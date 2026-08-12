"use client";

import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function RefreshButton() {
    const router = useRouter();
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = () => {
        setIsRefreshing(true);
        router.refresh();
        // Since router.refresh is async but doesn't return a promise we can await,
        // we'll just set a timeout to stop the spinner for UX.
        // In reality, the page might swap out before this finishes if the refresh is fast,
        // but since it's a client component in a server page, it should persist unless the parent unmounts.
        setTimeout(() => {
            setIsRefreshing(false);
            toast.success("Orders list updated");
        }, 2000);
    };

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-9 gap-2 bg-white"
        >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
        </Button>
    );
}
