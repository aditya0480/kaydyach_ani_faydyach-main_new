import { Button } from "@/components/ui/button";
import { prisma_db } from "@/lib/prisma";
import EditEbookForm from "./edit-form";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default async function EditEbookPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const { id } = params;

    const rawEbook = await prisma_db.ebook.findUnique({
        where: { id },
        include: {
            includedEbooks: {
                select: { ebookId: true }
            }
        }
    });
    const ebook = rawEbook ? {
        ...rawEbook,
        includedEbooks: rawEbook.includedEbooks.map((ci) => ({ id: ci.ebookId })),
    } : null;

    if (!ebook) {
        return (
            <div className="flex min-h-100 flex-col items-center justify-center">
                <h2 className="text-2xl font-bold text-gray-900">Ebook Not Found</h2>
                <p className="mt-2 text-gray-500">The ebook you are trying to edit does not exist.</p>
                <Button asChild className="mt-4">
                    <Link href="/dashboard/ebooks">Back to Ebooks</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 p-4 pt-6 duration-500 md:p-8">
            {/* Breadcrumbs */}
            <div className="mb-4 flex items-center text-sm text-muted-foreground">
                <Link href="/dashboard" className="transition-colors hover:text-[#0A2342]">Dashboard</Link>
                <ChevronRight className="mx-2 h-4 w-4" />
                <Link href="/dashboard/ebooks" className="transition-colors hover:text-[#0A2342]">Ebooks</Link>
                <ChevronRight className="mx-2 h-4 w-4" />
                <span className="font-medium text-gray-900">Edit Ebook</span>
            </div>

            <div className="flex flex-col justify-between gap-4 border-b pb-6 md:flex-row md:items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-[#0A2342]">
                        Edit Ebook
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Update ebook details, files and pricing.<br />
                        <span className="opacity-80">पुस्तकाचे तपशील, फाइल्स आणि किंमत अपडेट करा.</span>
                    </p>
                </div>
            </div>

            <EditEbookForm ebook={{
                ...ebook,
                includedEbooks: ebook.comboOrder && ebook.comboOrder.length > 0
                    ? ebook.comboOrder
                    : ebook.includedEbooks.map(b => b.id)
            }} />
        </div>
    );
}
