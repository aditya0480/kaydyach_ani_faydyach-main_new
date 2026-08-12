import type { Metadata } from "next";
import { Zap, Send, Mail, AlertCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "वितरण धोरण (Delivery Policy) | कायद्याचं आणि फायद्याचं",
  description:
    "Digital Delivery Policy — Instant PDF delivery via Email/WhatsApp. No physical shipping. (वितरण धोरण)",
};

export default function ShippingPolicyPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 md:py-16">
      <h1 className="mb-8 bg-linear-to-r from-brand-teal to-teal-600 bg-clip-text text-center text-3xl font-bold text-transparent md:text-4xl">
        वितरण आणि डिलिव्हरी धोरण (Delivery Policy)
      </h1>

      <div className="mb-6 mx-auto max-w-3xl rounded-xl border-2 border-brand-teal/30 bg-brand-teal/5 p-6 text-center md:p-8">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-sm font-bold text-brand-teal shadow-sm">
          <Zap className="h-4 w-4 fill-brand-teal" />
          केवळ डिजिटल वितरण (Digital Delivery Only)
        </div>
        <p className="mx-auto max-w-2xl text-lg font-medium text-gray-700">
          आमची सर्व पुस्तके <strong>केवळ डिजिटल (PDF)</strong> स्वरूपात आहेत. <strong>कोणतीही Hard Copy किंवा Physical पुस्तक पाठवले जात नाही.</strong> खरेदी यशस्वी झाल्यानंतर तत्काळ ई-बुक लिंक मिळेल.
        </p>
        <p className="mt-2 text-sm text-gray-500">
          (All products are digital ebooks in PDF format only. <strong>No physical / printed books are shipped.</strong> Instant digital delivery upon successful payment.)
        </p>
      </div>

      <div className="mb-10 mx-auto max-w-3xl rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
        <div className="text-sm text-amber-900">
          <strong>महत्त्वाचे (Important):</strong> आमची ई-बुक्स केवळ <strong>संदर्भ आणि माहितीच्या उद्देशाने</strong> आहेत. हे कोणत्याही प्रकारचा कायदेशीर सल्ला (Legal Advice / Legal Consultation) नाही. विशिष्ट कायदेशीर समस्येसाठी नेहमी तज्ञ वकिलाचा सल्ला घ्यावा.
          <span className="block mt-1 text-xs text-amber-700">(Our ebooks are for reference and educational purposes only. They do not constitute legal advice or legal consultation. Always consult a qualified lawyer for specific legal matters.)</span>
        </div>
      </div>

      <div className="prose prose-slate mx-auto max-w-3xl space-y-10 leading-relaxed text-gray-700">
        <section>
          <h2 className="mb-4 flex items-center gap-3 text-xl font-bold text-gray-900">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-teal text-sm text-white">
              1
            </div>
            माझे पुस्तक मला कसे मिळेल? (How will I receive my ebook?)
          </h2>
          <div className="pl-11">
            <p className="mb-4">
              पेमेंट पूर्ण झाल्यावर दोन प्रकारे तुम्हाला पुस्तक मिळेल:
            </p>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50 p-4">
                <Send className="mt-1 h-5 w-5 shrink-0 text-green-600" />
                <div>
                  <strong className="block text-gray-900">
                    स्क्रीनवर आणि WhatsApp वर (On Screen &amp; WhatsApp)
                  </strong>
                  पेमेंट यशस्वी झाल्यावर लगेच &apos;Download&apos; बटण दिसेल. तसेच, तुम्ही दिलेल्या WhatsApp नंबरवर PDF डाउनलोड लिंक पाठवली जाईल.
                  <span className="block mt-1 text-xs text-gray-500">(Download button appears immediately. PDF link also sent to your WhatsApp.)</span>
                </div>
              </li>
              <li className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50 p-4">
                <Mail className="mt-1 h-5 w-5 shrink-0 text-blue-600" />
                <div>
                  <strong className="block text-gray-900">
                    ईमेल द्वारे (Via Email)
                  </strong>
                  तुमच्या नोंदणीकृत ईमेल पत्त्यावर डाउनलोड लिंकसह पावती (Invoice) पाठवली जाईल.
                  <span className="block mt-1 text-xs text-gray-500">(Download link + invoice sent to your registered email.)</span>
                </div>
              </li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="mb-4 flex items-center gap-3 text-xl font-bold text-gray-900">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-teal text-sm text-white">
              2
            </div>
            डिलिव्हरी वेळ (Delivery Time)
          </h2>
          <div className="pl-11">
            <p>
              साधारणतः <strong>0–5 मिनिटांत</strong> प्रक्रिया पूर्ण होते. कधीकधी इंटरनेट किंवा सर्व्हरच्या समस्यांमुळे 10–15 मिनिटे लागू शकतात.
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Typically instant (0–5 mins). In rare cases of network/server issues, up to 10–15 minutes.
            </p>
          </div>
        </section>

        <section>
          <h2 className="mb-4 flex items-center gap-3 text-xl font-bold text-gray-900">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-teal text-sm text-white">
              3
            </div>
            भौगोलिक निर्बंध (Geographic Restrictions)
          </h2>
          <div className="pl-11">
            <p>
              डिजिटल वितरणामुळे भौगोलिक निर्बंध नाहीत. भारतातील कोठूनही ई-बुक खरेदी करता येते. आंतरराष्ट्रीय ग्राहकांसाठी: आमची पुस्तके मराठी/हिंदी/इंग्रजी भाषेत आहेत.
            </p>
            <p className="mt-1 text-sm text-gray-500">
              No geographic restrictions for digital delivery. Available across India. International customers: ebooks are in Marathi/Hindi/English.
            </p>
          </div>
        </section>

        <section className="rounded-xl border-l-4 border-amber-400 bg-amber-50 p-6">
          <h3 className="mb-2 font-bold text-amber-900">
            अडचण येत आहे? (Facing Issues?)
          </h3>
          <p className="mb-2 text-sm text-amber-800">
            जर पेमेंट होऊनही 30 मिनिटांत पुस्तक मिळाले नाही, तर Transaction ID सह आम्हाला तत्काळ संपर्क करा. आम्ही 48 तासांत पुस्तक पुन्हा पाठवू किंवा परतावा देऊ.
          </p>
          <p className="text-sm font-bold text-brand-teal">
            Email: support@kaydyachaanifaydyach.com <br />
            WhatsApp: +91 83780 89292
          </p>
          <p className="mt-1 text-xs text-gray-500">
            (If not received within 30 minutes of payment, contact us with your Transaction ID. We will resend or refund within 48 hours.)
          </p>
        </section>
      </div>
    </div>
  );
}
