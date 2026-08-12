"use client";

import { DataTable } from "@/components/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Mail, Shield, User as UserIcon, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface User {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
    isVerified: boolean;
    createdAt: Date;
}

const columns: ColumnDef<User>[] = [
    {
        accessorKey: "name",
        header: "User",
        cell: ({ row }) => {
            const user = row.original;
            return (
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-teal/10 text-brand-teal">
                        <UserIcon className="h-5 w-5" />
                    </div>
                    <div className="font-bold text-gray-900">{user.name || "Anonymous"}</div>
                </div>
            )
        }
    },
    {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => (
            <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-3.5 w-3.5" />
                {row.getValue("email")}
            </div>
        )
    },
    {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => {
            const role = row.getValue("role") as string;
            return (
                <Badge variant={role === "ADMIN" ? "default" : "secondary"} className="font-bold">
                    <Shield className="mr-1 h-3 w-3" />
                    {role}
                </Badge>
            )
        }
    },
    {
        accessorKey: "isVerified",
        header: "Status",
        cell: ({ row }) => {
            const isVerified = row.getValue("isVerified") as boolean;
            return (
                <Badge variant={isVerified ? "default" : "outline"} className={isVerified ? "bg-green-100 text-green-700 hover:bg-green-100" : "text-[10px] text-gray-500 uppercase"}>
                    {isVerified ? "Verified" : "Unverified"}
                </Badge>
            )
        }
    },
    {
        accessorKey: "createdAt",
        header: "Joined",
        cell: ({ row }) => {
            const date = row.getValue("createdAt") as Date;
            return (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    {format(new Date(date), "MMM d, yyyy")}
                </div>
            )
        }
    },
    {
        id: "actions",
        cell: ({ row: _row }) => (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem>View Details</DropdownMenuItem>
                    <DropdownMenuItem>Manage Subscriptions</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">Suspend User</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        ),
    },
];

export function UsersClient({ users }: { users: User[] }) {
    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <DataTable
                columns={columns}
                data={users}
                searchKey="email"
                placeholder="Search by email..."
                pageSize={10}
            />
        </div>
    );
}
