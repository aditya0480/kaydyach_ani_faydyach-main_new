import type { Metadata } from "next";
import { Mail, MapPin, Phone, MessageCircle } from "lucide-react";
import { ContactForm } from "./_components/contact-form";

export const metadata: Metadata = {
  title: "Contact Us | कायद्याचं आणि फायद्याचं",
  description:
    "Get in touch with Kaydyacha Ani Faydyacha (Kaydyach ani Faydyach) for support, inquiries, or feedback regarding our digital legal ebooks.",
};

export default function ContactPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 md:py-16">
      <h1 className="mb-8 bg-linear-to-r from-brand-teal to-teal-600 bg-clip-text text-center text-3xl font-bold text-transparent md:text-4xl">
        Contact Us / संपर्क करा
      </h1>

      <div className="grid gap-12 md:grid-cols-2">
        {/* Contact Info */}
        <div className="space-y-8">
          <div className="prose prose-slate">
            <p className="text-lg text-gray-700">
              ई-बुक्सबद्दल प्रश्न आहेत किंवा ऑर्डर सपोर्ट हवे आहे? आम्ही मदत करायला तत्पर आहोत.
            </p>
            <p className="text-sm text-gray-500">
              (Questions about our digital ebooks or need order support? We&apos;re here to help.)
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-4 rounded-lg border border-gray-100 bg-gray-50 p-4">
              <div className="rounded-full bg-white p-3 text-brand-teal shadow-sm">
                <Mail className="h-6 w-6" />
              </div>
              <div>
                <h3 className="mb-1 font-semibold text-gray-900">Email Support</h3>
                <p className="mb-1 text-sm text-gray-500">For general inquiries and order support:</p>
                <a href="mailto:support@kaydyachaanifaydyach.com" className="text-lg font-medium text-brand-teal hover:underline">
                  support@kaydyachaanifaydyach.com
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-lg border border-gray-100 bg-gray-50 p-4">
              <div className="rounded-full bg-white p-3 text-brand-teal shadow-sm">
                <Phone className="h-6 w-6" />
              </div>
              <div>
                <h3 className="mb-1 font-semibold text-gray-900">Call Us</h3>
                <p className="mb-1 text-sm text-gray-500">Mon – Sat, 9:00 AM – 6:00 PM IST</p>
                <a href="tel:+918378089292" className="text-lg font-medium text-brand-teal hover:underline">
                  +91 83780 89292
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-lg border border-gray-100 bg-gray-50 p-4">
              <div className="rounded-full bg-white p-3 text-brand-teal shadow-sm">
                <MessageCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="mb-1 font-semibold text-gray-900">WhatsApp Support</h3>
                <p className="mb-1 text-sm text-gray-500">Chat with us for quick help</p>
                <a
                  href="https://wa.me/918378089292"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg font-medium text-brand-teal hover:underline"
                >
                  +91 83780 89292
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-lg border border-gray-100 bg-gray-50 p-4">
              <div className="rounded-full bg-white p-3 text-brand-teal shadow-sm">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <h3 className="mb-1 font-semibold text-gray-900">Office Address</h3>
                <p className="text-gray-700">
                  <strong>Kaydyacha Ani Faydyacha</strong>
                  <br />
                  (Brand: कायद्याचं आणि फायद्याचं)
                  <br />
                  Floor No. 3, Amit Court Building,
                  <br />
                  Civil Court, Shivaji Nagar,
                  <br />
                  Pune, Maharashtra 411004, India
                </p>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-400">
            Response time: 48 hours | Resolution: within 7 working days
          </p>
        </div>

        <ContactForm />
      </div>
    </div>
  );
}
