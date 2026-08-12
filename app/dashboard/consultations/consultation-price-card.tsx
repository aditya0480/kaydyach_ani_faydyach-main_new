"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Loader2, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function ConsultationPriceCard({ initialPrice }: { initialPrice: number }) {
    const [price, setPrice] = useState(initialPrice);
    const [editing, setEditing] = useState(false);
    const [value, setValue] = useState(String(initialPrice));
    const [saving, setSaving] = useState(false);

    async function handleSave() {
        const parsed = Number(value);
        if (!Number.isFinite(parsed) || parsed < 1) {
            toast.error("Enter a valid price");
            return;
        }

        setSaving(true);
        try {
            const res = await fetch("/api/admin/consultation-price", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ price: parsed }),
            });
            if (!res.ok) throw new Error(await res.text());
            const data = await res.json();
            setPrice(data.price);
            setValue(String(data.price));
            setEditing(false);
            toast.success("Consultation price updated");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to update price");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <div>
                <p className="text-xs font-medium text-muted-foreground">Consultation Price</p>
                {editing ? (
                    <div className="mt-1.5 flex items-center gap-2">
                        <span className="text-lg font-bold text-[#0A2342]">₹</span>
                        <Input
                            type="number"
                            min={1}
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            className="h-9 w-28"
                            autoFocus
                        />
                        <Button size="sm" onClick={handleSave} disabled={saving}>
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => { setEditing(false); setValue(String(price)); }}>
                            Cancel
                        </Button>
                    </div>
                ) : (
                    <p className="mt-1 text-2xl font-bold text-[#0A2342]">₹{price}</p>
                )}
            </div>
            {!editing && (
                <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                </Button>
            )}
        </div>
    );
}
