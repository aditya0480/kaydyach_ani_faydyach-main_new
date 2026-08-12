"use client";

import { PremiumLoader } from "@/components/premium-loader";

export default function Loading() {
  return (
    <div className="relative min-h-screen">
      <PremiumLoader
        fullScreen={true}
      />

      {/* Background Decorative Elements - Kept here for extra flair on initial load */}
      <div className="pointer-events-none fixed top-10 left-10 h-64 w-64 rounded-full bg-brand-teal/5 blur-[100px]" />
      <div className="pointer-events-none fixed right-10 bottom-10 h-64 w-64 rounded-full bg-brand-gold/5 blur-[100px]" />
    </div>
  );
}
