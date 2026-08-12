"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import { toast } from "sonner";
import { Pointer, Loader2, ShieldCheck, Zap, Info, X, Lock } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useRef } from "react";
import { useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import { SaleTimer } from "@/components/marketing/sale-timer";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { useRouter } from "next/navigation";
import { ManualPaymentDialog } from "@/components/manual-payment/manual-payment-dialog";
import { parseClientContext, detectInAppBrowser } from "@/lib/user-agent";


const CHECKOUT_LABELS = {
  MARATHI: {
    readerCount: "2,000+ वाचक समाधानी",
    selectedBook: "निवडलेले पुस्तक",
    priceHeader: "किंमत",
    nameLabel: "नाव (Name)",
    namePlaceholder: "उदा. राहुल पाटील",
    phoneLabel: "व्हॉट्सॲप नंबर",
    phonePlaceholder: "उदा. 9876543210",
    nextBtn: "पुढे जा (Next)",
    secureText: "१००% सुरक्षित व्यवहार",
    instantPdf: "पेमेंटनंतर लगेच PDF",
    yourInfo: "तुमची माहिती:",
    editBtn: "बदल करा (Edit)",
    whatsappInfo: "या नंबरवर तुम्हाला ई-बुकची लिंक मिळेल.",
    pdfNotice: "हे पुस्तक डिजिटल PDF स्वरूपात मिळेल. घरपोच (Home Delivery) सुविधा उपलब्ध नाही. पेमेंट झाल्यावर PDF लगेच WhatsApp वर मिळेल.",
    iabTitle: "महत्वाची सूचना",
    iabMsg1: 'पेमेंट करताना "You\'re leaving our app" असा मेसेज येऊ शकतो.',
    iabMsg2: 'पेमेंट पूर्ण करण्यासाठी कृपया "CONTINUE" वर क्लिक करा.',
    consentPrefix: "खालील बटणावर क्लिक करून, तुम्ही आमच्या",
    consentAnd: "आणि",
    consentSuffix: "सहमत आहात.",
    termsText: "नियम आणि अटी",
    privacyText: "गोपनीयता धोरणाशी",
    processingText: "प्रोसेसिंग...",
    payBtn: "आता पेमेंट करा",
  },
  HINDI: {
    readerCount: "2,000+ पाठक संतुष्ट",
    selectedBook: "चयनित पुस्तक",
    priceHeader: "मूल्य",
    nameLabel: "नाम (Name)",
    namePlaceholder: "उदा. राहुल शर्मा",
    phoneLabel: "व्हाट्सएप नंबर",
    phonePlaceholder: "उदा. 9876543210",
    nextBtn: "आगे जाएं (Next)",
    secureText: "१००% सुरक्षित लेनदेन",
    instantPdf: "भुगतान के बाद तुरंत PDF",
    yourInfo: "आपकी जानकारी:",
    editBtn: "बदलें (Edit)",
    whatsappInfo: "इस नंबर पर आपको ई-बुक की लिंक मिलेगी।",
    pdfNotice: "यह पुस्तक डिजिटल PDF के रूप में उपलब्ध है। होम डिलीवरी उपलब्ध नहीं है। भुगतान के बाद PDF तुरंत WhatsApp पर मिलेगी।",
    iabTitle: "महत्वपूर्ण सूचना",
    iabMsg1: 'भुगतान के दौरान "You\'re leaving our app" संदेश आ सकता है।',
    iabMsg2: 'भुगतान पूरा करने के लिए कृपया "CONTINUE" पर क्लिक करें।',
    consentPrefix: "नीचे बटन पर क्लिक करके, आप हमारी",
    consentAnd: "और",
    consentSuffix: "से सहमत हैं।",
    termsText: "नियम और शर्तें",
    privacyText: "गोपनीयता नीति",
    processingText: "प्रोसेसिंग...",
    payBtn: "अभी भुगतान करें",
  },
  ENGLISH: {
    readerCount: "2,000+ Happy Readers",
    selectedBook: "Selected Book",
    priceHeader: "Price",
    nameLabel: "Name",
    namePlaceholder: "e.g. Rahul Sharma",
    phoneLabel: "WhatsApp Number",
    phonePlaceholder: "e.g. 9876543210",
    nextBtn: "Next",
    secureText: "100% Secure Transaction",
    instantPdf: "Instant PDF after payment",
    yourInfo: "Your Details:",
    editBtn: "Edit",
    whatsappInfo: "You will receive the e-book link on this number.",
    pdfNotice: "This book is available as a digital PDF. Home delivery is not available. PDF will be sent to WhatsApp immediately after payment.",
    iabTitle: "Important Notice",
    iabMsg1: 'You may see a "You\'re leaving our app" message while paying.',
    iabMsg2: 'Please click "CONTINUE" to complete your payment.',
    consentPrefix: "By clicking the button below, you agree to our",
    consentAnd: "and",
    consentSuffix: ".",
    termsText: "Terms & Conditions",
    privacyText: "Privacy Policy",
    processingText: "Processing...",
    payBtn: "Pay Now",
  },
} as const;

type CheckoutLanguage = keyof typeof CHECKOUT_LABELS;

interface BuyButtonProps {
  ebookId: string;
  price: number;
  title: string;
  customLabel?: string;
  language?: string;
}

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
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
  modal?: {
    ondismiss: () => void;
  };
  handler?: (response: RazorpayResponse) => Promise<void>;
  callback_url?: string;
}

declare global {
  interface Window {
    Razorpay: {
      new (options: RazorpayOptions): {
        open(): void;
        on(event: string, handler: (response: unknown) => void): void;
      };
    };
    opera?: unknown;
    MSStream?: unknown;
  }
}

// Robust script loader removed in favor of next/script

// --- RESILIENCY HELPERS FOR SCRIPT LOADING ---
const RZP_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";

const loadScript = (src: string): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof document === "undefined") return resolve(false);
    // If Razorpay is already available, we're good
    if (typeof window.Razorpay !== "undefined") return resolve(true);

    // If script tag exists but hasn't loaded yet, wait for it with higher timeout
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
      }, 10000); // Increased to 10s for slow internet
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true; // Ensure non-blocking
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error("Razorpay script failed to load. Ad-blocker or network issues?");
      resolve(false);
    };
    document.body.appendChild(script);

    // Safety timeout for new injection
    setTimeout(() => {
      if (typeof window.Razorpay === "undefined") {
        resolve(false);
      }
    }, 15000);
  });
};

// Helper to clean phone number
const cleanPhoneNumber = (val: string) => {
  // Remove spaces, dashes, parentheses, plus sign
  let cleaned = val.replace(/[\s\-\(\)\+]/g, "");

  // Handle logical prefixes if length indicates it includes them (matches Indian mobile length nuances)
  if (cleaned.length > 10) {
    if (cleaned.startsWith("91")) {
      cleaned = cleaned.substring(2);
    } else if (cleaned.startsWith("0")) {
      cleaned = cleaned.substring(1);
    }
  }
  return cleaned;
};

const checkoutSchema = z.object({
  name: z
    .string()
    .trim()
    .max(50, "नाव 50 अक्षरांपेक्षा जास्त नसावे")
    .optional(),
  phone: z
    .string()
    .transform(cleanPhoneNumber)
    .refine((val) => /^[6-9]\d{9}$/.test(val), {
      message: "कृपया वैध मोबाइल नंबर टाका (उदा. 9876543210)",
    }),
  email: z.string().trim().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export function BuyButton({
  ebookId,
  price,
  title,
  customLabel,
  language,
}: BuyButtonProps) {
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState<string>("");
  const [open, setOpen] = useState(false);
  const router = useRouter();

  // Ref for orderId to be accessible in closures (like ondismiss)
  const currentOrderIdRef = useRef<string | null>(null);
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [customerEmail, setCustomerEmail] = useState<string>("");
  const [customerName, setCustomerName] = useState<string>("");
  const isMobileBreakpoint = useIsMobile();
  const [isMobileOS, setIsMobileOS] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);
  const [isIAB, setIsIAB] = useState(false);
  const [isAndroidIAB, setIsAndroidIAB] = useState(false);
  const [manualDialogOpen, setManualDialogOpen] = useState(false);
  const [manualOrderId, setManualOrderId] = useState<string>("");
  const [manualAmount, setManualAmount] = useState<number>(0);
  const isManualMode = process.env.NEXT_PUBLIC_PAYMENT_MODE === "manual";

  // Fix: Cleanup pointerEvents on unmount to prevent stuck page
  useEffect(() => {
    return () => {
      document.body.style.pointerEvents = "";
    };
  }, []);

  // IAB detection (Instagram / Facebook / WhatsApp / Messenger / Snapchat / TikTok / Line WebView)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const ua = navigator.userAgent || navigator.vendor || (window.opera as string);
    if (detectInAppBrowser(ua) !== null) {
      setTimeout(() => {
        setIsIAB(true);
        setIsAndroidIAB(/android/i.test(ua));
      }, 0);
    }
  }, []);

  const handleOpenInBrowser = () => {
    const url = window.location.href;
    if (isAndroidIAB) {
      window.location.href = `intent://${window.location.hostname}${window.location.pathname}${window.location.search || ""}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(url)};end`;
    } else {
      window.open(url, "_blank");
    }
  };

  // Robust Mobile OS Detection (User Agent)
  useEffect(() => {
    const userAgent =
      navigator.userAgent || navigator.vendor || (window.opera as string);
    const checkMobileOS = () => {
      if (/android/i.test(userAgent)) return true;
      if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) return true;
      return false;
    };
    setIsMobileOS(checkMobileOS());
  }, []);

  // --- RESILIENCY HELPERS ---

  // 1. Fetch with Exponential Backoff Retries
  const fetchWithRetry = async (
    url: string,
    options: RequestInit,
    maxRetries = 3,
  ): Promise<Response> => {
    let retries = 0;
    while (retries < maxRetries) {
      try {
        const res = await fetch(url, options);
        if (res.ok) return res;
        // If 429 or 5xx, we might want to retry. 4xx usually means client error, don't retry.
        if (res.status < 500 && res.status !== 429) return res;
      } catch (e) {
        console.warn(`Fetch attempt ${retries + 1} failed:`, e);
      }
      retries++;
      if (retries < maxRetries) {
        const delay = Math.pow(2, retries) * 1000 + Math.random() * 1000;
        await new Promise((r) => setTimeout(r, delay));
      }
    }
    throw new Error(
      "नेटवर्क समस्या आली आहे. कृपया तुमचे इंटरनेट तपासा आणि पुन्हा प्रयत्न करा.",
    );
  };

  // 2. State Recovery Logic
  useEffect(() => {
    // If we were in the middle of an order, we could check for pending status here
    // But for now, we just restore user info which is already handled
  }, []);

  // Combine checks: use Redirect flow if it's a small screen OR a mobile OS
  const shouldUseRedirectFlow = isMobileBreakpoint || isMobileOS;

  // Safe LocalStorage Helpers
  const safeGetItem = (key: string) => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        return localStorage.getItem(key);
      }
    } catch (e) {
      console.warn("LocalStorage access denied:", e);
    }
    return null;
  };

  const safeSetItem = (key: string, value: string) => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.setItem(key, value);
      }
    } catch (e) {
      console.warn("LocalStorage write failed:", e);
    }
  };




  // Load saved info from localStorage
  useEffect(() => {
    const savedName = safeGetItem("customer_name");
    const savedPhone = safeGetItem("customer_phone");
    const savedEmail = safeGetItem("customer_email");
    if (savedName) setCustomerName(savedName);
    if (savedPhone) setCustomerPhone(savedPhone);
    if (savedEmail) setCustomerEmail(savedEmail);
  }, []);

  // Save info to localStorage when it changes
  const saveToLocal = (key: string, value: string) => {
    safeSetItem(key, value);
  };




  // Track when user clicks buy button (InitiateCheckout)
  function handleBuyClick() {
    if (typeof window !== "undefined" && window.fbq) {
      const eventId = `ic_${ebookId}_${Date.now()}`;
      window.fbq(
        "track",
        "InitiateCheckout",
        {
          value: price,
          currency: "INR",
          content_name: title,
          content_type: "product",
          content_ids: [ebookId],
          num_items: 1,
        },
        { eventID: eventId },
      );
    }
    setOpen(true);

    // Eager-warm Razorpay script while user fills the form
    if (!isRazorpayLoaded && typeof window !== "undefined" && typeof window.Razorpay === "undefined") {
      loadScript(RZP_SCRIPT_URL).then((ok) => {
        if (ok) setIsRazorpayLoaded(true);
      });
    }
  }

  async function onPaymentSubmit(data: CheckoutFormValues) {
    setLoading(true);
    setLoadingStage("ऑर्डर तयार करत आहोत...");

    // Track when user submits payment form (AddPaymentInfo)
    if (typeof window !== "undefined" && window.fbq) {
      window.fbq("track", "AddPaymentInfo", {
        value: price,
        currency: "INR",
        content_name: title,
        content_type: "product",
        content_ids: [ebookId],
      });
    }

    const { name = "", email = "", phone } = data;

    setCustomerPhone(phone);
    setCustomerEmail(email);
    setCustomerName(name);

    // Persist for future purchases
    saveToLocal("customer_name", name);
    saveToLocal("customer_phone", phone);
    saveToLocal("customer_email", email);

    // If API takes >5s (cold DB wake-up), tell user to hold on
    const waitHintTimer = setTimeout(() => {
      toast.loading("जरा वेळ लागेल, कृपया थांबा...", { id: "wait-hint", duration: 10000 });
    }, 5000);

    try {
      if (isManualMode) {
        const res = await fetchWithRetry("/api/orders/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ebookId, name, email, phone, paymentMode: "manual" }),
        });
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Order Creation Failed: ${res.status} ${errorText}`);
        }
        const order = await res.json();
        currentOrderIdRef.current = order.orderId;
        setManualOrderId(order.orderId);
        setManualAmount(price);
        clearTimeout(waitHintTimer);
        toast.dismiss("wait-hint");
        setOpen(false);
        setManualDialogOpen(true);
        setLoading(false);
        setLoadingStage("");
        return;
      }

      let isLoaded = isRazorpayLoaded || typeof window.Razorpay !== "undefined";
      if (!isLoaded) {
        toast.loading("पेमेंट गेटवे तयार करत आहोत...", { id: "rzp-load", duration: 8000 });
        isLoaded = await loadScript(RZP_SCRIPT_URL);
        if (isLoaded) {
          setIsRazorpayLoaded(true);
        }
        toast.dismiss("rzp-load");
      }

      if (!isLoaded || typeof window.Razorpay === "undefined") {
        throw new Error("तुमचे इंटरनेट स्लो आहे किंवा ब्राउझरने पेमेंट स्क्रिप्ट ब्लॉक केली आहे. कृपया रिफ्रेश करा (Refresh) आणि पुन्हा प्रयत्न करा.");
      }

      const res = await fetchWithRetry("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ebookId, name, email, phone }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Order Creation Failed: ${res.status} ${errorText}`);
      }

      clearTimeout(waitHintTimer);
      toast.dismiss("wait-hint");

      const order = await res.json();
      currentOrderIdRef.current = order.orderId;
      setLoadingStage("Razorpay उघडत आहे...");

      // 2. Initialize Razorpay Options
      const options: RazorpayOptions = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "Kaydyacha Ani Faydyach",
        description: `Payment for ${title}`,
        order_id: order.razorpayOrderId,
        prefill: {
          name: name,
          email: email,
          contact: phone,
        },
        theme: {
          color: "#0A2342", // Brand Teal
        },
      };

      // Tracks whether any Razorpay event fired — used by safety timeout
      let rzpInteracted = false;

      // Shared Modal Options (ondismiss handler)
      options.modal = {
        ondismiss: function () {
          rzpInteracted = true;
          setLoading(false);
          setLoadingStage("");
          document.body.style.pointerEvents = "auto";

          // Log dismissal (with device context to correlate drop-off with in-app browsers)
          fetch("/api/orders/log", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              event: "MODAL_DISMISSED",
              orderId: currentOrderIdRef.current,
              metadata: parseClientContext(navigator.userAgent),
            }),
          }).catch(() => {});
        },
      };

      // MOBILE VS DESKTOP LOGIC
      if (shouldUseRedirectFlow) {
        // REDIRECT FLOW (Mobile/Tablet)
        // This is robust against App Switching (UPI apps) as it relies on a full page redirect callback
        options.callback_url = `${window.location.origin}/api/payment/callback`;
      } else {
        // MODAL FLOW (Desktop)
        options.handler = async function (response: RazorpayResponse) {
          setIsVerifying(true);
          // 3. Verify Payment
          try {
            const verifyRes = await fetch("/api/orders/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            if (!verifyRes.ok) throw new Error("Payment verification failed");

            const verifyData = await verifyRes.json();

            toast.success("पेमेंट यशस्वी झाले!");

            // Show Redirecting State
            setIsRedirecting(true);
            setOpen(false);

            // Store browser access token in localStorage for device locking
            if (verifyData.browser_access_token) {
              try {
                const existingTokens = JSON.parse(
                  localStorage.getItem("authorized_tokens") || "[]",
                );
                if (!existingTokens.includes(verifyData.browser_access_token)) {
                  existingTokens.push(verifyData.browser_access_token);
                  localStorage.setItem(
                    "authorized_tokens",
                    JSON.stringify(existingTokens),
                  );
                }
              } catch (e) {
                console.error("Failed to save tokens", e);
              }
            }

            // Redirect to My Books with enough context for recovery on slower networks.
            const params = new URLSearchParams({
              orderId: verifyData.orderId || order.orderId,
              amount: order.amount.toString(),
              title: title,
              ebook_id: ebookId,
              currency: order.currency,
              phone,
            });
            if (email) {
              params.set("email", email);
            }
            if (verifyData.browser_access_token) {
              params.set("access_token", verifyData.browser_access_token);
            }
            params.set(
              verifyData.success ? "payment_success" : "payment_pending",
              "true",
            );
            router.push(`/my-books?${params.toString()}`);
          } catch (err: unknown) {
            toast.error(
              "पेमेंट पडताळणी अयशस्वी झाली. कृपया सपोर्टशी संपर्क साधा.",
            );
            console.error(err);
            setIsVerifying(false);
            // Do NOT mark FAILED — webhook will still fulfill if Razorpay captured payment.
            // Marking FAILED here causes "no books found" before webhook arrives.
          } finally {
            // Restore pointer events
            document.body.style.pointerEvents = "";
          }
        };
      }

      // 3. Initialize Razorpay (Since we already ensured it's loaded)
      const initRazorpay = () => {
        if (typeof window.Razorpay === "undefined") {
          // Should theoretically not happen due to check above, but safe guard
          toast.error("पेमेंट लोड होऊ शकले नाही. कृपया पुन्हा प्रयत्न करा.");
          setLoading(false);
          return;
        }
        const rzp1 = new window.Razorpay(options);

        // Ensure pointer events are enabled before opening
        document.body.style.pointerEvents = "";

        rzp1.open();

        // Log modal opened (with device context to correlate drop-off with in-app browsers)
        fetch("/api/orders/log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: "MODAL_OPENED",
            orderId: currentOrderIdRef.current,
            metadata: parseClientContext(navigator.userAgent),
          }),
        }).catch(() => {});

        // Safety net: if no Razorpay event fires within 15s, modal silently failed to open
        const safetyTimer = setTimeout(() => {
          if (!rzpInteracted) {
            setLoading(false);
            setLoadingStage("");
            toast.error(
              "पेमेंट पेज उघडले नाही. कृपया पेज रिफ्रेश करा आणि पुन्हा प्रयत्न करा.",
              { duration: 8000 },
            );
          }
        }, 15000);

        rzp1.on("payment.failed", function (rawResponse: unknown) {
          rzpInteracted = true;
          clearTimeout(safetyTimer);
          const response = rawResponse as { error: { code?: string; description?: string; reason?: string } };
          toast.error("पेमेंट अयशस्वी. कृपया पुन्हा प्रयत्न करा.");
          console.error(response.error);
          setLoading(false);
          setLoadingStage("");
          fetch("/api/orders/log", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              event: "PAYMENT_FAILED_CLIENT",
              orderId: currentOrderIdRef.current,
              metadata: response.error,
            }),
          }).catch(() => {});
        });
      };

      initRazorpay();
    } catch (error: unknown) {
      clearTimeout(waitHintTimer);
      toast.dismiss("wait-hint");
      toast.dismiss("rzp-load");
      setLoadingStage("");
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error(error);
      toast.error(
        errorMessage ||
          "क्षमस्व! काही तांत्रिक अडचण आली. कृपया पुन्हा प्रयत्न करा.",
      );
      setLoading(false); // Ensure loading stops on catch

      // Report technical error to backend if we have an orderId
      if (currentOrderIdRef.current) {
        fetch("/api/orders/update-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: currentOrderIdRef.current,
            status: "FAILED",
            reason: errorMessage,
          }),
        }).catch(console.error);
      }
    }
    // Note: We deliberately DO NOT have a top-level finally { setLoading(false) } here
    // because for mobile redirect flow, we WANT it to stay loading until redirect.
    // For desktop modal flow, the handler's finally block handles it, OR ondismiss handles it.
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        {!shouldUseRedirectFlow && (
          <Button
            size="lg"
            onClick={handleBuyClick}
            className="group flex w-full items-center justify-center gap-2 bg-brand-gold font-extrabold text-brand-teal shadow-lg transition-all hover:-translate-y-0.5 hover:bg-brand-gold/90"
          >
            <Pointer className="h-5 w-5 transition-transform group-hover:scale-110" />
            {customLabel || `आता डाउनलोड करा - ₹${price}`}
          </Button>
        )}
        {shouldUseRedirectFlow && (
          <Button
            size="lg"
            onClick={handleBuyClick}
            className="flex w-full items-center justify-center gap-2 bg-brand-gold font-extrabold text-brand-teal shadow-lg transition-all hover:bg-brand-gold/90 active:scale-95"
          >
            <Pointer className="h-5 w-5" />
            {customLabel || `आता डाउनलोड करा - ₹${price}`}
          </Button>
        )}

        {!shouldUseRedirectFlow ? (
          <DialogContent
            onPointerDownOutside={(e) => e.preventDefault()}
            onEscapeKeyDown={(e) => e.preventDefault()}
            className="w-[90vw] max-w-100 overflow-hidden rounded-2xl border-none p-0 shadow-2xl sm:max-w-96 [&>button]:top-4 [&>button]:right-4 [&>button]:text-gray-400"
          >
            <DialogTitle className="sr-only">पेमेंट करा</DialogTitle>
            <DialogDescription className="sr-only">
              तुमची ई-बुक खरेदी पूर्ण करा.
            </DialogDescription>
            {isVerifying || isRedirecting ? (
              <PaymentVerifying isRedirecting={isRedirecting} />
            ) : (
              <CheckoutForm
                handlePayment={onPaymentSubmit}
                loading={loading}
                loadingStage={loadingStage}
                title={title}
                price={price}
                language={language}
                isIAB={isIAB}
                isAndroidIAB={isAndroidIAB}
                onOpenInBrowser={handleOpenInBrowser}
                initialData={{
                  name: customerName,
                  phone: customerPhone,
                  email: customerEmail,
                }}
              />
            )}
          </DialogContent>
        ) : (
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetContent
              side="bottom"
              onOpenAutoFocus={(e) => e.preventDefault()}
              onPointerDownOutside={(e) => e.preventDefault()}
              onEscapeKeyDown={(e) => e.preventDefault()}
              className="h-auto max-h-[90dvh] overflow-y-auto rounded-t-3xl border-none p-0 pb-[env(safe-area-inset-bottom)]"
            >
              <SheetTitle className="sr-only">पेमेंट करा</SheetTitle>
              <SheetDescription className="sr-only">
                तुमची ई-बुक खरेदी पूर्ण करा.
              </SheetDescription>
              <div className="mx-auto mt-3 mb-1 h-1 w-12 rounded-full bg-gray-200" />
              {isVerifying || isRedirecting ? (
                <PaymentVerifying isRedirecting={isRedirecting} />
              ) : (
                <CheckoutForm
                  handlePayment={onPaymentSubmit}
                  loading={loading}
                  loadingStage={loadingStage}
                  title={title}
                  price={price}
                  isMobile={true}
                  language={language}
                  isIAB={isIAB}
                  isAndroidIAB={isAndroidIAB}
                  onOpenInBrowser={handleOpenInBrowser}
                  initialData={{
                    name: customerName,
                    phone: customerPhone,
                    email: customerEmail,
                  }}
                />
              )}
            </SheetContent>
          </Sheet>
        )}
      </Dialog>
      <ManualPaymentDialog
        open={manualDialogOpen}
        onOpenChange={setManualDialogOpen}
        orderId={manualOrderId}
        amount={manualAmount}
        language={language}
        onApproved={(oid) => {
          router.push(`/payment/success?orderId=${oid}`);
        }}
      />
    </>
  );
}

interface CheckoutFormProps {
  handlePayment: (data: CheckoutFormValues) => Promise<void>;
  loading: boolean;
  loadingStage?: string;
  title: string;
  price: number;
  isMobile?: boolean;
  language?: string;
  initialData: { name: string; phone: string; email: string };
  isIAB?: boolean;
  isAndroidIAB?: boolean;
  onOpenInBrowser?: () => void;
}

// CountdownTimer removed (replaced by global SaleTimer)

function CheckoutForm({
  handlePayment,
  loading,
  loadingStage,
  title,
  price,
  isMobile,
  language,
  initialData,
  isIAB,
  isAndroidIAB,
  onOpenInBrowser,
}: CheckoutFormProps) {
  const labels = CHECKOUT_LABELS[(language ?? "MARATHI") as CheckoutLanguage] ?? CHECKOUT_LABELS.MARATHI;

  const [step, setStep] = useState<1 | 2>(1);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: initialData.name || "",
      phone: initialData.phone || "",
      email: initialData.email || "",
    },
  });

  const [legalModal, setLegalModal] = useState<"terms" | "privacy" | null>(null);

  const handleNextStep = async () => {
    const isValid = await form.trigger();
    if (isValid) {
      setStep(2);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handlePayment)}
        className={cn(
          "relative bg-white transition-all",
          isMobile ? "px-5 pt-1.5 pb-24" : "p-6",
        )}
      >
        {/* Intelligence-driven Trust & Urgency Bar - Slimmer on mobile */}
        <div
          className={cn(
            "-mx-5 flex items-center justify-between border-b border-brand-teal/10 bg-brand-teal/5 px-5 py-2 shadow-sm",
            isMobile ? "-mt-1.5 mb-3" : "-mt-2 mb-4",
          )}
        >
          <div className="flex items-center gap-1.5 text-[9px] font-bold tracking-widest text-brand-teal/70 uppercase">
            <CheckCircle2 className="h-3 w-3 fill-green-50 text-green-500" />
            {labels.readerCount}
          </div>
          <SaleTimer className="animate-pulse rounded-full border-rose-100 bg-rose-50 px-2 py-0.5 text-[10px] text-rose-600 shadow-none" />
        </div>

        <div
          className={cn(
            "grid grid-cols-[1fr_auto] items-center gap-3 border-b border-gray-100 pb-2.5",
            isMobile ? "mb-4" : "mb-5",
          )}
        >
          <div className="min-w-0 overflow-hidden">
            <p className="mb-0.5 text-[9px] font-bold tracking-widest text-gray-400 uppercase">
              {labels.selectedBook}
            </p>
            <p
              className="truncate text-sm font-black text-brand-teal"
              title={title}
            >
              {title}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="mb-0.5 text-[9px] font-bold tracking-widest text-gray-400 uppercase">
              {labels.priceHeader}
            </p>
            <div className="flex flex-col items-end">
              <p className="text-lg leading-none font-black text-green-600">
                ₹{price}
              </p>
              <p className="mt-0.5 text-[8px] font-semibold tracking-wide text-gray-500 uppercase">
                Incl. all taxes
              </p>
            </div>
          </div>
        </div>

        {step === 1 && (
          <div className={cn("animate-in fade-in slide-in-from-left-2 space-y-3", isMobile && "space-y-2.5")}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="ml-1 text-[10px] font-bold text-gray-500 uppercase">
                    {labels.nameLabel}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={labels.namePlaceholder}
                      maxLength={50}
                      className="h-12 rounded-xl border-2 border-brand-teal/20 bg-brand-teal/5 text-base shadow-sm ring-offset-white transition-all placeholder:text-gray-400 focus:border-brand-teal focus:bg-white focus:ring-4 focus:ring-brand-teal/10"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="ml-1 text-[9px] font-medium text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="ml-1 text-[10px] font-bold text-gray-500 uppercase">
                    {labels.phoneLabel} <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      autoFocus={!isMobile}
                      placeholder={labels.phonePlaceholder}
                      className={cn(
                        "h-12 rounded-xl border-2 border-brand-teal/20 bg-brand-teal/5 text-lg font-bold shadow-sm ring-offset-white transition-all placeholder:text-gray-400 focus:border-brand-teal focus:bg-white focus:ring-4 focus:ring-brand-teal/10",
                        form.formState.errors.phone &&
                          "border-red-200 bg-red-50 focus:border-red-500 focus:ring-red-50",
                      )}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="ml-1 text-[9px] font-medium text-red-500" />
                </FormItem>
              )}
            />

            <Button
              type="button"
              onClick={handleNextStep}
              size="lg"
              className="mt-6 w-full rounded-2xl bg-brand-teal text-lg font-bold text-white shadow-xl transition-all hover:bg-brand-teal/90 hover:shadow-2xl active:scale-95"
            >
              {labels.nextBtn}
            </Button>

            <div className="mt-4 flex items-center justify-center gap-4">
              <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-gray-500">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                {labels.secureText}
              </div>
              <div className="h-3 w-px bg-gray-200" />
              <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-gray-500">
                <Zap className="h-3.5 w-3.5 fill-yellow-400 text-yellow-500" />
                {labels.instantPdf}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-2">
            <div className="mb-4 flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
              <div className="text-xs">
                <p className="font-medium text-gray-500">{labels.yourInfo}</p>
                <p className="font-bold text-brand-teal">{form.getValues("name")}</p>
                <p className="font-bold text-brand-teal">+91 {form.getValues("phone")}</p>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-[10px] font-bold text-blue-600 underline underline-offset-2"
              >
                {labels.editBtn}
              </button>
            </div>

            <div className="flex items-center gap-1.5 rounded-lg border border-green-100 bg-green-50/50 p-2">
              <svg
                viewBox="0 0 24 24"
                className="h-3.5 w-3.5 shrink-0 fill-current text-green-600"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <span className="text-[10px] leading-tight font-bold text-green-700">
                {labels.whatsappInfo}
              </span>
            </div>

            {/* PDF-only notice */}
            <div className="mt-3 flex items-start gap-2 rounded-xl border border-blue-200 bg-blue-50 p-3">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
              <p className="text-xs leading-relaxed font-medium text-blue-800">
                📱 {labels.pdfNotice}
              </p>
            </div>

            {isIAB && (
              <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-900">
                <div className="flex items-start gap-3">
                  <span className="text-xl">⚠️</span>
                  <div className="w-full space-y-1">
                    <p className="text-xs font-bold tracking-wider text-amber-800 uppercase">
                      {isAndroidIAB
                        ? "Instagram/Facebook Browser मध्ये UPI Payment काम करत नाही"
                        : labels.iabTitle}
                    </p>
                    <p className="text-xs leading-relaxed font-medium">
                      {isAndroidIAB
                        ? "Google Pay / PhonePe उघडण्यासाठी Chrome Browser आवश्यक आहे."
                        : labels.iabMsg1}
                    </p>
                    <p className="text-xs leading-relaxed font-black text-amber-700">
                      {isAndroidIAB
                        ? ""
                        : labels.iabMsg2}
                    </p>
                    {onOpenInBrowser && (
                      <button
                        type="button"
                        onClick={onOpenInBrowser}
                        className="mt-2 w-full rounded-xl bg-amber-600 py-2 text-xs font-black text-white active:scale-[0.98]"
                      >
                        {isAndroidIAB ? "Chrome मध्ये उघडा →" : "Safari मध्ये उघडा →"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-4 text-center">
              <p className="text-[10px] text-gray-400">
                {labels.consentPrefix}{" "}
                <button
                  type="button"
                  onClick={() => setLegalModal("terms")}
                  className="font-bold text-gray-500 underline-offset-2 hover:text-brand-teal hover:underline"
                >
                  {labels.termsText}
                </button>{" "}
                {labels.consentAnd}{" "}
                <button
                  type="button"
                  onClick={() => setLegalModal("privacy")}
                  className="font-bold text-gray-500 underline-offset-2 hover:text-brand-teal hover:underline"
                >
                  {labels.privacyText}
                </button>{" "}
                {labels.consentSuffix}
              </p>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={loading || isAndroidIAB}
              className="group relative mt-5 w-full overflow-hidden rounded-2xl bg-brand-teal text-lg font-bold text-white shadow-xl transition-all hover:bg-brand-teal/90 hover:shadow-2xl active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <span className="relative z-10 flex items-center justify-center gap-2 py-3">
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    {loadingStage || labels.processingText}
                  </>
                ) : isAndroidIAB ? (
                  <>
                    <Lock className="h-5 w-5" />
                    वर &quot;Chrome मध्ये उघडा&quot; दाबा ↑
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5 fill-yellow-400 text-yellow-400 group-hover:animate-pulse" />
                    {labels.payBtn}
                  </>
                )}
              </span>
              {!loading && !isAndroidIAB && (
                <div className="group-hover:animate-shimmer absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent" />
              )}
            </Button>
            
            <p className="mt-4 text-center text-[10px] font-bold tracking-wider text-gray-400 uppercase">
              <ShieldCheck className="mr-1 inline-block h-3 w-3 text-green-500" />
              SECURE CHECKOUT • RAZORPAY
            </p>

            <div className="mt-5 flex justify-center">
              <a 
                href="https://wa.me/918378089292?text=Hello,%20I%20need%20help%20with%20buying%20an%20ebook%20(Payment%20Issue)" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-full bg-gray-50 px-3 py-1.5 text-[11px] font-bold text-gray-600 transition-colors hover:bg-green-50 hover:text-green-700"
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-green-600">
                  <svg viewBox="0 0 24 24" className="h-3 w-3 fill-current" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </div>
                काही अडचण आहे? WhatsApp वर मदत मागा
              </a>
            </div>
          </div>
        )}

        {/* Legal Content Modal */}
        <LegalContentModal
          type={legalModal}
          onClose={() => setLegalModal(null)}
        />
      </form>
    </Form>
  );
}function PaymentVerifying({ isRedirecting }: { isRedirecting?: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 px-4 py-8 text-center sm:space-y-6 sm:px-6 sm:py-12">
      <div className="relative">
        <div className="absolute inset-0 animate-pulse rounded-full bg-brand-teal/20 blur-xl" />
        {isRedirecting ? (
           <CheckCircle2 className="relative h-12 w-12 animate-bounce text-brand-teal sm:h-16 sm:w-16" />
        ) : (
           <Loader2 className="relative h-12 w-12 animate-spin text-brand-teal sm:h-16 sm:w-16" />
        )}
      </div>

      <div className="space-y-1.5 sm:space-y-2">
        <h3 className="text-lg font-black text-brand-teal sm:text-xl">
          {isRedirecting 
            ? "पेमेंट यशस्वी! रिडायरेक्ट करत आहे..." 
            : "पेमेंट पडताळणी सुरू आहे..."}
        </h3>
        <p className="text-xs font-medium text-gray-500 sm:text-sm">
          {isRedirecting 
            ? "कृपया काही क्षण थांबा, आम्ही तुम्हाला तुमच्या खरेदीकडे घेऊन जात आहोत." 
            : "कृपया विंडो बंद करू नका किंवा रिफ्रेश करू नका."}
        </p>
      </div>

      {!isRedirecting && (
        <div className="flex items-center gap-2 rounded-full bg-yellow-50 px-3 py-1.5 text-[10px] font-bold text-yellow-700 sm:px-4 sm:py-2 sm:text-xs">
          <div className="h-2 w-2 animate-bounce rounded-full bg-yellow-500" />
          फक्त काही सेकंदात पूर्ण होईल
        </div>
      )}
    </div>
  );
}

function LegalContentModal({
  type,
  onClose,
}: {
  type: "terms" | "privacy" | null;
  onClose: () => void;
}) {
  if (!type) return null;

  return (
    <div
      className="fixed inset-0 z-9999 flex items-end justify-center bg-black/50 sm:items-center"
      onClick={onClose}
    >
      <div
        className="animate-in slide-in-from-bottom-4 fade-in relative max-h-[85dvh] w-full overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-w-lg sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3 sm:px-5">
          <h3 className="text-sm font-black text-brand-teal sm:text-base">
            {type === "terms" ? "नियम आणि अटी" : "गोपनीयता धोरण"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto px-4 py-4 sm:px-5 sm:py-5" style={{ maxHeight: "calc(85dvh - 52px)" }}>
          {type === "terms" ? <TermsContent /> : <PrivacyContent />}
        </div>
      </div>
    </div>
  );
}

function TermsContent() {
  return (
    <div className="space-y-5 text-sm leading-relaxed text-gray-700">
      <p className="text-[10px] font-bold text-gray-400">Last Updated: December 2025</p>

      <section>
        <h4 className="mb-1.5 text-sm font-bold text-gray-900">१. अटींचा स्वीकार</h4>
        <p className="text-xs">या साइटला भेट देऊन किंवा आमची उत्पादने खरेदी करून, तुम्ही या नियम आणि अटींना बांधील राहण्यास सहमती दर्शवता.</p>
      </section>

      <section>
        <h4 className="mb-1.5 text-sm font-bold text-gray-900">२. बौद्धिक संपदा अधिकार</h4>
        <p className="text-xs">साइटवरील सर्व मजकूर, ई-बुक्स, आणि डिझाइन आमची मालमत्ता आहे. आमच्या लेखी परवानगीशिवाय कोणत्याही सामग्रीची कॉपी, विक्री किंवा वितरण करण्यास सक्त मनाई आहे.</p>
      </section>

      <section>
        <h4 className="mb-1.5 text-sm font-bold text-gray-900">३. वापरकर्ता प्रतिज्ञा</h4>
        <p className="text-xs">साइट वापरताना तुम्ही हे मान्य करता की: (१) तुम्ही दिलेली माहिती सत्य आणि अचूक आहे, (२) तुम्ही कायद्याचे पालन कराल, आणि (३) तुम्ही कोणत्याही अनधिकृत कामासाठी साइटचा वापर करणार नाही.</p>
      </section>

      <section>
        <h4 className="mb-1.5 text-sm font-bold text-gray-900">४. खरेदी आणि पेमेंट</h4>
        <p className="text-xs">आम्ही UPI (Google Pay, PhonePe), क्रेडिट/डेबिट कार्ड्स स्वीकारतो. आम्ही Razorpay सुरक्षित पेमेंट गेटवे वापरतो.</p>
      </section>

      <section>
        <h4 className="mb-1.5 text-sm font-bold text-gray-900">५. डिजिटल उत्पादनांचा वापर</h4>
        <p className="text-xs">खरेदी केल्यानंतर तुम्हाला ई-बुक वापरण्याचा वैयक्तिक परवाना मिळतो. हे ई-बुक इतरांना शेअर करणे, विकणे किंवा सार्वजनिकरित्या प्रदर्शित करणे बेकायदेशीर आहे.</p>
      </section>

      <section>
        <h4 className="mb-1.5 text-sm font-bold text-gray-900">६. बदल आणि व्यत्यय</h4>
        <p className="text-xs">आम्ही कधीही साइट किंवा सेवांमध्ये बदल करण्याचा अधिकार राखून ठेवतो.</p>
      </section>

      <section>
        <h4 className="mb-1.5 text-sm font-bold text-gray-900">७. लागू कायदा</h4>
        <p className="text-xs">हे नियम भारतीय कायद्यानुसार आहेत. कोणतेही वाद पुणे, महाराष्ट्र न्यायालयाच्या अधिकारक्षेत्रात येतील.</p>
      </section>

      <section>
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
          <p className="mb-1 text-[10px] font-bold tracking-wide text-yellow-800 uppercase">महत्वाची कायदेशीर सूचना</p>
          <p className="text-xs text-yellow-900">या साइटवरील माहिती केवळ शैक्षणिक उद्देशाने आहे. हा कायदेशीर सल्ला नाही.</p>
        </div>
      </section>

      <section>
        <h4 className="mb-1.5 text-sm font-bold text-gray-900">संपर्क</h4>
        <p className="text-xs">Email: <a href="mailto:support@kaydyachaanifaydyach.com" className="font-bold text-brand-teal">support@kaydyachaanifaydyach.com</a></p>
      </section>
    </div>
  );
}

function PrivacyContent() {
  return (
    <div className="space-y-5 text-sm leading-relaxed text-gray-700">
      <p className="text-[10px] font-bold text-gray-400">Last Updated: December 2025</p>

      <section>
        <h4 className="mb-1.5 text-sm font-bold text-gray-900">१. आम्ही कोणती माहिती गोळा करतो?</h4>
        <ul className="list-disc space-y-1 pl-4 text-xs">
          <li><strong>वैयक्तिक माहिती:</strong> नाव, ईमेल पत्ता, फोन नंबर</li>
          <li><strong>पेमेंट माहिती:</strong> आम्ही कार्ड माहिती साठवत नाही. ती Razorpay द्वारे प्रोसेस केली जाते.</li>
        </ul>
      </section>

      <section>
        <h4 className="mb-1.5 text-sm font-bold text-gray-900">२. माहितीचा वापर</h4>
        <ul className="list-disc space-y-1 pl-4 text-xs">
          <li>ऑर्डर प्रोसेस करण्यासाठी आणि ई-बुक वितरित करण्यासाठी</li>
          <li>नवीन पुस्तके आणि ऑफर्सबद्दल माहिती देण्यासाठी</li>
          <li>फसवणूक रोखण्यासाठी आणि साइटची सुरक्षा राखण्यासाठी</li>
        </ul>
      </section>

      <section>
        <h4 className="mb-1.5 text-sm font-bold text-gray-900">३. माहिती शेअर करणे</h4>
        <p className="text-xs">आम्ही तुमची माहिती विकत नाही. फक्त सेवा प्रदाते (उदा. Razorpay) आणि कायदेशीर कारणास्तव शेअर केली जाऊ शकते.</p>
      </section>

      <section>
        <h4 className="mb-1.5 text-sm font-bold text-gray-900">४. डेटा सुरक्षा</h4>
        <p className="text-xs">तुमची माहिती सुरक्षित ठेवण्यासाठी आम्ही योग्य तांत्रिक उपाययोजना करतो.</p>
      </section>

      <section>
        <h4 className="mb-1.5 text-sm font-bold text-gray-900">५. संपर्क</h4>
        <p className="text-xs">Email: <a href="mailto:support@kaydyachaanifaydyach.com" className="font-bold text-brand-teal">support@kaydyachaanifaydyach.com</a></p>
      </section>
    </div>
  );
}
