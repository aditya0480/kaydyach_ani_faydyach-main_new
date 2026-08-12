"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

type OrderRow = {
    id: string;
    customerName: string | null;
    customerEmail: string | null;
    customerPhone: string | null;
    amount: number;
    status: string;
    manualStatus: string | null;
    manualUtr: string | null;
    manualPayerName: string | null;
    manualReceiverName: string | null;
    manualReceiverUpiId: string | null;
    manualPaidAt: Date | string | null;
    manualSubmittedAt: Date | string | null;
    manualConfidence: number | null;
    manualRejectionReason: string | null;
    ebookTitle: string;
    screenshotUrl: string | null;
};

export function ManualPaymentsClient({ orders }: { orders: OrderRow[] }) {
    const router = useRouter();
    const [busyId, setBusyId] = useState<string | null>(null);

    async function act(orderId: string, action: "approve" | "reject") {
        const reason = action === "reject" ? prompt("Rejection reason?") || "" : undefined;
        if (action === "reject" && !reason) return;
        setBusyId(orderId);
        try {
            const res = await fetch("/api/payment/manual/admin-verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId, action, rejectionReason: reason }),
            });
            const json = await res.json();
            if (!json.ok) throw new Error(json.error || "Failed");
            toast.success(action === "approve" ? "Approved + PDF dispatched" : "Rejected");
            router.refresh();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed");
        } finally {
            setBusyId(null);
        }
    }

    if (orders.length === 0) {
        return <p className="rounded-xl border border-gray-200 bg-gray-50 p-8 text-center text-gray-500">No pending payments to review.</p>;
    }

    return (
        <div className="space-y-4">
            {orders.map((o) => (
                <div key={o.id} className="grid gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:grid-cols-[200px_1fr_auto]">
                    {o.screenshotUrl ? (
                        <a href={o.screenshotUrl} target="_blank" rel="noopener noreferrer" className="block">
                            <Image src={o.screenshotUrl} alt="screenshot" width={200} height={300} className="h-auto w-full rounded-lg border border-gray-200 object-cover" unoptimized />
                        </a>
                    ) : (
                        <div className="flex h-48 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-xs text-gray-400">No screenshot</div>
                    )}

                    <div className="space-y-1 text-sm">
                        <p className="font-bold text-gray-900">{o.ebookTitle} — ₹{o.amount}</p>
                        <p><strong>Order:</strong> <code className="text-xs">{o.id}</code></p>
                        <p><strong>Customer:</strong> {o.customerName} · {o.customerPhone} · {o.customerEmail}</p>
                        <p><strong>UTR:</strong> <code className="text-xs">{o.manualUtr || "—"}</code></p>
                        <p><strong>Payer (from screenshot):</strong> {o.manualPayerName || "—"}</p>
                        <p><strong>Receiver (from screenshot):</strong> {o.manualReceiverName || "—"} · {o.manualReceiverUpiId || "—"}</p>
                        <p><strong>Paid at:</strong> {o.manualPaidAt ? new Date(o.manualPaidAt).toLocaleString() : "—"}</p>
                        <p><strong>Submitted:</strong> {o.manualSubmittedAt ? new Date(o.manualSubmittedAt).toLocaleString() : "—"}</p>
                        <p><strong>AI confidence:</strong> {o.manualConfidence !== null ? `${(o.manualConfidence * 100).toFixed(0)}%` : "—"}</p>
                        {o.manualRejectionReason && (
                            <p className="rounded-lg border border-amber-200 bg-amber-50 p-2 text-xs text-amber-800">
                                <strong>Flags:</strong> {o.manualRejectionReason}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <Button
                            onClick={() => act(o.id, "approve")}
                            disabled={busyId === o.id}
                            className="bg-green-600 text-white hover:bg-green-700"
                        >
                            {busyId === o.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                            Approve
                        </Button>
                        <Button
                            onClick={() => act(o.id, "reject")}
                            disabled={busyId === o.id}
                            variant="destructive"
                        >
                            <XCircle className="h-4 w-4" />
                            Reject
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    );
}
