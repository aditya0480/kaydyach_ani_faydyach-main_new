
import type { Metadata } from "next";
import { Lock } from "lucide-react";

export const metadata: Metadata = {
    title: "गोपनीयता धोरण | कायद्याचं आणि फायद्याचं",
    description: "Privacy Policy for Kaydyach ani Faydyach — how we collect, use, and protect your personal data. (गोपनीयता धोरण)",
};

export default function PrivacyPolicyPage() {
    return (
        <div className="container mx-auto max-w-4xl px-4 py-12 md:py-16">
            <h1 className="mb-8 bg-linear-to-r from-brand-teal to-teal-600 bg-clip-text text-center text-3xl font-bold text-transparent md:text-4xl">
                गोपनीयता धोरण (Privacy Policy)
            </h1>

            <div className="mb-10 flex items-center gap-4 rounded-2xl border border-brand-teal/20 bg-brand-teal/5 p-5 shadow-xs transition-all hover:shadow-md">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-brand-teal/10">
                    <Lock className="h-6 w-6 text-brand-teal" />
                </div>
                <div className="space-y-1">
                    <p className="text-xs font-bold tracking-wider text-brand-teal uppercase">Security First</p>
                    <p className="text-sm leading-relaxed font-medium text-gray-700 md:text-base">
                        तुमची गोपनीयता आमच्यासाठी महत्त्वाची आहे. आम्ही तुमचा डेटा सुरक्षित ठेवण्यासाठी वचनबद्ध आहोत.
                        <span className="mt-1 block text-xs font-normal text-gray-500">(Your privacy is important to us. We are committed to keeping your data secure.)</span>
                    </p>
                </div>
            </div>

            <div className="prose prose-slate max-w-none space-y-8 leading-relaxed text-gray-700">
                <p><strong>Last Updated: May 2026</strong></p>
                <p className="text-sm text-gray-500">
                    This Privacy Policy applies to Kaydyacha Ani Faydyacha (&quot;we&quot;, &quot;us&quot;) operating the website kaydyachaanifaydyach.com under the brand &quot;कायद्याचं आणि फायद्याचं&quot; (Kaydyach ani Faydyach). It is compliant with the Information Technology Act 2000, IT (Amendment) Act 2008, and the Digital Personal Data Protection Act 2023 (DPDPA 2023).
                </p>

                <section>
                    <h2 className="mb-2 text-xl font-bold text-gray-900">१. आम्ही कोणती माहिती गोळा करतो? (Information We Collect)</h2>
                    <p>आम्ही खालील माहिती गोळा करू शकतो:</p>
                    <ul className="list-disc space-y-2 pl-6">
                        <li><strong>वैयक्तिक माहिती:</strong> नाव, ईमेल पत्ता, फोन/WhatsApp नंबर (खरेदी प्रक्रियेत).</li>
                        <li><strong>पेमेंट माहिती:</strong> आम्ही स्वत: कार्ड माहिती साठवत नाही. ती Razorpay (PCI-DSS compliant gateway) द्वारे प्रोसेस केली जाते. आम्हाला फक्त Transaction ID आणि payment status मिळतो.</li>
                        <li><strong>तांत्रिक माहिती:</strong> IP address, browser type, device information, आणि pages visited (Vercel Analytics द्वारे).</li>
                        <li><strong>Cookies:</strong> Session management आणि security साठी आवश्यक cookies वापरल्या जातात. Third-party analytics cookies Vercel Analytics वापरते.</li>
                    </ul>
                    <p className="mt-2 text-sm text-gray-500">
                        We collect: Name, Email, Phone Number (during purchase); Transaction metadata from Razorpay (not raw card data); Technical data via Vercel Analytics; Session cookies for security and login state.
                    </p>
                </section>

                <section>
                    <h2 className="mb-2 text-xl font-bold text-gray-900">२. माहितीचा वापर (Use of Information)</h2>
                    <p>तुमची माहिती खालील कारणांसाठी वापरली जाते:</p>
                    <ul className="list-disc space-y-2 pl-6">
                        <li>ऑर्डर प्रोसेस करण्यासाठी आणि ई-बुक वितरित करण्यासाठी (ईमेल + WhatsApp).</li>
                        <li>पेमेंट पावती (Invoice) पाठवण्यासाठी.</li>
                        <li>नवीन पुस्तके आणि ऑफर्सबद्दल माहिती देण्यासाठी (तुम्ही कधीही अनसबस्क्राइब करू शकता).</li>
                        <li>खाते सुरक्षितता आणि फसवणूक रोखण्यासाठी.</li>
                        <li>कायदेशीर बंधने पूर्ण करण्यासाठी.</li>
                    </ul>
                    <p className="mt-2 text-sm text-gray-500">
                        We use your data to: process and deliver orders; send invoices and receipts; send product updates (unsubscribe anytime); prevent fraud; comply with legal obligations.
                    </p>
                </section>

                <section>
                    <h2 className="mb-2 text-xl font-bold text-gray-900">३. तृतीय-पक्ष सेवा प्रदाते (Third-Party Service Providers)</h2>
                    <p className="mb-2">आम्ही खालील विश्वसनीय सेवा प्रदात्यांसह डेटा शेअर करतो (फक्त आवश्यक तितका):</p>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border border-gray-200 p-3 text-left font-semibold">Provider</th>
                                    <th className="border border-gray-200 p-3 text-left font-semibold">Purpose</th>
                                    <th className="border border-gray-200 p-3 text-left font-semibold">Data Shared</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="border border-gray-200 p-3 font-medium">Razorpay</td>
                                    <td className="border border-gray-200 p-3">Payment processing</td>
                                    <td className="border border-gray-200 p-3">Name, email, phone, order amount</td>
                                </tr>
                                <tr className="bg-gray-50">
                                    <td className="border border-gray-200 p-3 font-medium">Amazon Web Services (S3)</td>
                                    <td className="border border-gray-200 p-3">Secure PDF storage & delivery</td>
                                    <td className="border border-gray-200 p-3">None (no personal data)</td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-200 p-3 font-medium">Twilio / WhatsApp</td>
                                    <td className="border border-gray-200 p-3">Order delivery notification</td>
                                    <td className="border border-gray-200 p-3">Phone number, download link</td>
                                </tr>
                                <tr className="bg-gray-50">
                                    <td className="border border-gray-200 p-3 font-medium">Vercel Analytics</td>
                                    <td className="border border-gray-200 p-3">Anonymous page analytics</td>
                                    <td className="border border-gray-200 p-3">Anonymous usage data only</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                        We never sell, rent, or trade your personal data. We only share with service providers strictly necessary to fulfill your order.
                    </p>
                </section>

                <section>
                    <h2 className="mb-2 text-xl font-bold text-gray-900">४. डेटा संग्रहण कालावधी (Data Retention)</h2>
                    <p className="mb-2">
                        आम्ही तुमची माहिती खालील कालावधीसाठी ठेवतो:
                    </p>
                    <ul className="list-disc space-y-2 pl-6">
                        <li><strong>ऑर्डर डेटा:</strong> 7 वर्षे (कर कायदे आणि लेखापरीक्षणाच्या आवश्यकतांनुसार)</li>
                        <li><strong>खाते माहिती:</strong> खाते सक्रिय असेपर्यंत + बंद केल्यानंतर 1 वर्ष</li>
                        <li><strong>Session data / Cookies:</strong> Session संपेपर्यंत (browser बंद केल्यावर)</li>
                    </ul>
                    <p className="mt-2 text-sm text-gray-500">
                        Order data retained 7 years (tax/audit compliance). Account data retained while active + 1 year post-closure. Session cookies expire on browser close.
                    </p>
                </section>

                <section>
                    <h2 className="mb-2 text-xl font-bold text-gray-900">५. डेटा सुरक्षा (Data Security)</h2>
                    <p className="mb-2">
                        तुमची माहिती सुरक्षित ठेवण्यासाठी आम्ही खालील उपाययोजना करतो: SSL/TLS encryption, Razorpay PCI-DSS compliance, AWS S3 secure storage, आणि database-level encryption. मात्र, इंटरनेटवरील कोणताही डेटा ट्रान्समिशन १००% सुरक्षित असण्याची हमी देता येत नाही.
                    </p>
                    <p className="text-sm text-gray-500">
                        We implement SSL/TLS encryption, use PCI-DSS compliant Razorpay for payments, and secure AWS S3 for file storage. No internet transmission is 100% secure — we mitigate risk through industry-standard measures.
                    </p>
                </section>

                <section>
                    <h2 className="mb-2 text-xl font-bold text-gray-900">६. तुमचे अधिकार (Your Rights — DPDPA 2023)</h2>
                    <p className="mb-2">डिजिटल वैयक्तिक डेटा संरक्षण कायदा 2023 अंतर्गत तुम्हाला खालील अधिकार आहेत:</p>
                    <ul className="list-disc space-y-2 pl-6">
                        <li><strong>माहिती मिळवणे:</strong> आम्ही तुमच्याबद्दल काय डेटा ठेवतो ते जाणून घेण्याचा अधिकार.</li>
                        <li><strong>दुरुस्ती:</strong> चुकीची माहिती सुधारण्याचा अधिकार.</li>
                        <li><strong>हटवणे:</strong> काही अटींच्या अधीन, तुमचा डेटा हटवण्याची विनंती करण्याचा अधिकार.</li>
                        <li><strong>नामांकन:</strong> तुमच्या मृत्यूनंतर डेटा व्यवस्थापनासाठी व्यक्ती नामांकित करण्याचा अधिकार.</li>
                    </ul>
                    <p className="mt-2 text-sm text-gray-500">
                        Under DPDPA 2023, you have rights to: access your data, correct inaccuracies, request erasure (subject to legal retention requirements), and nominate a person to manage your data.
                        To exercise any right, email: <a href="mailto:support@kaydyachaanifaydyach.com" className="text-brand-teal hover:underline">support@kaydyachaanifaydyach.com</a>
                    </p>
                </section>

                <section>
                    <h2 className="mb-2 text-xl font-bold text-gray-900">७. तक्रार निवारण अधिकारी (Grievance Officer)</h2>
                    <p className="mb-2">
                        IT Rules 2021 आणि DPDPA 2023 नुसार नियुक्त तक्रार निवारण अधिकारी:
                    </p>
                    <div className="rounded-lg border border-gray-100 bg-gray-50 p-5 text-sm">
                        <p><strong>Organization:</strong> Kaydyacha Ani Faydyacha</p>
                        <p><strong>Email:</strong> <a href="mailto:support@kaydyachaanifaydyach.com" className="text-brand-teal hover:underline">support@kaydyachaanifaydyach.com</a></p>
                        <p><strong>Phone:</strong> +91 83780 89292</p>
                        <p><strong>Address:</strong> Floor No. 3, Amit Court Building, Civil Court, Shivaji Nagar, Pune, Maharashtra 411004, India</p>
                        <p><strong>तक्रार प्रतिसाद वेळ:</strong> 48 तासांत (Response within 48 hours)</p>
                        <p><strong>निराकरण वेळ:</strong> 30 दिवसांत (Resolution within 30 days)</p>
                    </div>
                </section>

                <section>
                    <h2 className="mb-2 text-xl font-bold text-gray-900">८. संपर्क (Contact Us)</h2>
                    <p className="mb-2">
                        गोपनीयता धोरणाबद्दल प्रश्न असल्यास: <a href="mailto:support@kaydyachaanifaydyach.com" className="font-bold text-brand-teal hover:underline">support@kaydyachaanifaydyach.com</a>
                    </p>
                </section>
            </div>
        </div>
    );
}
