"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConsultationBookingForm } from "./consultation-booking-form";

const BookNowContext = createContext<() => void>(() => {});

export function useBookNow() {
    return useContext(BookNowContext);
}

export function BookingSheetProvider({ children, price }: { children: ReactNode; price: number }) {
    const [open, setOpen] = useState(false);

    return (
        <BookNowContext.Provider value={() => setOpen(true)}>
            {children}

            <Sheet open={open} onOpenChange={setOpen}>
                <SheetContent
                    side="bottom"
                    onOpenAutoFocus={(e) => e.preventDefault()}
                    className="h-auto max-h-[92dvh] overflow-y-auto rounded-t-3xl border-none p-0 pb-[env(safe-area-inset-bottom)]"
                >
                    <SheetTitle className="sr-only">कायदेशीर सल्ला बुक करा</SheetTitle>
                    <SheetDescription className="sr-only">
                        फॉर्म भरा आणि ₹{price} पेमेंट करून बुकिंग पूर्ण करा.
                    </SheetDescription>
                    <div className="mx-auto mt-3 mb-1 h-1 w-12 shrink-0 rounded-full bg-gray-200" />
                    <div className="px-4 pt-1 pb-5">
                        <h2 className="mb-1 text-base font-bold text-brand-teal">बुकिंग फॉर्म भरा</h2>
                        <p className="mb-4 text-xs text-gray-500">
                            फक्त 2 मिनिटांत बुकिंग पूर्ण होईल — ₹{price} पेमेंटनंतर आमची टीम संपर्क साधेल.
                        </p>
                        <ConsultationBookingForm price={price} />
                    </div>
                </SheetContent>
            </Sheet>
        </BookNowContext.Provider>
    );
}

export function BookNowButton({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) {
    const openSheet = useBookNow();
    return (
        <Button onClick={openSheet} size="lg" className={className}>
            {children}
        </Button>
    );
}

export function StickyBookBar({ price }: { price: number }) {
    const openSheet = useBookNow();

    return (
        <div className="animate-in slide-in-from-bottom-4 fade-in fixed right-0 bottom-(--sticky-bar-bottom) left-0 z-40 border-t border-gray-200 bg-white/95 px-4 py-3 shadow-[0_-2px_10px_rgba(0,0,0,0.08)] backdrop-blur-md duration-300 md:bottom-0">
            <button
                onClick={openSheet}
                className={cn(
                    "flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-gold py-3.5 text-base font-black text-brand-teal shadow-lg transition-all active:scale-[0.98]",
                )}
            >
                <Zap className="h-5 w-5 fill-current" />
                आता बुक करा - ₹{price}
            </button>
        </div>
    );
}
