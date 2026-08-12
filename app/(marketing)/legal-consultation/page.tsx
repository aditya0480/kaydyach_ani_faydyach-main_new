import type { Metadata } from "next";
import { CheckCircle2, MessageCircleQuestion, Phone, Scale, ShieldCheck, Sparkles, TrendingUp, Zap } from "lucide-react";
import { BookingSheetProvider, BookNowButton, StickyBookBar } from "./_components/booking-sheet";
import { getConsultationPrice } from "@/lib/consultation-config";

export async function generateMetadata(): Promise<Metadata> {
    const price = await getConsultationPrice();
    return {
        title: "कायदेशीर सल्ला बुक करा | Legal Consultation",
        description: `फक्त ₹${price} मध्ये तज्ञ वकिलाशी कायदेशीर सल्लामसलत बुक करा. मालमत्ता, कौटुंबिक, ग्राहक तक्रार आणि इतर कायदेशीर बाबींसाठी मदत.`,
    };
}

function getSteps(price: number) {
    return [
        { title: "फॉर्म भरा", desc: "नाव, मोबाईल नंबर आणि तुमच्या समस्येचा विषय निवडा.", icon: "📝" },
        { title: `₹${price} भरा`, desc: "UPI, कार्ड किंवा नेटबँकिंगने सुरक्षित पेमेंट करा.", icon: "💳" },
        { title: "कॉल मिळवा", desc: "आमची टीम 24 तासांत तुमच्याशी संपर्क साधेल.", icon: "📞" },
    ] as const;
}

const FAQS = [
    {
        q: "सल्ला कोण देईल?",
        a: "आमच्या टीमशी संबंधित अनुभवी वकील आणि कायदेशीर सल्लागार तुमच्याशी संपर्क साधतील.",
    },
    {
        q: "पेमेंट केल्यानंतर किती वेळात संपर्क होईल?",
        a: "साधारणपणे 24 तासांच्या आत आमची टीम तुम्हाला दिलेल्या मोबाईल नंबरवर कॉल करेल.",
    },
    {
        q: "माझी माहिती सुरक्षित आहे का?",
        a: "होय. तुमची वैयक्तिक माहिती फक्त सल्ला देण्यासाठी वापरली जाते आणि कोणासोबतही शेअर केली जात नाही.",
    },
    {
        q: "पेमेंट परत मिळू शकते का?",
        a: "एकदा सल्ला बुक झाल्यावर आणि टीमने संपर्क केल्यावर रिफंड दिला जात नाही. काही तांत्रिक अडचण असल्यास आमच्याशी WhatsApp वर संपर्क साधा.",
    },
];

export default async function LegalConsultationPage() {
    const price = await getConsultationPrice();
    const STEPS = getSteps(price);

    return (
        <BookingSheetProvider price={price}>
        <div className="bg-white pb-24">
            {/* Hero */}
            <section className="relative overflow-hidden bg-brand-teal px-4 pt-10 pb-14 text-white md:pt-16 md:pb-20">
                <div className="mx-auto max-w-3xl text-center">
                    <div className="mx-auto mb-4 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[10px] font-bold tracking-wide text-brand-gold/80 uppercase backdrop-blur-md md:text-xs">
                        <Scale className="h-3 w-3" />
                        तज्ञ वकिलाकडून थेट सल्ला
                    </div>

                    <h1 className="bg-linear-to-b from-white via-white to-white/70 bg-clip-text text-3xl leading-[1.15] font-black tracking-tight text-transparent sm:text-5xl">
                        कायदेशीर सल्ला बुक करा <br />
                        फक्त{" "}
                        <span className="bg-linear-to-r from-brand-gold via-yellow-200 to-brand-gold bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(255,193,7,0.3)]">
                            ₹{price}
                        </span>{" "}
                        मध्ये
                    </h1>

                    <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed font-normal text-slate-300 md:text-lg">
                        मालमत्ता, कौटुंबिक वाद, ग्राहक तक्रार किंवा इतर कोणत्याही कायदेशीर अडचणीसाठी — फॉर्म भरा, पेमेंट करा, आणि आमची टीम तुम्हाला थेट कॉल करेल.
                    </p>

                    {/* Trust metrics */}
                    <div className="mx-auto mt-7 grid max-w-md grid-cols-3 gap-2.5 sm:gap-3">
                        <div className="rounded-xl border border-white/10 bg-white/5 p-2.5 backdrop-blur-md">
                            <p className="text-sm leading-none font-black text-white md:text-base">500+</p>
                            <p className="mt-1 text-[9px] font-medium text-slate-400 md:text-[10px]">ग्राहकांना मदत</p>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-white/5 p-2.5 backdrop-blur-md">
                            <div className="flex items-center justify-center gap-1">
                                <TrendingUp className="h-3 w-3 text-green-400" />
                                <p className="text-sm leading-none font-black text-white md:text-base">4.8/5</p>
                            </div>
                            <p className="mt-1 text-[9px] font-medium text-slate-400 md:text-[10px]">रेटिंग</p>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-white/5 p-2.5 backdrop-blur-md">
                            <p className="text-sm leading-none font-black text-white md:text-base">24 तास</p>
                            <p className="mt-1 text-[9px] font-medium text-slate-400 md:text-[10px]">कॉल-बॅक</p>
                        </div>
                    </div>

                    <BookNowButton className="mt-8 h-14 w-full rounded-2xl bg-brand-gold px-8 text-base font-black text-brand-teal shadow-xl shadow-brand-gold/20 transition-all duration-300 hover:bg-yellow-400 active:scale-[0.98] sm:w-fit">
                        <Zap className="h-5 w-5 fill-current" />
                        आता बुक करा - ₹{price}
                    </BookNowButton>
                </div>

                <div className="absolute bottom-0 left-0 h-16 w-full bg-linear-to-t from-white to-transparent md:h-24" />
            </section>

            {/* How it works */}
            <section className="mx-auto max-w-4xl px-4 py-10 md:py-14">
                <h2 className="mb-6 text-center text-lg font-bold text-brand-teal md:text-2xl">
                    फक्त 3 सोप्या पायऱ्यांमध्ये
                </h2>
                <div className="grid gap-4 sm:grid-cols-3">
                    {STEPS.map((step, i) => (
                        <div
                            key={step.title}
                            className="relative rounded-2xl border border-gray-100 bg-gray-50 p-5 text-center transition-colors hover:border-brand-teal/30"
                        >
                            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border-2 border-brand-teal/20 bg-white text-xl shadow-sm">
                                {step.icon}
                            </div>
                            <p className="text-[10px] font-black tracking-widest text-brand-gold/80 uppercase">
                                पायरी {i + 1}
                            </p>
                            <p className="mt-1 text-sm font-bold text-brand-teal md:text-base">{step.title}</p>
                            <p className="mt-1.5 text-xs leading-relaxed text-gray-500">{step.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA + trust grid */}
            <section className="mx-auto max-w-5xl px-4 pb-14">
                <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:items-start">
                    <div className="rounded-2xl border border-brand-teal/10 bg-brand-teal/5 p-6 text-center md:p-8">
                        <p className="text-[10px] font-black tracking-widest text-brand-gold/80 uppercase">
                            तुमची कायदेशीर समस्या आजच सोडवा
                        </p>
                        <h2 className="mt-2 text-xl font-bold text-brand-teal md:text-2xl">
                            फक्त 2 मिनिटांत बुकिंग पूर्ण करा
                        </h2>
                        <p className="mx-auto mt-2 max-w-sm text-xs text-gray-600 md:text-sm">
                            नाव, मोबाईल नंबर आणि विषय द्या — ₹{price} पेमेंटनंतर आमची टीम 24 तासांत तुम्हाला कॉल करेल.
                        </p>
                        <BookNowButton className="mt-5 w-full rounded-2xl bg-brand-teal text-base font-bold text-white shadow-lg transition-all hover:bg-brand-teal/90 sm:w-fit sm:px-10">
                            <Zap className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                            आता बुक करा - ₹{price}
                        </BookNowButton>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-brand-teal shadow-sm">
                                <ShieldCheck className="h-4.5 w-4.5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-900">100% सुरक्षित पेमेंट</p>
                                <p className="mt-0.5 text-xs text-gray-500">Razorpay द्वारे UPI, कार्ड, नेटबँकिंग — तुमची माहिती सुरक्षित राहते.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-brand-teal shadow-sm">
                                <Sparkles className="h-4.5 w-4.5 text-brand-gold" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-900">अनुभवी वकील</p>
                                <p className="mt-0.5 text-xs text-gray-500">तुमच्या विषयातील तज्ञ वकील तुमच्याशी थेट बोलेल.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-brand-teal shadow-sm">
                                <CheckCircle2 className="h-4.5 w-4.5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-900">गोपनीयता जपली जाते</p>
                                <p className="mt-0.5 text-xs text-gray-500">तुमची समस्या आणि माहिती पूर्णपणे गोपनीय ठेवली जाते.</p>
                            </div>
                        </div>

                        {/* WhatsApp support */}
                        <a
                            href="https://wa.me/918378089292?text=Hello,%20I%20have%20a%20question%20about%20Legal%20Consultation%20booking"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 rounded-xl border border-green-100 bg-green-50 p-4 transition-colors hover:bg-green-100"
                        >
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                                <Phone className="h-4.5 w-4.5" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-green-800">काही प्रश्न आहे?</p>
                                <p className="mt-0.5 text-xs text-green-700">WhatsApp वर आमच्याशी थेट बोला</p>
                            </div>
                        </a>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="mx-auto max-w-3xl px-4 pb-16">
                <h2 className="mb-5 flex items-center justify-center gap-2 text-center text-lg font-bold text-brand-teal md:text-2xl">
                    <MessageCircleQuestion className="h-5 w-5 text-brand-gold" />
                    वारंवार विचारले जाणारे प्रश्न
                </h2>
                <div className="space-y-2.5">
                    {FAQS.map((faq) => (
                        <details
                            key={faq.q}
                            className="group rounded-xl border border-gray-100 bg-gray-50 p-4 open:bg-white open:shadow-sm"
                        >
                            <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-bold text-gray-900">
                                {faq.q}
                                <svg
                                    className="h-4 w-4 shrink-0 text-brand-teal transition-transform group-open:rotate-180"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </summary>
                            <p className="mt-2.5 text-xs leading-relaxed text-gray-600 md:text-sm">{faq.a}</p>
                        </details>
                    ))}
                </div>

                <div className="mt-6 rounded-lg border border-amber-100 bg-amber-50 p-3 text-center">
                    <p className="text-[11px] font-medium text-amber-800 md:text-xs">
                        ⚠️ हा सल्ला सामान्य कायदेशीर मार्गदर्शनासाठी आहे. गंभीर प्रकरणांसाठी स्थानिक वकिलाचा सल्ला घ्या.
                    </p>
                </div>
            </section>

            <StickyBookBar price={price} />
        </div>
        </BookingSheetProvider>
    );
}
