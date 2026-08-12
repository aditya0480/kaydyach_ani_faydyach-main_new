import { getEbooksByLanguage } from "@/lib/data-access";
import { EbookCatalog } from "@/components/marketing/ebook-catalog";
import { ChevronLeft } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { SocialProof } from "@/components/marketing/social-proof";

export const metadata: Metadata = {
    title: "English Legal Ebooks | Legal Knowledge Library",
    description: "Browse our collection of simplified legal ebooks and guides in English.",
};

export default async function EnglishEbooksPage() {
    const ebooks = await getEbooksByLanguage("ENGLISH");

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "English Legal Ebooks",
        "description": "Browse our collection of simplified legal ebooks and guides in English.",
        "url": "https://www.kaydyachaanifaydyach.com/ebooks/english",
        "inLanguage": "en",
        "mainEntity": {
            "@type": "ItemList",
            "itemListElement": ebooks.map((ebook, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "url": `https://www.kaydyachaanifaydyach.com/ebooks/${ebook.id}`,
                "name": ebook.title,
            })),
        },
    };

    return (
        <div className="min-h-screen bg-white">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <div className="relative overflow-hidden bg-slate-900 py-3 text-white">
                <div className="relative z-10 container mx-auto flex items-center px-4">
                    <Link
                        href="/ebooks"
                        className="shrink-0 rounded-full p-1.5 transition-colors hover:bg-white/10"
                        aria-label="All ebooks"
                    >
                        <ChevronLeft className="h-5 w-5 text-brand-gold" />
                    </Link>
                    <div className="flex-1 pr-8 text-center">
                        <h1 className="text-xl font-bold tracking-tight md:text-2xl">
                            English Legal <span className="text-brand-gold">Ebooks Library</span>
                        </h1>
                    </div>
                </div>
            </div>

            <div className="border-b border-gray-100 bg-white">
                <div className="container mx-auto flex gap-1 overflow-x-auto px-4 py-2">
                    <Link href="/ebooks" className="rounded-full px-4 py-1.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-100">All / सर्व</Link>
                    <Link href="/ebooks/hindi" className="rounded-full px-4 py-1.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-100">हिंदी</Link>
                    <span className="rounded-full bg-slate-900 px-4 py-1.5 text-xs font-bold text-white">English</span>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {ebooks.length === 0 ? (
                    <div className="py-16 text-center text-muted-foreground">
                        No English ebooks available yet. Please check back soon.
                    </div>
                ) : (
                    <EbookCatalog initialEbooks={ebooks} />
                )}
            </div>
            <SocialProof />
        </div>
    );
}
