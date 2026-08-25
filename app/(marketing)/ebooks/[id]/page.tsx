import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { BuyButton } from "@/components/buy-button";
import { ShieldCheck, BookOpen, Download as DownloadIcon, Zap, Mail, Home, ChevronRight } from "lucide-react";
import { ShareButtons } from "@/components/share-buttons";
import { RecommendedCarousel } from "./recommended-carousel";
import { EbookGallery } from "@/components/marketing/ebook-gallery";
import { PixelViewContent } from "./_components/pixel-view-content";
import { DescriptionToggle } from "./_components/description-toggle";
import { ScrollToTop } from "./_components/scroll-to-top";
import Image from "next/image";
import { getEbookById, getComboEbooks } from "@/lib/data-access";
import { SALE_CONFIG, getInflatedOriginalPrice } from "@/lib/sale-config";
import { SaleTimer } from "@/components/marketing/sale-timer";
import { SITE_URL } from "@/lib/constants/site";

// ISR: Revalidate every 24 hours - maximum edge caching efficiency
// Pages are cached at Vercel's edge, users get faster loads
// Use revalidateTag('ebooks') to force-refresh after updates
export const revalidate = 86400; // 24 hours

const LANGUAGE_LABELS: Record<string, string> = {
  MARATHI: "मराठी",
  HINDI: "हिंदी",
  ENGLISH: "English",
};

const PAGE_LABELS = {
  MARATHI: {
    backNav: "मागील पृष्ठ",
    onlyText: "फक्त",
    discount: "सवलत",
    downloadBtn: "आत्ताच डाऊनलोड करा",
    downloadBtnDesktop: "आत्ताच डाऊनलोड करा (Download Now)",
    securePayment: "सुरक्षित पेमेंट | UPI, Card, Netbanking",
    securePaymentDesktop: "सुरक्षित पेमेंट (Safe & Secure Payment)",
    digitalNotice: "📄 हे केवळ Digital PDF E-Book आहे — कोणतीही Physical / Printed प्रत पाठवली जात नाही.",
    refundNotice: "⚠️ एकदा PDF डाउनलोड केल्यानंतर परतावा (Refund) शक्य नाही.",
    faqHeader: "नेहमी विचारले जाणारे प्रश्न",
    faq1Q: "हे पुस्तक मला कसे मिळेल?",
    faq1AfterPayment: "पेमेंट यशस्वी झाल्यानंतर:",
    faq1Download: "तुम्हाला लगेच Download Button दिसेल.",
    faq1WhatsApp: "WhatsApp वर पाठवले जाईल.",
    faq1Email: "Email वर देखील PDF पाठवली जाईल.",
    faq2Q: "पेमेंट सुरक्षित आहे का?",
    faq2A: "हो, Razorpay 100% सुरक्षित आहे. GooglePay, PhonePe, Paytm किंवा कार्डद्वारे पेमेंट करा.",
    faq3Q: "मोबाईलवर वाचता येते का?",
    faq3A: "हो! PDF फाइल कोणत्याही मोबाईल, लॅपटॉप किंवा टॅब्लेटवर वाचता येते.",
    faq4Q: "हे Physical पुस्तक आहे का?",
    faq4A: "नाही. हे पूर्णपणे Digital PDF E-Book आहे. कोणतीही Printed / Hard Copy पाठवली जात नाही. खरेदी केल्यानंतर तुम्हाला PDF फाइल ईमेल आणि WhatsApp वर मिळेल.",
    faq5Q: "किती डिव्हाइसवर वाचता येईल?",
    faq5A: "PDF वर कोणतेही बंधन नाही — तुम्ही तुमच्या Mobile, Tablet, Laptop, Desktop — कोणत्याही डिव्हाइसवर वाचू शकता.",
    faq6Q: "भविष्यात Update मिळेल का?",
    faq6A: "कायद्यात महत्त्वाचे बदल झाल्यास आम्ही Updated Edition प्रकाशित करतो. Current Version ची माहिती Product Page वर दिली आहे.",
    faq7Q: "हे पुस्तक कायदेशीर सल्ला देते का?",
    faq7A: "नाही. हे पुस्तक केवळ संदर्भ आणि शैक्षणिक उद्देशाने आहे. हा कोणत्याही प्रकारचा कायदेशीर सल्ला (Legal Advice) नाही. तुमच्या विशिष्ट कायदेशीर समस्येसाठी नेहमी तज्ञ वकिलाचा सल्ला घ्या.",
    helpMobile: "मदत हवी आहे का?",
    helpMobileSub: "WhatsApp वर बोला",
    helpDesktop: "काही मदत हवी आहे का? (Need Help?)",
    helpDesktopSub: "आमच्या सपोर्ट टीमशी बोला",
    waMessage: "नमस्ते, मला या ई-बुकबद्दल माहिती हवी आहे:",
    recommendedTitle: "तुम्हाला हे देखील आवडेल",
    recommendedSub: "आमची इतर काही महत्वाची पुस्तके पहा",
    socialProof: "वाचकांनी विश्वास ठेवला",
  },
  HINDI: {
    backNav: "वापस जाएं",
    onlyText: "केवल",
    discount: "छूट",
    downloadBtn: "अभी डाउनलोड करें",
    downloadBtnDesktop: "अभी डाउनलोड करें (Download Now)",
    securePayment: "सुरक्षित भुगतान | UPI, Card, Netbanking",
    securePaymentDesktop: "सुरक्षित भुगतान (Safe & Secure Payment)",
    digitalNotice: "📄 यह केवल Digital PDF E-Book है — कोई Physical / Printed प्रति नहीं भेजी जाती।",
    refundNotice: "⚠️ PDF डाउनलोड के बाद Refund संभव नहीं है।",
    faqHeader: "अक्सर पूछे जाने वाले प्रश्न",
    faq1Q: "यह पुस्तक मुझे कैसे मिलेगी?",
    faq1AfterPayment: "भुगतान सफल होने के बाद:",
    faq1Download: "आपको तुरंत Download Button दिखेगा।",
    faq1WhatsApp: "WhatsApp पर भेजा जाएगा।",
    faq1Email: "Email पर भी PDF भेजी जाएगी।",
    faq2Q: "क्या भुगतान सुरक्षित है?",
    faq2A: "हां, Razorpay 100% सुरक्षित है। GooglePay, PhonePe, Paytm या कार्ड से भुगतान करें।",
    faq3Q: "क्या मोबाइल पर पढ़ा जा सकता है?",
    faq3A: "हां! PDF फ़ाइल किसी भी मोबाइल, लैपटॉप या टैबलेट पर पढ़ी जा सकती है।",
    faq4Q: "क्या यह Physical पुस्तक है?",
    faq4A: "नहीं। यह पूरी तरह Digital PDF E-Book है। कोई Printed / Hard Copy नहीं भेजी जाती। खरीद के बाद PDF Email और WhatsApp पर मिलेगी।",
    faq5Q: "कितने डिवाइस पर पढ़ सकते हैं?",
    faq5A: "PDF पर कोई प्रतिबंध नहीं — Mobile, Tablet, Laptop, Desktop — किसी भी डिवाइस पर पढ़ सकते हैं।",
    faq6Q: "क्या भविष्य में Update मिलेगा?",
    faq6A: "कानून में महत्वपूर्ण बदलाव होने पर हम Updated Edition प्रकाशित करते हैं। Current Version की जानकारी Product Page पर दी गई है।",
    faq7Q: "क्या यह पुस्तक Legal Advice देती है?",
    faq7A: "नहीं। यह पुस्तक केवल संदर्भ और शैक्षणिक उद्देश्य के लिए है। यह किसी भी प्रकार की Legal Advice नहीं है। अपनी विशिष्ट कानूनी समस्या के लिए हमेशा किसी योग्य वकील से सलाह लें।",
    helpMobile: "मदद चाहिए?",
    helpMobileSub: "WhatsApp पर बात करें",
    helpDesktop: "कोई सहायता चाहिए? (Need Help?)",
    helpDesktopSub: "हमारी सपोर्ट टीम से बात करें",
    waMessage: "नमस्ते, मुझे इस ई-बुक के बारे में जानकारी चाहिए:",
    recommendedTitle: "आपको यह भी पसंद आएगा",
    recommendedSub: "हमारी अन्य महत्वपूर्ण पुस्तकें देखें",
    socialProof: "पाठकों का विश्वास",
  },
  ENGLISH: {
    backNav: "Go Back",
    onlyText: "only",
    discount: "off",
    downloadBtn: "Download Now",
    downloadBtnDesktop: "Download Now",
    securePayment: "Secure Payment | UPI, Card, Netbanking",
    securePaymentDesktop: "Secure Payment (Safe & Secure)",
    digitalNotice: "📄 This is a Digital PDF E-Book only — No Physical / Printed copy is shipped.",
    refundNotice: "⚠️ No refund once PDF is downloaded.",
    faqHeader: "Frequently Asked Questions",
    faq1Q: "How will I get this book?",
    faq1AfterPayment: "After successful payment:",
    faq1Download: "You will see a Download Button immediately.",
    faq1WhatsApp: "It will be sent to you on WhatsApp.",
    faq1Email: "PDF will also be sent to your Email.",
    faq2Q: "Is payment secure?",
    faq2A: "Yes, Razorpay is 100% secure. Pay via GooglePay, PhonePe, Paytm or card.",
    faq3Q: "Can I read it on mobile?",
    faq3A: "Yes! The PDF can be read on any mobile, laptop or tablet.",
    faq4Q: "Is this a physical book?",
    faq4A: "No. This is a Digital PDF E-Book only. No printed or hard copy is shipped. After purchase, you receive the PDF via Email and WhatsApp instantly.",
    faq5Q: "How many devices can I read it on?",
    faq5A: "There are no device restrictions on PDFs — read on your Mobile, Tablet, Laptop, or Desktop.",
    faq6Q: "Will I get future updates?",
    faq6A: "We publish an updated edition when significant legal changes occur. The current version details are mentioned on the product page.",
    faq7Q: "Does this book provide legal advice?",
    faq7A: "No. This book is for reference and educational purposes only. It does not constitute legal advice of any kind. For your specific legal issue, always consult a qualified advocate.",
    helpMobile: "Need Help?",
    helpMobileSub: "Chat on WhatsApp",
    helpDesktop: "Need Help?",
    helpDesktopSub: "Talk to our support team",
    waMessage: "Hello, I need information about this e-book:",
    recommendedTitle: "You May Also Like",
    recommendedSub: "Explore more important books",
    socialProof: "Trusted by readers",
  },
} as const;

export async function generateMetadata(
    props: { params: Promise<{ id: string }> }
): Promise<Metadata> {
    try {
        const params = await props.params;
        const id = params.id;

        const ebook = await getEbookById(id);

        if (!ebook) {
            return {
                title: "Ebook Not Found | Kaydyanch ani Faydyach",
                description: "The ebook you are looking for might have been removed or is temporarily unavailable.",
            };
        }

        // Strip HTML tags for description and truncate to optimal length for SEO/Social (110-160 chars)
        const plainDescription = ebook.description?.replace(/<[^>]+>/g, ' ').trim() || `Buy ${ebook.title} - Legal Ebook in Marathi`;
        const truncatedDescription = plainDescription.length > 155 ? plainDescription.slice(0, 152) + "..." : plainDescription;

        // Truncate title for OG/Twitter (strictly < 60)
        const rawTitle = ebook.title.replace(/<[^>]+>/g, '').trim();
        const ogTitle = rawTitle.length > 55 ? rawTitle.slice(0, 52) + "..." : rawTitle;

        return {
            title: {
                absolute: `${ogTitle} | कायद्याचं आणि फायद्याचं`
            },
            description: truncatedDescription,
            openGraph: {
                title: ogTitle,
                description: truncatedDescription,
                url: `https://www.kaydyachaanifaydyach.com/ebooks/${id}`,
                type: 'book',
                siteName: 'Kaydyanch Ani Faydyach',
                images: [
                    {
                        url: `/ebooks/${id}/opengraph-image`,
                        width: 1200,
                        height: 630,
                        alt: ogTitle,
                    }
                ]
            },
            twitter: {
                card: 'summary_large_image',
                title: ogTitle,
                description: truncatedDescription,
                images: [`/ebooks/${id}/opengraph-image`],
            },
            authors: [{ name: 'Ajay Mane' }],
        };
    } catch (error) {
        console.error("Metadata generation failed:", error);
        return {
            title: "Kaydyanch ani Faydyach",
            description: "Legal Knowledge Center. Buy Ebooks in Marathi.",
        };
    }
}

// Return empty — pages are not pre-rendered at build time.
// ISR via revalidate=86400 handles caching after first request.
// This prevents DB connection timeouts during CI builds.
export async function generateStaticParams() {
    return [];
}

export default async function EbookDetailPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const { id } = params;

    const ebook = await getEbookById(id);

    if (!ebook || !ebook.isEnabled) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
                <div className="space-y-4 text-center">
                    <h1 className="text-3xl font-bold text-gray-900">Ebook not found</h1>
                    <p className="text-muted-foreground">The book you are looking for might have been removed or is temporarily unavailable.</p>
                    <Button asChild className="bg-brand-teal hover:bg-brand-teal/90">
                        <Link href="/ebooks">Back to Store / मुख्यपृष्ठावर जा</Link>
                    </Button>
                </div>
            </div>
        );
    }

    // Fetch recommended ebooks (cached list) - Filtered to show only Combo Books
    const combosOnly = await getComboEbooks();
    const recommendedBooks = combosOnly
        .filter((b) => b.id !== id)
        .slice(0, 8) // Limit to a reasonable number for carousel
        .map(b => ({
            ...b,
            price: Number(b.price)
        }));

    // Strip HTML tags for description (for JSON-LD)
    const plainDescription = ebook.description?.replace(/<[^>]+>/g, ' ').trim().slice(0, 160) + '...' || `Buy ${ebook.title} - Legal Ebook in Marathi`;

    const labels = PAGE_LABELS[(ebook.language ?? "MARATHI") as keyof typeof PAGE_LABELS] ?? PAGE_LABELS.MARATHI;

    // Calculate final price based on Flash Sale
    // With reverse logic: DB price IS the sale price.
    const finalPrice = Number(ebook.price); // DB price

    // Inflated original price for "Was" display
    const crossedPrice = getInflatedOriginalPrice(finalPrice);

    const isSaleActive = SALE_CONFIG.isActive;

    // Calculate discount %
    const discountPercent = isSaleActive
        ? SALE_CONFIG.discountPercent
        : Math.round(((crossedPrice - finalPrice) / crossedPrice) * 100);

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": ["Book", "Product"],
        "name": ebook.title,
        "description": plainDescription,
        "image": ebook.coverImage || `${SITE_URL}/logo.png`,
        "inLanguage": ebook.language === "HINDI" ? "hi-IN" : ebook.language === "ENGLISH" ? "en-IN" : "mr-IN",
        "bookFormat": "https://schema.org/EBook",
        "fileFormat": "application/pdf",
        "author": [
            { "@type": "Person", "name": "Ajay Mane" },
            { "@type": "Person", "name": "Shrutika Gochade" }
        ],
        "publisher": { "@id": `${SITE_URL}/#organization` },
        "brand": { "@type": "Brand", "name": "कायद्याचं आणि फायद्याचं" },
        "category": "Digital Educational Ebook",
        "offers": {
            "@type": "Offer",
            "price": finalPrice,
            "priceCurrency": "INR",
            "availability": "https://schema.org/InStock",
            "url": `${SITE_URL}/ebooks/${id}`,
            "priceValidUntil": `${new Date().getFullYear() + 1}-12-31`,
            "seller": { "@id": `${SITE_URL}/#organization` },
            "itemCondition": "https://schema.org/NewCondition",
            "shippingDetails": {
                "@type": "OfferShippingDetails",
                "shippingRate": { "@type": "MonetaryAmount", "value": "0", "currency": "INR" },
                "deliveryTime": {
                    "@type": "ShippingDeliveryTime",
                    "handlingTime": { "@type": "QuantitativeValue", "minValue": 0, "maxValue": 0, "unitCode": "MIN" },
                    "transitTime": { "@type": "QuantitativeValue", "minValue": 0, "maxValue": 5, "unitCode": "MIN" }
                }
            }
        }
    };

    const breadcrumbLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.kaydyachaanifaydyach.com" },
            { "@type": "ListItem", "position": 2, "name": "Ebooks", "item": "https://www.kaydyachaanifaydyach.com/ebooks" },
            { "@type": "ListItem", "position": 3, "name": ebook.title, "item": `https://www.kaydyachaanifaydyach.com/ebooks/${id}` },
        ]
    };

    return (
        <div className="min-h-screen bg-background pb-28 md:pb-12">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
            <PixelViewContent ebookId={ebook.id} title={ebook.title} price={finalPrice} />

            {/* Breadcrumb nav */}
            <div className="sticky top-0 z-30 border-b border-gray-100 bg-white/80 backdrop-blur-md">
                <div className="container mx-auto flex h-11 items-center gap-1.5 px-4 md:h-14">
                    <Link href="/" className="flex items-center text-muted-foreground transition-colors hover:text-brand-teal">
                        <Home className="h-3.5 w-3.5" />
                    </Link>
                    <ChevronRight className="h-3 w-3 text-gray-300" />
                    <Link href="/ebooks" className="text-xs text-muted-foreground transition-colors hover:text-brand-teal md:text-sm">
                        Ebooks
                    </Link>
                    <ChevronRight className="h-3 w-3 text-gray-300" />
                    <span className="max-w-40 truncate text-xs font-medium text-brand-teal md:max-w-xs md:text-sm">
                        {ebook.title}
                    </span>
                </div>
            </div>

            <div className="container mx-auto max-w-6xl px-4 py-3 md:py-6">
                <div className="grid gap-6 lg:grid-cols-12 lg:gap-10">

                    {/* ===== LEFT: Gallery (Desktop sticky) ===== */}
                    <div className="h-fit lg:sticky lg:top-20 lg:col-span-5">
                        <EbookGallery
                            coverImage={ebook.coverImage}
                            sampleImages={ebook.sampleImages}
                            title={ebook.title}
                            ebookId={ebook.id}
                            price={finalPrice}
                            language={ebook.language}
                            totalPages={ebook.pages}
                            previewUrl={ebook.previewUrl}
                        />
                    </div>

                    {/* ===== RIGHT: Product Info ===== */}
                    <div className="flex flex-col lg:col-span-7">

                        {/* Book ID badge */}
                        {ebook.displayId && (
                            <div className="mb-2">
                                <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#FFD301]/30 bg-[#0A2342] px-2 py-0.5 text-[#FFD301]">
                                    <span className="text-[8px] font-bold tracking-wider uppercase opacity-80">ID</span>
                                    <span className="border-l border-[#FFD301]/20 pl-1.5 font-mono text-[11px] font-bold tracking-widest">
                                        {ebook.displayId}
                                    </span>
                                </span>
                            </div>
                        )}

                        {/* Title */}
                        <h1 className="mb-3 text-xl leading-tight font-black text-brand-teal sm:text-2xl md:text-3xl lg:text-4xl">
                            {ebook.title}
                        </h1>

                        {/* Social proof */}
                        <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                                {"★★★★★".split("").map((s, i) => <span key={i} className="text-amber-400">{s}</span>)}
                                <span className="ml-1 font-semibold text-gray-700">4.8/5</span>
                            </span>
                            <span className="text-gray-300">|</span>
                            <span>📦 <strong className="text-gray-700">10,000+</strong> {labels.socialProof}</span>
                            <span className="text-gray-300">|</span>
                            <span className="font-medium text-green-600">✓ Instant Digital Delivery</span>
                        </div>

                        {/* Price card — prominent */}
                        <div className="mb-3 flex items-center gap-3 rounded-2xl border border-green-100 bg-green-50/60 p-3 md:p-4">
                            <div className="flex flex-col">
                                <span className="text-[11px] font-semibold text-gray-400 line-through decoration-red-400/60">
                                    ₹{crossedPrice}
                                </span>
                                <div className="flex items-baseline gap-1.5">
                                    <span className="text-3xl font-black tracking-tight text-green-600 sm:text-4xl md:text-5xl">
                                        ₹{finalPrice}
                                    </span>
                                    <span className="text-[10px] font-bold text-gray-500 sm:text-xs">{labels.onlyText}</span>
                                </div>
                                <span className="mt-0.5 text-[10px] font-semibold text-gray-500">
                                    Inclusive of all taxes · No GST applicable
                                </span>
                            </div>
                            <span className={`rounded-lg border border-red-200 bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700 md:text-xs ${isSaleActive ? 'animate-pulse' : ''}`}>
                                {discountPercent}% {labels.discount}
                            </span>
                            {isSaleActive && <SaleTimer />}
                        </div>

                        {/* Digital-only + no-refund notice */}
                        <div className="mb-3 space-y-1.5">
                            <p className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-1.5 text-[11px] font-medium text-blue-800">
                                {labels.digitalNotice}
                            </p>
                            <p className="rounded-lg border border-amber-100 bg-amber-50 px-3 py-1.5 text-[11px] font-medium text-amber-800">
                                {labels.refundNotice}
                            </p>
                        </div>

                        {/* ===== MOBILE CTA (shown only on mobile, right after price) ===== */}
                        <div className="mb-4 flex flex-col gap-2 md:hidden">
                            <BuyButton ebookId={ebook.id} price={finalPrice} title={ebook.title} customLabel={labels.downloadBtn} language={ebook.language} />
                            <p className="flex items-center justify-center gap-1 text-center text-[10px] text-muted-foreground">
                                <ShieldCheck className="h-3 w-3 text-green-500" /> {labels.securePayment}
                            </p>
                        </div>

                        {/* Quick info chips */}
                        <div className="mb-4 flex flex-wrap gap-2 text-[10px] font-medium text-muted-foreground md:text-xs">
                            <span className="inline-flex items-center gap-1 rounded-full border border-gray-100 bg-gray-50 px-2.5 py-1">
                                <DownloadIcon className="h-3 w-3 text-brand-teal" /> PDF ({LANGUAGE_LABELS[ebook.language ?? "MARATHI"] ?? ebook.language})
                            </span>
                            {ebook.pages && ebook.pages > 0 && (
                                <span className="inline-flex items-center gap-1 rounded-full border border-gray-100 bg-gray-50 px-2.5 py-1">
                                    <BookOpen className="h-3 w-3 text-brand-teal" /> {ebook.pages} पाने
                                </span>
                            )}
                            <span className="inline-flex items-center gap-1 rounded-full border border-gray-100 bg-gray-50 px-2.5 py-1">
                                <Zap className="h-3 w-3 text-brand-teal" /> Instant Download
                            </span>
                        </div>

                        {/* How to Buy — horizontal flow all screens */}
                        <div className="mb-4 rounded-2xl border border-brand-teal/10 bg-brand-teal/5 p-3 sm:p-4">
                            <h4 className="mb-3 text-center text-[9px] font-black tracking-[0.2em] text-brand-teal/60 uppercase sm:text-[10px]">
                                खरेदी करण्याची पद्धत / How to Buy
                            </h4>
                            <div className="flex items-start justify-between gap-1 text-center">
                                {[
                                    { n: "1", mr: "बटन दाबा", en: "Click" },
                                    { n: "2", mr: "माहिती भरा", en: "Fill Info" },
                                    { n: "3", mr: "पेमेंट करा", en: "Pay" },
                                    { n: "✓", mr: "PDF मिळवा", en: "Get PDF", green: true },
                                ].map((step, i, arr) => (
                                    <div key={i} className="flex flex-1 items-center">
                                        <div className="flex flex-1 flex-col items-center gap-1">
                                            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-black shadow-sm ${step.green ? "border-2 border-green-200 bg-green-500 text-white" : "border-2 border-brand-teal/20 bg-white text-brand-teal"}`}>
                                                {step.n}
                                            </div>
                                            <div className="text-[9px] leading-tight font-bold text-gray-800 sm:text-[10px]">
                                                {step.mr}<br /><span className="font-medium opacity-60">{step.en}</span>
                                            </div>
                                        </div>
                                        {i < arr.length - 1 && (
                                            <div className="mb-4 h-px w-3 shrink-0 bg-brand-teal/20 sm:w-4" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="prose prose-sm dark:prose-invert mb-4 max-w-none text-muted-foreground">
                            <h4 className="mb-1 text-sm font-bold text-brand-teal sm:text-base">वर्णन / Description</h4>
                            <DescriptionToggle html={ebook.description} />
                        </div>

                        {/* Included Books for Combos */}
                        {ebook.isCombo && ebook.includedEbooks.length > 0 && (() => {
                            const individualTotal = ebook.includedEbooks.reduce((sum, b) => sum + Number(b.price), 0);
                            const saved = individualTotal - finalPrice;
                            return (
                                <div className="mb-4 w-full rounded-xl border border-purple-100 bg-purple-50/70 p-3 sm:p-4">
                                    <div className="mb-2.5 flex items-center justify-between">
                                        <h4 className="flex items-center gap-2 text-sm font-bold text-purple-900 sm:text-base">
                                            <BookOpen className="h-4 w-4 text-purple-600 sm:h-5 sm:w-5" />
                                            या पॅकेजमधील पुस्तके ({ebook.includedEbooks.length})
                                        </h4>
                                        {saved > 0 && (
                                            <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-[11px] font-bold text-green-700">
                                                ₹{saved} बचत / Save ₹{saved}
                                            </span>
                                        )}
                                    </div>
                                    <div className="grid gap-2 sm:grid-cols-2">
                                        {ebook.includedEbooks.map((book) => (
                                            <div key={book.id} className="flex items-center gap-2.5 rounded-lg border border-purple-100 bg-white p-2 shadow-sm">
                                                {book.coverImage ? (
                                                    <Image src={book.coverImage} alt={book.title} width={40} height={54} className="rounded object-cover shadow-sm" />
                                                ) : (
                                                    <div className="flex h-14 w-10 items-center justify-center rounded bg-gray-100 text-[10px]">N/A</div>
                                                )}
                                                <div className="min-w-0 flex-1">
                                                    <h5 className="line-clamp-2 text-xs leading-tight font-bold text-gray-900 sm:text-sm">{book.title}</h5>
                                                    <span className="mt-0.5 inline-block text-[10px] font-medium text-purple-600">₹{Number(book.price)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })()}


                        {/* ===== DESKTOP CTA Card ===== */}
                        <div className="relative mb-6 hidden w-full overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-lg md:block">
                            <div className="pointer-events-none absolute top-0 right-0 -mt-10 -mr-10 h-28 w-28 rounded-full bg-brand-gold/10 blur-2xl"></div>
                            <div className="relative z-10 flex flex-col gap-3">
                                <BuyButton ebookId={ebook.id} price={finalPrice} title={ebook.title} customLabel={labels.downloadBtnDesktop} language={ebook.language} />
                                <p className="flex items-center justify-center gap-1.5 text-center text-[10px] text-muted-foreground">
                                    <ShieldCheck className="h-3 w-3 text-green-500" /> {labels.securePaymentDesktop}
                                </p>
                                {/* Payment method badges */}
                                <div className="flex flex-wrap items-center justify-center gap-2">
                                    {["UPI", "GPay", "PhonePe", "Paytm", "Visa / MC", "NetBanking"].map((m) => (
                                        <span key={m} className="rounded border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-semibold text-gray-500">{m}</span>
                                    ))}
                                </div>
                                <div className="border-t border-gray-100 pt-3">
                                    <ShareButtons title={ebook.title} text={`Check out this book: ${ebook.title}`} />
                                </div>
                            </div>
                        </div>

                        {/* FAQ Section — compact */}
                        <div className="w-full space-y-2">
                            <h4 className="mb-2 flex items-center gap-2 text-base font-bold text-brand-teal sm:text-lg">
                                <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5" /> {labels.faqHeader}
                            </h4>

                            <details className="group overflow-hidden rounded-xl border border-gray-100 bg-gray-50 [&_summary::-webkit-details-marker]:hidden">
                                <summary className="flex min-h-11 cursor-pointer items-center justify-between gap-2 p-3 text-[13px] font-medium text-gray-900 transition-colors hover:bg-gray-100 sm:text-sm">
                                    <span>{labels.faq1Q}</span>
                                    <span className="shrink-0 transition duration-300 group-open:-rotate-180">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </span>
                                </summary>
                                <div className="border-t border-gray-100 px-3 pb-3 text-[13px] leading-relaxed text-gray-600">
                                    <div className="mt-3 flex flex-col gap-2">
                                        <p className="font-semibold text-gray-800">{labels.faq1AfterPayment}</p>
                                        <div className="flex items-start gap-2 pl-1">
                                            <DownloadIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-teal" />
                                            <span>{labels.faq1Download}</span>
                                        </div>
                                        <div className="flex items-start gap-2 pl-1">
                                            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" className="mt-0.5 shrink-0 text-green-600"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.592 2.654-.696c1.001.572 2.135.882 3.807.882 3.123 0 5.669-2.52 5.669-5.765 0-3.186-2.586-5.786-5.669-5.786zm0 10.428c-1.353 0-2.617-.464-3.56-1.115l-.25-.173-1.637.428.44-1.593-.163-.261c-3.132-5.004.286-9.853 5.166-9.853 2.593 0 4.703 2.109 4.703 4.786 0 2.673-2.158 5.782-4.703 5.782zm2.618-4.293c-.143-.072-.857-.424-.972-.472-.143-.049-.25-.072-.321.071-.108.17-.429.525-.501.62-.107.096-.214.12-.357.049-.643-.287-1.401-.762-2.008-1.554-.25-.333.178-.309.606-1.164.072-.143.036-.262-.018-.381-.053-.12-.464-1.119-.643-1.524-.16-.381-.321-.334-.446-.334-.107-.001-.25-.001-.393-.001-.143 0-.393.048-.607.286-.214.238-.821.81-0.821 1.977 0 1.166.857 2.285.964 2.452.107.166 1.678 2.57 4.07 3.665.572.263 1.016.418 1.361.525.572.179 1.18.155 1.666.084.535-.072 1.392-.572 1.589-1.119.196-.548.196-1.024.143-1.119-.054-.096-.197-.144-.34-.215z" /></svg>
                                            <span>{labels.faq1WhatsApp}</span>
                                        </div>
                                        <div className="flex items-start gap-2 pl-1">
                                            <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-600" />
                                            <span>{labels.faq1Email}</span>
                                        </div>
                                    </div>
                                </div>
                            </details>

                            <details className="group overflow-hidden rounded-xl border border-gray-100 bg-gray-50 [&_summary::-webkit-details-marker]:hidden">
                                <summary className="flex min-h-11 cursor-pointer items-center justify-between gap-2 p-3 text-[13px] font-medium text-gray-900 transition-colors hover:bg-gray-100 sm:text-sm">
                                    <span>{labels.faq2Q}</span>
                                    <span className="shrink-0 transition duration-300 group-open:-rotate-180">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </span>
                                </summary>
                                <div className="border-t border-gray-100 px-3 pb-3 pt-2 text-[13px] leading-relaxed text-gray-600">
                                    {labels.faq2A}
                                </div>
                            </details>

                            <details className="group overflow-hidden rounded-xl border border-gray-100 bg-gray-50 [&_summary::-webkit-details-marker]:hidden">
                                <summary className="flex min-h-11 cursor-pointer items-center justify-between gap-2 p-3 text-[13px] font-medium text-gray-900 transition-colors hover:bg-gray-100 sm:text-sm">
                                    <span>{labels.faq3Q}</span>
                                    <span className="shrink-0 transition duration-300 group-open:-rotate-180">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </span>
                                </summary>
                                <div className="border-t border-gray-100 px-3 pb-3 pt-2 text-[13px] leading-relaxed text-gray-600">
                                    {labels.faq3A}
                                </div>
                            </details>

                            {/* FAQ 4 — Physical book confusion — open by default */}
                            <details open className="group overflow-hidden rounded-xl border border-blue-100 bg-blue-50/60 [&_summary::-webkit-details-marker]:hidden">
                                <summary className="flex min-h-11 cursor-pointer items-center justify-between gap-2 p-3 text-[13px] font-medium text-gray-900 transition-colors hover:bg-blue-100/60 sm:text-sm">
                                    <span>{labels.faq4Q}</span>
                                    <span className="shrink-0 transition duration-300 group-open:-rotate-180">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                    </span>
                                </summary>
                                <div className="border-t border-blue-100 px-3 pb-3 pt-2 text-[13px] leading-relaxed text-gray-600">
                                    {labels.faq4A}
                                </div>
                            </details>

                            {/* FAQ 5 — Devices */}
                            <details className="group overflow-hidden rounded-xl border border-gray-100 bg-gray-50 [&_summary::-webkit-details-marker]:hidden">
                                <summary className="flex min-h-11 cursor-pointer items-center justify-between gap-2 p-3 text-[13px] font-medium text-gray-900 transition-colors hover:bg-gray-100 sm:text-sm">
                                    <span>{labels.faq5Q}</span>
                                    <span className="shrink-0 transition duration-300 group-open:-rotate-180">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                    </span>
                                </summary>
                                <div className="border-t border-gray-100 px-3 pb-3 pt-2 text-[13px] leading-relaxed text-gray-600">
                                    {labels.faq5A}
                                </div>
                            </details>

                            {/* FAQ 6 — Updates */}
                            <details className="group overflow-hidden rounded-xl border border-gray-100 bg-gray-50 [&_summary::-webkit-details-marker]:hidden">
                                <summary className="flex min-h-11 cursor-pointer items-center justify-between gap-2 p-3 text-[13px] font-medium text-gray-900 transition-colors hover:bg-gray-100 sm:text-sm">
                                    <span>{labels.faq6Q}</span>
                                    <span className="shrink-0 transition duration-300 group-open:-rotate-180">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                    </span>
                                </summary>
                                <div className="border-t border-gray-100 px-3 pb-3 pt-2 text-[13px] leading-relaxed text-gray-600">
                                    {labels.faq6A}
                                </div>
                            </details>

                            {/* FAQ 7 — Legal advice disclaimer */}
                            <details className="group overflow-hidden rounded-xl border border-amber-100 bg-amber-50/60 [&_summary::-webkit-details-marker]:hidden">
                                <summary className="flex min-h-11 cursor-pointer items-center justify-between gap-2 p-3 text-[13px] font-medium text-gray-900 transition-colors hover:bg-amber-100/60 sm:text-sm">
                                    <span>{labels.faq7Q}</span>
                                    <span className="shrink-0 transition duration-300 group-open:-rotate-180">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                    </span>
                                </summary>
                                <div className="border-t border-amber-100 px-3 pb-3 pt-2 text-[13px] leading-relaxed text-gray-600">
                                    {labels.faq7A}
                                </div>
                            </details>
                        </div>

                        {/* Share + Help — mobile only (desktop gets it in CTA card) */}
                        <div className="mt-4 space-y-3 md:hidden">
                            <ShareButtons title={ebook.title} text={`Check out this book: ${ebook.title}`} />

                            <a
                                href={`https://wa.me/918378089292?text=${encodeURIComponent(`${labels.waMessage} ${ebook.title}\nID: ${ebook.id}\nLink: https://www.kaydyachaanifaydyach.com/ebooks/${ebook.id}`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between rounded-xl border border-green-100 bg-green-50 p-3 transition-colors active:bg-green-100"
                            >
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-gray-900">{labels.helpMobile}</span>
                                    <span className="text-[10px] text-gray-500">{labels.helpMobileSub}</span>
                                </div>
                                <div className="flex items-center gap-1.5 rounded-full bg-green-500 px-3 py-1.5 text-xs font-bold text-white">
                                    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.592 2.654-.696c1.001.572 2.135.882 3.807.882 3.123 0 5.669-2.52 5.669-5.765 0-3.186-2.586-5.786-5.669-5.786zm0 10.428c-1.353 0-2.617-.464-3.56-1.115l-.25-.173-1.637.428.44-1.593-.163-.261c-3.132-5.004.286-9.853 5.166-9.853 2.593 0 4.703 2.109 4.703 4.786 0 2.673-2.158 5.782-4.703 5.782zm2.618-4.293c-.143-.072-.857-.424-.972-.472-.143-.049-.25-.072-.321.071-.108.17-.429.525-.501.62-.107.096-.214.12-.357.049-.643-.287-1.401-.762-2.008-1.554-.25-.333.178-.309.606-1.164.072-.143.036-.262-.018-.381-.053-.12-.464-1.119-.643-1.524-.16-.381-.321-.334-.446-.334-.107-.001-.25-.001-.393-.001-.143 0-.393.048-.607.286-.214.238-.821.81-0.821 1.977 0 1.166.857 2.285.964 2.452.107.166 1.678 2.57 4.07 3.665.572.263 1.016.418 1.361.525.572.179 1.18.155 1.666.084.535-.072 1.392-.572 1.589-1.119.196-.548.196-1.024.143-1.119-.054-.096-.197-.144-.34-.215z" /></svg>
                                    WhatsApp
                                </div>
                            </a>
                        </div>

                        {/* WhatsApp help — desktop only */}
                        <div className="mt-4 hidden md:block">
                            <a
                                href={`https://wa.me/918378089292?text=${encodeURIComponent(`${labels.waMessage} ${ebook.title}\nID: ${ebook.id}\nLink: https://www.kaydyachaanifaydyach.com/ebooks/${ebook.id}`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between rounded-xl border border-green-100 bg-green-50 p-3 transition-colors hover:bg-green-100"
                            >
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-gray-900">{labels.helpDesktop}</span>
                                    <span className="text-[10px] text-gray-500">{labels.helpDesktopSub}</span>
                                </div>
                                <div className="flex items-center gap-1.5 rounded-full bg-green-500 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-green-600">
                                    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.592 2.654-.696c1.001.572 2.135.882 3.807.882 3.123 0 5.669-2.52 5.669-5.765 0-3.186-2.586-5.786-5.669-5.786zm0 10.428c-1.353 0-2.617-.464-3.56-1.115l-.25-.173-1.637.428.44-1.593-.163-.261c-3.132-5.004.286-9.853 5.166-9.853 2.593 0 4.703 2.109 4.703 4.786 0 2.673-2.158 5.782-4.703 5.782zm2.618-4.293c-.143-.072-.857-.424-.972-.472-.143-.049-.25-.072-.321.071-.108.17-.429.525-.501.62-.107.096-.214.12-.357.049-.643-.287-1.401-.762-2.008-1.554-.25-.333.178-.309.606-1.164.072-.143.036-.262-.018-.381-.053-.12-.464-1.119-.643-1.524-.16-.381-.321-.334-.446-.334-.107-.001-.25-.001-.393-.001-.143 0-.393.048-.607.286-.214.238-.821.81-0.821 1.977 0 1.166.857 2.285.964 2.452.107.166 1.678 2.57 4.07 3.665.572.263 1.016.418 1.361.525.572.179 1.18.155 1.666.084.535-.072 1.392-.572 1.589-1.119.196-.548.196-1.024.143-1.119-.054-.096-.197-.144-.34-.215z" /></svg>
                                    WhatsApp
                                </div>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Recommended Books Section */}
                {recommendedBooks.length > 0 && (
                    <div className="mt-12 mb-4 md:mt-16 md:mb-8">
                        <div className="mb-4 md:mb-6">
                            <h2 className="mb-1 flex items-center gap-2 text-xl font-bold text-brand-teal md:text-3xl">
                                <Zap className="h-5 w-5 text-brand-gold md:h-6 md:w-6" />
                                {labels.recommendedTitle}
                            </h2>
                            <p className="text-xs text-muted-foreground md:text-sm">
                                {labels.recommendedSub}
                            </p>
                        </div>
                        <RecommendedCarousel books={recommendedBooks} />
                    </div>
                )}
            </div>

            {/* Mobile Sticky Buy Bar */}
            <div className="animate-in slide-in-from-bottom-4 fade-in fixed right-0 bottom-(--sticky-bar-bottom) left-0 z-40 border-t border-gray-200 bg-white/95 px-3 py-2 shadow-[0_-2px_10px_rgba(0,0,0,0.08)] backdrop-blur-md duration-300 md:hidden">
                <p className="mb-1 truncate text-[10px] font-semibold text-gray-500">{ebook.title}</p>
                <div className="flex items-center gap-3">
                    <div className="flex shrink-0 flex-col leading-none">
                        <span className="text-[10px] text-gray-400 line-through">₹{crossedPrice}</span>
                        <span className="text-lg font-black text-green-600">₹{finalPrice}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                        <BuyButton ebookId={ebook.id} price={finalPrice} title={ebook.title} customLabel={labels.downloadBtn} language={ebook.language} />
                    </div>
                </div>
            </div>

            <ScrollToTop />
        </div>
    );
}
