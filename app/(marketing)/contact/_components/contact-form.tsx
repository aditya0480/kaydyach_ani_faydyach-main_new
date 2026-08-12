"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

const schema = z.object({
    name: z.string().min(2, "नाव किमान 2 अक्षरे असावे"),
    email: z.string().email("वैध ईमेल पत्ता द्या"),
    subject: z.string().min(2, "विषय द्या"),
    message: z.string().min(10, "संदेश किमान 10 अक्षरे असावा"),
});

type FormData = z.infer<typeof schema>;

export function ContactForm() {
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (data: FormData) => {
        setSubmitting(true);
        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) throw new Error("Failed");

            setSubmitted(true);
            reset();
            toast.success("संदेश पाठवला! आम्ही लवकरच संपर्क करू. (Message sent! We'll be in touch.)");
        } catch {
            toast.error("संदेश पाठवता आला नाही. कृपया पुन्हा प्रयत्न करा. (Failed to send. Please try again.)");
        } finally {
            setSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-green-100 bg-green-50 p-12 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                    <svg className="h-7 w-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h3 className="mb-2 text-lg font-bold text-green-800">संदेश पाठवला! (Message Sent!)</h3>
                <p className="text-sm text-green-700">आम्ही 48 तासांत तुमच्याशी संपर्क करू. (We&apos;ll contact you within 48 hours.)</p>
                <button
                    onClick={() => setSubmitted(false)}
                    className="mt-6 text-sm font-medium text-brand-teal underline"
                >
                    आणखी एक संदेश पाठवा (Send another)
                </button>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Send us a Message</h2>
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-1">
                    <label htmlFor="name" className="text-sm font-medium text-gray-700">
                        Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        {...register("name")}
                        type="text"
                        id="name"
                        className="w-full rounded-lg border border-gray-200 px-4 py-2 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-brand-teal"
                        placeholder="Enter your name"
                    />
                    {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                </div>

                <div className="space-y-1">
                    <label htmlFor="email" className="text-sm font-medium text-gray-700">
                        Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                        {...register("email")}
                        type="email"
                        id="email"
                        className="w-full rounded-lg border border-gray-200 px-4 py-2 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-brand-teal"
                        placeholder="name@example.com"
                    />
                    {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                </div>

                <div className="space-y-1">
                    <label htmlFor="subject" className="text-sm font-medium text-gray-700">
                        Subject <span className="text-red-500">*</span>
                    </label>
                    <input
                        {...register("subject")}
                        type="text"
                        id="subject"
                        className="w-full rounded-lg border border-gray-200 px-4 py-2 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-brand-teal"
                        placeholder="How can we help?"
                    />
                    {errors.subject && <p className="text-xs text-red-500">{errors.subject.message}</p>}
                </div>

                <div className="space-y-1">
                    <label htmlFor="message" className="text-sm font-medium text-gray-700">
                        Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        {...register("message")}
                        id="message"
                        rows={4}
                        className="w-full resize-none rounded-lg border border-gray-200 px-4 py-2 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-brand-teal"
                        placeholder="Type your message here..."
                    />
                    {errors.message && <p className="text-xs text-red-500">{errors.message.message}</p>}
                </div>

                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-lg bg-brand-teal py-3 font-semibold text-white shadow-lg shadow-brand-teal/25 transition-colors hover:bg-brand-teal/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {submitting ? "पाठवत आहे... (Sending...)" : "Send Message"}
                </button>
            </form>
        </div>
    );
}
