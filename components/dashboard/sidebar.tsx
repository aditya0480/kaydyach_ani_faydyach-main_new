"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, Settings, LogOut } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { NotificationBellButton } from "@/components/notification-bell-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { DASHBOARD_SIDEBAR_ITEMS } from "@/components/dashboard/sidebar-items";
import { cn } from "@/lib/utils";
import { SITE_URL } from "@/lib/constants/site";

function isItemActive(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardSidebar({
  className,
  onLinkClick,
}: {
  className?: string;
  onLinkClick?: () => void;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <div
      className={cn(
        "flex h-full w-64 flex-col border-r bg-background",
        className
      )}
    >
      <div className="flex h-16 items-center border-b bg-sidebar-accent/50 px-6">
        <Link href="/dashboard" className="group flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Kaydyanch"
            width={120}
            height={40}
            className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
          />
        </Link>
        <div className="ml-auto">
          <NotificationBellButton />
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        <p className="mt-2 mb-2 px-2 text-xs font-semibold tracking-wider text-muted-foreground/50 uppercase">
          Menu
        </p>
        {DASHBOARD_SIDEBAR_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = isItemActive(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onLinkClick}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-teal-50 text-teal-700"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 transition-colors",
                  isActive
                    ? "text-teal-600"
                    : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              {item.title}
              {isActive ? (
                <div className="absolute top-1/2 left-0 h-8 w-1 -translate-y-1/2 rounded-r-full bg-teal-600" />
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="border-t bg-gray-50/50 p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="group h-auto w-full justify-start border-gray-200 px-3 py-3 shadow-sm transition-all hover:border-gray-300 hover:bg-white"
            >
              <div className="flex w-full items-center gap-3 text-left">
                <Avatar className="h-9 w-9 border-2 border-white shadow-sm transition-colors group-hover:border-teal-100">
                  <AvatarImage
                    src={session?.user?.image || ""}
                    alt={session?.user?.name || ""}
                    key={session?.user?.image}
                  />
                  <AvatarFallback className="bg-teal-100 font-bold text-teal-700">
                    {session?.user?.name?.slice(0, 2).toUpperCase() || "AD"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-bold text-gray-900">
                    {session?.user?.name || "Admin User"}
                  </span>
                  <span className="truncate text-xs text-muted-foreground transition-colors group-hover:text-teal-600">
                    {session?.user?.email || "admin@kaydyanch.com"}
                  </span>
                </div>
                <Settings className="h-4 w-4 text-muted-foreground opacity-50 transition-opacity group-hover:opacity-100" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm leading-none font-medium">
                  {session?.user?.name || "Admin User"}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {session?.user?.email || "admin@kaydyanch.com"}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: `${SITE_URL}/auth/login` })}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export function MobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 border-r bg-background p-0">
        <SheetTitle className="sr-only">Dashboard Menu</SheetTitle>
        <SheetDescription className="sr-only">
          Navigation menu for the dashboard
        </SheetDescription>
        <DashboardSidebar
          onLinkClick={() => setOpen(false)}
          className="w-full border-none"
        />
      </SheetContent>
    </Sheet>
  );
}
