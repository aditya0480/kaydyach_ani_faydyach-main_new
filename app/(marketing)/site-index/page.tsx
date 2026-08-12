import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Sitemap | साइटमॅप | कायद्याचं आणि फायद्याचं",
    description: "Browse all pages on Kaydyacha Ani Faydyacha. Find legal ebooks, combos, and important information easily.",
};

const sitemapLinks = [
    {
        category: "Main",
        links: [
            { name: "Home (मुख्य पृष्ठ)", href: "/" },
            { name: "About Us (आमच्याबद्दल)", href: "/about" },
            { name: "Contact (संपर्क)", href: "/contact" },
        ],
    },
    {
        category: "Products",
        links: [
            { name: "All E-books (सर्व ई-बुक्स)", href: "/ebooks" },
            { name: "Combo Offers (कॉम्बो ऑफर्स)", href: "/combos" },
        ],
    },
    {
        category: "Legal & Support",
        links: [
            { name: "Privacy Policy (गोपनीयता धोरण)", href: "/privacy-policy" },
            { name: "Terms & Conditions (नियम आणि अटी)", href: "/terms" },
            { name: "Refund Policy (परतावा धोरण)", href: "/refund-policy" },
            { name: "Cancellation Policy (रद्दीकरण धोरण)", href: "/cancellation-policy" },
            { name: "Shipping Policy (shipping धोरण)", href: "/shipping-policy" },
        ],
    },
];

export default function SitemapPage() {
    return (
        <div className="container mx-auto max-w-4xl px-4 py-12">
            <h1 className="mb-8 text-center text-3xl font-bold text-teal-800">
                Site Map <span className="ml-2 text-lg font-normal text-muted-foreground">(साइटमॅप)</span>
            </h1>

            <div className="grid gap-8 md:grid-cols-2">
                {sitemapLinks.map((section) => (
                    <div key={section.category} className="rounded-lg border bg-card p-6 shadow-sm">
                        <h2 className="mb-4 border-b pb-2 text-xl font-semibold text-teal-700">
                            {section.category}
                        </h2>
                        <ul className="space-y-3">
                            {section.links.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="group flex items-center text-foreground transition-colors hover:text-teal-600"
                                    >
                                        <span className="mr-3 h-1.5 w-1.5 rounded-full bg-teal-400 transition-colors group-hover:bg-teal-600" />
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
}
