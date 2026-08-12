"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { FileQuestion, Home, BookOpen } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function NotFound() {
  const pathname = usePathname();
  const [currentUrl, setCurrentUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setTimeout(() => {
        setCurrentUrl(window.location.href);
      }, 0);
    }
  }, []);

  const whatsappMessage = encodeURIComponent(
    `Hello, I found a broken link on your website.\n\nPage: ${currentUrl || pathname}\n\nPlease check this.`,
  );
  const whatsappLink = `https://wa.me/917262096067?text=${whatsappMessage}`;

  return (
    <div className="flex min-h-screen flex-col bg-gray-50/50">
      <Navbar />

      <main className="animate-in fade-in zoom-in flex flex-1 flex-col items-center justify-center p-6 text-center duration-500">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-brand-teal/10 shadow-sm">
          <FileQuestion className="h-12 w-12 text-brand-teal" />
        </div>

        <h1 className="mb-2 text-8xl font-black tracking-tighter text-brand-teal shadow-sm drop-shadow-sm">
          404
        </h1>

        <h2 className="mb-4 text-2xl font-bold text-gray-900 md:text-3xl">
          Oops! Page Not Found / पान सापडत नाही
        </h2>

        <p className="mx-auto mb-8 max-w-md text-lg leading-relaxed text-muted-foreground">
          The page you are looking for might have been removed, had its name
          changed, or is temporarily unavailable.
          <br />
          <span className="text-sm opacity-80">
            (तुम्ही शोधत असलेले पान अस्तित्वात नाही किंवा हलवण्यात आले आहे.)
          </span>
        </p>

        <div className="flex w-full flex-col items-center gap-4 sm:w-auto sm:flex-row">
          <Button
            asChild
            size="lg"
            className="w-full gap-2 bg-brand-teal shadow-md hover:bg-brand-teal/90 sm:w-auto"
          >
            <Link href="/">
              <Home className="h-4 w-4" /> Go Home / मुख्यपृष्ठ
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full gap-2 border-brand-teal/20 text-brand-teal hover:bg-brand-teal/5 sm:w-auto"
          >
            <Link href="/ebooks">
              <BookOpen className="h-4 w-4" /> Browse Ebooks / ई-बुक्स
            </Link>
          </Button>
        </div>

        <div className="mx-auto mt-8 w-full max-w-lg border-t border-gray-200 pt-8">
          <p className="mb-4 text-sm text-gray-500">
            Found a broken link? Let us know directly on WhatsApp.
            <br />
            <span className="text-xs opacity-80">
              (तुटलेली लिंक आढळली? आम्हाला थेट व्हॉट्सॲपवर कळवा.)
            </span>
          </p>
          <Button
            asChild
            size="lg"
            className="gap-2 bg-[#25D366] font-bold text-white shadow-md transition-all hover:scale-105 hover:bg-[#128C7E]"
          >
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
              <svg
                viewBox="0 0 24 24"
                width="24"
                height="24"
                fill="currentColor"
                className="h-5 w-5"
              >
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.592 2.654-.696c1.001.572 2.135.882 3.807.882 3.123 0 5.669-2.52 5.669-5.765 0-3.186-2.586-5.786-5.669-5.786zm0 10.428c-1.353 0-2.617-.464-3.56-1.115l-.25-.173-1.637.428.44-1.593-.163-.261c-3.132-5.004.286-9.853 5.166-9.853 2.593 0 4.703 2.109 4.703 4.786 0 2.673-2.158 5.782-4.703 5.782zm2.618-4.293c-.143-.072-.857-.424-.972-.472-.143-.049-.25-.072-.321.071-.108.17-.429.525-.501.62-.107.096-.214.12-.357.049-.643-.287-1.401-.762-2.008-1.554-.25-.333.178-.309.606-1.164.072-.143.036-.262-.018-.381-.053-.12-.464-1.119-.643-1.524-.16-.381-.321-.334-.446-.334-.107-.001-.25-.001-.393-.001-.143 0-.393.048-.607.286-.214.238-.821.81-0.821 1.977 0 1.166.857 2.285.964 2.452.107.166 1.678 2.57 4.07 3.665.572.263 1.016.418 1.361.525.572.179 1.18.155 1.666.084.535-.072 1.392-.572 1.589-1.119.196-.548.196-1.024.143-1.119-.054-.096-.197-.144-.34-.215z" />
              </svg>
              Report on WhatsApp / व्हॉट्सॲपवर कळवा
            </a>
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
