import Link from "next/link";
import { Button } from "@/components/ui/button";
import { WifiOff } from "lucide-react";

export default function OfflinePage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-foreground">
            <div className="max-w-md space-y-6 text-center">
                <div className="flex justify-center">
                    <div className="rounded-full bg-brand-teal/10 p-6">
                        <WifiOff className="h-16 w-16 text-brand-teal" />
                    </div>
                </div>
                <h1 className="text-3xl font-bold text-brand-teal">You are offline</h1>
                <p className="text-lg text-muted-foreground">
                    It looks like you don&apos;t have an active internet connection. Please check your settings and try again.
                </p>
                <div className="pt-4">
                    <Button asChild className="h-12 rounded-full bg-brand-teal px-8 font-bold text-white hover:bg-brand-teal/90">
                        <Link href="/">Try Again</Link>
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground italic opacity-60">
                    Kaydyachaanifaydyach • Offline Mode
                </p>
            </div>
        </div>
    );
}
