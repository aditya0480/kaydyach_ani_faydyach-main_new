import { getComboEbooks } from "@/lib/data-access";
import { EbookCatalog } from "@/components/marketing/ebook-catalog";
import { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata: Metadata = {
    title: "Combo Packages | कायदेशीर कॉम्बो पॅक्स",
    description: "Get multiple legal guides together at a discounted price with our special combo packages.",
};

export default async function CombosPage() {
    const ebooks = await getComboEbooks();

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Legal Combo Packages | कायदेशीर कॉम्बो पॅक्स",
        "description": "Get multiple legal guides together at a discounted price with our special combo packages.",
        "url": "https://www.kaydyachaanifaydyach.com/combos",
        "mainEntity": {
            "@type": "ItemList",
            "itemListElement": ebooks.map((ebook, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "url": `https://www.kaydyachaanifaydyach.com/ebooks/${ebook.id}`,
                "name": ebook.title
            }))
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            {/* Header / Hero */}
            <div className="relative overflow-hidden bg-brand-teal py-3 text-white">
                <div className="relative z-10 container mx-auto flex items-center px-4">
                    <Link
                        href="/"
                        className="shrink-0 rounded-full p-1.5 transition-colors hover:bg-white/10"
                        aria-label="Back to home"
                    >
                        <ChevronLeft className="h-5 w-5 text-brand-gold" />
                    </Link>
                    <div className="flex-1 pr-8 text-center">
                        <h1 className="text-lg font-extrabold tracking-tight md:text-xl">
                            Special <span className="text-brand-gold">Combo Packages</span>
                        </h1>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8 flex items-center gap-2 rounded-xl border border-brand-gold/20 bg-brand-gold/10 p-3">
                    <div className="rounded-lg bg-brand-gold p-1.5 text-brand-teal">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 11 18-5v12L3 14v-3z" /><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" /></svg>
                    </div>
                    <p className="text-sm font-bold text-brand-teal">
                        Limited Time Offer: Get huge discounts on all combo packs!
                    </p>
                </div>

                <EbookCatalog initialEbooks={ebooks} />
            </div>
        </div>
    );
}
