"use client";

import { useEffect, useState } from "react";
import { Scale, X } from "lucide-react";
import { cn } from "@/lib/utils";

const NAMES = [
    "राहुल पाटील", "प्रिया देशमुख", "अमित कुलकर्णी", "स्नेहा जाधव",
    "विक्रम शिंदे", "अंजली पवार", "सुरेश गायकवाड", "कविता मोरे",
    "रोहन चव्हाण", "पूजा भोईर", "गणेश सावंत", "मीरा जोशी",
    "विजय काळे", "आयशा शेख", "निखिल वाघ", "नेहा तांबे"
];

const CITIES = [
    "पुणे", "मुंबई", "नाशिक", "नागपूर", "छत्रपती संभाजीनगर", "कोल्हापूर", "सातारा",
    "ठाणे", "सोलापूर", "अमरावती", "लातूर", "धुळे", "जळगाव", "अकोला", "नांदेड"
];



const TIMES = [
    "आत्ताच", "२ सेकंदांपूर्वी", "१ मिनिटापूर्वी", "५ मिनिटांपूर्वी", "१० मिनिटांपूर्वी",
    "१५ मिनिटांपूर्वी", "आत्ताच", "आत्ताच"
];

interface Notification {
    id: number;
    name: string;
    city: string;
    time: string;
}

export function SocialProof() {
    const [notification, setNotification] = useState<Notification | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    const triggerNotification = () => {
        const randomName = NAMES[Math.floor(Math.random() * NAMES.length)];
        const randomCity = CITIES[Math.floor(Math.random() * CITIES.length)];
        const randomTime = TIMES[Math.floor(Math.random() * TIMES.length)];

        setNotification({
            id: Date.now(),
            name: randomName,
            city: randomCity,
            time: randomTime
        });
        setIsVisible(true);

        setTimeout(() => {
            setIsVisible(false);
        }, 5000);
    };

    useEffect(() => {
        const initialTimer = setTimeout(() => {
            triggerNotification();
        }, 10000);

        const interval = setInterval(() => {
            triggerNotification();
        }, Math.random() * (60000 - 30000) + 30000);

        return () => {
            clearTimeout(initialTimer);
            clearInterval(interval);
        };
    }, []);

    if (!notification) return null;

    return (
        <div
            className={cn(
                "fixed bottom-20 left-4 z-50 w-full max-w-[320px] transform transition-all duration-500 md:bottom-8 md:left-8",
                isVisible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-20 opacity-0"
            )}
        >
            <div className="relative flex items-center gap-3 overflow-hidden rounded-2xl border border-brand-gold/30 bg-white/95 p-3 shadow-2xl backdrop-blur-md">
                <div
                    className={cn(
                        "absolute bottom-0 left-0 h-0.5 bg-brand-gold transition-all duration-5000 ease-linear",
                        isVisible ? "w-0" : "w-full"
                    )}
                    style={{ width: isVisible ? "0%" : "100%", transitionProperty: "width" }}
                />

                <button
                    onClick={() => setIsVisible(false)}
                    className="absolute top-1 right-1 text-gray-400 hover:text-gray-600"
                    title="बंद करा"
                >
                    <X className="h-3 w-3" />
                </button>

                <div className="flex min-w-0 flex-1 flex-col px-2">
                    <div className="mb-0.5 flex items-center gap-1.5">
                        <span className="truncate text-sm font-bold text-gray-900">
                            {notification.name} ({notification.city})
                        </span>
                        <Scale className="h-3.5 w-3.5 shrink-0 text-brand-gold" />
                    </div>
                    <p className="text-xs leading-tight text-gray-600">
                        यांनी आता ई-बूक खरेदी केले.
                    </p>
                    <p className="mt-1 text-[10px] font-medium text-gray-400 italic">
                        {notification.time}
                    </p>
                </div>
            </div>
        </div>
    );
}
