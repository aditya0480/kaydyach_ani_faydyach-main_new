import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { BottomNav } from "@/components/bottom-nav";
import { WhatsAppFAB } from "@/components/whatsapp-fab";
import { IABManager } from "@/components/iab-manager";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col pb-20 md:pb-0">
      <IABManager />
      <Navbar />
      <main className="flex-1 pb-4">{children}</main>
      <Footer />
      <BottomNav />
      <WhatsAppFAB />
    </div>
  );
}
