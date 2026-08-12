import { PaymentSuccess } from "@/components/payment-success";
import { prisma_db } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { BackPrevention } from "@/components/back-prevention";
import { PixelPurchaseTracker } from "@/components/pixel-purchase-tracker";
import { createShortLink } from "@/lib/short-link";
import { getBaseUrl } from "@/lib/base-url";
import crypto from "crypto";

export const dynamic = 'force-dynamic';

async function SuccessPageContent({ searchParams }: { searchParams: Promise<{ orderId?: string }> }) {
    const { orderId } = await searchParams;

    if (!orderId) {
        return notFound();
    }

    // Fetch order
    const rawOrder = await prisma_db.order.findUnique({
        where: { id: orderId },
        include: { items: { include: { ebook: { include: { includedEbooks: { include: { ebook: true } } } } } } }
    });
    // Flatten ComboItem join records
    const order = rawOrder ? {
        ...rawOrder,
        items: rawOrder.items.map((item) => ({
            ...item,
            ebook: {
                ...item.ebook,
                includedEbooks: item.ebook.includedEbooks.map((ci) => ci.ebook),
            },
        })),
    } : null;

    if (!order) {
        return notFound();
    }

    if (order.status !== "PAID") {
        // If coming from callback, maybe it's still processing or failed?
        // But the callback logic updates it before redirect.
        // If it's not paid, we might show a message.
        return (
            <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
                <h1 className="mb-2 text-xl font-bold text-red-600">पेमेंट प्रक्रिया अपूर्ण आहे</h1>
                <p className="text-gray-600">कृपया थोड्या वेळाने पुन्हा तपासा किंवा सपोर्टशी संपर्क साधा.</p>
            </div>
        );
    }

    // Generate Token
    const secret = process.env.AUTH_SECRET;
    if (!secret) throw new Error("AUTH_SECRET not set");

    const token = jwt.sign(
        { orderId: order.id, customerEmail: order.customerEmail },
        secret,
        { expiresIn: "7d" }
    );
    const baseUrl = getBaseUrl();
    const longDownloadLink = `${baseUrl}/api/download/${token}`;
    const shortCode = await createShortLink(longDownloadLink);
    const downloadLink = `${baseUrl}/d/${shortCode}`;

    // Generate a Browser Access Token (BAT) to lock this order to this specific device/browser
    const browserAccessToken = crypto
        .createHmac("sha256", secret)
        .update(order.id)
        .digest("hex");

    // Generate Individual Links for Combos
    const downloadItems: { title: string; ebookId: string; url: string }[] = [];

    // Helper to check for combo items
    for (const item of order.items) {
        const ebook = item.ebook;

        if (ebook.isCombo && ebook.includedEbooks && ebook.includedEbooks.length > 0) {
            // Sort the included items based on the defined order
            const sortedBooks = [...ebook.includedEbooks].sort((a: { id: string }, b: { id: string }) => {
                const orderArray = ebook.comboOrder || [];
                const indexA = orderArray.indexOf(a.id);
                const indexB = orderArray.indexOf(b.id);

                if (indexA !== -1 && indexB !== -1) return indexA - indexB;
                if (indexA !== -1) return -1;
                if (indexB !== -1) return 1;
                return 0;
            });

            // It's a combo, list individual books
            for (const subBook of sortedBooks) {
                const longUrl = `${baseUrl}/api/download/${token}?ebookId=${subBook.id}`;
                const subShortCode = await createShortLink(longUrl);
                downloadItems.push({
                    title: subBook.title,
                    ebookId: subBook.id,
                    url: `${baseUrl}/d/${subShortCode}`
                });
            }
        } else {
            // Single book
            const longUrl = `${baseUrl}/api/download/${token}?ebookId=${ebook.id}`;
            const subShortCode = await createShortLink(longUrl);
            downloadItems.push({
                title: ebook.title,
                ebookId: ebook.id,
                url: `${baseUrl}/d/${subShortCode}`
            });
        }
    }

    const title = order.items.map(i => i.ebook.title).join(", ");

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            {/* Meta Pixel Purchase Tracking */}
            <PixelPurchaseTracker
                orderId={order.id}
                amount={order.amount}
                currency="INR"
                contentName={title}
                contentIds={order.items.map(i => i.ebookId)}
            />
            {/* Prevent Back Button Script */}
            <BackPrevention />
            <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-xl">
                <PaymentSuccess
                    title={title}
                    downloadUrl={downloadLink}
                    downloadItems={downloadItems}
                    isMobile={true} // Always nice layout
                    amount={order.amount}
                    currency="INR"
                    customerPhone={order.customerPhone}
                    browserAccessToken={browserAccessToken}
                />
            </div>
        </div>
    );
}

export default function Page({ searchParams }: { searchParams: Promise<{ orderId?: string }> }) {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-brand-teal" />
            </div>
        }>
            <SuccessPageContent searchParams={searchParams} />
        </Suspense>
    );
}
