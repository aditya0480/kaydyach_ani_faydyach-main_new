"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, ShieldCheck, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { CONSULTATION_CATEGORIES, CONSULTATION_CATEGORY_VALUES } from "@/lib/constants/consultation-categories";

const RZP_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";

const loadScript = (src: string): Promise<boolean> => {
    return new Promise((resolve) => {
        if (typeof document === "undefined") return resolve(false);
        if (typeof window.Razorpay !== "undefined") return resolve(true);

        const existing = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement | null;
        if (existing) {
            const checkInterval = setInterval(() => {
                if (typeof window.Razorpay !== "undefined") {
                    clearInterval(checkInterval);
                    clearTimeout(timeout);
                    resolve(true);
                }
            }, 100);
            const timeout = setTimeout(() => {
                clearInterval(checkInterval);
                resolve(typeof window.Razorpay !== "undefined");
            }, 10000);
            return;
        }

        const script = document.createElement("script");
        script.src = src;
        script.async = true;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);

        setTimeout(() => {
            if (typeof window.Razorpay === "undefined") resolve(false);
        }, 15000);
    });
};

const cleanPhoneNumber = (val: string) => {
    let cleaned = val.replace(/[\s\-\(\)\+]/g, "");
    if (cleaned.length > 10) {
        if (cleaned.startsWith("91")) cleaned = cleaned.substring(2);
        else if (cleaned.startsWith("0")) cleaned = cleaned.substring(1);
    }
    return cleaned;
};

const bookingSchema = z.object({
    name: z.string().trim().min(2, "नाव किमान 2 अक्षरे असावे").max(50, "नाव 50 अक्षरांपेक्षा जास्त नसावे"),
    mobile: z
        .string()
        .transform(cleanPhoneNumber)
        .refine((val) => /^[6-9]\d{9}$/.test(val), {
            message: "कृपया वैध मोबाइल नंबर टाका (उदा. 9876543210)",
        }),
    category: z.enum(CONSULTATION_CATEGORY_VALUES, { message: "कृपया विषय निवडा" }),
    description: z.string().max(500, "500 अक्षरांपेक्षा जास्त नसावे").optional(),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

interface RazorpayResponse {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}

interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    order_id: string;
    prefill: { name: string; email: string; contact: string };
    theme: { color: string };
    modal?: { ondismiss: () => void };
    handler?: (response: RazorpayResponse) => Promise<void>;
    callback_url?: string;
}

declare global {
    interface Window {
        Razorpay: {
            new(options: RazorpayOptions): {
                open(): void;
                on(event: string, handler: (response: unknown) => void): void;
            };
        };
    }
}

export function ConsultationBookingForm({ price }: { price: number }) {
    const [loading, setLoading] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);
    const router = useRouter();
    const isMobile = useIsMobile();

    const form = useForm<BookingFormValues>({
        resolver: zodResolver(bookingSchema),
        defaultValues: { name: "", mobile: "", description: "" },
    });

    useEffect(() => {
        if (typeof window !== "undefined" && typeof window.Razorpay === "undefined") {
            loadScript(RZP_SCRIPT_URL).then((ok) => { if (ok) setIsRazorpayLoaded(true); });
        }
    }, []);

    const currentBookingIdRef = useRef<string | null>(null);

    async function onSubmit(data: BookingFormValues) {
        setLoading(true);
        try {
            let isLoaded = isRazorpayLoaded || typeof window.Razorpay !== "undefined";
            if (!isLoaded) {
                isLoaded = await loadScript(RZP_SCRIPT_URL);
                if (isLoaded) setIsRazorpayLoaded(true);
            }
            if (!isLoaded || typeof window.Razorpay === "undefined") {
                throw new Error("पेमेंट गेटवे लोड होऊ शकले नाही. कृपया रिफ्रेश करून पुन्हा प्रयत्न करा.");
            }

            const res = await fetch("/api/consultations/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(errorText || "बुकिंग तयार करता आले नाही");
            }

            const booking = await res.json();
            currentBookingIdRef.current = booking.bookingId;

            const options: RazorpayOptions = {
                key: booking.keyId,
                amount: booking.amount,
                currency: booking.currency,
                name: "Kaydyacha Ani Faydyach",
                description: "Legal Consultation Booking",
                order_id: booking.razorpayOrderId,
                prefill: { name: data.name, email: "", contact: data.mobile },
                theme: { color: "#0A2342" },
                modal: {
                    ondismiss: () => {
                        setLoading(false);
                        document.body.style.pointerEvents = "auto";
                    },
                },
            };

            if (isMobile) {
                options.callback_url = `${window.location.origin}/api/consultations/callback`;
            } else {
                options.handler = async (response: RazorpayResponse) => {
                    setIsVerifying(true);
                    try {
                        const verifyRes = await fetch("/api/consultations/verify", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(response),
                        });
                        if (!verifyRes.ok) throw new Error("Payment verification failed");

                        toast.success("पेमेंट यशस्वी झाले!");
                        router.push(`/legal-consultation/success?bookingId=${booking.bookingId}`);
                    } catch (err) {
                        toast.error("पेमेंट पडताळणी अयशस्वी झाली. कृपया सपोर्टशी संपर्क साधा.");
                        console.error(err);
                        setIsVerifying(false);
                    } finally {
                        document.body.style.pointerEvents = "";
                    }
                };
            }

            const rzp = new window.Razorpay(options);
            document.body.style.pointerEvents = "";
            rzp.open();

            rzp.on("payment.failed", () => {
                toast.error("पेमेंट अयशस्वी. कृपया पुन्हा प्रयत्न करा.");
                setLoading(false);
            });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "काही तांत्रिक अडचण आली";
            toast.error(message);
            setLoading(false);
        }
    }

    if (isVerifying) {
        return (
            <div className="flex flex-col items-center justify-center space-y-4 rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-sm">
                <Loader2 className="h-10 w-10 animate-spin text-brand-teal" />
                <p className="text-sm font-medium text-gray-600">पेमेंट पडताळणी सुरू आहे...</p>
            </div>
        );
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8"
            >
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>नाव (Name)</FormLabel>
                            <FormControl>
                                <Input placeholder="उदा. राहुल पाटील" maxLength={50} {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="mobile"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>मोबाईल नंबर</FormLabel>
                            <FormControl>
                                <Input type="tel" placeholder="उदा. 9876543210" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>विषय (Category)</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="विषय निवडा" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {CONSULTATION_CATEGORIES.map((c) => (
                                        <SelectItem key={c.value} value={c.value}>
                                            {c.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>समस्येचे थोडक्यात वर्णन (Optional)</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="तुमची समस्या थोडक्यात लिहा..."
                                    rows={4}
                                    maxLength={500}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button
                    type="submit"
                    size="lg"
                    disabled={loading}
                    className="w-full rounded-xl bg-brand-teal text-base font-bold text-white shadow-lg transition-all hover:bg-brand-teal/90"
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            प्रोसेसिंग...
                        </>
                    ) : (
                        <>
                            <Zap className="mr-2 h-5 w-5 fill-yellow-400 text-yellow-400" />
                            ₹{price} भरा आणि बुक करा
                        </>
                    )}
                </Button>

                <p className="flex items-center justify-center gap-1.5 text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                    <ShieldCheck className="h-3.5 w-3.5 text-green-500" />
                    Secure Checkout • Razorpay
                </p>
            </form>
        </Form>
    );
}
