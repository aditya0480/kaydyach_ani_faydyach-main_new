"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Copy, Check, Smartphone } from "lucide-react";
import { getPayLabels, type PayLang } from "./labels";

interface Props {
    orderId: string;
    amount: number;
    upiVpa: string;
    receiverName: string;
    language?: PayLang | string | null;
}

export function QrDisplay({ orderId, amount, upiVpa, receiverName, language }: Props) {
    const [qrDataUrl, setQrDataUrl] = useState<string>("");
    const [copied, setCopied] = useState(false);
    const t = getPayLabels(language);

    const upiParams = useMemo(() => {
        return new URLSearchParams({
            pa: upiVpa,
            pn: receiverName,
            am: amount.toFixed(2),
            cu: "INR",
            tn: `Order ${orderId}`,
            tr: orderId,
        }).toString();
    }, [upiVpa, receiverName, amount, orderId]);

    const upiLink = `upi://pay?${upiParams}`;

    useEffect(() => {
        import("qrcode").then(({ default: QRCode }) => {
            QRCode.toDataURL(upiLink, {
                errorCorrectionLevel: "M",
                margin: 1,
                width: 320,
                color: { dark: "#0A2342", light: "#FFFFFF" },
            }).then(setQrDataUrl);
        });
    }, [upiLink]);

    function copyUpi() {
        navigator.clipboard.writeText(upiVpa);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <div className="rounded-xl border border-brand-teal/20 bg-white p-2.5 shadow-sm">
            {qrDataUrl ? (
                <div className="mx-auto mb-2 w-fit rounded-lg border border-gray-200 bg-white p-1.5">
                    <Image src={qrDataUrl} alt="UPI QR Code" width={160} height={160} unoptimized />
                </div>
            ) : (
                <div className="mx-auto mb-2 h-40 w-40 animate-pulse rounded-lg bg-gray-100" />
            )}

            <a
                href={upiLink}
                className="mb-2 flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand-teal px-3 py-2 text-xs font-bold text-white shadow active:scale-95"
            >
                <Smartphone className="h-3.5 w-3.5" />
                {t.openUpiApp(amount)}
            </a>

            <div className="flex items-center justify-between gap-2 rounded-md border border-gray-200 bg-gray-50 px-2 py-1.5">
                <div className="min-w-0">
                    <code className="block truncate text-[11px] font-semibold text-gray-800">{upiVpa}</code>
                    <p className="truncate text-[9px] text-gray-500">{receiverName}</p>
                </div>
                <button
                    onClick={copyUpi}
                    className="shrink-0 rounded bg-white p-1 text-brand-teal shadow-sm hover:bg-brand-teal hover:text-white"
                    aria-label="Copy UPI ID"
                >
                    {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                </button>
            </div>
        </div>
    );
}
