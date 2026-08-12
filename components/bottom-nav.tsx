"use client";

import Link from "next/link";
import { Home, BookOpen, Sparkles, Download } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="pb-safe fixed right-0 bottom-0 left-0 z-50 border-t border-gray-100 bg-white/95 shadow-[0_-4px_20px_rgba(0,0,0,0.04)] backdrop-blur-md md:hidden">
      <div className="flex h-14 items-center justify-around px-1">
        <NavItem
          href="/"
          icon={Home}
          label="मुख्यपृष्ठ"
          active={isActive("/")}
        />

        <NavItem
          href="/ebooks"
          icon={BookOpen}
          label="ई-बुक्स"
          active={isActive("/ebooks")}
        />

        <NavItem
          href="/combos"
          icon={Sparkles}
          label="कॉम्बो"
          active={isActive("/combos")}
          special={true}
        />


        <NavItem
          href="/my-books"
          icon={Download}
          label="माझी पुस्तके"
          active={isActive("/my-books")}
        />
      </div>
    </nav>
  );
}

const NavItem = ({
  href,
  icon: Icon,
  label,
  active,
  special = false,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  active: boolean;
  special?: boolean;
}) => (
  <Link
    href={href}
    className={cn(
      "flex h-full flex-1 flex-col items-center justify-center gap-0.5 transition-all active:scale-95",
      active ? "text-brand-teal" : "text-gray-500 hover:text-brand-teal",
    )}
  >
    <div
      className={cn(
        "flex items-center justify-center rounded-xl px-3 py-1 transition-all",
        active ? "bg-brand-teal/10" : "bg-transparent",
        special && !active && "text-brand-gold",
      )}
    >
      <Icon
        className={cn(
          "h-5 w-5",
          active && "fill-current",
          special && !active && "animate-pulse fill-brand-gold",
        )}
      />
    </div>
    <span className={cn("text-[9px]", active ? "font-bold" : "font-medium")}>
      {label}
    </span>
  </Link>
);
