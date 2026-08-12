import { getEbooks } from "@/lib/data-access";
import { EbookCatalog } from "@/components/marketing/ebook-catalog";
import { ChevronLeft } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { SocialProof } from "@/components/marketing/social-proof";

export const metadata: Metadata = {
    title: "Legal Ebooks Library | कायदेविषयक पुस्तके",
    description: "Browse our collection of simplified legal ebooks and guides in Marathi and English.",
};

export default async function EbooksPage() {
    const ebooks = await getEbooks();

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Legal Ebooks Library | कायदेविषयक पुस्तके",
        "description": "Browse our collection of simplified legal ebooks and guides in Marathi and English.",
        "url": "https://www.kaydyachaanifaydyach.com/ebooks",
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
            <div className="relative overflow-hidden bg-slate-900 py-3 text-white">
                <div className="relative z-10 container mx-auto flex items-center px-4">
                    <Link
                        href="/"
                        className="shrink-0 rounded-full p-1.5 transition-colors hover:bg-white/10"
                        aria-label="Back to home"
                    >
                        <ChevronLeft className="h-5 w-5 text-brand-gold" />
                    </Link>
                    <div className="flex-1 pr-8 text-center">
                        <h1 className="text-xl font-bold tracking-tight md:text-2xl">
                            Legal Knowledge Simplified / <span className="text-brand-gold">ज्ञान हीच शक्ती</span>
                        </h1>
                        <p className="mt-0.5 text-[10px] font-medium tracking-wide text-gray-300 md:text-xs">
                            Digital PDF Ebooks · Instant Delivery · Inclusive of all taxes
                        </p>
                    </div>
                </div>
            </div>

            {/* Language tabs */}
            <div className="border-b border-gray-100 bg-white">
                <div className="container mx-auto flex gap-1 overflow-x-auto px-4 py-2">
                    <span className="rounded-full bg-slate-900 px-4 py-1.5 text-xs font-bold text-white">
                        All / सर्व
                    </span>
                    <Link
                        href="/ebooks/hindi"
                        className="rounded-full px-4 py-1.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-100"
                    >
                        हिंदी
                    </Link>
                    <Link
                        href="/ebooks/english"
                        className="rounded-full px-4 py-1.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-100"
                    >
                        English
                    </Link>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 py-8">
                <EbookCatalog initialEbooks={ebooks} />
            </div>
            <SocialProof />
        </div>
    );
}
