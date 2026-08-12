"use client";

import { useState } from "react";
import { Upload, CheckCircle2, XCircle, Loader2, AlertCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getPayLabels, type PayLang } from "./labels";

interface Props {
    orderId: string;
    onApproved?: (orderId: string) => void;
    language?: PayLang | string | null;
}

type SubmitState =
    | { status: "idle" }
    | { status: "submitting" }
    | { status: "approved"; message: string }
    | { status: "pending_review"; message: string; reasons?: string[] }
    | { status: "error"; message: string };

export function ManualPaymentUploadForm({ orderId, onApproved, language }: Props) {
    const [utr, setUtr] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [state, setState] = useState<SubmitState>({ status: "idle" });
    const [extracting, setExtracting] = useState(false);
    const [autoFilled, setAutoFilled] = useState(false);
    const t = getPayLabels(language);

    async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const f = e.target.files?.[0] || null;
        setFile(f);
        setAutoFilled(false);
        if (f) {
            const reader = new FileReader();
            reader.onload = () => setPreview(typeof reader.result === "string" ? reader.result : null);
            reader.readAsDataURL(f);

            setExtracting(true);
            try {
                const form = new FormData();
                form.append("screenshot", f);
                const res = await fetch("/api/payment/manual/extract-utr", { method: "POST", body: form });
                const json = await res.json();
                if (json.ok && json.utr) {
                    setUtr(String(json.utr).replace(/\s/g, ""));
                    setAutoFilled(true);
                }
            } catch {
                // silent — user can type manually
            } finally {
                setExtracting(false);
            }
        } else {
            setPreview(null);
        }
    }

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!file || !utr) return;
        setState({ status: "submitting" });

        const form = new FormData();
        form.append("orderId", orderId);
        form.append("utr", utr.trim());
        form.append("screenshot", file);

        try {
            const res = await fetch("/api/payment/manual/submit", { method: "POST", body: form });
            const json = await res.json();
            if (!json.ok) {
                setState({ status: "error", message: json.error || "Submission failed" });
                return;
            }
            if (json.status === "approved") {
                setState({ status: "approved", message: json.message });
                onApproved?.(orderId);
            } else {
                setState({ status: "pending_review", message: json.message, reasons: json.reasons });
            }
        } catch {
            setState({ status: "error", message: "Network error. Try again." });
        }
    }

    if (state.status === "approved") {
        return (
            <div className="rounded-2xl border-2 border-green-200 bg-green-50 p-6 text-center">
                <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-green-600" />
                <h3 className="mb-1 text-lg font-bold text-green-900">{t.approvedTitle}</h3>
                <p className="text-sm text-green-800">{state.message || t.approvedMessage}</p>
                <p className="mt-2 text-xs text-green-700">{t.approvedFooter}</p>
            </div>
        );
    }

    if (state.status === "pending_review") {
        return (
            <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-6">
                <AlertCircle className="mx-auto mb-3 h-12 w-12 text-amber-600" />
                <h3 className="mb-1 text-center text-lg font-bold text-amber-900">{t.reviewTitle}</h3>
                <p className="text-center text-sm text-amber-800">{state.message}</p>
                {state.reasons && state.reasons.length > 0 && (
                    <ul className="mt-3 list-inside list-disc text-xs text-amber-700">
                        {state.reasons.map((r, i) => <li key={i}>{r}</li>)}
                    </ul>
                )}
                <p className="mt-3 text-center text-xs text-amber-700">
                    {t.reviewFooter}
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border-2 border-brand-teal/20 bg-white p-6 shadow-sm">
            <div>
                <h3 className="mb-1 text-lg font-bold text-gray-900">{t.proofTitle}</h3>
                <p className="text-xs text-gray-500">{t.proofSubtitle}</p>
            </div>

            <div>
                <label className="mb-1 block text-xs font-bold tracking-wider text-gray-500 uppercase">
                    {t.screenshotLabel}
                </label>
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-brand-teal/30 bg-brand-teal/5 px-4 py-6 text-sm font-semibold text-brand-teal hover:bg-brand-teal/10">
                    <Upload className="h-4 w-4" />
                    {file ? file.name : t.uploadCta}
                    <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={onFileChange}
                        className="hidden"
                        required
                    />
                </label>
                {preview && (
                    <img src={preview} alt="preview" className="mt-3 max-h-48 rounded-lg border border-gray-200 object-contain" />
                )}
            </div>

            <div>
                <label className="mb-1 flex items-center justify-between text-xs font-bold tracking-wider text-gray-500 uppercase">
                    <span>{t.utrLabel}</span>
                    {extracting && (
                        <span className="flex items-center gap-1 text-[10px] font-semibold text-brand-teal normal-case">
                            <Loader2 className="h-3 w-3 animate-spin" /> {t.aiReading}
                        </span>
                    )}
                    {autoFilled && !extracting && (
                        <span className="flex items-center gap-1 text-[10px] font-semibold text-green-600 normal-case">
                            <Sparkles className="h-3 w-3" /> {t.autoFilled}
                        </span>
                    )}
                </label>
                <Input
                    value={utr}
                    onChange={(e) => {
                        setUtr(e.target.value);
                        setAutoFilled(false);
                    }}
                    placeholder={extracting ? t.utrPlaceholderReading : t.utrPlaceholder}
                    required
                    maxLength={40}
                    disabled={extracting}
                    className={`font-mono ${autoFilled ? "border-green-300 bg-green-50" : ""}`}
                />
                <p className="mt-1 text-[10px] text-gray-400">
                    {autoFilled ? t.utrAutoFilledHelp : t.utrHelp}
                </p>
            </div>

            <Button
                type="submit"
                disabled={!utr || !file || state.status === "submitting"}
                className="h-12 w-full bg-brand-teal text-white hover:bg-brand-teal/90"
            >
                {state.status === "submitting" ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t.verifying}
                    </>
                ) : (
                    t.submit
                )}
            </Button>

            {state.status === "error" && (
                <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800">
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{state.message}</span>
                </div>
            )}
        </form>
    );
}
