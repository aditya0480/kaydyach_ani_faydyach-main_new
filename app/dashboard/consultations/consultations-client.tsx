"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { consultationCategoryLabel } from "@/lib/constants/consultation-categories";

interface ConsultationBooking {
    id: string;
    name: string;
    mobile: string;
    category: string;
    description: string | null;
    amount: number;
    status: string;
    createdAt: string;
}

const STATUS_STYLES: Record<string, string> = {
    PAID: "bg-green-50 text-green-700 border-green-200",
    PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
    PENDING_VERIFICATION: "bg-yellow-50 text-yellow-700 border-yellow-200",
    FAILED: "bg-red-50 text-red-700 border-red-200",
    CANCELLED: "bg-gray-50 text-gray-500 border-gray-200",
};

export function ConsultationsClient({ bookings }: { bookings: ConsultationBooking[] }) {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    const filtered = useMemo(() => {
        return bookings.filter((b) => {
            const matchesStatus = statusFilter === "all" || b.status === statusFilter;
            const q = search.trim().toLowerCase();
            const matchesSearch =
                !q || b.name.toLowerCase().includes(q) || b.mobile.includes(q);
            return matchesStatus && matchesSearch;
        });
    }, [bookings, search, statusFilter]);

    return (
        <div className="space-y-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search by name or mobile..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-8"
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-40">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All statuses</SelectItem>
                        <SelectItem value="PAID">Paid</SelectItem>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="FAILED">Failed</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Mobile</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                                    No consultation bookings found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((b) => (
                                <TableRow key={b.id}>
                                    <TableCell className="font-medium">{b.name}</TableCell>
                                    <TableCell>{b.mobile}</TableCell>
                                    <TableCell>{consultationCategoryLabel(b.category)}</TableCell>
                                    <TableCell className="max-w-60 truncate" title={b.description ?? ""}>
                                        {b.description || <span className="text-muted-foreground">—</span>}
                                    </TableCell>
                                    <TableCell>₹{b.amount}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={STATUS_STYLES[b.status] ?? ""}>
                                            {b.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-xs whitespace-nowrap text-muted-foreground">
                                        {format(new Date(b.createdAt), "dd MMM yyyy, hh:mm a")}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
