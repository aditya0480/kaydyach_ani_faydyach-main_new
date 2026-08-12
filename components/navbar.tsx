"use client";

import Link from "next/link";
import Image from "next/image"; // Next.js Image component
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useState } from "react";
import { GlobalSearch } from "./global-search";
import { Badge } from "@/components/ui/badge";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="group flex items-center gap-3" aria-label="Home">
          <Image
            src="/logo.png"
            alt="Kaydyacha"
            width={0}
            height={0}
            sizes="100vw"
            priority
            fetchPriority="high"
            className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
            style={{ width: 'auto', height: '2.5rem' }}
          />
          {/* Text is usually part of logo image, but if we need text next to it: */}
          {/* <span className="font-bold text-xl md:text-2xl hidden md:block text-brand-teal">कायद्याचं आणि फायद्याचं</span> */}
        </Link>

        {/* Desktop Search */}
        <div className="mx-6 hidden max-w-70 flex-1 lg:flex">
          <GlobalSearch />
        </div>

        <div className="hidden items-center gap-5 text-sm font-medium text-brand-teal/80 md:flex">
          <Link href="/" className="transition-colors hover:text-brand-gold" aria-label="Home">मुख्यपृष्ठ (Home)</Link>
          <Link href="/ebooks" className="transition-colors hover:text-brand-gold" aria-label="E-books">ई-बुक्स (E-Books)</Link>
          <Link href="/combos" className="flex items-center gap-1 transition-colors hover:text-brand-gold" aria-label="Combo Packs">
            कॉम्बो पॅक्स (Combos)
            <Badge className="h-3.5 animate-pulse bg-orange-500 px-1 text-[9px] leading-none uppercase hover:bg-orange-600">Sale</Badge>
          </Link>
          <Link href="/about" className="transition-colors hover:text-brand-gold" aria-label="About Us">आमच्याबद्दल (About)</Link>
          <Link href="/my-books" className="font-bold text-brand-teal transition-colors hover:text-brand-gold" aria-label="My Books">माझी पुस्तके</Link>
          <Button asChild size="sm" className="rounded-full bg-brand-gold px-5 font-bold text-brand-teal shadow-sm transition-all hover:bg-brand-gold/90 hover:shadow-md">
            <Link href="/ebooks">खरेदी करा (Buy Now)</Link>
          </Button>
        </div>

        {/* Mobile Nav */}
        <div className="flex items-center gap-4 md:hidden">
          <GlobalSearch variant="icon" />
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-brand-teal hover:bg-brand-teal/5" aria-label="Toggle menu">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="flex w-75 flex-col border-l-brand-gold/20 bg-white p-0">
              <SheetHeader className="border-b border-gray-100 bg-brand-teal/5 p-6">
                <SheetTitle className="flex items-center justify-center">
                  <Image src="/logo.png" alt="Kaydyacha" width={150} height={64} className="h-16 w-auto object-contain" />
                </SheetTitle>
              </SheetHeader>

              <div className="border-b border-gray-100 p-4 md:hidden">
                <GlobalSearch className="max-w-full" triggerClassName="h-10 text-xs" />
              </div>

              <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-6">
                <Link
                  href="/"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-4 rounded-lg p-3 text-lg font-semibold text-brand-teal transition-all hover:bg-brand-teal/5 hover:text-brand-gold"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                  मुख्यपृष्ठ (Home)
                </Link>
                <Link
                  href="/ebooks"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-4 rounded-lg p-3 text-lg font-semibold text-brand-teal transition-all hover:bg-brand-teal/5 hover:text-brand-gold"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
                  ई-बुक्स (E-Books)
                </Link>
                <Link
                  href="/combos"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-4 rounded-lg p-3 text-lg font-semibold text-brand-teal transition-all hover:bg-brand-teal/5 hover:text-brand-gold"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8h-2c0-2.26-1.2-5.48-2-8-1.5 1.46-3 2.5-4.5 3.35A7 7 0 0 1 11 20z" /><path d="M11 13a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" /></svg>
                  कॉम्बो पॅक्स (Combos)
                  <Badge className="h-4 bg-orange-500 px-1 text-[10px] uppercase">Sale</Badge>
                </Link>
                <Link
                  href="/about"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-4 rounded-lg p-3 text-lg font-semibold text-brand-teal transition-all hover:bg-brand-teal/5 hover:text-brand-gold"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                  आमच्याबद्दल (About)
                </Link>
                <Link
                  href="/my-books"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-4 rounded-lg bg-brand-teal/5 p-3 text-lg font-bold text-brand-teal transition-all hover:bg-brand-teal/10 hover:text-brand-gold"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="m16 6 4 14" /><path d="M12 6v14" /><path d="M8 8v12" /><path d="M4 4v16" /></svg>
                  माझी पुस्तके (My Books)
                </Link>

                <div className="mt-4 border-t border-gray-100 pt-4">
                  <Link href="/ebooks" onClick={() => setIsOpen(false)}>
                    <Button className="w-full bg-brand-gold font-bold text-brand-teal hover:bg-brand-gold/90">
                      खरेदी करा (Buy Now)
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="mt-auto border-t border-gray-100 bg-gray-50 p-6">
                <Link
                  href="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-brand-teal"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                  Admin Login
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav >
  );
}
