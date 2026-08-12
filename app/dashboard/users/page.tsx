import { prisma_db } from "@/lib/prisma";
import { UsersClient } from "./users-client";
import { Users, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = 'force-dynamic';

export default async function UsersPage() {
  const users = await prisma_db.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isVerified: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 p-4 pt-6 duration-500 md:p-8">
      <div className="flex flex-col justify-between gap-4 border-b pb-6 md:flex-row md:items-center">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-brand-teal">
            <Users className="h-8 w-8" />
            User Management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            View and manage registered users and their permissions.<br />
            <span className="opacity-80">नोंदणीकृत वापरकर्ते आणि त्यांच्या परवानग्या व्यवस्थापित करा.</span>
          </p>
        </div>
        <Button className="bg-brand-teal shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-brand-teal/90">
          <UserPlus className="mr-2 h-4 w-4" /> Add New Admin
        </Button>
      </div>

      <UsersClient users={users} />
    </div>
  );
}
