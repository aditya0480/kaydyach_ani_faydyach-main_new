"use client";

import { useEffect, useState } from "react";
import { X, ExternalLink, MoreVertical, Compass, Chrome } from "lucide-react";
import { Button } from "@/components/ui/button";

export function IABManager() {
  // const [isIAB, setIsIAB] = useState(false); // Unused
  const [isAndroid, setIsAndroid] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const ua =
      navigator.userAgent ||
      navigator.vendor ||
      (window as unknown as { opera: string }).opera;
    const isInstagram = ua.indexOf("Instagram") > -1;
    const isFacebook = ua.indexOf("FBAN") > -1 || ua.indexOf("FBAV") > -1;
    const isWhatsApp = ua.indexOf("WhatsApp") > -1;
    const isIABAuto = isInstagram || isFacebook || isWhatsApp;

    if (!isIABAuto) return;

    const android = /android/i.test(ua);

    const ios =
      /iPad|iPhone|iPod/.test(ua) &&
      !(window as unknown as { MSStream: unknown }).MSStream;

    // eslint-disable-next-line react-hooks/set-state-in-effect -- Client-side only state initialization
    setIsAndroid(android);
     
    setIsIOS(ios);

    // FOR ANDROID: Attempt instant force-jump to Chrome
    if (android) {
      const currentUrl = window.location.href.replace(/^https?:\/\//, "");
      // Using Intent protocol to force Chrome
      const intentUrl = `intent://${currentUrl}#Intent;scheme=https;package=com.android.chrome;end`;

      // Short delay to allow domestic logic to settle
      const timer = setTimeout(() => {
        window.location.href = intentUrl;
        // If the user isn't redirected after 2 seconds, show the manual button
        setTimeout(() => setIsVisible(true), 2000);
      }, 500);

      return () => clearTimeout(timer);
    }

    // FOR iOS: Just show the handoff UI immediately
    if (ios) {
      setIsVisible(true);
    }
  }, []);

  if (!isVisible) return null;

  return (
    <div className="animate-in fade-in fixed inset-0 z-60 flex flex-col items-center justify-end bg-black/60 backdrop-blur-sm duration-500">
      {/* Main Handoff Panel */}
      <div className="animate-in slide-in-from-bottom-full relative w-full max-w-md rounded-t-[2.5rem] bg-white p-6 pb-12 shadow-2xl duration-700">
        {/* Visual Accent */}
        <div className="absolute top-3 left-1/2 h-1 w-12 -translate-x-1/2 rounded-full bg-gray-200" />

        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-6 right-6 rounded-full bg-gray-100 p-2 text-gray-400 transition-colors hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mt-4 space-y-4 text-center">
          <div className="mb-2 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-teal/5 text-brand-teal">
            <Compass className="animate-spin-slow h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-black text-brand-teal">
              ब्राउझरमध्ये उघडा (Open in Browser)
            </h2>
            <p className="px-4 text-sm font-medium text-gray-500">
              सुरक्षित पेमेंट आणि चांगल्या अनुभवासाठी कृपया हे पेज तुमच्या मुख्य
              ब्राउझरमध्ये उघडा.
              <span className="mt-1 block text-[10px] opacity-70">
                (For secure payment and better experience, please open this in
                your main browser.)
              </span>
            </p>
          </div>

          {isAndroid && (
            <div className="px-2 pt-4">
              <Button
                onClick={() => {
                  const currentUrl = window.location.href.replace(
                    /^https?:\/\//,
                    "",
                  );
                  window.location.href = `intent://${currentUrl}#Intent;scheme=https;package=com.android.chrome;end`;
                }}
                className="h-14 w-full rounded-2xl bg-brand-teal text-lg font-bold text-white shadow-xl shadow-brand-teal/20 hover:bg-brand-teal/90"
              >
                <Chrome className="mr-2 h-5 w-5" />
                Chrome मध्ये उघडा
              </Button>
            </div>
          )}

          {isIOS && (
            <div className="space-y-6 pt-4 text-left">
              <div className="space-y-4 rounded-2xl border border-brand-teal/10 bg-brand-teal/5 p-5">
                <p className="mb-2 text-center text-xs font-black tracking-widest text-brand-teal uppercase">
                  कसे करायचे? (How to do it?)
                </p>

                <div className="flex items-center gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white font-black text-brand-teal shadow-sm ring-1 ring-brand-teal/10">
                    1
                  </div>
                  <p className="text-sm font-bold text-gray-700">
                    उजव्या कोपऱ्यात{" "}
                    <MoreVertical className="inline-block h-4 w-4" /> (3 ठिपके)
                    वर क्लिक करा.
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white font-black text-brand-teal shadow-sm ring-1 ring-brand-teal/10">
                    2
                  </div>
                  <p className="text-sm font-bold text-gray-700">
                    <span className="font-black text-brand-teal">
                      &quot;Open in System Browser&quot;
                    </span>{" "}
                    निवडा.
                  </p>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="animate-bounce">
                  <div className="rounded-full bg-brand-gold/10 p-3">
                    <ExternalLink className="h-6 w-6 text-brand-teal" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
}
