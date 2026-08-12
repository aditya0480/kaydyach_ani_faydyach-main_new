"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { QrDisplay } from "./qr-display";
import { ManualPaymentUploadForm } from "./upload-form";
import { getPayLabels, type PayLang } from "./labels";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    orderId: string;
    amount: number;
    onApproved?: (orderId: string) => void;
    language?: PayLang | string | null;
}

export function ManualPaymentDialog({ open, onOpenChange, orderId, amount, onApproved, language }: Props) {
    const upiVpa = process.env.NEXT_PUBLIC_UPI_VPA || "";
    const receiverName = process.env.NEXT_PUBLIC_UPI_RECEIVER_NAME || "";
    const t = getPayLabels(language);
    const [step, setStep] = useState<1 | 2>(1);

    function handleOpenChange(o: boolean) {
        if (!o) setStep(1);
        onOpenChange(o);
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-h-[95vh] max-w-md overflow-y-auto p-0">
                <DialogHeader className="border-b border-gray-100 p-3">
                    <DialogTitle className="text-center text-base font-bold">
                        {t.headerTitle(amount)}
                    </DialogTitle>
                    <div className="mt-1.5 flex items-center justify-center gap-1.5">
                        <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${step === 1 ? "bg-brand-teal text-white" : "bg-green-500 text-white"}`}>
                            {step === 2 ? <CheckCircle2 className="h-3 w-3" /> : "1"}
                        </span>
                        <div className={`h-0.5 w-8 ${step === 2 ? "bg-green-500" : "bg-gray-200"}`} />
                        <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${step === 2 ? "bg-brand-teal text-white" : "bg-gray-200 text-gray-500"}`}>
                            2
                        </span>
                        <span className="ml-2 text-[11px] font-semibold text-gray-600">
                            {step === 1 ? t.step1 : t.step2}
                        </span>
                    </div>
                </DialogHeader>

                <div className="space-y-3 p-3">
                    {step === 1 && (
                        <>
                            <QrDisplay
                                orderId={orderId}
                                amount={amount}
                                upiVpa={upiVpa}
                                receiverName={receiverName}
                                language={language}
                            />
                            <Button
                                onClick={() => setStep(2)}
                                className="h-11 w-full bg-green-600 text-sm font-bold text-white shadow hover:bg-green-700 active:scale-95"
                            >
                                <CheckCircle2 className="mr-1.5 h-4 w-4" />
                                {t.iHavePaid}
                            </Button>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <button
                                onClick={() => setStep(1)}
                                className="text-xs font-semibold text-brand-teal hover:underline"
                            >
                                {t.stepBack}
                            </button>
                            <ManualPaymentUploadForm orderId={orderId} onApproved={onApproved} language={language} />
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
