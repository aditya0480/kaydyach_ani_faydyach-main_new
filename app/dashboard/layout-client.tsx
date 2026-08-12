"use client";

import {
  DashboardSidebar,
  MobileSidebar,
} from "@/components/dashboard/sidebar";

export default function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="fixed inset-0 flex h-dvh w-full overflow-hidden">
        {/* Desktop Sidebar */}
        <DashboardSidebar className="hidden shrink-0 border-r md:flex" />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          {/* Mobile Header */}
          <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-muted/40 px-6 md:hidden">
            <MobileSidebar />
            <span className="font-semibold">Dashboard</span>
          </header>

          {/* Main Content */}
          <main className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
