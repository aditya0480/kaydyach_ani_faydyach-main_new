
import type { Metadata } from "next";
import { BookOpen, Shield, Building2, Mail, Phone, MapPin } from "lucide-react";
import { BUSINESS_INFO } from "@/lib/business-info";

export const metadata: Metadata = {
    title: "आमच्याबद्दल | कायद्याचं आणि फायद्याचं",
    description: "कायद्याचं आणि फायद्याचं बद्दल जाणून घ्या, कायद्याचे ज्ञान सर्वांसाठी सोपे करण्याचे आमचे ध्येय.",
};

export default function AboutPage() {
    return (
        <div className="container mx-auto max-w-5xl px-4 py-8 md:py-8">
            {/* Hero Section */}
            <div className="mx-auto mb-16 max-w-3xl space-y-4 text-center">
                <h1 className="bg-linear-to-r from-brand-teal to-teal-600 bg-clip-text text-3xl leading-tight font-bold text-transparent md:text-5xl">
                    कायद्याच्या ज्ञानाने तुम्हाला सक्षम करणे
                </h1>
                <p className="text-lg leading-relaxed text-gray-600 md:text-xl">
                    <strong>कायद्याचं आणि फायद्याचं</strong> मध्ये तुमचे स्वागत आहे. सर्वांसाठी कायद्याची गुंतागुंतीची माहिती सोप्या, परवडणाऱ्या आणि समजण्यास सोप्या भाषेत उपलब्ध करून देण्यास आम्ही वचनबद्ध आहोत.
                </p>
            </div>

            {/* Mission & Vision */}
            <div className="mb-20 grid gap-12 md:grid-cols-2">
                <div className="rounded-2xl border border-teal-100 bg-linear-to-br from-teal-50 to-white p-8 shadow-sm transition-shadow hover:shadow-md">
                    <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-white text-brand-teal shadow-sm">
                        <Shield className="h-6 w-6" />
                    </div>
                    <h2 className="mb-4 text-2xl font-bold text-gray-900">आमचे ध्येय (Mission)</h2>
                    <p className="text-lg leading-relaxed text-gray-700">
                        सामान्य माणसासाठी कायदा सोपा करणे. आमचा असा विश्वास आहे की कायद्याचे ज्ञान कोणा एकाचा विशेषाधिकार नसून तो प्रत्येकाचा मूलभूत हक्क आहे. आमचे ध्येय म्हणजे क्लिष्ट कायदे आणि त्यांचे दैनंदिन जीवनातील उपयोग यांमधील दरी आमच्या साध्या आणि अभ्यासू ई-बुक्सच्या माध्यमातून भरून काढणे.
                    </p>
                </div>
                <div className="rounded-2xl border border-blue-100 bg-linear-to-br from-blue-50 to-white p-8 shadow-sm transition-shadow hover:shadow-md">
                    <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                        <BookOpen className="h-6 w-6" />
                    </div>
                    <h2 className="mb-4 text-2xl font-bold text-gray-900">आम्ही काय करतो (What We Do)</h2>
                    <p className="text-lg leading-relaxed text-gray-700">
                        आम्ही भारतातील दैनंदिन जीवनाशी संबंधित विविध कायदेशीर विषयांवर उच्च-दर्जाची आणि वाचण्यास सोपी ई-बुक्स तयार करतो. मालमत्ता कायदा आणि ग्राहक हक्कांपासून ते व्यवसाय नियमनांपर्यंत, आमची संसाधने तुमचे हित जपण्यासाठी आणि तुम्हाला योग्य निर्णय घेण्यास मदत करण्यासाठी तयार केली गेली आहेत.
                    </p>
                </div>
            </div>

            {/* Stats / Trust */}
            <div className="mb-20 grid grid-cols-2 gap-6 md:grid-cols-4">
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-6 text-center transition-colors hover:border-brand-teal/30">
                    <div className="mb-2 text-3xl font-bold text-brand-teal">50+</div>
                    <div className="text-sm font-medium text-gray-600">प्रकाशित ई-बुक्स</div>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-6 text-center transition-colors hover:border-brand-teal/30">
                    <div className="mb-2 text-3xl font-bold text-brand-teal">10k+</div>
                    <div className="text-sm font-medium text-gray-600">समाधानी वाचक</div>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-6 text-center transition-colors hover:border-brand-teal/30">
                    <div className="mb-2 text-3xl font-bold text-brand-teal">65k+</div>
                    <div className="text-sm font-medium text-gray-600">सोशल कम्युनिटी</div>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-6 text-center transition-colors hover:border-brand-teal/30">
                    <div className="mb-2 text-3xl font-bold text-brand-teal">24/7</div>
                    <div className="text-sm font-medium text-gray-600">सपोर्ट ॲक्सेस</div>
                </div>
            </div>

            {/* Story / Context */}
            <div className="prose prose-lg prose-slate mx-auto mb-20 max-w-3xl text-center">
                <h2 className="mb-6 text-3xl font-bold text-gray-900">आम्हालाच का निवडावे?</h2>
                <p className="text-gray-700">
                    कायद्याची क्लिष्ट भाषा भीतीदायक असू शकते. <strong>कायद्याचं आणि फायद्याचं</strong> मध्ये आम्ही हा गोंधळ दूर करतो. आमची कायदेतज्ज्ञ आणि संपादकांची टीम कायद्याची भाषा (मराठी आणि इंग्रजीमध्ये) इतकी सोपी करते की तुम्ही ती सहजपणे वापरू शकता. तुम्ही विद्यार्थी असाल, व्यावसायिक असाल किंवा एक जागृत नागरिक, आमची पुस्तके तुमचे &apos;पॉकेट लीगल ॲडव्हायझर्स&apos; आहेत.
                </p>
            </div>

            {/* Business Entity Info — required for payment gateway compliance */}
            <div className="mx-auto mb-16 max-w-3xl rounded-2xl border border-gray-200 bg-gray-50 p-8">
                <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-brand-teal shadow-sm ring-1 ring-gray-100">
                        <Building2 className="h-5 w-5" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">व्यवसाय माहिती (Business Information)</h2>
                </div>
                <div className="grid gap-4 text-sm md:grid-cols-2">
                    <div>
                        <p className="mb-0.5 text-xs font-semibold tracking-wider text-gray-400 uppercase">Registered Enterprise Name</p>
                        <p className="font-semibold text-gray-800">KAYDYACHA ANI FAYDYACHA</p>
                    </div>
                    <div>
                        <p className="mb-0.5 text-xs font-semibold tracking-wider text-gray-400 uppercase">Proprietor / Owner</p>
                        <p className="font-semibold text-gray-800">Shrutika Gochade</p>
                    </div>
                    <div>
                        <p className="mb-0.5 text-xs font-semibold tracking-wider text-gray-400 uppercase">Brand Name</p>
                        <p className="font-semibold text-gray-800">कायद्याचं आणि फायद्याचं</p>
                    </div>
                    <div>
                        <p className="mb-0.5 text-xs font-semibold tracking-wider text-gray-400 uppercase">Business Type</p>
                        <p className="font-semibold text-gray-800">Digital Goods — Educational Ebooks (PDF only)</p>
                    </div>
                    <div>
                        <p className="mb-0.5 text-xs font-semibold tracking-wider text-gray-400 uppercase">Registration</p>
                        <p className="font-semibold text-gray-800">Udyam Registration (MSME) — UDYAM-MH-26-1024122</p>
                    </div>
                    <div>
                        <p className="mb-0.5 text-xs font-semibold tracking-wider text-gray-400 uppercase">Website</p>
                        <p className="font-semibold text-gray-800">kaydyachaanifaydyach.com</p>
                    </div>
                    <div>
                        <p className="mb-0.5 text-xs font-semibold tracking-wider text-gray-400 uppercase">Operating Since</p>
                        <p className="font-semibold text-gray-800">{BUSINESS_INFO.foundedYear}</p>
                    </div>
                    <div>
                        <p className="mb-0.5 text-xs font-semibold tracking-wider text-gray-400 uppercase">Support Hours</p>
                        <p className="font-semibold text-gray-800">{BUSINESS_INFO.supportHours}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 shrink-0 text-brand-teal" />
                        <a href="mailto:support@kaydyachaanifaydyach.com" className="font-medium text-brand-teal hover:underline">support@kaydyachaanifaydyach.com</a>
                    </div>
                    <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 shrink-0 text-brand-teal" />
                        <a href="tel:+918378089292" className="font-medium text-brand-teal hover:underline">+91 83780 89292</a>
                    </div>
                    <div className="flex items-center gap-2 md:col-span-2">
                        <MapPin className="h-4 w-4 shrink-0 text-brand-teal" />
                        <span className="font-medium text-gray-700">Floor No. 3, Amit Court Building, Civil Court, Shivaji Nagar, Pune, Maharashtra 411004, India</span>
                    </div>
                </div>
                <p className="mt-4 text-xs text-gray-400">
                    * आमची उत्पादने केवळ संदर्भ आणि शैक्षणिक उद्देशाने आहेत. हे कायदेशीर सल्ला (Legal Advice) नाही.
                    (Products are for reference/educational purposes only. Not legal advice or consultation.)
                </p>
                <div className="mt-4 rounded-lg border border-brand-teal/20 bg-brand-teal/5 p-3 text-xs text-gray-600">
                    <p className="font-semibold text-gray-800 mb-1">Content Authorization / सामग्री अधिकृतता</p>
                    <p>All ebook content on this platform is authored by <strong>Ajay Mane</strong> and <strong>Shrutika Gochade</strong>, legal literacy authors and educators. They have authorized Kaydyacha Ani Faydyacha (Proprietor: Shrutika Gochade) to publish and distribute this educational content digitally under the brand &quot;कायद्याचं आणि फायद्याचं&quot;.</p>
                    <p className="mt-1 font-light">या प्लॅटफॉर्मवरील सर्व ई-बुक सामग्री <strong>अजय माने</strong> आणि <strong>श्रुतिका गोचडे</strong> यांनी लिहिलेली आहे.</p>
                </div>
            </div>

        </div>
    );
}
