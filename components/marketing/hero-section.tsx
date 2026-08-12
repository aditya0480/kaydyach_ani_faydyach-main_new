import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Search, Sparkles, TrendingUp } from "lucide-react";
import { GlobalSearch } from "../global-search";

export function HeroSection() {
    return (
        <section className="relative flex min-h-fit items-center overflow-hidden bg-brand-teal pt-4 pb-12 text-white md:min-h-150 md:py-20 lg:min-h-screen lg:py-24">

            <div className="relative z-10 mx-auto w-full max-w-6xl px-4">
                <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
                    {/* Content Area */}
                    <div className="flex flex-col space-y-4 pt-2 text-center lg:space-y-8 lg:text-left">

                        {/* Headline - Scaled for Scanning */}
                        <div className="space-y-4 md:space-y-6">
                            <h1 className="bg-linear-to-b from-white via-white to-white/70 bg-clip-text text-3xl leading-[1.1] font-black tracking-tight text-transparent sm:text-5xl">
                                सोप्या भाषेत <br />
                                कायदे -
                                <span className="bg-linear-to-r from-brand-gold via-yellow-200 to-brand-gold bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(255,193,7,0.3)]"> तुमच्या हक्कांसाठी</span>
                            </h1>
                            <p className="mx-auto max-w-md text-sm leading-relaxed font-normal text-slate-300 md:max-w-xl md:text-lg lg:mx-0 lg:text-xl">
                                शेतकरी, सामान्य नागरिक आणि महिलांसाठी जमीन आणि वारसा हक्कांची विश्वासार्ह माहिती एका क्लिकवर.
                            </p>
                            <p className="mx-auto max-w-md text-[11px] font-medium text-brand-gold/70 md:max-w-xl md:text-xs lg:mx-0">
                                📘 Digital PDF Ebooks · Educational Reference Material · Not Legal Advice or Consultancy
                            </p>
                        </div>

                        {/* Search & Action Box - Core App UI */}
                        <div className="mx-auto flex w-full max-w-lg flex-col gap-4 lg:mx-0">
                            <div className="group relative">
                                <div className="absolute -inset-1 rounded-2xl bg-linear-to-r from-brand-gold/20 to-yellow-500/20 opacity-30 blur-lg transition duration-500 group-hover:opacity-100"></div>
                                <div className="relative">
                                    <GlobalSearch
                                        className="w-full"
                                        triggerClassName="h-14 md:h-16 text-sm md:text-lg rounded-2xl border border-white/15 bg-white/5 backdrop-blur-3xl text-white hover:bg-white/10 hover:border-brand-gold/40 transition-all duration-300 placeholder:text-slate-500 pl-11 ring-brand-gold/10 focus-within:ring-2"
                                    />
                                    <div className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2">
                                        <Search className="h-4.5 w-4.5 text-brand-gold/60 md:h-6 md:w-6" />
                                    </div>
                                </div>
                            </div>

                            {/* popular tags - horizontal scroll on small devices */}
                            <div className="hide-scrollbar -mx-4 flex items-center gap-2 overflow-x-auto px-4 lg:mx-0 lg:flex-wrap lg:px-0">
                                <span className="shrink-0 text-[10px] font-bold tracking-wider text-brand-gold/50 uppercase">लोकप्रिय:</span>
                                {["वारसा हक्क", "शेतकरी कायदा", "घर खरेदी"].map((tag) => (
                                    <button key={tag} className="shrink-0 rounded-lg border border-white/5 bg-white/5 px-2.5 py-1.5 text-[10px] font-bold whitespace-nowrap text-slate-300 transition-colors hover:bg-white/10 hover:text-white md:text-xs">
                                        {tag}
                                    </button>
                                ))}
                            </div>

                            <Button asChild size="lg" className="h-14 w-full rounded-2xl bg-brand-gold px-8 text-base font-black text-[#0A2342] shadow-xl shadow-brand-gold/20 transition-all duration-300 hover:bg-yellow-400 active:scale-[0.98] lg:w-fit">
                                <Link href="#ebooks" className="flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 fill-current" />
                                    प्रकाशन पहा (View Books)
                                </Link>
                            </Button>
                        </div>

                        {/* Trust Metrics - Compact Grid on Mobile */}
                        <div className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-2 lg:flex lg:justify-start lg:gap-4">
                            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-2 backdrop-blur-md">
                                <div className="flex -space-x-1.5">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="flex h-6 w-6 items-center justify-center rounded-full border border-[#0A2342] bg-brand-gold/80 text-[8px] font-bold text-[#0A2342]">
                                            {i}
                                        </div>
                                    ))}
                                </div>
                                <div className="text-left">
                                    <p className="text-[10px] leading-none font-black text-white">1000+</p>
                                    <p className="text-[8px] font-medium text-slate-400">वाचक</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-2 backdrop-blur-md">
                                <TrendingUp className="h-3.5 w-3.5 text-green-400" />
                                <div className="text-left">
                                    <p className="text-[10px] leading-none font-black text-white">4.8/5</p>
                                    <p className="text-[8px] font-medium text-slate-400">रेटिंग</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Image Area - Hidden on Mobile for Focus */}
                    <div className="relative mt-4 hidden items-center justify-center lg:mt-0 lg:flex lg:justify-end">
                        <div className="relative aspect-square w-full max-w-70 sm:max-w-105 md:max-w-112.5">
                            {/* Decorative Elements */}
                            <div className="absolute top-1/2 left-1/2 h-[120%] w-[120%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-gold/5 blur-3xl"></div>
                            <div className="absolute top-1/2 left-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 opacity-50"></div>

                            {/* Hero Image */}
                            <div className="animate-float relative z-10 h-full w-full overflow-hidden rounded-3xl border-4 border-white/10 bg-white/5 shadow-2xl backdrop-blur-sm transition-transform duration-700 lg:rounded-full lg:border-8">
                                <Image
                                    src="/hero.png"
                                    alt="Official Platform Logo"
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            </div>

                            {/* Floating badges - Responsive Placement */}
                            <div className="animate-bounce-slow absolute -top-4 -left-4 z-20 flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-xl shadow-xl backdrop-blur-xl md:h-14 md:w-14">
                                📖
                            </div>

                            <div className="animate-pulse-slow absolute -right-3 bottom-8 z-20 flex items-center gap-2 rounded-xl border border-brand-gold/20 bg-white/95 p-2 shadow-xl ring-2 ring-brand-teal/5 sm:-right-6 md:gap-3 md:p-3">
                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-gold/10 md:h-9 md:w-9">
                                    <Sparkles className="h-3.5 w-3.5 text-brand-gold md:h-5 md:w-5" />
                                </div>
                                <div className="text-left">
                                    <p className="text-[9px] leading-none font-black text-gray-900 md:text-xs">100% अधिकृत</p>
                                    <p className="mt-0.5 text-[7px] font-bold text-brand-teal uppercase opacity-60 md:mt-1 md:text-[9px]">कायदेशीर माहिती</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Fade Transition */}
            <div className="absolute bottom-0 left-0 h-16 w-full bg-linear-to-t from-background to-transparent md:h-32"></div>
        </section>
    );
}
