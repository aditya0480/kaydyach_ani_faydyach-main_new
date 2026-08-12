import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import DashboardLayoutClient from "./layout-client";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Redirect to login if not authenticated
  if (!session?.user) {
    redirect("/auth/login");
  }

  // Redirect to verify OTP if email not verified
  // Skip verification check for OAuth users (Google, GitHub, etc.)
  const isOAuthUser =
    session.user.provider && session.user.provider !== "credentials";
  if (!session.user.isVerified && !isOAuthUser) {
    redirect(
      "/auth/verify-otp?email=" + encodeURIComponent(session.user.email)
    );
  }

  // Restrict to ADMIN only
  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
