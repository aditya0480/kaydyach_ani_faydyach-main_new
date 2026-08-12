import { prisma_db } from "@/lib/prisma";
import { ConsultationsClient } from "./consultations-client";
import { ConsultationPriceCard } from "./consultation-price-card";
import { getConsultationPrice } from "@/lib/consultation-config";

export const dynamic = "force-dynamic";

export default async function ConsultationsPage() {
    const [bookings, price] = await Promise.all([
        prisma_db.consultationBooking.findMany({
            orderBy: { createdAt: "desc" },
            take: 500,
        }),
        getConsultationPrice(),
    ]);

    const serialized = bookings.map((b) => ({
        ...b,
        amount: Number(b.amount),
        createdAt: b.createdAt.toISOString(),
        updatedAt: b.updatedAt.toISOString(),
    }));

    return (
        <div className="animate-in fade-in mx-auto max-w-7xl space-y-4 duration-500">
            <div className="border-b border-gray-100 pb-2 md:pb-6">
                <h1 className="text-xl font-bold tracking-tight text-[#0A2342] md:text-3xl">Consultations</h1>
                <p className="mt-1 hidden text-xs text-muted-foreground md:block md:text-sm">
                    Legal consultation bookings from customers.
                </p>
            </div>

            <ConsultationPriceCard initialPrice={price} />

            <ConsultationsClient bookings={serialized} />
        </div>
    );
}
