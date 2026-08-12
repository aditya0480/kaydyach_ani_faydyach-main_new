import { BookOpen, ShieldCheck, Wallet } from "lucide-react";

export function FeaturesSection() {
    return (
        <section className="bg-white py-12 md:py-20">
            <div className="mx-auto max-w-6xl px-4 text-center">
                <h2 className="relative mb-10 inline-block text-2xl font-bold text-brand-teal md:mb-16 md:text-4xl">
                    नागरिकांसाठी महत्त्वाचे फायदे
                    <span className="absolute -bottom-3 left-1/2 h-1 w-16 -translate-x-1/2 transform rounded-full bg-brand-gold md:h-1.5 md:w-24"></span>
                </h2>

                <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
                    {/* Feature 1 */}
                    <div className="group rounded-3xl border border-gray-100 bg-white p-6 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl md:p-8">
                        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-teal/5 transition-colors duration-300 group-hover:bg-brand-gold/20 md:mb-6 md:h-20 md:w-20">
                            <BookOpen className="h-8 w-8 text-brand-teal transition-colors duration-300 group-hover:text-brand-gold md:h-10 md:w-10" />
                        </div>
                        <h3 className="mb-3 text-xl font-bold text-brand-teal md:mb-4 md:text-2xl">सोपी भाषा</h3>
                        <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
                            कायद्याची क्लिष्ट आणि अवघड भाषा सोप्या मराठीत समजून घ्या.
                        </p>
                    </div>

                    {/* Feature 2 */}
                    <div className="group relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl md:p-8">
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-bl-full bg-brand-gold/10 transition-transform group-hover:scale-110"></div>
                        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-teal/5 transition-colors duration-300 group-hover:bg-brand-gold/20 md:mb-6 md:h-20 md:w-20">
                            <ShieldCheck className="h-8 w-8 text-brand-teal transition-colors duration-300 group-hover:text-brand-gold md:h-10 md:w-10" />
                        </div>
                        <h3 className="mb-3 text-xl font-bold text-brand-teal md:mb-4 md:text-2xl">तज्ञांचे मार्गदर्शन</h3>
                        <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
                            उच्च न्यायालयातील अनुभवी वकीलांकडून तयार केलेले खात्रीशीर साहित्य.
                        </p>
                    </div>

                    {/* Feature 3 */}
                    <div className="group rounded-3xl border border-gray-100 bg-white p-6 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl md:p-8">
                        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-teal/5 transition-colors duration-300 group-hover:bg-brand-gold/20 md:mb-6 md:h-20 md:w-20">
                            <Wallet className="h-8 w-8 text-brand-teal transition-colors duration-300 group-hover:text-brand-gold md:h-10 md:w-10" />
                        </div>
                        <h3 className="mb-3 text-xl font-bold text-brand-teal md:mb-4 md:text-2xl">किफायतशीर दर</h3>
                        <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
                            सर्वसामान्यांना सहज परवडणाऱ्या दरात कायदेशीर ई-बुक्स उपलब्ध.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
