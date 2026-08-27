"use client";

import { useState, useEffect, useCallback } from "react";
import confetti from "canvas-confetti";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  BookOpen,
  Download,
  Search,
  Loader2,
  ArrowLeft,
  FileText,
  CheckCircle2,
  ShieldCheck,
  Phone,
  RefreshCw,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import Link from "next/link";
import { format } from "date-fns";
import { ComboCarousel } from "./combo-carousel";
import { DownloadInstructions } from "./_components/download-instructions";
import { DownloadStartedModal } from "@/components/download-started-modal";

interface Order {
  id: string;
  date: string;
  amount: number;
  items: {
    title: string;
    ebookId: string;
    url: string;
    pages?: number | null;
    isCombo?: boolean;
  }[];
}

export default function MyBooksPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [pollingTimedOut, setPollingTimedOut] = useState(false);
  const [justPurchasedOrder, setJustPurchasedOrder] = useState<{
    title: string;
    ebookId: string;
    amount: number;
    downloadUrl?: string; // We might need to find this from the fetched orders
  } | null>(null);
  const [downloadModalData, setDownloadModalData] = useState<{
    open: boolean;
    title: string;
    url: string;
  }>({
    open: false,
    title: "",
    url: "",
  });
  const isMobile = useIsMobile();

  const handleStartDownload = (title: string, url: string) => {
    setDownloadModalData({ open: true, title, url });
    toast.success("डाउनलोड सुरू झाले आहे! तपासा 'Downloads' फोल्डर.", {
      icon: "📥",
      duration: 4000,
    });
  };

  const performSearch = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/orders/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: searchTerm.trim(),
        }),
      });

      if (res.status === 429) {
        throw new Error(
          "खूप जास्त वेळा प्रयत्न केले गेले आहेत. कृपया थोड्या वेळाने प्रयत्न करा.",
        );
      }
      if (!res.ok)
        throw new Error("काहीतरी चूक झाली. कृपया पुन्हा प्रयत्न करा.");

      const data = await res.json();
      setOrders(data.orders);

      if (data.orders.length === 0) {
        // toast.error("ह्या नंबर/ईमेलवर कोणतीही पुस्तके सापडली नाहीत."); // Suppress default error for better UX
      } else {
        if (!justPurchasedOrder) {
             toast.success(`${data.orders.length} पुस्तके सापडली!`);
        }
        // Save for future use
        localStorage.setItem("customer_phone", searchTerm.trim());
      }
    } catch (error) {
      console.error(error);
      toast.error("तांत्रिक अडचण आली. कृपया थोड्या वेळाने प्रयत्न करा.");
    } finally {
      setLoading(false);
    }
  }, [justPurchasedOrder]);

  useEffect(() => {
    let pollIntervalId: ReturnType<typeof setInterval> | null = null;

    // Check for access_token in URL (from payment callback)
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);

      // 0. Session Restoration (Critical for Mobile Redirects)
      const paramPhone = params.get("phone");
      const paramEmail = params.get("email");

      if (paramPhone) {
        localStorage.setItem("customer_phone", paramPhone);
        setQuery(paramPhone);
      }
      if (paramEmail) {
        localStorage.setItem("customer_email", paramEmail);
      }

      // 1. Handle Access Token (Device Locking)
      const accessToken = params.get("access_token");
      if (accessToken) {
         try {
            const existingTokens = JSON.parse(localStorage.getItem("authorized_tokens") || "[]");
            if (!existingTokens.includes(accessToken)) {
               existingTokens.push(accessToken);
               localStorage.setItem("authorized_tokens", JSON.stringify(existingTokens));
            }
         } catch(e) { console.error(e) }
      }

      // 2. Handle Payment Success
      if (params.get("payment_success") === "true") {
        const amount = parseFloat(params.get("amount") || "0");
        const title = params.get("title") || "Unknown Book";
        const ebookId = params.get("ebook_id") || "";
        const currency = params.get("currency") || "INR";

        setJustPurchasedOrder({ title, ebookId, amount });

        // Celebration!
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ["#0A2342", "#FFD301", "#25D366"]
        });

        // Trigger auto search to fetch the actual download link
        const phoneToSearch = paramPhone || localStorage.getItem("customer_phone");
        if(phoneToSearch) {
            performSearch(phoneToSearch);
        }

        // Auto-show instructions primarily on mobile where file management is harder
        // We delay it slightly so they see the success card first
        if (isMobile) {
            setTimeout(() => setShowInstructions(true), 2500);
        }

        if (amount > 0) {
           // Pixel logic — poll for fbq since it loads via next/script afterInteractive
           // and may not be ready yet when this effect runs.
            const orderIdForEvent = params.get("orderId") || `${ebookId}_${amount}`;
            const trackPurchase = () => {
              window.fbq!("track", "Purchase", {
                currency: currency,
                value: amount,
                content_name: title,
                content_type: "product",
                content_ids: ebookId ? [ebookId] : undefined,
              }, { eventID: `purchase_${orderIdForEvent}` });
            };
            if (window.fbq) {
              trackPurchase();
            } else {
              let attempts = 0;
              const pixelInterval = setInterval(() => {
                attempts++;
                if (window.fbq) {
                  clearInterval(pixelInterval);
                  trackPurchase();
                } else if (attempts >= 100) {
                  clearInterval(pixelInterval);
                }
              }, 100);
            }

            setIsFinalizing(true);
            setTimeout(() => setIsFinalizing(false), 3000);
            toast.success("खरेदी यशस्वी! तुमचे पुस्तक खालीत आहे.");
        }
      } else if (params.get("payment_pending") === "true") {
        // Payment was processed but fulfillment didn't complete yet (webhook will handle)
        // Poll until order appears as PAID
        const pendingOrderId = params.get("orderId");
        const phoneToSearch = paramPhone || localStorage.getItem("customer_phone");
        
        if (phoneToSearch) {
          setQuery(phoneToSearch);
          toast.loading("पेमेंट प्रक्रियेत आहे... कृपया थांबा.", { id: "pending-poll" });
          
          let pollCount = 0;
          const MAX_POLLS = 6; // 30 seconds total
          pollIntervalId = setInterval(async () => {
            pollCount++;
            try {
              const res = await fetch("/api/orders/lookup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: phoneToSearch.trim() }),
              });
              if (res.ok) {
                const data = await res.json();
                const paidOrder = pendingOrderId
                  ? data.orders?.find((o: Order) => o.id === pendingOrderId)
                  : data.orders?.length > 0;
                if (paidOrder) {
                  if (pollIntervalId !== null) clearInterval(pollIntervalId);
                  setOrders(data.orders);
                  toast.success("खरेदी यशस्वी! तुमचे पुस्तक तयार आहे.", { id: "pending-poll" });
                  confetti({ particleCount: 100, spread: 60, origin: { y: 0.6 } });
                }
              }
            } catch { /* ignore poll errors */ }
            if (pollCount >= MAX_POLLS) {
              if (pollIntervalId !== null) clearInterval(pollIntervalId);
              toast.dismiss("pending-poll");
              setPollingTimedOut(true);
              performSearch(phoneToSearch);
            }
          }, 5000);
        }
      } else {
          // Normal load - auto search
          const phoneToSearch = paramPhone || localStorage.getItem("customer_phone");
          if(phoneToSearch) {
             setQuery(phoneToSearch);
             performSearch(phoneToSearch);
          }
      }

      // 3. Clean URL
      if (accessToken || params.get("payment_success") === "true" || params.get("payment_pending") === "true" || paramPhone) {
        const newUrl = window.location.pathname;
        window.history.replaceState({}, "", newUrl);
      }
    }

    return () => {
      if (pollIntervalId !== null) clearInterval(pollIntervalId);
    };
  }, [isMobile, performSearch]); // Added isMobile dependency

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };

  // Helper to find the specific item from the orders list
  const justPurchasedItem = justPurchasedOrder && orders 
    ? orders.flatMap(o => o.items).find(i => i.ebookId === justPurchasedOrder.ebookId || i.title === justPurchasedOrder.title)
    : null;

  return (
    <div className="flex min-h-screen flex-col bg-gray-50/50">
      {/* Compact Header */}
      <header className="sticky top-0 z-50 flex items-center gap-3 border-b bg-white/90 px-4 py-2 backdrop-blur-md">
        <Link
          href="/"
          className="rounded-full p-1.5 transition-colors hover:bg-gray-100 active:scale-95"
        >
          <ArrowLeft className="h-5 w-5 text-gray-700" />
        </Link>
        <div className="flex flex-col">
          <h1 className="text-sm leading-none font-black tracking-tight text-gray-800">
            माझी पुस्तके
          </h1>
          <span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
            My Digital Bookshelf
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-3 py-4">
        {/* JUST PURCHASED HERO CARD */}
        {justPurchasedOrder && (
            <div className="animate-in slide-in-from-top-4 mb-6 duration-700">
                <div className="relative overflow-hidden rounded-3xl border-2 border-brand-teal/10 bg-white p-5 shadow-xl shadow-brand-teal/5">
                    {/* Background Pattern */}
                    <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-brand-gold/10 blur-3xl" />
                    <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-brand-teal/5 blur-3xl" />

                    <div className="relative flex flex-col items-center text-center">
                        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600 shadow-inner">
                            <CheckCircle2 className="h-8 w-8" />
                        </div>
                        <h2 className="text-xl font-black text-brand-teal">अभिनंदन!</h2>
                        <p className="text-xs font-bold tracking-widest text-gray-400 uppercase">तुमची खरेदी यशस्वी झाली</p>
                        
                        <div className="mt-4 mb-4 w-full rounded-xl bg-gray-50 p-3">
                             <p className="text-[10px] font-bold text-gray-400 uppercase">आता डाऊनलोड करा</p>
                             <h3 className="mt-0.5 text-base leading-tight font-black text-gray-800">
                                {justPurchasedOrder.title}
                             </h3>
                        </div>

                        {/* WhatsApp Delivery Status (New) */}
                        <div className="mb-6 w-full rounded-xl border border-green-100 bg-green-50/50 p-3 text-left">
                            <div className="flex items-center gap-2">
                                <FaWhatsapp className="h-4 w-4 text-green-600" />
                                <span className="text-[11px] font-black text-green-700">WhatsApp वर PDF पाठवली आहे!</span>
                            </div>
                            <p className="mt-1 text-[10px] leading-relaxed font-medium text-green-600/80">
                                तुम्हाला व्हॉट्सएपवर लगेच मेसेज येईल. जर मेसेज आला नाही तर खालील बटनावरून डाऊनलोड करा.
                            </p>
                        </div>

                        {justPurchasedItem ? (
                             <div className="flex w-full flex-col gap-3">
                                 <Button 
                                    asChild
                                    size="lg"
                                    className="w-full rounded-xl bg-brand-teal text-base font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl active:scale-95"
                                 >
                                    <a href={justPurchasedItem.url} target="_blank" rel="noopener noreferrer">
                                        <Download className="mr-2 h-5 w-5 animate-bounce" />
                                        PDF डाऊनलोड करा
                                    </a>
                                 </Button>
                                 
                                 <Button
                                    asChild
                                    variant="outline"
                                    size="sm"
                                    className="w-full rounded-xl border-green-200 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800"
                                 >
                                    <a
                                        href={`https://wa.me/917262096067?text=${encodeURIComponent(`नमस्कार,\nहे माझे पुस्तक आहे: ${justPurchasedItem.title}\nलिंक: ${justPurchasedItem.url}\n\n(या लिंकवर क्लिक करून तुम्ही कधीही PDF डाऊनलोड करू शकता)\nकृपया हा मेसेज सेव्ह राहू द्या.`)}`}
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                    >
                                        <FaWhatsapp className="mr-2 h-4 w-4" />
                                        लिंक WhatsApp वर सेव्ह करा
                                    </a>
                                 </Button>
                                 <p className="mt-2 text-[10px] text-gray-400">
                                    <span className="font-bold text-brand-teal">टीप:</span> PDF तुमच्या ब्राउझरच्या &quot;Downloads&quot; फोल्डरमध्ये सेव्ह होईल.
                                 </p>
                             </div>
                        ) : (
                            <div className="flex items-center gap-2 text-sm font-bold text-gray-500">
                                <Loader2 className="h-4 w-4 animate-spin text-brand-teal" />
                                तुमची लिंक तयार होत आहे...
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}

        {/* Ultra Compact Search */}
        <div className="mb-4 space-y-3">
          <div className="rounded-2xl border border-gray-100/50 bg-white p-3 shadow-sm">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="WhatsApp नंबर टाका..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="h-10 rounded-xl border-gray-200 bg-gray-50 pl-9 text-sm font-bold shadow-none focus:border-brand-teal focus:bg-white focus:ring-1 focus:ring-brand-teal focus-visible:ring-offset-0"
                />
              </div>
              <Button
                type="submit"
                disabled={loading || !query.trim()}
                className="h-10 shrink-0 rounded-xl bg-brand-teal px-4 text-xs font-bold text-white shadow-md shadow-brand-teal/10 active:scale-95 disabled:opacity-70"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "शोध (Search)"
                )}
              </Button>
            </form>
          </div>

          <div className="flex items-center justify-between px-1">
            <a
              href="tel:+918378089292"
              className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-bold text-brand-teal transition-all hover:bg-teal-50 active:scale-95"
            >
              <Phone className="h-4 w-4" />
              कॉल करा
            </a>
            <a
              href={`https://wa.me/917262096067?text=${encodeURIComponent("नमस्कार, मला माझी पुस्तके डाऊनलोड करण्यास मदत हवी आहे.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-bold text-green-600 transition-all hover:bg-green-50 active:scale-95"
            >
              <FaWhatsapp className="h-4 w-4" />
              मदत हवी?
            </a>
            <DownloadInstructions
              open={showInstructions}
              onOpenChange={setShowInstructions}
            />
          </div>
        </div>
        
        {/* Finalizing Purchase Overlay */}
        {isFinalizing && (
          <div className="animate-in fade-in slide-in-from-top-2 mb-4 duration-500">
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-brand-teal/20 bg-brand-teal/5 p-6 text-center">
              <div className="relative">
                <div className="absolute inset-0 animate-ping rounded-full bg-brand-teal/20" />
                <CheckCircle2 className="relative h-12 w-12 text-brand-teal" />
              </div>
              <div className="space-y-1">
                <h2 className="text-lg font-black text-brand-teal">
                  खरेदी पूर्ण झाली!
                </h2>
                <p className="text-xs font-bold tracking-widest text-gray-500 uppercase">
                  Finalizing Your Order...
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-[10px] font-bold text-gray-600 shadow-sm">
                <ShieldCheck className="h-3 w-3 text-brand-teal" />
                Secure Verification Successful
              </div>
            </div>
          </div>
        )}

        {/* Polling Timed Out Alert */}
        {pollingTimedOut && (
          <div className="animate-in fade-in slide-in-from-top-2 mb-4 duration-500">
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-amber-200/50 bg-amber-50 p-6 text-center shadow-sm">
              <div className="relative">
                <ShieldCheck className="relative h-10 w-10 text-amber-500" />
              </div>
              <div className="space-y-1">
                <h2 className="text-base font-black text-amber-800">
                  पेमेंट पडताळणी प्रक्रियेत आहे
                </h2>
                <p className="max-w-xs text-xs font-bold text-amber-700/80">
                  तुमचे पेमेंट यशस्वी झाले असावे, पण बँक/सर्व्हरडून जोडणी होण्यास थोडा वेळ लागत आहे. कृपया खालील बटणावर क्लिक करा.
                </p>
              </div>
              <Button
                onClick={() => {
                   setPollingTimedOut(false);
                   performSearch(query);
                }}
                className="mt-2 w-full max-w-48 rounded-xl bg-amber-500 text-sm font-bold text-white shadow-md transition-all hover:bg-amber-600 active:scale-95"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                रिफ्रेश (Refresh Status)
              </Button>
            </div>
          </div>
        )}
        {/* Results Area */}
        <div className="space-y-3">
          {orders === null ? (
            <div className="flex flex-col items-center justify-center py-10 text-center text-gray-400">
              <div className="mb-3 rounded-full bg-gray-100 p-4">
                <BookOpen className="h-8 w-8 opacity-40" />
              </div>
              <p className="text-sm font-bold text-gray-500">
                तुमची पुस्तके शोधण्यासाठी वर नंबर टाका
              </p>
            </div>
          ) : orders.length > 0 ? (
            orders.map((order) => (
              <div
                key={order.id}
                className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-md"
              >
                {/* Compact Card Header */}
                <div className="flex items-center justify-between border-b border-gray-50 bg-gray-50/30 px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-50">
                      <FileText className="h-3.5 w-3.5 text-teal-600" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] leading-none font-bold text-gray-400 uppercase">
                        खरेदी दिनांक
                      </span>
                      <span className="text-xs font-bold text-gray-700">
                        {format(new Date(order.date), "dd MMM yyyy")}
                      </span>
                    </div>
                  </div>
                  <div className="rounded-lg bg-green-50 px-2 py-1 text-[10px] font-black tracking-wide text-green-700">
                    Paid ₹{order.amount}
                  </div>
                </div>

                {/* Items List - Dense */}
                <div className="p-3">
                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col gap-3 rounded-xl bg-gray-50/50 p-3 transition-colors hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between sm:p-2.5"
                      >
                        <div className="min-w-0 flex-1">
                          <h3
                            className="text-sm leading-tight font-bold text-gray-800 sm:text-xs"
                            title={item.title}
                          >
                            {item.title}
                          </h3>
                          <div className="mt-1.5 flex flex-wrap items-center gap-1.5 sm:mt-1 sm:gap-2">
                            {item.pages ? (
                              <span className="inline-flex items-center rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500">
                                {item.pages} पाने
                              </span>
                            ) : null}
                            {item.isCombo && (
                              <span className="inline-flex items-center rounded border border-amber-100 bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-600">
                                सर्व पुस्तके एकाच पीडीएफमध्ये आहेत
                              </span>
                            )}
                            {/* Tag for Just Purchased Item */}
                            {justPurchasedOrder?.ebookId === item.ebookId && (
                                <span className="inline-flex animate-pulse items-center rounded border border-green-100 bg-green-50 px-1.5 py-0.5 text-[10px] font-bold text-green-600">
                                    नवीन खरेदी
                                </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-row gap-2 sm:shrink-0">
                          <Button
                            asChild
                            size="sm"
                            variant="outline"
                            className="h-9 flex-1 rounded-lg border-green-200 bg-green-50 text-green-700 shadow-sm transition-all hover:border-green-300 hover:bg-green-100 active:scale-95 sm:h-8 sm:w-auto sm:flex-initial"
                          >
                            <a
                              href={`https://wa.me/917262096067?text=${encodeURIComponent(`नमस्कार,\nहे माझे पुस्तक आहे: ${item.title}\nलिंक: ${item.url}\nकृपया हे मेसेज सेव्ह राहू द्या.\n\nटीप: PDF डाऊनलोड झाल्यावर, ब्राउझरच्या मेनूमध्ये (तीन ठिपके) 'Downloads' मध्ये ती सापडेल.`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center gap-1.5 px-2 sm:px-3"
                            >
                              <FaWhatsapp className="h-4 w-4" />
                              <span className="text-[10px] font-bold whitespace-nowrap">
                                लिंक सेव्ह
                              </span>
                            </a>
                          </Button>
                          <Button
                            asChild
                            size="sm"
                            className="h-9 flex-1 rounded-lg border border-gray-200 bg-white text-brand-teal shadow-sm transition-all hover:border-brand-teal hover:bg-brand-teal hover:text-white active:scale-95 sm:h-8 sm:w-auto sm:flex-initial"
                          >
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center gap-1.5 px-2 sm:px-3"
                              onClick={() => handleStartDownload(item.title, item.url)}
                            >
                              <span className="text-[10px] font-bold whitespace-nowrap">
                                डाऊनलोड
                              </span>
                              <Download className="h-3 w-3" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center space-y-4 py-8 text-center">
               <div>
                  <p className="text-sm font-bold text-red-400">
                    पुस्तके सापडली नाहीत.
                  </p>
                  <p className="mt-0.5 text-xs text-gray-400">
                    नंबर बरोबर असल्याची खात्री करा किंवा खालील बटनावर क्लिक करून मदत घ्या.
                  </p>
               </div>
               
               <Button
                 variant="outline"
                 className="rounded-xl border-dashed border-gray-300 text-xs text-gray-500"
                 onClick={() => window.open(`https://wa.me/917262096067?text=${encodeURIComponent(`नमस्कार, मी आताच एक पुस्तक विकत घेतले पण मला 'माझी पुस्तके' मध्ये ते दिसत नाहीये. माझा नंबर: ${query || "N/A"}`)}`, '_blank')}
               >
                 मी पैसे भरले आहेत, पण पुस्तक दिसत नाही?
               </Button>
            </div>
          )}
          

        </div>

        {/* Download Started Modal Popup */}
        <DownloadStartedModal
          open={downloadModalData.open}
          onOpenChange={(open) => setDownloadModalData(prev => ({ ...prev, open }))}
          title={downloadModalData.title}
          downloadUrl={downloadModalData.url}
        />

        {/* Compact Recommended Combos */}
        <div className="mt-6 mb-2">
          <div className="mb-2 flex items-center gap-2 px-1">
            <span className="flex h-1.5 w-1.5 rounded-full bg-amber-400" />
            <h2 className="text-xs font-black tracking-wide text-gray-400 uppercase">
              तुमच्यासाठी खास कॉम्बोस
            </h2>
          </div>
          <ComboCarousel />
        </div>
      </main>

      {/* Support Footer */}
      <footer className="px-6 py-8 pb-24 text-center md:pb-8">
        <div className="flex flex-col justify-center gap-3 md:flex-row">
          <a
            href="tel:++918378089292"
            className="inline-flex h-12 items-center justify-center gap-2.5 rounded-full bg-brand-teal px-8 text-sm font-bold text-white shadow-lg shadow-brand-teal/20 transition-transform hover:-translate-y-1 hover:bg-teal-700 active:scale-95"
          >
            <Phone className="h-5 w-5" />
            थेट कॉल करा (+91 83780 89292)
          </a>
          <a
            href={`https://wa.me/918378089292?text=${encodeURIComponent("नमस्कार, मी 'माझी पुस्तके' (My Books) पेजवर आहे. मला पुस्तके उघडण्यात किंवा शोधण्यात थोडी मदत हवी आहे.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 items-center justify-center gap-2.5 rounded-full bg-[#25D366] px-8 text-sm font-bold text-white shadow-lg shadow-green-500/20 transition-transform hover:-translate-y-1 hover:bg-[#20bd5a] active:scale-95"
          >
            <FaWhatsapp className="h-5 w-5" />
            काही मदत हवी? व्हॉट्सॲप करा
          </a>
        </div>
      </footer>
    </div>
  );
}
