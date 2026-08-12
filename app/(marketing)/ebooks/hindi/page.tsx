import { getEbooksByLanguage } from "@/lib/data-access";
import { EbookCatalog } from "@/components/marketing/ebook-catalog";
import { ChevronLeft } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { SocialProof } from "@/components/marketing/social-proof";

export const metadata: Metadata = {
    title: "Hindi Legal Ebooks | हिंदी कानूनी पुस्तकें",
    description: "Browse our collection of simplified legal ebooks and guides in Hindi.",
};

export default async function HindiEbooksPage() {
    const ebooks = await getEbooksByLanguage("HINDI");

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Hindi Legal Ebooks | हिंदी कानूनी पुस्तकें",
        "description": "Browse our collection of simplified legal ebooks and guides in Hindi.",
        "url": "https://www.kaydyachaanifaydyach.com/ebooks/hindi",
        "inLanguage": "hi",
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
                            Hindi Legal Ebooks / <span className="text-brand-gold">हिंदी कानूनी पुस्तकें</span>
                        </h1>
                    </div>
                </div>
            </div>

            <div className="border-b border-gray-100 bg-white">
                <div className="container mx-auto flex gap-1 overflow-x-auto px-4 py-2">
                    <Link href="/ebooks" className="rounded-full px-4 py-1.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-100">All / सर्व</Link>
                    <span className="rounded-full bg-slate-900 px-4 py-1.5 text-xs font-bold text-white">हिंदी</span>
                    <Link href="/ebooks/english" className="rounded-full px-4 py-1.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-100">English</Link>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {ebooks.length === 0 ? (
                    <div className="py-16 text-center text-muted-foreground">
                        No Hindi ebooks available yet. कृपया बाद में जाँचें।
                    </div>
                ) : (
                    <EbookCatalog initialEbooks={ebooks} />
                )}
            </div>
            <SocialProof />
        </div>
    );
}
