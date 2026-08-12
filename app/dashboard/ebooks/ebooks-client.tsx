"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { BookOpen, Edit, Eye, Trash2, Plus, Search, Filter, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";

interface Ebook {
    id: string;
    displayId: number;
    title: string;
    description: string;
    price: number;
    coverImage: string | null;
    isEnabled: boolean;
    _count: {
        orderItems: number;
    };
}

interface EbooksClientProps {
    ebooks: Ebook[];
}

export function EbooksClient({ ebooks }: EbooksClientProps) {
    const router = useRouter();
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [togglingId, setTogglingId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "active" | "disabled">("all");

    const handleToggleStatus = async (id: string, currentStatus: boolean, title: string) => {
        setTogglingId(id);
        const newStatus = !currentStatus;

        try {
            const formData = new FormData();
            formData.append("isEnabled", String(newStatus));

            const response = await fetch(`/api/admin/ebooks/${id}`, {
                method: "PUT",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Failed to update status");
            }

            toast.success(newStatus ? `"${title}" is now Active` : `"${title}" is now Disabled`);
            router.refresh();
        } catch (error) {
            toast.error("Failed to update status");
            console.error(error);
        } finally {
            setTogglingId(null);
        }
    };

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
            return;
        }

        setDeletingId(id);
        try {
            const response = await fetch(`/api/admin/ebooks/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Failed to delete ebook");
            }

            toast.success("Ebook deleted successfully");
            router.refresh();
        } catch (error) {
            toast.error("Something went wrong");
            console.error(error);
        } finally {
            setDeletingId(null);
        }
    };

    const stripHtml = (html: string) => {
        return html.replace(/<[^>]*>?/gm, '');
    };

    const filteredEbooks = ebooks.filter(ebook => {
        const matchesSearch = ebook.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ebook.displayId.toString().includes(searchQuery);
        const matchesStatus = statusFilter === "all" ||
            (statusFilter === "active" && ebook.isEnabled) ||
            (statusFilter === "disabled" && !ebook.isEnabled);
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6">
            {/* Filters Section */}
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search by title or ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-10 rounded-xl border-gray-200 bg-white pl-9 shadow-sm transition-colors focus:border-[#0A2342] focus:bg-white"
                    />
                </div>

                <div className="flex w-full items-center gap-2 sm:w-auto">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="ml-auto h-10 w-full gap-2 rounded-xl border-gray-200 bg-white shadow-sm sm:w-auto">
                                <Filter className="h-4 w-4" />
                                <span className="capitalize">{statusFilter === 'all' ? 'All Status' : statusFilter}</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl">
                            <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuRadioGroup value={statusFilter} onValueChange={(v) => setStatusFilter(v as "all" | "active" | "disabled")}>
                                <DropdownMenuRadioItem value="all">All Ebooks</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="active">Active Only</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="disabled">Disabled Only</DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Ebooks List - Horizontal Cards */}
            <div className="flex flex-col gap-4">
                {filteredEbooks.map((ebook) => (
                    <div
                        key={ebook.id}
                        className={cn(
                            "group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-200 hover:shadow-md sm:flex-row",
                            !ebook.isEnabled && "bg-gray-50/50"
                        )}
                    >
                        {/* Image Section - Left Side */}
                        <div className="relative aspect-4/3 w-full shrink-0 border-b border-gray-100 bg-gray-100 sm:aspect-auto sm:w-48 sm:border-r sm:border-b-0">
                            {ebook.coverImage ? (
                                <Image
                                    src={ebook.coverImage}
                                    alt={ebook.title}
                                    width={192}
                                    height={144}
                                    className={cn(
                                        "h-full w-full object-cover transition-transform duration-500",
                                        !ebook.isEnabled && "opacity-70 grayscale"
                                    )}
                                />
                            ) : (
                                <div className="flex h-full w-full flex-col items-center justify-center bg-gray-50 text-gray-400">
                                    <BookOpen className="mb-2 h-10 w-10 opacity-50" />
                                    <span className="text-xs font-semibold">No Cover</span>
                                </div>
                            )}

                            {/* ID Badge - Top Left */}
                            <div className="absolute top-2 left-2 z-10">
                                <Badge variant="secondary" className="h-5 border-transparent bg-black/50 px-1.5 font-mono text-[10px] text-white backdrop-blur-md hover:bg-black/60">
                                    #{ebook.displayId}
                                </Badge>
                            </div>

                            {/* Status Badge - Mobile Only */}
                            <div className="absolute top-2 right-2 z-10 sm:hidden">
                                {ebook.isEnabled ? (
                                    <Badge className="h-5 border-transparent bg-white/90 px-1.5 text-[10px] text-green-700 shadow-sm backdrop-blur-md hover:bg-white">
                                        Active
                                    </Badge>
                                ) : (
                                    <Badge variant="destructive" className="h-5 border border-gray-200 bg-white/90 px-1.5 text-[10px] text-gray-500 shadow-sm backdrop-blur-md hover:bg-white">
                                        Disabled
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {/* Content Section - Right Side */}
                        <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
                            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                                <div className="min-w-0 flex-1 space-y-1.5">
                                    <div className="flex items-center gap-2">
                                        <Link
                                            href={`/dashboard/ebooks/${ebook.id}`}
                                            className={cn(
                                                "line-clamp-1 text-lg leading-tight font-bold transition-colors hover:text-[#0A2342]",
                                                ebook.isEnabled ? "text-[#0A2342]" : "text-muted-foreground"
                                            )}
                                            title={ebook.title}
                                        >
                                            {ebook.title}
                                        </Link>
                                        {/* Status Badge - Desktop */}
                                        <div className="hidden sm:block">
                                            {!ebook.isEnabled && (
                                                <Badge variant="outline" className="h-5 border-gray-200 bg-gray-50 px-1.5 text-[10px] text-gray-500">
                                                    Disabled
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    <p className="line-clamp-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                                        {stripHtml(ebook.description)}
                                    </p>
                                </div>

                                {/* Toggle Switch - Desktop */}
                                <div className="hidden shrink-0 items-center gap-2 rounded-full border border-gray-100 bg-gray-50 px-2 py-1 sm:flex">
                                    <span className={cn("text-[10px] font-bold tracking-wider uppercase", ebook.isEnabled ? "text-green-600" : "text-gray-400")}>
                                        {ebook.isEnabled ? "Active" : "Off"}
                                    </span>
                                    <Switch
                                        checked={ebook.isEnabled}
                                        onCheckedChange={() => handleToggleStatus(ebook.id, ebook.isEnabled, ebook.title)}
                                        disabled={togglingId === ebook.id}
                                        className="scale-75 data-[state=checked]:bg-green-600"
                                    />
                                </div>
                            </div>

                            <div className="mt-auto flex flex-col justify-between gap-4 pt-4 sm:flex-row sm:items-end">
                                {/* Stats */}
                                <div className="flex items-center gap-6 text-sm">
                                    <div className="flex flex-col">
                                        <span className="mb-0.5 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">Price</span>
                                        <span className="text-lg font-bold text-[#0A2342]">₹{Number(ebook.price)}</span>
                                    </div>
                                    <div className="hidden h-8 w-px bg-gray-100 sm:block"></div>
                                    <div className="flex flex-col">
                                        <span className="mb-0.5 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">Sales</span>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-lg font-bold text-[#0A2342]">{ebook._count.orderItems}</span>
                                            <span className="text-xs font-medium text-muted-foreground">copies</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="mt-2 flex items-center justify-end gap-2 border-t border-gray-100 pt-3 sm:mt-0 sm:border-t-0 sm:pt-0">
                                    {/* Mobile Status Toggle */}
                                    <div className="mr-auto flex items-center gap-2 sm:hidden">
                                        <span className="text-xs font-medium text-muted-foreground">Status</span>
                                        <Switch
                                            checked={ebook.isEnabled}
                                            onCheckedChange={() => handleToggleStatus(ebook.id, ebook.isEnabled, ebook.title)}
                                            disabled={togglingId === ebook.id}
                                            className="scale-75 data-[state=checked]:bg-green-600"
                                        />
                                    </div>

                                    <Button variant="outline" size="sm" asChild className="h-8 gap-1.5 px-3 text-xs font-medium hover:bg-gray-50 hover:text-[#0A2342]">
                                        <Link href={`/ebooks/${ebook.id}`} target="_blank">
                                            <Eye className="h-3.5 w-3.5" /> View
                                        </Link>
                                    </Button>
                                    <Button variant="outline" size="sm" asChild className="h-8 gap-1.5 px-3 text-xs font-medium hover:border-[#FFD301] hover:bg-[#FFD301]/10 hover:text-[#0A2342]">
                                        <Link href={`/dashboard/ebooks/${ebook.id}`}>
                                            <Edit className="h-3.5 w-3.5" /> Edit
                                        </Link>
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-600"
                                        onClick={() => handleDelete(ebook.id, ebook.title)}
                                        disabled={deletingId === ebook.id}
                                    >
                                        {deletingId === ebook.id ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Trash2 className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {filteredEbooks.length === 0 && (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-20 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 text-muted-foreground">
                        {searchQuery ? <Search className="h-8 w-8 opacity-50" /> : <BookOpen className="h-8 w-8 opacity-50" />}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">
                        {searchQuery ? "No matching ebooks found" : "No Ebooks Yet"}
                    </h3>
                    <p className="mx-auto mt-2 mb-6 max-w-sm text-sm text-muted-foreground">
                        {searchQuery
                            ? "Try adjusting your search terms or filters."
                            : "Start selling by adding your first digital product to the library."}
                    </p>
                    {searchQuery ? (
                        <Button
                            variant="outline"
                            onClick={() => { setSearchQuery(""); setStatusFilter("all"); }}
                            className="rounded-full"
                        >
                            Clear Filters
                        </Button>
                    ) : (
                        <Button asChild className="rounded-full bg-[#0A2342] hover:bg-[#0A2342]/90">
                            <Link href="/dashboard/ebooks/new">
                                <Plus className="mr-2 h-4 w-4" /> Create First Ebook
                            </Link>
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}
