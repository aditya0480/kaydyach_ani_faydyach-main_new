import type { Metadata } from "next";
import { AlertTriangle, Mail, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "परतावा धोरण (Refund Policy) | कायद्याचं आणि फायद्याचं",
  description:
    "Refund and Cancellation Policy for Kaydyach ani Faydyach — digital ebook purchases. (परतावा धोरण)",
};

export default function RefundPolicyPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 md:py-16">
      <h1 className="mb-8 bg-linear-to-r from-brand-teal to-teal-600 bg-clip-text text-center text-3xl font-bold text-transparent md:text-4xl">
        परतावा आणि रद्दीकरण धोरण (Refund & Cancellation Policy)
      </h1>

      <div className="mx-auto mb-10 max-w-3xl rounded-xl border border-amber-200 bg-amber-50 p-6 text-center text-amber-900 md:p-8">
        <div className="mb-4 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 ring-4 ring-amber-50">
            <AlertTriangle className="h-7 w-7 text-amber-600" />
          </div>
        </div>
        <h2 className="mb-2 text-lg font-bold">
          डिजिटल उत्पादन — परतावा नाही (Digital Product — No Refund Policy)
        </h2>
        <p className="text-sm leading-relaxed font-medium opacity-90 md:text-base">
          आम्ही केवळ डिजिटल ई-बुक्स (PDF) विकतो. कोणतीही भौतिक (Physical) प्रत पाठवली जात नाही. एकदा खरेदी केल्यानंतर परतावा (Refund) किंवा रद्दीकरण (Cancellation) स्वीकारले जात नाही.
        </p>
        <p className="mt-2 text-xs text-amber-700 opacity-80">
          (We sell digital ebooks (PDF only). No physical copies are shipped. Refunds and cancellations are not accepted once a purchase is made and the digital product is delivered.)
        </p>
      </div>

      <div className="prose prose-slate mx-auto max-w-3xl space-y-8 leading-relaxed text-gray-700">

        <section>
          <h2 className="mb-2 text-xl font-bold text-gray-900">
            १. आम्ही काय विकतो? (What We Sell)
          </h2>
          <div className="rounded-lg border border-brand-teal/20 bg-brand-teal/5 p-4 text-sm">
            <ul className="list-disc space-y-1 pl-5">
              <li><strong>उत्पादनाचे स्वरूप:</strong> केवळ डिजिटल ई-बुक (PDF फाइल) — कोणतीही Hard Copy / Printed Book नाही.</li>
              <li><strong>वितरण:</strong> पेमेंट यशस्वी झाल्यावर तत्काळ — ईमेल + WhatsApp द्वारे.</li>
              <li><strong>उद्देश:</strong> संदर्भ आणि माहिती (Reference &amp; Educational) — कायदेशीर सल्ला नाही.</li>
            </ul>
            <p className="mt-2 text-gray-500">
              (Product type: Digital ebook PDF only. No physical/hard copy. Delivered instantly via email and WhatsApp. For reference and educational purposes only — not legal consultation or advice.)
            </p>
          </div>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-bold text-gray-900">
            २. परतावा धोरण (Refund Policy)
          </h2>
          <p>
            आमची सर्व पुस्तके PDF स्वरूपातील डिजिटल उत्पादने आहेत. एकदा डाउनलोड लिंक दिल्यानंतर परतावा शक्य नाही. खरेदी करण्यापूर्वी उत्पादन वर्णन काळजीपूर्वक वाचावे.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            All products are digital PDFs. Once the download link is delivered, a refund is not possible. Customers are strongly advised to read the product description carefully before purchasing.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-bold text-gray-900">
            ३. रद्दीकरण धोरण (Cancellation Policy)
          </h2>
          <p>
            डिजिटल उत्पादने तात्काळ वितरित होतात, त्यामुळे पेमेंट पूर्ण झाल्यानंतर ऑर्डर रद्द करता येत नाही. पेमेंट सुरू केल्यावर — Razorpay पेमेंट विंडो बंद करण्यापूर्वी — रद्द करणे शक्य आहे.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Since digital products are delivered instantly, cancellations are not possible after payment is completed. You may cancel before completing payment (by closing the Razorpay payment window).
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-bold text-gray-900">
            ४. अपवाद परिस्थिती (Exceptional Circumstances — We Will Help)
          </h2>
          <p>खालील परिस्थितीत आम्ही मदत करू:</p>
          <ul className="list-disc space-y-3 pl-6">
            <li>
              <strong>दुहेरी पेमेंट (Double Payment):</strong> तांत्रिक त्रुटीमुळे एकाच ऑर्डरसाठी दोनदा पैसे कापले गेल्यास — अतिरिक्त रक्कम परत केली जाईल.
              <span className="block text-sm text-gray-500 mt-1">(If you were charged twice for the same order due to a technical error, the extra amount will be refunded.)</span>
            </li>
            <li>
              <strong>पेमेंट कापले पण पुस्तक नाही (Payment Deducted, Product Not Received):</strong> पेमेंट यशस्वी झाले पण 30 मिनिटांत पुस्तक मिळाले नाही, तर आम्ही पुस्तक पुन्हा पाठवू किंवा परतावा देऊ.
              <span className="block text-sm text-gray-500 mt-1">(If payment was deducted but ebook was not delivered within 30 minutes, we will resend the ebook or initiate a full refund.)</span>
            </li>
          </ul>

          <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm">
            <p className="font-semibold mb-2">या परिस्थितीत काय करावे? (What to do in these cases?)</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Transaction ID आणि पेमेंटचा screenshot तयार करा.</li>
              <li>खालील ईमेल वर 48 तासांत संपर्क करा.</li>
              <li>आम्ही 48–72 तासांत प्रतिसाद देऊ आणि 7 कार्यालयीन दिवसांत निराकरण करू.</li>
            </ol>
            <p className="mt-2 text-gray-500">
              (Prepare: Transaction ID + screenshot. Email us within 48 hours. We respond within 48–72 hours and resolve within 7 working days.)
            </p>
          </div>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-bold text-gray-900">
            ५. परतावा प्रक्रिया (Refund Process)
          </h2>
          <p>
            मान्य परतावा मूळ पेमेंट पद्धतीने (UPI / Card / Net Banking) दिला जातो. Razorpay processing वेळ: 5–7 कार्यालयीन दिवस.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Approved refunds are credited back to the original payment method (UPI/Card/Net Banking) via Razorpay within 5–7 working days.
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
                  href="mailto:support@kaydyachaanifaydyach.com"
                  className="font-bold text-brand-teal hover:underline"
                >
                  support@kaydyachaanifaydyach.com
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
                  href="tel:+918378089292"
                  className="font-bold text-brand-teal hover:underline"
                >
                  +91 83780 89292
                </a>
              </div>
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-500 text-center">
            Kaydyacha Ani Faydyacha — Floor No. 3, Amit Court Building, Civil Court, Shivaji Nagar, Pune, Maharashtra 411004, India
          </p>
        </section>
      </div>
    </div>
  );
}
