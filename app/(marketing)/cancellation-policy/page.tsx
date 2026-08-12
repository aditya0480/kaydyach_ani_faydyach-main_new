import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, Mail, Phone, ArrowRight } from "lucide-react";
import { BUSINESS_INFO } from "@/lib/business-info";

export const metadata: Metadata = {
  title: "रद्दीकरण धोरण (Cancellation Policy) | कायद्याचं आणि फायद्याचं",
  description:
    "Order Cancellation Policy for Kaydyach ani Faydyach digital ebooks. (ऑर्डर रद्दीकरण धोरण)",
};

export default function CancellationPolicyPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 md:py-16">
      <h1 className="mb-8 bg-linear-to-r from-brand-teal to-teal-600 bg-clip-text text-center text-3xl font-bold text-transparent md:text-4xl">
        रद्दीकरण धोरण (Cancellation Policy)
      </h1>

      <div className="mx-auto mb-10 max-w-3xl rounded-xl border border-amber-200 bg-amber-50 p-6 text-center text-amber-900 md:p-8">
        <div className="mb-4 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 ring-4 ring-amber-50">
            <AlertTriangle className="h-7 w-7 text-amber-600" />
          </div>
        </div>
        <h2 className="mb-2 text-lg font-bold">
          डिजिटल वितरण — तात्काळ (Instant Digital Delivery)
        </h2>
        <p className="text-sm leading-relaxed font-medium opacity-90 md:text-base">
          आम्ही फक्त डिजिटल PDF ई-बुक्स विकतो. पेमेंट यशस्वी झाल्यावर डाउनलोड लिंक तत्काळ पाठवली जाते. त्यामुळे पेमेंट पूर्ण झाल्यानंतर ऑर्डर रद्द करता येत नाही.
        </p>
        <p className="mt-2 text-xs text-amber-700 opacity-80">
          (We sell digital PDF ebooks only. Download link is delivered instantly on successful payment. Therefore, an order cannot be cancelled once the payment has been completed.)
        </p>
      </div>

      <div className="prose prose-slate mx-auto max-w-3xl space-y-8 leading-relaxed text-gray-700">

        <section>
          <h2 className="mb-2 text-xl font-bold text-gray-900">
            १. पेमेंटपूर्वी रद्दीकरण (Cancellation Before Payment)
          </h2>
          <p>
            ऑर्डर तयार झाली असली तरी जोपर्यंत पेमेंट पूर्ण होत नाही, तोपर्यंत तुम्ही ऑर्डर रद्द करू शकता. फक्त Razorpay पेमेंट विंडो बंद करा.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            You can cancel an order before payment is completed simply by closing the Razorpay payment window. No charge is made to your account in that case.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-bold text-gray-900">
            २. पेमेंटनंतर रद्दीकरण (Cancellation After Payment)
          </h2>
          <p>
            एकदा पेमेंट यशस्वी झाले की डाउनलोड लिंक तत्काळ ईमेल आणि WhatsApp द्वारे पाठवली जाते. डिजिटल उत्पादन तात्काळ वितरित होत असल्यामुळे — पेमेंट पूर्ण झाल्यानंतर ऑर्डर रद्द करता येत नाही.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Once payment is successful, the download link is delivered instantly via email and WhatsApp. Because the digital product is delivered immediately, cancellation is not possible after payment completion.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-bold text-gray-900">
            ३. अपवाद (Exceptions)
          </h2>
          <p>
            खालील परिस्थितीत आम्ही ऑर्डर रद्द करून पूर्ण परतावा देऊ:
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <strong>दुहेरी पेमेंट (Duplicate Payment):</strong> एकाच ऑर्डरसाठी दोनदा पैसे कापले गेल्यास.
              <span className="block text-sm text-gray-500 mt-1">(Charged twice for the same order due to a technical issue.)</span>
            </li>
            <li>
              <strong>वितरण अयशस्वी (Delivery Failure):</strong> पेमेंट यशस्वी झाले पण 30 मिनिटांत डाउनलोड लिंक मिळाली नाही आणि आम्ही ती पुन्हा पाठवू शकलो नाही.
              <span className="block text-sm text-gray-500 mt-1">(Payment succeeded but no download link delivered within 30 minutes and we are unable to redeliver.)</span>
            </li>
            <li>
              <strong>चुकीचे उत्पादन (Wrong Product Listed):</strong> उत्पादन वर्णनात स्पष्ट त्रुटी आढळल्यास — आम्ही ऑर्डर रद्द करून पूर्ण रक्कम परत करू.
              <span className="block text-sm text-gray-500 mt-1">(Material misrepresentation in the product description.)</span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-bold text-gray-900">
            ४. कसे संपर्क करावे (How to Request Cancellation)
          </h2>
          <ol className="list-decimal space-y-1 pl-6">
            <li>Transaction ID आणि पेमेंट screenshot तयार ठेवा.</li>
            <li>खरेदीच्या 48 तासांत ईमेल / WhatsApp द्वारे संपर्क करा.</li>
            <li>आम्ही 48–72 तासांत प्रतिसाद देऊ.</li>
            <li>मान्य रद्दीकरणासाठी परतावा 5–7 कार्यालयीन दिवसांत Razorpay मार्फत मूळ पेमेंट पद्धतीने केला जाईल.</li>
          </ol>
          <p className="mt-2 text-sm text-gray-500">
            (Keep Transaction ID + screenshot ready. Contact us within 48 hours of purchase. We respond in 48–72 hours. Approved refunds are processed via Razorpay to the original payment method within 5–7 working days.)
          </p>
        </section>

        <section className="rounded-lg border border-brand-teal/20 bg-brand-teal/5 p-5">
          <p className="text-sm">
            पूर्ण परतावा धोरण आणि Razorpay processing वेळेसाठी कृपया{" "}
            <Link href="/refund-policy" className="inline-flex items-center gap-1 font-semibold text-brand-teal hover:underline">
              Refund Policy
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>{" "}
            पहा.
          </p>
        </section>

        <section className="border-t border-gray-100 pt-8">
          <h2 className="mb-4 text-xl font-bold text-gray-900">
            तक्रार / Support संपर्क (Grievance Contact)
          </h2>
          <div className="flex flex-col gap-4 rounded-xl bg-gray-50 p-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
                <Mail className="h-5 w-5 text-brand-teal" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase">
                  Email (48 hrs response)
                </p>
                <a
                  href={`mailto:${BUSINESS_INFO.email}`}
                  className="font-bold text-brand-teal hover:underline"
                >
                  {BUSINESS_INFO.email}
                </a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
                <Phone className="h-5 w-5 text-brand-teal" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase">
                  WhatsApp / Phone
                </p>
                <a
                  href={`tel:${BUSINESS_INFO.phone}`}
                  className="font-bold text-brand-teal hover:underline"
                >
                  {BUSINESS_INFO.phoneDisplay}
                </a>
              </div>
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-500 text-center">
            {BUSINESS_INFO.legalName} — Proprietor: {BUSINESS_INFO.proprietor} — Udyam: {BUSINESS_INFO.udyam}
            <br />
            {BUSINESS_INFO.address.full}
          </p>
        </section>
      </div>
    </div>
  );
}
