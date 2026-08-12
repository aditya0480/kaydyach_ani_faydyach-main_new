export const BUSINESS_INFO = {
  legalName: "Kaydyacha Ani Faydyacha",
  brandName: "कायद्याचं आणि फायद्याचं",
  proprietor: "Shrutika Gochade",
  udyam: "UDYAM-MH-26-1024122",
  foundedYear: 2024,
  email: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@kaydyachaanifaydyach.com",
  phone: process.env.NEXT_PUBLIC_SUPPORT_PHONE || "+918378089292",
  phoneDisplay: "+91 83780 89292",
  whatsappUrl: `https://wa.me/${(process.env.NEXT_PUBLIC_SUPPORT_PHONE || "+918378089292").replace(/[^0-9]/g, "")}`,
  address: {
    line1: "Floor No. 3, Amit Court Building",
    line2: "Civil Court, Shivaji Nagar",
    city: "Pune",
    state: "Maharashtra",
    pin: "411004",
    country: "India",
    full: "Floor No. 3, Amit Court Building, Civil Court, Shivaji Nagar, Pune, Maharashtra 411004, India",
  },
  social: {
    instagram: "https://www.instagram.com/kaydyach_aani_faydyach/",
  },
  supportHours: "Mon – Sat, 9:00 AM – 6:00 PM IST",
} as const;
