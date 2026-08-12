import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default async function ConsultationSuccessPage({
    searchParams,
}: {
    searchParams?: Promise<{ bookingId?: string }>;
}) {
    const sp = await searchParams;

    return (
        <div className="mx-auto flex max-w-md flex-col items-center px-4 py-16 text-center md:py-24">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
            <h1 className="mt-4 text-2xl font-bold text-brand-teal">बुकिंग यशस्वी!</h1>
            <p className="mt-2 text-sm text-gray-600">
                तुमचे पेमेंट यशस्वी झाले आहे. आमची टीम लवकरच तुमच्याशी संपर्क साधेल.
            </p>
            {sp?.bookingId && (
                <p className="mt-3 text-xs text-gray-400">Booking ID: {sp.bookingId}</p>
            )}
            <Link
                href="/"
                className="mt-8 rounded-lg bg-brand-teal px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-teal/90"
            >
                मुख्यपृष्ठावर परत जा
            </Link>
        </div>
    );
}
