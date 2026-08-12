import type { LucideIcon } from "lucide-react";
import {
  BarChart,
  BookOpen,
  FileText,
  Gavel,
  LayoutDashboard,
  LineChart,
  Settings,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";

export type DashboardSidebarItem = {
  title: string;
  href: string;
  icon: LucideIcon;
};

export const DASHBOARD_SIDEBAR_ITEMS: DashboardSidebarItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Ebooks",
    href: "/dashboard/ebooks",
    icon: BookOpen,
  },
  {
    title: "Orders",
    href: "/dashboard/orders",
    icon: ShoppingCart,
  },
  {
    title: "Users",
    href: "/dashboard/users",
    icon: Users,
  },
  {
    title: "Consultations",
    href: "/dashboard/consultations",
    icon: Gavel,
  },
  {
    title: "Inputs",
    href: "/dashboard/inputs",
    icon: FileText,
  },
  {
    title: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart,
  },
  {
    title: "Sales Analytics",
    href: "/dashboard/sales-analytics",
    icon: TrendingUp,
  },
  {
    title: "Ad Performance",
    href: "/dashboard/ad-performance",
    icon: LineChart,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];
