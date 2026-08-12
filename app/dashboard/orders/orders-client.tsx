"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    Search,
    Download,
    CheckCircle2,
    XCircle,
    Clock,
    Copy,
    MessageSquare,
    FileText,
    ChevronRight,
    ExternalLink,
    Activity,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface OrderLog {
    id: string;
    event: string;
    source: string;
    metadata: Record<string, unknown> | null;
    createdAt: string;
}

const EVENT_LABELS: Record<string, { label: string; color: string }> = {
    ORDER_CREATED: { label: "Order created", color: "text-blue-600 bg-blue-50" },
    MODAL_OPENED: { label: "Payment modal opened", color: "text-blue-600 bg-blue-50" },
    MODAL_DISMISSED: { label: "Modal dismissed by user", color: "text-orange-600 bg-orange-50" },
    PAYMENT_FAILED_CLIENT: { label: "Payment failed (client)", color: "text-red-600 bg-red-50" },
    CALLBACK_RECEIVED: { label: "Payment callback received", color: "text-green-600 bg-green-50" },
    CALLBACK_EMPTY: { label: "Abandoned mid-redirect", color: "text-orange-600 bg-orange-50" },
    CALLBACK_ERROR: { label: "Gateway error", color: "text-red-600 bg-red-50" },
    CALLBACK_SIG_INVALID: { label: "Invalid signature", color: "text-red-600 bg-red-50" },
    WEBHOOK_RECEIVED: { label: "Webhook received", color: "text-green-600 bg-green-50" },
    VERIFY_CALLED: { label: "Verify called", color: "text-blue-600 bg-blue-50" },
    VERIFY_RECEIVED: { label: "Verify received", color: "text-blue-600 bg-blue-50" },
    VERIFY_SIG_INVALID: { label: "Verify: invalid signature", color: "text-red-600 bg-red-50" },
    VERIFY_ERROR: { label: "Verify error", color: "text-red-600 bg-red-50" },
    VERIFY_FAILED: { label: "Verify failed", color: "text-red-600 bg-red-50" },
    ORDER_FULFILLED: { label: "Order fulfilled", color: "text-green-600 bg-green-50" },
    ORDER_ALREADY_PAID: { label: "Already paid (idempotent)", color: "text-green-600 bg-green-50" },
    ORDER_AUTO_RECOVERED: { label: "Auto-recovered from stuck state", color: "text-purple-600 bg-purple-50" },
    WHATSAPP_SENT: { label: "WhatsApp sent", color: "text-green-600 bg-green-50" },
    WHATSAPP_FAILED: { label: "WhatsApp failed", color: "text-red-600 bg-red-50" },
    PAYMENT_LINK_CREATED: { label: "Payment link created", color: "text-blue-600 bg-blue-50" },
    PAYMENT_REMINDER_SENT: { label: "Reminder sent", color: "text-blue-600 bg-blue-50" },
    PAYMENT_REMINDER_FAILED: { label: "Reminder failed", color: "text-red-600 bg-red-50" },
    STATUS_UPDATED: { label: "Status updated", color: "text-gray-600 bg-gray-50" },
};

function OrderLogsLoader({ orderId }: { orderId: string }) {
    const [logs, setLogs] = useState<OrderLog[] | null>(null);

    useEffect(() => {
        let cancelled = false;
        fetch(`/api/admin/orders/${orderId}/logs`)
            .then((r) => r.json())
            .then((data: OrderLog[]) => { if (!cancelled) setLogs(data); })
            .catch(() => { if (!cancelled) setLogs([]); });
        return () => { cancelled = true; };
    }, [orderId]);

    if (logs === null) {
        return (
            <div className="flex items-center gap-2 py-4 text-xs text-muted-foreground">
                <Activity className="h-3.5 w-3.5 animate-pulse" />
                Loading event log...
            </div>
        );
    }

    if (!logs || logs.length === 0) {
        return <p className="py-2 text-xs text-muted-foreground">No events recorded for this order.</p>;
    }

    return (
        <div className="space-y-1.5">
            {logs.map((log) => {
                const meta = EVENT_LABELS[log.event] ?? { label: log.event, color: "text-gray-600 bg-gray-50" };
                const extraMeta = log.metadata as Record<string, string> | null;
                const errorDesc = extraMeta?.error_description || extraMeta?.error_reason || extraMeta?.message;
                return (
                    <div key={log.id} className="flex items-start gap-2">
                        <span className={cn("mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold", meta.color)}>
                            {meta.label}
                        </span>
                        <div className="min-w-0 flex-1">
                            {errorDesc && (
                                <p className="truncate text-[10px] font-medium text-red-500">{errorDesc}</p>
                            )}
                            <p className="text-[10px] text-muted-foreground">
                                {format(new Date(log.createdAt), "MMM dd, h:mm:ss a")} · {log.source}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

type OrderStatus = "PAID" | "PENDING" | "PENDING_VERIFICATION" | "FAILED" | "CANCELLED";

interface OrderItem {
    id: string;
    price: number;
    ebook: {
        id: string;
        title: string;
        coverImage?: string | null;
    };
}

interface Order {
    id: string;
    customerName: string | null;
    customerEmail: string | null;
    customerPhone: string | null;
    status: OrderStatus;
    failureReason: string | null;
    razorpayOrderId: string | null;
    amount: number;
    createdAt: string;
    updatedAt: string;
    items: OrderItem[];
}

interface OrdersClientProps {
    orders: Order[];
    loadedAt: string;
    customFrom?: string;
    customTo?: string;
}

// --- CSV helpers (properly escaped) ---
function csvEscape(value: string | number | null | undefined): string {
    const str = String(value ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}

export function OrdersClient({ orders, loadedAt, customFrom, customTo }: OrdersClientProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
    const [drawerOrder, setDrawerOrder] = useState<Order | null>(null);
    const [staleMinutes, setStaleMinutes] = useState(0);
    const [fromInput, setFromInput] = useState(customFrom || "");
    const [toInput, setToInput] = useState(customTo || "");
    const [showCustom, setShowCustom] = useState(!!customFrom);
    const [pdfDialogOrder, setPdfDialogOrder] = useState<Order | null>(null);
    const [testPhone, setTestPhone] = useState("");

    const dateFilter = searchParams.get("date") || "today";

    // Staleness ticker
    useEffect(() => {
        const loaded = new Date(loadedAt).getTime();
        const tick = setInterval(() => {
            setStaleMinutes(Math.floor((Date.now() - loaded) / 60000));
        }, 30000);
        return () => clearInterval(tick);
    }, [loadedAt]);

    const handleDateChange = (value: string) => {
        if (value === "custom") { setShowCustom(true); return; }
        setShowCustom(false);
        const params = new URLSearchParams(searchParams);
        params.delete("from"); params.delete("to");
        if (value) params.set("date", value); else params.delete("date");
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleCustomApply = () => {
        if (!fromInput) return;
        const params = new URLSearchParams(searchParams);
        params.delete("date");
        params.set("from", fromInput);
        if (toInput) params.set("to", toInput); else params.delete("to");
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleSendPdf = (order: Order) => {
        setTestPhone("");
        setPdfDialogOrder(order);
    };

    const doSendPdf = async () => {
        if (!pdfDialogOrder) return;
        const promise = fetch(`/api/admin/orders/${pdfDialogOrder.id}/send-pdf`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ testPhone: testPhone.trim() || undefined }),
        }).then(async (res) => {
            if (!res.ok) throw new Error(await res.text() || "Failed");
            return res.json();
        });
        toast.promise(promise, {
            loading: "Sending PDF...",
            success: "PDF sent via WhatsApp!",
            error: (err) => `Failed: ${(err as Error).message}`,
        });
        await promise;
        setPdfDialogOrder(null);
    };

    const handleSendFollowup = async (order: Order) => {
        const promise = fetch(`/api/admin/orders/${order.id}/send-followup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
        }).then(async (res) => {
            if (!res.ok) throw new Error(await res.text() || "Failed");
            return res.json();
        });
        toast.promise(promise, {
            loading: "Sending reminder...",
            success: "Payment reminder sent!",
            error: (err) => `Failed: ${(err as Error).message}`,
        });
        await promise;
    };

    const filteredOrders = useMemo(() => {
        return orders.filter((order) => {
            const searchLower = searchQuery.toLowerCase();
            const matchesSearch =
                searchQuery === "" ||
                order.id.toLowerCase().includes(searchLower) ||
                order.customerName?.toLowerCase().includes(searchLower) ||
                order.customerEmail?.toLowerCase().includes(searchLower) ||
                order.customerPhone?.includes(searchQuery) ||
                order.razorpayOrderId?.toLowerCase().includes(searchLower);
            const matchesStatus = statusFilter === "all" || order.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [orders, searchQuery, statusFilter]);

    // Fixed CSV export — all values properly quoted
    const exportToCSV = () => {
        const headers = ["Order ID", "Customer", "Email", "Phone", "Razorpay ID", "Status", "Amount", "Date", "Items"];
        const rows = filteredOrders.map((order) => [
            csvEscape(order.id),
            csvEscape(order.customerName || "Guest"),
            csvEscape(order.customerEmail),
            csvEscape(order.customerPhone),
            csvEscape(order.razorpayOrderId),
            csvEscape(order.status),
            csvEscape(order.amount),
            csvEscape(format(new Date(order.createdAt), "yyyy-MM-dd HH:mm")),
            csvEscape(order.items.map((item) => item.ebook.title).join("; ")),
        ]);

        const csv = [headers.map(csvEscape), ...rows].map(row => row.join(",")).join("\n");
        const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" }); // BOM for Excel
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `orders-${dateFilter}-${format(new Date(), "yyyy-MM-dd")}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success(`Exported ${filteredOrders.length} orders`);
    };

    const getStatusIcon = (status: OrderStatus) => {
        switch (status) {
            case "PAID": return <CheckCircle2 className="h-3 w-3" />;
            case "PENDING": return <Clock className="h-3 w-3" />;
            case "FAILED":
            case "CANCELLED": return <XCircle className="h-3 w-3" />;
        }
    };

    const copyToClipboard = useCallback((text: string, label = "Copied") => {
        navigator.clipboard.writeText(text);
        toast.success(label);
    }, []);

    const handleWhatsAppLink = async (order: Order) => {
        try {
            if (order.status !== "PAID") {
                const promise = fetch(`/api/orders/send-payment-link`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ orderId: order.id }),
                }).then(async (res) => {
                    if (res.status === 429) throw new Error("Rate limited — max 5 payment links per 24 hours for this number");
                    if (!res.ok) throw new Error(await res.text() || "Failed to send payment link");
                    return res;
                });
                toast.promise(promise, {
                    loading: 'Sending payment link...',
                    success: 'Payment link sent via WhatsApp!',
                    error: (err) => `Failed: ${(err as Error).message}`
                });
                await promise;
                return;
            }

            const res = await fetch(`/api/admin/orders/${order.id}/whatsapp-link`);
            if (!res.ok) throw new Error("Failed to generate link");

            const data = await res.json() as { phone: string; customerName: string; downloadLink: string };
            const { phone, customerName, downloadLink } = data;
            const text = `नमस्कार ${customerName || ""},%0Aकायद्यांच आणि फायद्यांच मधून खरेदी केल्याबद्दल धन्यवाद!%0A%0A⬇️ *डाउनलोड करा:*%0A${downloadLink}%0A%0A(या लिंक्स ७ दिवसांसाठी वैध आहेत)%0A💡 टीप: PDF तुमच्या मोबाईलच्या Downloads किंवा Documents फोल्डरमध्ये डाउनलोड होईल.%0A%0Aधन्यवाद!`;
            window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
            toast.success("WhatsApp opened!");
        } catch (err) {
            toast.error("Could not generate link");
            console.error(err);
        }
    };

    const toggleOrderSelection = (orderId: string) => {
        const s = new Set(selectedOrders);
        if (s.has(orderId)) s.delete(orderId); else s.add(orderId);
        setSelectedOrders(s);
    };

    const toggleAllOrders = () => {
        if (selectedOrders.size === filteredOrders.length) setSelectedOrders(new Set());
        else setSelectedOrders(new Set(filteredOrders.map(o => o.id)));
    };

    const handleBulkWhatsApp = async () => {
        const pendingSelected = filteredOrders.filter(o =>
            selectedOrders.has(o.id) && (o.status === "PENDING" || o.status === "FAILED")
        );
        if (pendingSelected.length === 0) { toast.error("No pending/failed orders selected"); return; }

        const promise = fetch('/api/admin/orders/bulk-send-reminder', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderIds: pendingSelected.map(o => o.id) })
        }).then(async (res) => {
            if (!res.ok) throw new Error(await res.text() || "Failed");
            return res.json() as Promise<{ successCount: number }>;
        });

        toast.promise(promise, {
            loading: `Sending reminders to ${pendingSelected.length} customer(s)...`,
            success: (data) => { setSelectedOrders(new Set()); return `Sent ${data.successCount} of ${pendingSelected.length} reminders`; },
            error: (err) => `Failed: ${(err as Error).message}`
        });
        await promise;
    };

    const handleBulkPdf = async () => {
        const paidSelected = filteredOrders.filter(o => selectedOrders.has(o.id) && o.status === "PAID");
        if (paidSelected.length === 0) { toast.error("No paid orders selected"); return; }

        const promise = fetch('/api/admin/orders/bulk-send-pdf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderIds: paidSelected.map(o => o.id) })
        }).then(async (res) => {
            if (!res.ok) throw new Error(await res.text() || "Failed");
            return res.json() as Promise<{ totalOrders: number; successCount: number; skippedCount: number }>;
        });

        toast.promise(promise, {
            loading: `Sending PDFs to ${paidSelected.length} customer(s)...`,
            success: (data) => { setSelectedOrders(new Set()); return `Processed ${data.totalOrders}. Sent: ${data.successCount}, Skipped: ${data.skippedCount}`; },
            error: (err) => `Failed: ${(err as Error).message}`
        });
        await promise;
    };

    const getInitials = (name: string | null) =>
        name ? name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "G";

    const WhatsappIcon = ({ className }: { className?: string }) => (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
    );

    const DATE_FILTERS = [
        { label: 'Today', value: 'today' },
        { label: 'Week', value: 'week' },
        { label: 'Month', value: 'month' },
        { label: '2M', value: '2months' },
        { label: '3M', value: '3months' },
        { label: 'All', value: 'all' },
        { label: 'Custom', value: 'custom' },
    ];

    const STATUS_FILTERS = [
        { label: 'All', value: 'all' },
        { label: 'Paid', value: 'PAID' },
        { label: 'Pending', value: 'PENDING' },
        { label: 'Failed', value: 'FAILED' },
        { label: 'Cancelled', value: 'CANCELLED' },
    ];

    const pendingSelCount = Array.from(selectedOrders).filter(id => {
        const o = orders.find(o => o.id === id);
        return o?.status === "PENDING" || o?.status === "FAILED";
    }).length;

    const paidSelCount = Array.from(selectedOrders).filter(id =>
        orders.find(o => o.id === id)?.status === "PAID"
    ).length;

    return (
        <>
            {/* Order Detail Drawer */}
            <Sheet open={!!drawerOrder} onOpenChange={(open) => !open && setDrawerOrder(null)}>
                <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
                    {drawerOrder && (
                        <>
                            <SheetHeader className="mb-4">
                                <SheetTitle className="flex items-center gap-2">
                                    <span className="font-mono text-sm text-muted-foreground">#{drawerOrder.id.slice(-8).toUpperCase()}</span>
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            "ml-auto border-0 text-[10px] font-bold uppercase",
                                            drawerOrder.status === "PAID" && "bg-green-50 text-green-700",
                                            drawerOrder.status === "PENDING" && "bg-yellow-50 text-yellow-700",
                                            (drawerOrder.status === "FAILED" || drawerOrder.status === "CANCELLED") && "bg-red-50 text-red-700"
                                        )}
                                    >
                                        {getStatusIcon(drawerOrder.status)} {drawerOrder.status}
                                    </Badge>
                                </SheetTitle>
                            </SheetHeader>

                            <div className="space-y-5">
                                {/* Customer */}
                                <section>
                                    <p className="mb-2 text-[10px] font-bold tracking-wider text-gray-400 uppercase">Customer</p>
                                    <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3">
                                        <Avatar className="h-10 w-10 border border-gray-200">
                                            <AvatarImage src="" />
                                            <AvatarFallback className="bg-[#0A2342]/5 text-sm font-bold text-[#0A2342]">
                                                {getInitials(drawerOrder.customerName)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-gray-900">{drawerOrder.customerName || "Guest"}</p>
                                            {drawerOrder.customerEmail && (
                                                <p className="truncate text-xs text-muted-foreground">{drawerOrder.customerEmail}</p>
                                            )}
                                            {drawerOrder.customerPhone && (
                                                <p className="font-mono text-xs text-blue-600">{drawerOrder.customerPhone}</p>
                                            )}
                                        </div>
                                        {drawerOrder.customerPhone && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 gap-1.5 rounded-lg border-green-100 bg-green-50 px-2 text-green-700"
                                                onClick={() => handleWhatsAppLink(drawerOrder)}
                                            >
                                                <WhatsappIcon className="h-3.5 w-3.5" />
                                            </Button>
                                        )}
                                    </div>
                                </section>

                                {/* Items */}
                                <section>
                                    <p className="mb-2 text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                                        Items ({drawerOrder.items.length})
                                    </p>
                                    <div className="space-y-2">
                                        {drawerOrder.items.map((item) => (
                                            <div key={item.id} className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-3">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    {item.ebook.coverImage && (
                                                        // eslint-disable-next-line @next/next/no-img-element
                                                        <img src={item.ebook.coverImage} alt="" className="h-10 w-7 rounded object-cover shadow-sm" />
                                                    )}
                                                    <p className="line-clamp-2 text-xs font-semibold text-gray-800">{item.ebook.title}</p>
                                                </div>
                                                <p className="ml-3 shrink-0 text-sm font-bold text-[#0A2342]">₹{item.price.toLocaleString()}</p>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                {/* Payment */}
                                <section>
                                    <p className="mb-2 text-[10px] font-bold tracking-wider text-gray-400 uppercase">Payment</p>
                                    <div className="rounded-xl border border-gray-100 bg-gray-50 divide-y divide-gray-100">
                                        <div className="flex items-center justify-between px-3 py-2.5">
                                            <span className="text-xs text-gray-500">Total</span>
                                            <span className="text-sm font-bold text-green-600">₹{drawerOrder.amount.toLocaleString()}</span>
                                        </div>
                                        <div className="flex items-center justify-between px-3 py-2.5">
                                            <span className="text-xs text-gray-500">DB Order ID</span>
                                            <button
                                                className="flex items-center gap-1 font-mono text-xs text-gray-700 hover:text-[#0A2342]"
                                                onClick={() => copyToClipboard(drawerOrder.id, "Order ID copied")}
                                            >
                                                {drawerOrder.id.slice(-10).toUpperCase()}
                                                <Copy className="h-3 w-3" />
                                            </button>
                                        </div>
                                        {drawerOrder.razorpayOrderId && (
                                            <div className="flex items-center justify-between px-3 py-2.5">
                                                <span className="text-xs text-gray-500">Razorpay ID</span>
                                                <button
                                                    className="flex items-center gap-1 font-mono text-xs text-gray-700 hover:text-[#0A2342]"
                                                    onClick={() => copyToClipboard(drawerOrder.razorpayOrderId!, "Razorpay ID copied")}
                                                >
                                                    {drawerOrder.razorpayOrderId.slice(-12)}
                                                    <Copy className="h-3 w-3" />
                                                </button>
                                            </div>
                                        )}
                                        {drawerOrder.failureReason && (
                                            <div className="px-3 py-2.5">
                                                <span className="text-xs text-gray-500">Failure reason</span>
                                                <p className="mt-0.5 text-xs font-medium text-red-600">{drawerOrder.failureReason}</p>
                                            </div>
                                        )}
                                    </div>
                                </section>

                                {/* Timestamps */}
                                <section>
                                    <p className="mb-2 text-[10px] font-bold tracking-wider text-gray-400 uppercase">Timeline</p>
                                    <div className="rounded-xl border border-gray-100 bg-gray-50 divide-y divide-gray-100">
                                        <div className="flex items-center justify-between px-3 py-2.5">
                                            <span className="text-xs text-gray-500">Created</span>
                                            <span className="text-xs font-medium text-gray-700">
                                                {format(new Date(drawerOrder.createdAt), "MMM dd, yyyy • h:mm a")}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between px-3 py-2.5">
                                            <span className="text-xs text-gray-500">Updated</span>
                                            <span className="text-xs font-medium text-gray-700">
                                                {format(new Date(drawerOrder.updatedAt), "MMM dd, yyyy • h:mm a")}
                                            </span>
                                        </div>
                                    </div>
                                </section>

                                {/* Event Log */}
                                <section>
                                    <p className="mb-2 text-[10px] font-bold tracking-wider text-gray-400 uppercase flex items-center gap-1.5">
                                        <Activity className="h-3 w-3" />
                                        Event Log
                                    </p>
                                    <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                                        <OrderLogsLoader orderId={drawerOrder.id} />
                                    </div>
                                </section>

                                {/* Actions */}
                                <section className="flex flex-col gap-2">
                                    {drawerOrder.status === "PAID" && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full gap-2 rounded-xl border-blue-100 bg-blue-50 text-blue-700 hover:bg-blue-100"
                                            onClick={() => handleSendPdf(drawerOrder)}
                                        >
                                            <FileText className="h-3.5 w-3.5" />
                                            Resend PDF via WhatsApp
                                        </Button>
                                    )}
                                    {(drawerOrder.status === "PENDING" || drawerOrder.status === "FAILED") && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full gap-2 rounded-xl border-amber-100 bg-amber-50 text-amber-700 hover:bg-amber-100"
                                            onClick={() => handleSendFollowup(drawerOrder)}
                                        >
                                            <MessageSquare className="h-3.5 w-3.5" />
                                            Send Payment Reminder
                                        </Button>
                                    )}
                                </section>

                                {/* Razorpay Dashboard link */}
                                {drawerOrder.razorpayOrderId && (
                                    <a
                                        href={`https://dashboard.razorpay.com/app/orders/${drawerOrder.razorpayOrderId}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-2.5 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50 hover:text-[#0A2342]"
                                    >
                                        <ExternalLink className="h-3.5 w-3.5" />
                                        View in Razorpay Dashboard
                                    </a>
                                )}
                            </div>
                        </>
                    )}
                </SheetContent>
            </Sheet>

            <div className="overflow-hidden rounded-2xl border border-none border-gray-100 bg-white shadow-sm">
                {/* Toolbar */}
                <div className="flex flex-col gap-4 border-b border-gray-100 bg-white p-4">
                    {/* Top Row */}
                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                        <div>
                            <h2 className="text-lg font-bold text-[#0A2342]">Recent Sales</h2>
                            <div className="flex items-center gap-2">
                                <p className="text-sm text-muted-foreground">
                                    {filteredOrders.length} records found
                                </p>
                                {staleMinutes > 0 && (
                                    <span className="rounded-full bg-yellow-50 px-2 py-0.5 text-[10px] font-semibold text-yellow-700">
                                        {staleMinutes}m old
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Date Filter */}
                        <div className="flex flex-col gap-2 self-start md:self-auto">
                            <div className="flex w-fit items-center rounded-xl bg-gray-100/80 p-1">
                                {DATE_FILTERS.map((f) => {
                                    const isActive = f.value === "custom" ? showCustom : (!showCustom && dateFilter === f.value);
                                    return (
                                        <button
                                            key={f.value}
                                            onClick={() => handleDateChange(f.value)}
                                            className={cn(
                                                "rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
                                                isActive
                                                    ? "bg-white text-[#0A2342] shadow-sm ring-1 ring-black/5"
                                                    : "text-gray-500 hover:bg-gray-200/50 hover:text-gray-900"
                                            )}
                                        >
                                            {f.label}
                                        </button>
                                    );
                                })}
                            </div>
                            {showCustom && (
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="date"
                                        value={fromInput}
                                        onChange={(e) => setFromInput(e.target.value)}
                                        className="h-8 rounded-lg border-gray-200 bg-gray-50 text-xs"
                                    />
                                    <span className="text-xs text-muted-foreground">to</span>
                                    <Input
                                        type="date"
                                        value={toInput}
                                        onChange={(e) => setToInput(e.target.value)}
                                        className="h-8 rounded-lg border-gray-200 bg-gray-50 text-xs"
                                    />
                                    <Button
                                        size="sm"
                                        onClick={handleCustomApply}
                                        disabled={!fromInput}
                                        className="h-8 rounded-lg bg-[#0A2342] px-3 text-xs text-white"
                                    >
                                        Apply
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Bottom Row */}
                    <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
                        {/* Search */}
                        <div className="group relative w-full md:w-72">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-[#0A2342]" />
                            <Input
                                placeholder="Search name, phone, order ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-10 rounded-xl border-gray-200 bg-gray-50 pl-10 transition-all focus:bg-white"
                            />
                        </div>

                        <div className="flex w-full flex-wrap items-center gap-2 md:w-auto">
                            {/* Status Filters */}
                            <div className="scrollbar-hide flex items-center gap-1 overflow-x-auto rounded-xl bg-gray-50 p-1">
                                {STATUS_FILTERS.map((f) => (
                                    <button
                                        key={f.value}
                                        onClick={() => setStatusFilter(f.value)}
                                        className={cn(
                                            "rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all",
                                            statusFilter === f.value
                                                ? cn(
                                                    "shadow-sm ring-1 ring-black/5",
                                                    f.value === 'PAID' ? "bg-green-50 text-green-700 ring-green-200" :
                                                        f.value === 'PENDING' ? "bg-orange-50 text-orange-700 ring-orange-200" :
                                                            f.value === 'FAILED' ? "bg-red-50 text-red-700 ring-red-200" :
                                                                f.value === 'CANCELLED' ? "bg-gray-100 text-gray-700 ring-gray-200" :
                                                                    "bg-white text-[#0A2342]"
                                                )
                                                : "text-gray-500 hover:bg-gray-200/50"
                                        )}
                                    >
                                        {f.label}
                                    </button>
                                ))}
                            </div>

                            {/* Export */}
                            <Button
                                onClick={exportToCSV}
                                variant="outline"
                                className="h-10 shrink-0 gap-2 rounded-xl border-gray-200 px-4 text-gray-600 hover:bg-gray-50 hover:text-[#0A2342]"
                            >
                                <Download className="h-4 w-4" />
                                <span className="hidden sm:inline">Export CSV</span>
                            </Button>

                            {/* Bulk Actions */}
                            {selectedOrders.size > 0 && pendingSelCount > 0 && (
                                <Button
                                    onClick={handleBulkWhatsApp}
                                    className="h-10 shrink-0 gap-2 rounded-xl bg-amber-600 px-4 text-white hover:bg-amber-700"
                                >
                                    <MessageSquare className="h-4 w-4" />
                                    Remind ({pendingSelCount})
                                </Button>
                            )}
                            {selectedOrders.size > 0 && paidSelCount > 0 && (
                                <Button
                                    onClick={handleBulkPdf}
                                    className="h-10 shrink-0 gap-2 rounded-xl bg-green-600 px-4 text-white hover:bg-green-700"
                                >
                                    <FileText className="h-4 w-4" />
                                    Send PDF ({paidSelCount})
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-0">
                    {/* Mobile List */}
                    <div className="block bg-gray-50/30 px-4 pb-4 md:hidden">
                        {filteredOrders.length === 0 ? (
                            <div className="mt-4 flex flex-col items-center justify-center p-8 text-center">
                                <div className="mb-3 rounded-full border border-gray-100 bg-white p-4 shadow-sm">
                                    <Search className="h-6 w-6 text-gray-400" />
                                </div>
                                <h3 className="text-sm font-semibold text-gray-900">No orders found</h3>
                                <p className="mt-1 text-xs text-gray-500">Adjust filters to see results.</p>
                            </div>
                        ) : (
                            <div className="mt-3 space-y-3">
                                {filteredOrders.map((order) => (
                                    <div
                                        key={order.id}
                                        className="relative space-y-3 overflow-hidden rounded-xl border border-gray-100 bg-white p-3 shadow-sm"
                                        onClick={() => setDrawerOrder(order)}
                                    >
                                        <div className="flex items-start justify-between pl-1">
                                            <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                                                <Checkbox
                                                    checked={selectedOrders.has(order.id)}
                                                    onCheckedChange={() => toggleOrderSelection(order.id)}
                                                />
                                                <Avatar className="h-9 w-9 border border-gray-100">
                                                    <AvatarImage src="" />
                                                    <AvatarFallback className="bg-[#0A2342]/5 text-[10px] font-bold text-[#0A2342]">
                                                        {getInitials(order.customerName)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="line-clamp-1 text-sm font-bold text-[#0A2342]">
                                                        {order.customerName || "Guest User"}
                                                    </div>
                                                    <div className="mt-0.5 flex items-center gap-2 text-[10px] text-muted-foreground">
                                                        <span>{format(new Date(order.createdAt), "MMM dd, h:mm a")}</span>
                                                        <span className="text-gray-300">•</span>
                                                        <span className="font-mono text-gray-400">#{order.id.slice(-4).toUpperCase()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    "rounded-md border-0 px-1.5 py-0.5 text-[9px] font-bold uppercase",
                                                    order.status === "PAID" && "bg-green-50 text-green-700",
                                                    order.status === "PENDING" && "bg-yellow-50 text-yellow-700",
                                                    (order.status === "FAILED" || order.status === "CANCELLED") && "bg-red-50 text-red-700"
                                                )}
                                            >
                                                {order.status}
                                            </Badge>
                                        </div>

                                        <div className="space-y-1 border-y border-dashed border-gray-50 py-2">
                                            {order.items.map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-1.5 truncate text-xs font-medium text-gray-600">
                                                    <div className="h-1 w-1 shrink-0 rounded-full bg-gray-300" />
                                                    {item.ebook.title}
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex items-center justify-between pt-0.5">
                                            <div className="text-base font-bold text-[#0A2342]">₹{order.amount.toLocaleString()}</div>
                                            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                                <Button
                                                    variant="outline" size="sm"
                                                    className="h-7 w-7 rounded-lg border-gray-100 p-0"
                                                    onClick={() => copyToClipboard(order.id)}
                                                >
                                                    <Copy className="h-3 w-3 text-gray-500" />
                                                </Button>
                                                <Button
                                                    variant="outline" size="sm"
                                                    className="h-7 gap-1.5 rounded-lg border-green-100 bg-green-50/50 px-2 text-green-700"
                                                    onClick={() => handleWhatsAppLink(order)}
                                                >
                                                    <WhatsappIcon className="h-3 w-3" />
                                                    <span className="text-[10px] font-bold">WhatsApp</span>
                                                </Button>
                                                <ChevronRight className="h-4 w-4 self-center text-gray-400" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Desktop Table */}
                    <div className="relative hidden md:block">
                        <Table>
                            <TableHeader className="bg-gray-50/40">
                                <TableRow className="border-b-gray-100 hover:bg-transparent">
                                    <TableHead className="w-12 pl-6">
                                        <Checkbox
                                            checked={selectedOrders.size === filteredOrders.length && filteredOrders.length > 0}
                                            onCheckedChange={toggleAllOrders}
                                            aria-label="Select all"
                                        />
                                    </TableHead>
                                    <TableHead className="w-24 text-xs font-semibold tracking-wider text-muted-foreground uppercase">Order</TableHead>
                                    <TableHead className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Customer</TableHead>
                                    <TableHead className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Items</TableHead>
                                    <TableHead className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Status</TableHead>
                                    <TableHead className="text-right text-xs font-semibold tracking-wider text-muted-foreground uppercase">Amount</TableHead>
                                    <TableHead className="text-right text-xs font-semibold tracking-wider text-muted-foreground uppercase">Date</TableHead>
                                    <TableHead className="pr-6 text-right text-xs font-semibold tracking-wider text-muted-foreground uppercase">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredOrders.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-64 text-center">
                                            <div className="flex flex-col items-center justify-center p-8">
                                                <div className="mb-3 rounded-full bg-gray-50 p-4">
                                                    <Search className="h-6 w-6 text-gray-400" />
                                                </div>
                                                <h3 className="font-semibold text-gray-900">No orders found</h3>
                                                <p className="mt-1 text-sm text-gray-500">Try adjusting your filters.</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredOrders.map((order) => (
                                    <TableRow
                                        key={order.id}
                                        className="group cursor-pointer border-b-gray-50 transition-colors hover:bg-blue-50/10"
                                        onClick={() => setDrawerOrder(order)}
                                    >
                                        <TableCell className="pl-6" onClick={(e) => e.stopPropagation()}>
                                            <Checkbox
                                                checked={selectedOrders.has(order.id)}
                                                onCheckedChange={() => toggleOrderSelection(order.id)}
                                            />
                                        </TableCell>
                                        <TableCell className="font-mono text-xs font-semibold text-muted-foreground group-hover:text-[#0A2342]">
                                            #{order.id.slice(-6).toUpperCase()}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8 border border-gray-100 shadow-sm">
                                                    <AvatarImage src="" alt={order.customerName || "Guest"} />
                                                    <AvatarFallback className="bg-[#0A2342]/5 text-[10px] font-bold text-[#0A2342]">
                                                        {getInitials(order.customerName)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex max-w-44 flex-col">
                                                    <span className="truncate text-sm font-semibold text-gray-900">
                                                        {order.customerName || "Guest User"}
                                                    </span>
                                                    <div className="flex flex-col gap-0.5 text-[11px] text-muted-foreground">
                                                        <span className="truncate">{order.customerEmail || "No email"}</span>
                                                        {order.customerPhone && (
                                                            <span className="font-mono text-xs text-blue-600">{order.customerPhone}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex max-w-48 flex-col gap-1">
                                                {order.items.slice(0, 1).map((item, idx) => (
                                                    <span key={idx} className="block truncate text-sm font-medium text-gray-700" title={item.ebook.title}>
                                                        {item.ebook.title}
                                                    </span>
                                                ))}
                                                {order.items.length > 1 && (
                                                    <span className="inline-flex w-fit items-center rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                                                        +{order.items.length - 1} more
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div title={order.failureReason || ""}>
                                                <Badge
                                                    variant="outline"
                                                    className={cn(
                                                        "gap-1.5 rounded-md border-0 px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase",
                                                        order.status === "PAID" && "bg-green-50 text-green-700",
                                                        order.status === "PENDING" && "bg-yellow-50 text-yellow-700",
                                                        (order.status === "FAILED" || order.status === "CANCELLED") && "cursor-help bg-red-50 text-red-700"
                                                    )}
                                                >
                                                    {getStatusIcon(order.status)}
                                                    {order.status}
                                                </Badge>
                                                {(order.status === "FAILED" || order.status === "CANCELLED") && order.failureReason && (
                                                    <div className="mt-1 max-w-36 truncate text-[10px] font-medium text-red-600">
                                                        {order.failureReason}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right text-sm font-bold text-[#0A2342]">
                                            ₹{order.amount.toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-right text-xs text-muted-foreground">
                                            <div className="flex flex-col items-end gap-0.5">
                                                <span className="font-medium text-gray-900">{format(new Date(order.createdAt), "MMM dd")}</span>
                                                <span className="text-[10px]">{format(new Date(order.createdAt), "h:mm a")}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost" size="icon"
                                                    className="h-8 w-8 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-[#0A2342]"
                                                    onClick={() => copyToClipboard(order.id, "Order ID copied")}
                                                    title="Copy Order ID"
                                                >
                                                    <Copy className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost" size="sm"
                                                    onClick={() => handleWhatsAppLink(order)}
                                                    className="h-8 gap-2 rounded-lg border-green-100 bg-green-50/50 px-2 text-green-600 hover:bg-green-100"
                                                    title="Send via WhatsApp"
                                                >
                                                    <WhatsappIcon className="h-4 w-4" />
                                                    <span className="hidden text-xs font-semibold lg:inline">WhatsApp</span>
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>

            {/* PDF Send Dialog */}
            <Dialog open={!!pdfDialogOrder} onOpenChange={(open) => !open && setPdfDialogOrder(null)}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-sm">
                            <FileText className="h-4 w-4 text-blue-600" />
                            Send PDF via WhatsApp
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 py-2">
                        <p className="text-xs text-muted-foreground">
                            Customer: <span className="font-semibold text-gray-900">{pdfDialogOrder?.customerName}</span>
                            {pdfDialogOrder?.customerPhone && (
                                <span className="ml-2 font-mono text-blue-600">{pdfDialogOrder.customerPhone}</span>
                            )}
                        </p>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-gray-700">Test phone (optional)</Label>
                            <Input
                                placeholder="91XXXXXXXXXX — leave blank to send to customer"
                                value={testPhone}
                                onChange={(e) => setTestPhone(e.target.value)}
                                className="h-9 rounded-lg text-xs"
                            />
                            <p className="text-[10px] text-muted-foreground">
                                Enter a number to test without sending to the real customer.
                            </p>
                        </div>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" size="sm" onClick={() => setPdfDialogOrder(null)} className="rounded-lg">
                            Cancel
                        </Button>
                        <Button size="sm" onClick={doSendPdf} className="rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                            Send PDF
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
