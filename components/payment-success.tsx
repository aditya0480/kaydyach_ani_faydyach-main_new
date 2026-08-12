"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ShieldCheck,
  ArrowDown,
  BookOpen,
  ArrowUp,
  Library,
} from "lucide-react";
import confetti from "canvas-confetti";
import { useEffect } from "react";
import Link from "next/link";

interface PaymentSuccessProps {
  title: string;
  downloadUrl?: string | null;
  downloadItems?: { title: string; ebookId: string; url: string }[];
  isMobile?: boolean;
  onClose?: () => void; // Optional for dialog mode
  amount?: number;
  currency?: string;
  customerPhone?: string | null;
  browserAccessToken?: string | null;
}

export function PaymentSuccess({
  title,
  downloadUrl,
  downloadItems,
  isMobile,
  onClose,
  amount,
  currency = "INR",
  customerPhone,
  browserAccessToken,
}: PaymentSuccessProps) {
  useEffect(() => {

    // Store phone number for "My Books" pre-fill
    if (customerPhone) {
      localStorage.setItem("customer_phone", customerPhone);
    }

    // Store browser access token for device locking
    if (browserAccessToken) {
      try {
        const existingTokens = JSON.parse(
          localStorage.getItem("authorized_tokens") || "[]",
        );
        if (!existingTokens.includes(browserAccessToken)) {
          existingTokens.push(browserAccessToken);
          localStorage.setItem(
            "authorized_tokens",
            JSON.stringify(existingTokens),
          );
        }
      } catch (e) {
        console.error("Failed to save tokens in PaymentSuccess", e);
      }
    }

    // Trigger confetti on mount
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#0A2342", "#FFD301", "#25D366"],
    });
  }, [amount, currency, title, customerPhone, browserAccessToken]);

  // Construct WhatsApp Message
  let whatsappMessage = "";

  // Hardcoded combo books for promotion
  const comboPromos = `\n\n🔥 आमचे लोकप्रिय कोम्बो पॅक्स (Best Selling Combos):

👉 घर घेण्याआधी हे वाचाच! – रिसेल, म्हाडा आणि गुंठेवारी फ्लॅट खरेदी ( 3 Book Set)
🔗 लिंक: https://www.kaydyachaanifaydyach.com/ebooks/cmki9y4mk000f04jowhl6babh

👉 विवाह ते घटस्फोट: हक्कांची पूर्ण मार्गदर्शिका ( 3 Book Set)
🔗 लिंक: https://www.kaydyachaanifaydyach.com/ebooks/cmkdvuui9000004l170b2db2g

👉 मालमत्ता, वाटप व कायदेशीर हक्क – कम्प्लीट कॉम्बो गाईड ( 3 Books Set )
🔗 लिंक: https://www.kaydyachaanifaydyach.com/ebooks/cmk163mbe000004kyhqrih4e5`;

  if (downloadItems && downloadItems.length > 1) {
    // Multi-book message
    const linksList = downloadItems
      .map(
        (item, index) =>
          `${index + 1}. ${item.title}\n⬇️ डाऊनलोड करा: ${item.url}`,
      )
      .join("\n-------------------\n");

    whatsappMessage = `नमस्कार,\nकोम्बो पॅक खरेदी केल्याबद्दल धन्यवाद!\nतुमची पुस्तके खालीलप्रमाणे आहेत:\n\n${linksList}\n\n⚠️ ही लिंक ७ दिवसांसाठी वैध आहे. कृपया त्वरित डाऊनलोड करा.\n📱 PDF मोबाईलमध्ये 'Downloads' किंवा 'Documents' फोल्डरमध्ये तपासा.\n\n${comboPromos}\n\nआमच्या इतर पुस्तकांसाठी: https://www.kaydyachaanifaydyach.com/ebooks\n\nधन्यवाद!`;
  } else {
    // Single book message (Legacy)
    whatsappMessage = `नमस्कार,\nपुस्तक: ${title}\nखरेदी केल्याबद्दल धन्यवाद!\n\n⬇️ डाऊनलोड करा:\n${downloadUrl}\n\n⚠️ ही लिंक ७ दिवसांसाठी वैध आहे. कृपया त्वरित डाऊनलोड करा.\n📱 जर PDF आधी डाऊनलोड झाली असेल तर 'Downloads' फोल्डरमध्ये तपासा.\n\n${comboPromos}\n\nआमच्या इतर पुस्तकांसाठी: https://www.kaydyachaanifaydyach.com/ebooks\n\nधन्यवाद!`;
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center bg-white",
        isMobile ? "px-6 pt-4 pb-12" : "px-8 py-10",
      )}
    >
      {/* Animated Celebration Icon */}
      <div className={cn("relative", isMobile ? "mb-6" : "mb-4")}>
        <div className="absolute inset-0 animate-ping rounded-full bg-green-100 opacity-25" />
        <div
          className={cn(
            "relative z-10 flex items-center justify-center rounded-full bg-green-50",
            isMobile ? "h-20 w-20" : "h-16 w-16",
          )}
        >
          <ShieldCheck
            className={cn(
              "text-green-500 drop-shadow-sm",
              isMobile ? "h-10 w-10" : "h-8 w-8",
            )}
          />
        </div>
      </div>

      <h2
        className={cn(
          "text-center leading-tight font-black text-brand-teal",
          isMobile ? "mb-2 text-2xl" : "mb-1 text-xl",
        )}
      >
        पेमेंट यशस्वी!
        <br />
        <span
          className={
            isMobile
              ? "text-xl font-bold opacity-90"
              : "text-lg font-bold opacity-90"
          }
        >
          अभिनंदन!
        </span>
      </h2>

      <div
        className={cn(
          "relative w-full overflow-hidden rounded-2xl border border-green-100 bg-green-50/80 text-center",
          isMobile ? "mx-2 mb-6 p-4" : "mb-6 p-4",
        )}
      >
        <div className="absolute top-0 left-0 h-1 w-full bg-linear-to-r from-transparent via-green-400 to-transparent opacity-50" />
        <p className="mb-2 text-sm leading-relaxed font-bold text-green-900">
          तुमचे पुस्तक तयार आहे! <br />
          पुस्तकाची डाउनलोड लिंक आणि डायरेक्ट ओपन करण्याची लिंक कायम सेव्ह
          करण्यासाठी खालील <strong>व्हॉट्सॲप बटनावर</strong> क्लिक करा.
        </p>
        <div className="mt-1 flex animate-bounce justify-center">
          <div className="rounded-full bg-white p-1.5 shadow-sm">
            <ArrowDown className="h-5 w-5 text-green-600" />
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col gap-3">
        {downloadUrl && (
          <>
            {/* Buttons Container - Side by side on Desktop */}
            <div
              className={cn(
                "grid gap-3",
                isMobile ? "grid-cols-1" : "grid-cols-2",
              )}
            >
              {/* WhatsApp Button - High Priority */}
              <Button
                asChild
                className="group h-14 w-full rounded-2xl border-none bg-[#25D366] font-bold text-white shadow-lg shadow-green-500/20 transition-all hover:bg-[#20bd5a] active:scale-[0.98]"
              >
                <a
                  href={`https://wa.me/917262096067?text=${encodeURIComponent(whatsappMessage)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="transition-transform group-hover:scale-110"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  <span className="text-[11px] font-bold">
                    व्हॉट्सॲपवर उघडा
                  </span>
                </a>
              </Button>

              <Button
                asChild
                className="h-14 w-full rounded-2xl border-2 border-brand-teal/10 bg-white font-bold text-brand-teal shadow-sm transition-all hover:bg-gray-50 active:scale-[0.98]"
              >
                <a
                  href={downloadUrl}
                  download={`${title.replace(/["/\\:;]/g, "").trim()}.pdf`}
                  className="flex items-center justify-center gap-2 text-[11px] font-bold"
                >
                  <BookOpen className="h-4 w-4" /> PDF डाउनलोड करा
                </a>
              </Button>
            </div>

            {/* Download Hint Box */}
            <div
              className={cn(
                "w-full rounded-2xl border border-teal-100 bg-teal-50/80 text-center",
                isMobile ? "mb-2 p-4" : "mb-1 p-3",
              )}
            >
              <div className="mb-1 flex items-center justify-center gap-2 text-sm font-bold text-teal-800">
                <div className="h-2 w-2 animate-pulse rounded-full bg-teal-500" />
                PDF डायरेक्ट डाउनलोड करण्यासाठी वरील बटनावर क्लिक करा
                <ArrowUp className="h-4 w-4 animate-bounce text-teal-600" />
              </div>
              <p className="text-xs leading-relaxed font-medium text-teal-600/90">
                PDF तुमच्या मोबाइलमधील <strong>&quot;Downloads&quot;</strong>{" "}
                किंवा <strong>&quot;Documents&quot;</strong> फोल्डरमध्ये सेव्ह
                होईल.
              </p>
            </div>

            {/* Secondary Action: My Books */}
            <Button
              asChild
              variant="outline"
              className="h-12 w-full rounded-2xl border-2 border-brand-teal/20 bg-brand-teal/5 font-bold text-brand-teal shadow-none transition-all hover:bg-brand-teal/10 active:scale-[0.98]"
            >
              <Link
                href="/my-books"
                className="flex items-center justify-center gap-2 text-[11px] font-bold"
              >
                <Library className="h-4 w-4" /> माझी सर्व खरेदी केलेली पुस्तके
                (My Books)
              </Link>
            </Button>

            {/* WhatsApp Community Action */}
            <Button
              asChild
              className="mt-2 h-12 w-full rounded-2xl border-2 border-[#25D366]/20 bg-[#25D366]/10 font-bold text-[#25D366] shadow-none transition-all hover:bg-[#25D366]/20 active:scale-[0.98]"
            >
              <a
                href="https://chat.whatsapp.com/JpLenMVNds4ELcTkrDujfv"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-[11px] font-bold"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                नवीन पुस्तकांच्या अपडेट्ससाठी WhatsApp ग्रुप जॉईन करा
              </a>
            </Button>

            {onClose && (
              <button
                onClick={onClose}
                className="mt-2 w-full px-4 py-2 text-[10px] font-semibold tracking-wider text-gray-400 uppercase transition-colors hover:text-gray-600"
              >
                बंद करा
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
