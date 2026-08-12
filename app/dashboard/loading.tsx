"use client";

import { PremiumLoader } from "@/components/premium-loader";

export default function DashboardLoading() {
    return (
        <PremiumLoader
            marathiText="डॅशबोर्ड तयार होत आहे..."
            englishText="Preparing Dashboard"
        />
    );
}
