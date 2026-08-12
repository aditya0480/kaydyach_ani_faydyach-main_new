
import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
    title: "नियम आणि अटी | कायद्याचं आणि फायद्याचं",
    description: "Terms and Conditions for using Kaydyach ani Faydyach and purchasing our digital ebooks. (नियम आणि अटी)",
};

export default function TermsPage() {
    return (
        <div className="container mx-auto max-w-4xl px-4 py-12 md:py-16">
            <h1 className="mb-8 bg-linear-to-r from-brand-teal to-teal-600 bg-clip-text text-center text-3xl font-bold text-transparent md:text-4xl">
                नियम आणि अटी (Terms and Conditions)
            </h1>

            <div className="mb-10 flex items-center gap-4 rounded-2xl border border-brand-teal/20 bg-brand-teal/5 p-5 shadow-xs transition-all hover:shadow-md">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-brand-teal/10">
                    <ShieldCheck className="h-6 w-6 text-brand-teal" />
                </div>
                <div className="space-y-1">
                    <p className="text-xs font-bold tracking-wider text-brand-teal uppercase">अधिकृत प्लॅटफॉर्म माहिती (Official Info)</p>
                    <p className="text-sm leading-relaxed font-medium text-gray-700 md:text-base">
                        हे डिजिटल प्लॅटफॉर्म <span className="font-bold text-gray-900">Kaydyacha Ani Faydyacha</span> द्वारे मालकीचे आणि चालवले जाते — &quot;कायद्याचं आणि फायद्याचं&quot; (kaydyachaanifaydyach.com) या ब्रँड नावाखाली.
                        <span className="mt-1 block text-xs font-normal text-gray-500">(This platform is owned and operated by Kaydyacha Ani Faydyacha under the brand &quot;Kaydyach ani Faydyach&quot;.)</span>
                    </p>
                </div>
            </div>

            <div className="prose prose-slate max-w-none space-y-8 leading-relaxed text-gray-700">
                <p><strong>Last Updated: May 2026</strong></p>

                <div className="rounded-lg border border-gray-200 bg-gray-50 p-5 text-sm">
                    <p className="font-semibold text-gray-800 mb-1">Business Details / व्यवसाय तपशील</p>
                    <p><strong>Registered Enterprise Name:</strong> KAYDYACHA ANI FAYDYACHA</p>
                    <p><strong>Udyam Registration No.:</strong> UDYAM-MH-26-1024122</p>
                    <p><strong>Proprietor / Owner:</strong> Shrutika Gochade</p>
                    <p><strong>Brand:</strong> कायद्याचं आणि फायद्याचं (Kaydyach ani Faydyach)</p>
                    <p><strong>Website:</strong> https://kaydyachaanifaydyach.com</p>
                    <p><strong>Business Type:</strong> Digital Goods — Educational Ebooks (PDF only, no physical goods)</p>
                    <p><strong>GST No.:</strong> Not applicable (below GST threshold)</p>
                    <p><strong>Registration:</strong> Udyam Registration (MSME) — Micro Enterprise, Services</p>
                    <p><strong>Address:</strong> Floor No. 3, Amit Court Building, Civil Court, Shivaji Nagar, Pune, Maharashtra 411004, India</p>
                    <p><strong>Email:</strong> support@kaydyachaanifaydyach.com</p>
                    <p><strong>Phone:</strong> +91 83780 89292</p>
                </div>

                <section>
                    <h2 className="mb-2 text-xl font-bold text-gray-900">१. अटींचा स्वीकार (Agreement to Terms)</h2>
                    <p className="mb-2">
                        या साइटला भेट देऊन किंवा आमची उत्पादने खरेदी करून, तुम्ही या नियम आणि अटींना बांधील राहण्यास सहमती दर्शवता. जर तुम्ही या अटींशी सहमत नसाल, तर कृपया साइटचा वापर थांबवा.
                    </p>
                    <p className="text-sm text-gray-500">
                        By accessing the Site, you agree to be bound by these Terms and Conditions. If you do not agree with all of these terms, you are explicitly prohibited from using the Site.
                    </p>
                </section>

                <section>
                    <h2 className="mb-2 text-xl font-bold text-gray-900">२. व्यवसायाचे स्वरूप (Nature of Business)</h2>
                    <p className="mb-2">
                        <strong>Kaydyacha Ani Faydyacha</strong> हे पूर्णपणे डिजिटल उत्पादनांचे (ई-बुक्स/PDF) विक्रेते आहे. आम्ही कोणतेही भौतिक (Physical) उत्पादन विकत नाही किंवा पाठवत नाही. सर्व खरेदी डिजिटल स्वरूपात तत्काळ दिली जाते — ईमेल आणि/किंवा WhatsApp द्वारे.
                    </p>
                    <p className="text-sm text-gray-500">
                        Kaydyacha Ani Faydyacha exclusively sells digital products (ebooks/PDFs). No physical goods are sold or shipped. All purchases are delivered digitally and instantly via email and/or WhatsApp. This is a digital-goods-only business.
                    </p>
                </section>

                <section>
                    <h2 className="mb-2 text-xl font-bold text-gray-900">३. बौद्धिक संपदा अधिकार (Intellectual Property Rights)</h2>
                    <p className="mb-2">
                        साइटवरील सर्व मजकूर, ई-बुक्स, आणि डिझाइन <strong>Kaydyacha Ani Faydyacha</strong> ची मालमत्ता आहे. आमच्या लेखी परवानगीशिवाय कोणत्याही सामग्रीची कॉपी, विक्री, शेअरिंग किंवा वितरण करण्यास सक्त मनाई आहे.
                    </p>
                    <p className="text-sm text-gray-500">
                        Unless otherwise indicated, the Site and all ebooks are proprietary property of Kaydyacha Ani Faydyacha. No part of the content may be copied, reproduced, sold, shared, or exploited without our express prior written permission.
                    </p>
                </section>

                <section>
                    <h2 className="mb-2 text-xl font-bold text-gray-900">४. वापरकर्ता प्रतिज्ञा (User Representations)</h2>
                    <p className="mb-2">
                        साइट वापरताना तुम्ही हे मान्य करता की: (१) तुम्ही दिलेली माहिती सत्य आणि अचूक आहे, (२) तुम्ही कायद्याचे पालन कराल, आणि (३) तुम्ही कोणत्याही अनधिकृत कामासाठी साइटचा वापर करणार नाही.
                    </p>
                    <p className="text-sm text-gray-500">
                        By using the Site, you represent that: (1) all registration information you submit is truthful and accurate, (2) you will comply with these Terms, and (3) you will not use the Site for any illegal or unauthorized purpose.
                    </p>
                </section>

                <section>
                    <h2 className="mb-2 text-xl font-bold text-gray-900">५. खरेदी आणि पेमेंट (Purchases and Payment)</h2>
                    <p className="mb-2">
                        आम्ही खालील पेमेंट पद्धती स्वीकारतो: UPI (Google Pay, PhonePe), क्रेडिट/डेबिट कार्ड्स, नेट बँकिंग. तुम्ही सहमत आहात की दिलेली पेमेंट माहिती अचूक आहे. आम्ही <strong>Razorpay</strong> सुरक्षित पेमेंट गेटवे वापरतो. पेमेंट यशस्वी झाल्यावर तुम्हाला तत्काळ डाउनलोड लिंक मिळेल.
                    </p>
                    <p className="text-sm text-gray-500">
                        We accept UPI, Credit/Debit Cards, and Net Banking via Razorpay (our secure payment gateway). You agree to provide accurate purchase information. Upon successful payment, digital access is granted immediately.
                    </p>
                </section>

                <section>
                    <h2 className="mb-2 text-xl font-bold text-gray-900">६. डिजिटल उत्पादनांचा वापर (Digital Products Usage)</h2>
                    <p className="mb-2">
                        खरेदी केल्यानंतर तुम्हाला ई-बुक वापरण्याचा वैयक्तिक, हस्तांतरण-अयोग्य परवाना मिळतो. हे ई-बुक इतरांना शेअर करणे, विकणे, पुनर्वितरण करणे, किंवा सार्वजनिकरित्या प्रदर्शित करणे कायदेशीर गुन्हा आहे आणि कायदेशीर कारवाई होऊ शकते.
                    </p>
                    <p className="text-sm text-gray-500">
                        Upon purchase, you are granted a personal, non-transferable license for your own use only. Distributing, sharing, reselling, or publicly displaying ebook content is a violation of copyright law and may result in legal action.
                    </p>
                </section>

                <section>
                    <h2 className="mb-2 text-xl font-bold text-gray-900">७. परतावा आणि रद्दीकरण (Refund and Cancellation)</h2>
                    <p className="mb-2">
                        डिजिटल उत्पादन (PDF) एकदा वितरित केल्यावर परतावा शक्य नाही. तथापि, तांत्रिक त्रुटीमुळे दुहेरी पेमेंट झाल्यास किंवा पेमेंट कापले पण पुस्तक न मिळाल्यास, आम्ही 48-72 तासांत परिस्थिती सुधारू. विस्तृत माहितीसाठी आमचे <a href="/refund-policy" className="text-brand-teal hover:underline">परतावा धोरण</a> पाहा.
                    </p>
                    <p className="text-sm text-gray-500">
                        Digital products are non-refundable once delivered. However, in case of double payment or payment deducted but product not received, we will resolve within 48-72 hours. See our full <a href="/refund-policy" className="text-brand-teal hover:underline">Refund Policy</a>.
                    </p>
                </section>

                <section>
                    <h2 className="mb-2 text-xl font-bold text-gray-900">८. बदल आणि व्यत्यय (Modifications and Interruptions)</h2>
                    <p className="mb-2">
                        आम्ही कधीही साइट किंवा सेवांमध्ये बदल करण्याचा अधिकार राखून ठेवतो. तांत्रिक कारणांमुळे साइट कधीतरी बंद असू शकते, ज्यासाठी आम्ही जबाबदार नाही.
                    </p>
                    <p className="text-sm text-gray-500">
                        We reserve the right to change or remove contents of the Site at any time. We cannot guarantee the Site will be available at all times due to maintenance or technical issues.
                    </p>
                </section>

                <section>
                    <h2 className="mb-2 text-xl font-bold text-gray-900">९. दायित्व मर्यादा (Limitation of Liability)</h2>
                    <p className="mb-2">
                        Kaydyacha Ani Faydyacha कोणत्याही अप्रत्यक्ष, प्रासंगिक किंवा परिणामी नुकसानीसाठी जबाबदार नाही. आमची एकूण जबाबदारी तुम्ही दिलेल्या खरेदी रकमेपेक्षा जास्त असणार नाही.
                    </p>
                    <p className="text-sm text-gray-500">
                        Kaydyacha Ani Faydyacha shall not be liable for any indirect, incidental, or consequential damages. Our total liability shall not exceed the amount paid by you for the specific purchase.
                    </p>
                </section>

                <section>
                    <h2 className="mb-2 text-xl font-bold text-gray-900">१०. कायदेशीर सल्ल्याचे अस्वीकरण (Disclaimer of Legal Advice)</h2>
                    <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-900">
                        <p className="mb-2 font-bold tracking-wide uppercase">महत्वाची कायदेशीर सूचना (Important Legal Notice):</p>
                        <p className="mb-2">
                            या साइटवर आणि आमच्या ई-बुक्समध्ये दिलेली माहिती केवळ शैक्षणिक आणि माहितीच्या उद्देशाने आहे. हा कोणताही कायदेशीर सल्ला नाही आणि यामुळे वकील-ग्राहक संबंध तयार होत नाहीत.
                        </p>
                        <p className="text-xs font-medium text-yellow-800/80">
                            The information, content, and materials provided on this Site and in our ebooks are for general informational and educational purposes only. They do not constitute legal advice, and no attorney-client relationship is formed. Laws change frequently — always consult a qualified lawyer for your specific legal situation.
                        </p>
                    </div>
                </section>

                <section>
                    <h2 className="mb-2 text-xl font-bold text-gray-900">११. लागू कायदा (Governing Law)</h2>
                    <p className="mb-2">
                        हे नियम आणि अटी भारतीय कायद्यानुसार आहेत, विशेषतः माहिती तंत्रज्ञान कायदा 2000, ग्राहक संरक्षण (ई-कॉमर्स) नियम 2020, आणि डिजिटल वैयक्तिक डेटा संरक्षण कायदा 2023. कोणतेही वाद पुणे, महाराष्ट्र न्यायालयाच्या अधिकारक्षेत्रात येतील.
                    </p>
                    <p className="text-sm text-gray-500">
                        These Terms are governed by the laws of India including the Information Technology Act 2000, Consumer Protection (E-Commerce) Rules 2020, and Digital Personal Data Protection Act 2023. Disputes shall be subject to the exclusive jurisdiction of courts in Pune, Maharashtra.
                    </p>
                </section>

                <section>
                    <h2 className="mb-2 text-xl font-bold text-gray-900">१२. तक्रार निवारण अधिकारी (Grievance Officer)</h2>
                    <p className="mb-2">
                        माहिती तंत्रज्ञान कायदा 2000 आणि ग्राहक संरक्षण कायद्यानुसार, आमचे तक्रार निवारण अधिकारी:
                    </p>
                    <div className="rounded-lg border border-gray-100 bg-gray-50 p-5 text-sm">
                        <p><strong>नाव / Name:</strong> Kaydyacha Ani Faydyacha — Grievance Officer</p>
                        <p><strong>Email:</strong> <a href="mailto:support@kaydyachaanifaydyach.com" className="text-brand-teal hover:underline">support@kaydyachaanifaydyach.com</a></p>
                        <p><strong>Phone:</strong> +91 83780 89292</p>
                        <p><strong>Response Time:</strong> तक्रार मिळाल्यापासून 48 तासांत (Within 48 hours of receiving complaint)</p>
                        <p><strong>Resolution Time:</strong> 30 दिवसांत (Within 30 days)</p>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                        As required by the Information Technology Act 2000 and Consumer Protection Rules 2020, we have designated a Grievance Officer to address user complaints. Complaints are acknowledged within 48 hours and resolved within 30 days.
                    </p>
                </section>

                <section>
                    <h2 className="mb-2 text-xl font-bold text-gray-900">१३. संपर्क (Contact Us)</h2>
                    <address className="rounded-lg border border-gray-100 bg-gray-50 p-6 not-italic">
                        <strong>Kaydyacha Ani Faydyacha</strong><br />
                        Brand: कायद्याचं आणि फायद्याचं (Kaydyach ani Faydyach)<br />
                        Email: <a href="mailto:support@kaydyachaanifaydyach.com" className="text-brand-teal hover:underline">support@kaydyachaanifaydyach.com</a><br />
                        Phone: <a href="tel:+918378089292" className="text-brand-teal hover:underline">+91 83780 89292</a><br />
                        Floor No. 3, Amit Court Building, Civil Court,<br />
                        Shivaji Nagar, Pune, Maharashtra 411004, India
                    </address>
                </section>
            </div>
        </div>
    );
}
