"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Mail,
  Phone,
  MapPin,
  Instagram,
  ArrowUpRight,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-brand-teal pt-20 pb-24 text-white md:pb-10">
      {/* Decorative Background */}
      <div className="pointer-events-none absolute top-0 right-0 -mt-20 -mr-20 h-96 w-96 rounded-full bg-brand-gold/5 blur-3xl"></div>
      <div className="pointer-events-none absolute bottom-0 left-0 -mb-16 -ml-16 h-64 w-64 rounded-full bg-brand-gold/5 blur-3xl"></div>

      <div className="relative z-10 mx-auto max-w-6xl px-4">
        <div className="mb-16 grid gap-12 border-b border-white/10 pb-16 md:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-6 md:col-span-2">
            <Link
              href="/"
              className="group flex items-center gap-3"
              aria-label="Home"
            >
              <Image
                src="/logo.png"
                alt="Kaydyacha"
                width={0}
                height={0}
                sizes="100vw"
                unoptimized
                priority
                className="h-12 w-auto object-contain transition-transform group-hover:scale-105"
                style={{ width: "auto", height: "3rem" }}
              />
            </Link>
            <h3 className="bg-linear-to-r from-white to-gray-300 bg-clip-text text-3xl font-bold text-transparent">
              कायद्याचं आणि फायद्याचं
            </h3>
            <p className="max-w-sm text-lg leading-relaxed font-light opacity-80">
              कायद्याचे ज्ञान, सामाजिक भान.
              <br />
              आम्ही तुमच्या हक्कासाठी नेहमीच तत्पर.
            </p>
            <div className="pt-6">
              <a
                href="https://www.instagram.com/kaydyach_aani_faydyach/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-linear-to-r from-pink-500 via-red-500 to-yellow-500 px-6 py-2.5 font-bold text-white shadow-lg transition-transform duration-300 hover:scale-105 hover:shadow-xl"
              >
                <Instagram className="h-5 w-5" />
                <span>Follow on Instagram</span>
              </a>
            </div>
          </div>

          <div>
            <h3 className="mb-8 text-lg font-bold text-brand-gold">
              महत्वाचे दुवे (Quick Links)
            </h3>
            <ul className="space-y-4">
              <li>
                <Link
                  href="/"
                  className="group flex items-center gap-2 opacity-80 transition-colors hover:text-brand-gold hover:opacity-100"
                  aria-label="Home"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-gold/50 transition-colors group-hover:bg-brand-gold"></span>
                  मुख्यपृष्ठ
                </Link>
              </li>
              <li>
                <Link
                  href="/ebooks"
                  className="group flex items-center gap-2 opacity-80 transition-colors hover:text-brand-gold hover:opacity-100"
                  aria-label="E-books"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-gold/50 transition-colors group-hover:bg-brand-gold"></span>
                  ई-बुक्स
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="group flex items-center gap-2 opacity-80 transition-colors hover:text-brand-gold hover:opacity-100"
                  aria-label="About Us"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-gold/50 transition-colors group-hover:bg-brand-gold"></span>
                  आमच्याबद्दल (About)
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="group flex items-center gap-2 opacity-80 transition-colors hover:text-brand-gold hover:opacity-100"
                  aria-label="Contact Us"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-gold/50 transition-colors group-hover:bg-brand-gold"></span>
                  संपर्क (Contact)
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="group flex items-center gap-2 opacity-80 transition-colors hover:text-brand-gold hover:opacity-100"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-gold/50 transition-colors group-hover:bg-brand-gold"></span>
                  Admin Login <ArrowUpRight className="h-3 w-3 opacity-50" />
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-8 text-lg font-bold text-brand-gold">
              खरेदी (Shop)
            </h3>
            <ul className="space-y-4">
              <li>
                <Link
                  href="/ebooks"
                  className="group flex items-center gap-2 opacity-80 transition-colors hover:text-brand-gold hover:opacity-100"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-gold/50 transition-colors group-hover:bg-brand-gold"></span>
                  All Ebooks (सर्व ई-बुक्स)
                </Link>
              </li>
              <li>
                <Link
                  href="/combos"
                  className="group flex items-center gap-2 opacity-80 transition-colors hover:text-brand-gold hover:opacity-100"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-gold/50 transition-colors group-hover:bg-brand-gold"></span>
                  Combo Packs (कॉम्बो)
                </Link>
              </li>
              <li>
                <Link
                  href="/ebooks/hindi"
                  className="group flex items-center gap-2 opacity-80 transition-colors hover:text-brand-gold hover:opacity-100"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-gold/50 transition-colors group-hover:bg-brand-gold"></span>
                  हिंदी ई-बुक्स
                </Link>
              </li>
              <li>
                <Link
                  href="/ebooks/english"
                  className="group flex items-center gap-2 opacity-80 transition-colors hover:text-brand-gold hover:opacity-100"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-gold/50 transition-colors group-hover:bg-brand-gold"></span>
                  English Ebooks
                </Link>
              </li>
              <li>
                <Link
                  href="/site-index"
                  className="group flex items-center gap-2 opacity-80 transition-colors hover:text-brand-gold hover:opacity-100"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-gold/50 transition-colors group-hover:bg-brand-gold"></span>
                  Sitemap (साइटमॅप)
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-8 text-lg font-bold text-brand-gold">
              संपर्क (Contact Us)
            </h3>
            <ul className="space-y-5">
              <li className="group flex cursor-pointer items-start gap-4 opacity-90 transition-colors hover:text-brand-gold">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 transition-colors group-hover:bg-brand-gold group-hover:text-brand-teal">
                  <Mail className="h-4 w-4" />
                </div>
                <div className="text-sm">
                  <p className="mb-1 text-xs font-semibold tracking-wider uppercase opacity-90">
                    Email
                  </p>
                  <a
                    href="mailto:support@kaydyachaanifaydyach.com"
                    className="hover:underline"
                  >
                    support@kaydyachaanifaydyach.com
                  </a>
                </div>
              </li>
              <li className="group flex cursor-pointer items-start gap-4 opacity-90 transition-colors hover:text-brand-gold">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 transition-colors group-hover:bg-brand-gold group-hover:text-brand-teal">
                  <Phone className="h-4 w-4" />
                </div>
                <div className="text-sm">
                  <p className="mb-1 text-xs font-semibold tracking-wider uppercase opacity-90">
                    Phone
                  </p>
                  <a
                    href="tel:+918378089292"
                    className="hover:underline"
                  >
                    +91 83780 89292
                  </a>
                </div>
              </li>
              <li className="group flex cursor-pointer items-start gap-4 opacity-90 transition-colors hover:text-brand-gold">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 transition-colors group-hover:bg-brand-gold group-hover:text-brand-teal">
                  <MessageCircle className="h-4 w-4" />
                </div>
                <div className="text-sm">
                  <p className="mb-1 text-xs font-semibold tracking-wider uppercase opacity-90">
                    WhatsApp
                  </p>
                  <a
                    href="https://wa.me/918378089292"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    +91 83780 89292
                  </a>
                </div>
              </li>
              <li className="group flex cursor-pointer items-start gap-4 opacity-90 transition-colors hover:text-brand-gold">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 transition-colors group-hover:bg-brand-gold group-hover:text-brand-teal">
                  <MapPin className="h-4 w-4" />
                </div>
                <div className="text-sm">
                  <p className="mb-1 text-xs font-semibold tracking-wider uppercase opacity-90">
                    Location
                  </p>
                  Floor No. 3, Amit Court Building,
                  <br />
                  Civil Court, Shivaji Nagar,
                  <br />
                  पुणे, महाराष्ट्र 411004 (Pune, MH)
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-6 border-t border-white/10 pt-8 md:flex-row">
          <div className="flex flex-col items-center gap-2 md:items-start">
            <p className="text-sm opacity-60">
              &copy; {new Date().getFullYear()} Kaydyacha Ani Faydyach. All
              rights reserved.
            </p>
            <div className="mt-4 flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 backdrop-blur-sm transition-colors hover:border-brand-gold/30">
              <ShieldCheck className="h-3.5 w-3.5 text-brand-gold" />
              <p className="text-[10px] font-bold tracking-widest text-gray-300 uppercase md:text-xs">
                Kaydyacha Ani Faydyacha | Proprietor: Shrutika Gochade | Udyam: UDYAM-MH-26-1024122
              </p>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-4 text-xs opacity-60 md:justify-end md:gap-6 md:text-sm">
            <Link
              href="/contact"
              className="transition-colors hover:text-brand-gold"
            >
              Contact
            </Link>
            <Link
              href="/privacy-policy"
              className="transition-colors hover:text-brand-gold"
            >
              Privacy Policy
            </Link>
            <Link
              href="/data-deletion"
              className="transition-colors hover:text-brand-gold"
            >
              Data Deletion
            </Link>
            <Link
              href="/terms"
              className="transition-colors hover:text-brand-gold"
            >
              Terms
            </Link>
            <Link
              href="/refund-policy"
              className="transition-colors hover:text-brand-gold"
            >
              Refunds
            </Link>
            <Link
              href="/cancellation-policy"
              className="transition-colors hover:text-brand-gold"
            >
              Cancellation
            </Link>
            <Link
              href="/shipping-policy"
              className="transition-colors hover:text-brand-gold"
            >
              Delivery
            </Link>
          </div>
        </div>

        <div className="border-t border-white/5 py-6 text-center">
          <div className="mx-auto max-w-4xl space-y-3 text-[10px] leading-relaxed font-medium text-gray-400 opacity-60 md:text-xs">
            <p>
              <strong>DISCLAIMER:</strong> The information provided on this
              website and in our digital products is for educational and
              informational purposes only. It does not constitute legal advice
              or professional legal services. No attorney-client relationship is
              created by your use of this site. Please consult with a qualified
              advocate for advice on your specific legal issues.
            </p>
            <p className="font-light">
              <strong>अस्वीकरण:</strong> या वेबसाइटवर आणि आमच्या डिजिटल
              उत्पादनांमध्ये दिलेली माहिती केवळ शैक्षणिक आणि माहितीच्या
              उद्देशाने आहे. हा कायदेशीर सल्ला किंवा व्यावसायिक कायदेशीर सेवा
              नाही. या साइटचा वापर केल्याने वकील-ग्राहक संबंध तयार होत नाहीत.
              आपल्या विशिष्ट कायदेशीर समस्यांवर सल्यासाठी कृपया पात्र वकिलाचा
              सल्ला घ्या.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
