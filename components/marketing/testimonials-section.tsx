"use client";

import { Star, Quote } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

const testimonials = [
    {
        id: 1,
        content: "हे कायदेशीर मार्गदर्शक खूपच उपयुक्त आहेत. मला माझ्या व्यवसायाची नोंदणी करताना खूप मदत झाली. सोप्या भाषेतील माहितीमुळे सर्व काही समजणे सोपे झाले.",
        author: "राजेश पाटील",
        role: "छोटा व्यावसायिक",
        rating: 5,
        initials: "RP"
    },
    {
        id: 2,
        content: "कायद्याची माहिती इतक्या सोप्या मराठी भाषेत मिळणे अवघड आहे. 'कायद्याचं आणि फायद्याचं' मुळे माझे काम खूप सोपे झाले. मी सर्वांना नक्कीच शिफारस करेन.",
        author: "स्मिता देशपांडे",
        role: "गृहिणी",
        rating: 5,
        initials: "SD"
    },
    {
        id: 3,
        content: "विद्यार्थी म्हणून मला कायदेशीर अभ्यासासाठी या ई-बुक्सचा खूप फायदा झाला. किंमत पण खूप वाजवी आहे आणि माहिती अगदी अचूक आहे.",
        author: "अमित कुमार",
        role: "दधीत विद्यार्थी",
        rating: 4,
        initials: "AK"
    },
    {
        id: 4,
        content: "जमीन खरेदी करताना काय काळजी घ्यावी हे मला या पुस्तकामुळे समजले. आता मी फसवणूक टाळू शकतो. अतिशय उपयुक्त माहिती.",
        author: "प्रकाश जाधव",
        role: "शेतकरी",
        rating: 5,
        initials: "PJ"
    },
    {
        id: 5,
        content: "सायबर गुन्ह्यांबद्दलची माहिती खूप महत्वाची आहे. आजकालच्या डिजिटल युगात प्रत्येकाने हे वाचले पाहिजे.",
        author: "नेहा कुलकर्णी",
        role: "आय.टी. प्रोफेशनल",
        rating: 5,
        initials: "NK"
    },
    {
        id: 6,
        content: "घटस्फोट आणि पोटगी कायद्याबद्दलचे माझे अनेक गैरसमज दूर झाले. खूप छान उपक्रम आहे, नक्कीच वाचावे.",
        author: "संजय मोरे",
        role: "खाजगी कर्मचारी",
        rating: 5,
        initials: "SM"
    },
    {
        id: 7,
        content: "ग्राहक म्हणून माझे हक्क काय आहेत हे मला आता पक्के माहित आहे. यामुळे माझा आत्मविश्वास वाढला आहे. धन्यवाद!",
        author: "वंदना साळुंखे",
        role: "शिक्षक",
        rating: 5,
        initials: "VS"
    }
];

export function TestimonialsSection() {
    const [emblaRef] = useEmblaCarousel({ loop: true, align: "start" }, [
        Autoplay({ delay: 3000, stopOnInteraction: false, stopOnMouseEnter: true })
    ]);

    return (
        <section className="overflow-hidden bg-white py-12 md:py-24">
            <div className="mx-auto max-w-6xl px-4">
                <div className="mb-10 space-y-3 text-center md:mb-16">
                    <h2 className="text-2xl font-extrabold text-brand-teal md:text-5xl">
                        आमचे समाधानी ग्राहक
                    </h2>
                    <p className="mx-auto max-w-2xl text-base text-muted-foreground md:text-lg">
                        हजारो नागरिकांनी आमच्या सेवेवर विश्वास दाखवला आहे. त्यांचे अनुभव वाचा.
                    </p>
                </div>

                <div className="overflow-hidden" ref={emblaRef}>
                    <div className="flex gap-6">
                        {testimonials.map((testimonial) => (
                            <div
                                key={testimonial.id}
                                className="relative min-w-0 flex-[0_0_100%] md:flex-[0_0_45%] lg:flex-[0_0_32%]"
                            >
                                <div className="flex h-full flex-col rounded-3xl border border-gray-100 bg-gray-50 p-6 shadow-sm transition-shadow hover:shadow-md md:p-8">
                                    <Quote className="absolute top-8 right-8 h-10 w-10 text-brand-teal/10" />

                                    <div className="mb-6 flex gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`h-4 w-4 ${i < testimonial.rating ? "fill-brand-gold text-brand-gold" : "text-gray-300"}`}
                                            />
                                        ))}
                                    </div>

                                    <p className="relative z-10 mb-6 line-clamp-4 min-h-22.5 text-sm leading-relaxed font-medium text-gray-700 md:min-h-25 md:text-base">
                                        &quot;{testimonial.content}&quot;
                                    </p>

                                    <div className="mt-auto flex items-center gap-4">
                                        <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                                            <AvatarFallback className="bg-brand-teal/10 text-xs font-bold text-brand-teal">
                                                {testimonial.initials}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="text-sm font-bold text-gray-900">{testimonial.author}</div>
                                            <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
