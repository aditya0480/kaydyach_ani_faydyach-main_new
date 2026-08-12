import type { Metadata } from "next";
import { Trash2, ShieldAlert } from "lucide-react";

export const metadata: Metadata = {
  title: "डेटा हटवण्याच्या सूचना | Kaydyanch ani Faydyach",
  description:
    "Learn how to request deletion of your data. (डेटा हटवण्याच्या सूचना)",
};

export default function DataDeletionPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 md:py-16">
      <h1 className="mb-8 bg-linear-to-r from-brand-teal to-teal-600 bg-clip-text text-center text-3xl font-bold text-transparent md:text-4xl">
        डेटा हटवण्याच्या सूचना (Data Deletion Instructions)
      </h1>

      <div className="mb-10 flex items-center gap-4 rounded-2xl border border-brand-teal/20 bg-brand-teal/5 p-5 shadow-xs transition-all hover:shadow-md">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-brand-teal/10">
          <Trash2 className="h-6 w-6 text-brand-teal" />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-bold tracking-wider text-brand-teal uppercase">
            Privacy Control
          </p>
          <p className="text-sm leading-relaxed font-medium text-gray-700 md:text-base">
            आम्ही तुमच्या गोपनीयतेचा आदर करतो. तुमची माहिती हटवण्याचा सोपा मार्ग
            आम्ही उपलब्ध करून दिला आहे.
            <span className="mt-1 block text-xs font-normal text-gray-500">
              (We value your privacy and provide a path to delete your data.)
            </span>
          </p>
        </div>
      </div>

      <div className="prose prose-slate max-w-none space-y-8 leading-relaxed text-gray-700">
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-900">
            १. कोणता डेटा आम्ही साठवतो? (Data We Store)
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-6">
            <li>
              <strong>संपर्क माहिती (Contact Info):</strong> नाव, ईमेल, फोन
              नंबर.
            </li>
            <li>
              <strong>ऑर्डर इतिहास (Order History):</strong> खरेदी केलेली
              पुस्तके आणि व्यवहाराचे तपशील.
            </li>
          </ul>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-gray-50/50 p-6">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-900">
            २. डेटा हटवण्यासाठी विनंती कशी करावी? (How to Request Deletion)
          </h2>
          <p className="mb-4">
            तुमची माहिती कायमस्वरूपी हटवण्यासाठी, खालील पायऱ्या फॉलो करा:
          </p>
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-teal text-xs font-bold text-white">
                1
              </div>
              <p>
                तुमच्या नोंदणीकृत ईमेलवरून{" "}
                <strong>support@kaydyachaanifaydyach.com</strong> ला ईमेल करा.
              </p>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-teal text-xs font-bold text-white">
                2
              </div>
              <p>
                ईमेल चा विषय (Subject) असा ठेवा:{" "}
                <strong>&quot;Data Deletion Request - [Your Name]&quot;</strong>
                .
              </p>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-teal text-xs font-bold text-white">
                3
              </div>
              <p>ईमेलमध्ये तुमचा नोंदणीकृत फोन नंबर नमूद करा.</p>
            </div>
          </div>
          <p className="mt-4 border-l-4 border-brand-teal/30 pl-4 text-sm italic">
            आमची टीम ७-१० दिवसांत तुमच्या विनंतीवर प्रक्रिया करेल. (Process
            takes 7-10 business days.)
          </p>
        </section>

        <section>
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-destructive">
            <ShieldAlert className="h-5 w-5" />
            ३. डेटा हटवल्याचे परिणाम (Impact of Deletion)
          </h2>
          <div className="text-destructive-foreground rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm">
            <p className="mb-2 text-xs font-bold tracking-wide uppercase">
              चेतावणी (Warning):
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                तुम्ही खरेदी केलेल्या ई-बुक्सचा ॲक्सेस गमावाल. (Loss of access
                to purchased ebooks)
              </li>
              <li>
                तुमचा ऑर्डर इतिहास पुन्हा मिळवता येणार नाही. (Order history
                cannot be recovered)
              </li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-bold text-gray-900">
            ४. कायदेशीर पालन (Legal Compliance)
          </h2>
          <p>
            कृपया लक्षात घ्या की टॅक्स आणि कायद्याच्या नियमांनुसार (उदा. Indian
            Tax Laws), काही व्यवहार रेकॉर्ड्स (Invoices) आम्हाला ७ वर्षांपर्यंत
            जतन करून ठेवावे लागतात. हे रेकॉर्ड्स मार्केटिंगसाठी वापरले जात
            नाहीत.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            We are legally required to retain certain transaction records for 7
            years as per tax laws. These are not used for marketing.
          </p>
        </section>
      </div>
    </div>
  );
}
