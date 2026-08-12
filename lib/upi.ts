import QRCode from "qrcode";

export const UPI_VPA = process.env.NEXT_PUBLIC_UPI_VPA || process.env.UPI_VPA || "";
export const UPI_RECEIVER_NAME = process.env.NEXT_PUBLIC_UPI_RECEIVER_NAME || process.env.UPI_RECEIVER_NAME || "";

export function buildUpiDeepLink(opts: {
    amount: number;
    orderId: string;
    note?: string;
}): string {
    const params = new URLSearchParams({
        pa: UPI_VPA,
        pn: UPI_RECEIVER_NAME,
        am: opts.amount.toFixed(2),
        cu: "INR",
        tn: opts.note || `Order ${opts.orderId}`,
        tr: opts.orderId,
    });
    return `upi://pay?${params.toString()}`;
}

export async function generateUpiQrDataUrl(opts: {
    amount: number;
    orderId: string;
    note?: string;
}): Promise<string> {
    const link = buildUpiDeepLink(opts);
    return QRCode.toDataURL(link, {
        errorCorrectionLevel: "M",
        margin: 1,
        width: 320,
        color: { dark: "#0A2342", light: "#FFFFFF" },
    });
}
