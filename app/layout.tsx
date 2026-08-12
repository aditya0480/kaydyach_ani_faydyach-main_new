import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AppProviders } from "@/components/providers/app-providers";
import { Toaster } from "@/components/ui/sonner";
import { FacebookPixel } from "@/components/fb-pixel";
import { AnalyticsWrapper } from "@/components/analytics-wrapper";
import { IABManager } from "@/components/iab-manager";
import {
  TagManagerNoScript,
  ThirdPartyScripts,
} from "@/components/analytics/third-party-scripts";
import {
  GOOGLE_SITE_VERIFICATION,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
  TWITTER_HANDLE,
} from "@/lib/constants/site";
import { BUSINESS_INFO } from "@/lib/business-info";

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: BUSINESS_INFO.legalName,
  alternateName: BUSINESS_INFO.brandName,
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  foundingDate: `${BUSINESS_INFO.foundedYear}-01-01`,
  founder: { "@type": "Person", name: BUSINESS_INFO.proprietor },
  identifier: BUSINESS_INFO.udyam,
  contactPoint: {
    "@type": "ContactPoint",
    telephone: BUSINESS_INFO.phone,
    email: BUSINESS_INFO.email,
    contactType: "customer support",
    areaServed: "IN",
    availableLanguage: ["Marathi", "Hindi", "English"],
  },
  address: {
    "@type": "PostalAddress",
    streetAddress: `${BUSINESS_INFO.address.line1}, ${BUSINESS_INFO.address.line2}`,
    addressLocality: BUSINESS_INFO.address.city,
    addressRegion: BUSINESS_INFO.address.state,
    postalCode: BUSINESS_INFO.address.pin,
    addressCountry: BUSINESS_INFO.address.country,
  },
  sameAs: [BUSINESS_INFO.social.instagram],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: SITE_URL,
  name: SITE_NAME,
  description: SITE_DESCRIPTION,
  publisher: { "@id": `${SITE_URL}/#organization` },
  inLanguage: ["mr-IN", "hi-IN", "en-IN"],
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/ebooks?q={search_term_string}` },
    "query-input": "required name=search_term_string",
  },
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#0D9488",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: ["मराठी ई-बुक्स", "कायदेशीर साक्षरता", "Marathi ebooks", "civic literacy", "consumer rights", "RTI Marathi", "digital ebooks", "legal awareness Marathi"],
  authors: [{ name: "Ajay Mane", url: SITE_URL }, { name: "Shrutika Gochade", url: SITE_URL }],
  creator: "Kaydyacha Ani Faydyacha",
  publisher: SITE_NAME,
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: SITE_NAME,
  },
  icons: {
    icon: [
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.ico",
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "mr_IN",
    url: SITE_URL,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    siteName: SITE_NAME,
    images: [
      {
        url: "/opengraph/home.png",
        width: 1200,
        height: 630,
        alt: "कायद्याचं आणि फायद्याचं",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/logo_new.png"],
    creator: TWITTER_HANDLE,
  },
  alternates: {
    canonical: "/",
  },
  verification: {
    google: GOOGLE_SITE_VERIFICATION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="mr" suppressHydrationWarning>
      <head>
        <FacebookPixel />
        <ThirdPartyScripts />
        <link rel="preconnect" href="https://checkout.razorpay.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://checkout.razorpay.com" />
        <link rel="preconnect" href="https://api.razorpay.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.razorpay.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <TagManagerNoScript />
        <IABManager />
        <AppProviders>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
          >
            {children}
            <AnalyticsWrapper />
            <Toaster position="top-center" />
          </ThemeProvider>
        </AppProviders>
      </body>
    </html>
  );
}
