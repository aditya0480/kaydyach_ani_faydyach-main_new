"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, Book } from "lucide-react";
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface Ebook {
    id: string;
    displayId: number;
    title: string;
    description: string;
    coverImage: string | null;
    category: string | null;
    price: string;
}

export function GlobalSearch({
    className,
    triggerClassName,
    variant = "default"
}: {
    className?: string,
    triggerClassName?: string,
    variant?: "default" | "icon"
}) {
    const [open, setOpen] = React.useState(false);
    const [ebooks, setEbooks] = React.useState<Ebook[]>([]);
    const [search, setSearch] = React.useState("");
    const [isLoading, setIsLoading] = React.useState(false);
    const router = useRouter();

    // We no longer need client-side filtering
    const filteredEbooks = ebooks;

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const fetchEbooks = React.useCallback(async (query: string) => {
        setIsLoading(true);
        try {
            const url = query ? `/api/search?q=${encodeURIComponent(query)}` : "/api/search";
            const response = await fetch(url);
            const data = await response.json();
            setEbooks(data);
        } catch (error) {
            console.error("Failed to fetch ebooks for search", error);
        } finally {
            setIsLoading(false);
        }
    }, [setIsLoading]);

    // Handle debounced search
    React.useEffect(() => {
        if (!open) return;

        const handler = setTimeout(() => {
            fetchEbooks(search);
        }, 300); // 300ms debounce

        return () => clearTimeout(handler);
    }, [search, open, fetchEbooks]);

    const runCommand = React.useCallback((command: () => void) => {
        setOpen(false);
        setSearch("");
        command();
    }, []);

    if (variant === "icon") {
        return (
            <>
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn("text-brand-teal hover:bg-brand-teal/5", className)}
                    onClick={() => setOpen(true)}
                    aria-label="Search"
                >
                    <Search className="h-5 w-5 animate-pulse" />
                </Button>
                <DialogContentWrapper open={open} setOpen={setOpen} search={search} setSearch={setSearch} isLoading={isLoading} filteredEbooks={filteredEbooks} runCommand={runCommand} router={router} />
            </>
        )
    }

    return (
        <div className={cn("relative w-full max-w-sm", className)}>
            <Button
                variant="outline"
                className={cn(
                    "relative h-10 w-full justify-start rounded-xl border-gray-200 bg-gray-50 text-sm font-normal text-muted-foreground shadow-sm transition-all hover:border-brand-teal hover:bg-white focus-visible:ring-brand-teal md:pr-12",
                    triggerClassName
                )}
                onClick={() => setOpen(true)}
            >

                <span className="hidden lg:inline-flex">पुस्तके शोधा (Search books)...</span>
                <span className="inline-flex lg:hidden">शोधा (Search)...</span>
                <kbd className="pointer-events-none absolute top-[50%] right-3 hidden h-5 -translate-y-1/2 items-center gap-1 rounded border bg-white px-1.5 font-mono text-[10px] font-medium opacity-60 select-none md:flex">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </Button>
            <DialogContentWrapper open={open} setOpen={setOpen} search={search} setSearch={setSearch} isLoading={isLoading} filteredEbooks={filteredEbooks} runCommand={runCommand} router={router} />
        </div>
    );
}

function DialogContentWrapper({
    open,
    setOpen,
    search,
    setSearch,
    isLoading,
    filteredEbooks,
    runCommand,
    router
}: {
    open: boolean,
    setOpen: (open: boolean) => void,
    search: string,
    setSearch: (search: string) => void,
    isLoading: boolean,
    filteredEbooks: Ebook[],
    runCommand: (command: () => void) => void,
    router: ReturnType<typeof useRouter>
}) {
    return (
        <CommandDialog
            open={open}
            onOpenChange={setOpen}
            className="fixed inset-0 top-0 left-0 z-50 m-0 h-full w-full max-w-none translate-x-0 translate-y-0 rounded-none border-none shadow-none md:fixed md:top-[50%] md:left-[50%] md:m-0 md:h-auto md:w-full md:max-w-lg md:translate-x-[-50%] md:translate-y-[-50%] md:rounded-xl md:border md:shadow-xl"
        >
            <CommandInput
                placeholder="पुस्तकाचे नाव किंवा आयडी टाका (Type book name or ID)..."
                value={search}
                onValueChange={setSearch}
                className="h-14 pr-12 text-base md:h-12 md:text-sm"
            />
            <CommandList className="max-h-full! md:max-h-75">
                <CommandEmpty className="py-10 text-center">
                    <p className="text-lg font-semibold text-gray-900">काहीही सापडले नाही 😞</p>
                    <p className="mt-1 text-sm text-muted-foreground">No results found for &quot;{search}&quot;</p>
                </CommandEmpty>

                {isLoading ? (
                    <div className="flex animate-pulse flex-col items-center gap-3 p-8 text-center text-sm text-muted-foreground">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-teal border-t-transparent" />
                        <span>पुस्तके शोधत आहोत (Searching)...</span>
                    </div>
                ) : (
                    <CommandGroup heading="पुस्तके (Ebooks)" className="pb-20 md:pb-0">
                        {filteredEbooks.map((ebook) => (
                            <CommandItem
                                key={ebook.id}
                                value={`${ebook.displayId} ${ebook.title} ${ebook.category}`}
                                onSelect={() => {
                                    runCommand(() => router.push(`/ebooks/${ebook.id}`));
                                }}
                                className="mb-1 flex cursor-pointer items-start gap-4 rounded-xl border-b border-gray-50 p-3 transition-colors last:border-0 hover:bg-brand-teal/5 md:p-2.5"
                            >
                                <div className="relative h-20 w-14 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-100 shadow-sm transition-colors group-hover:border-brand-teal/30 md:h-14 md:w-10 md:rounded-md">
                                    {/* ID Badge */}
                                    <div className="absolute top-0 left-0 z-10 rounded-br-md border-r border-b border-white/20 bg-brand-teal px-1.5 py-0.5 text-[10px] font-black text-white shadow-sm md:text-[9px]">
                                        {ebook.displayId}
                                    </div>
                                    {ebook.coverImage ? (
                                        <Image
                                            src={ebook.coverImage}
                                            alt={ebook.title}
                                            fill
                                            className="object-cover transition-transform duration-300 group-hover:scale-110"
                                            sizes="60px"
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center">
                                            <Book className="h-5 w-5 text-gray-300 md:h-4 md:w-4" />
                                        </div>
                                    )}
                                </div>

                                <div className="flex min-w-0 flex-1 flex-col gap-1 pt-0.5">
                                    <h4 className="line-clamp-2 text-base leading-tight font-bold text-gray-900 transition-colors group-hover:text-brand-teal md:line-clamp-1 md:text-sm">
                                        {ebook.title}
                                    </h4>
                                    <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground opacity-80">
                                        {ebook.description.replace(/<[^>]*>?/gm, '').substring(0, 100)}...
                                    </p>
                                    <div className="mt-1 flex items-center gap-2 md:hidden">
                                        <span className="rounded-full border border-gray-200 bg-gray-100 px-2 py-0.5 text-[10px] font-medium tracking-wide text-gray-600 uppercase">
                                            Ebook
                                        </span>
                                        {ebook.category && (
                                            <span className="rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-600">
                                                {ebook.category}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-1 self-start pt-1">
                                    <div className="rounded-lg border border-brand-teal/10 bg-brand-teal/5 px-2.5 py-1 text-base font-black whitespace-nowrap text-brand-teal md:text-sm">
                                        ₹{ebook.price}
                                    </div>
                                </div>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                )}
            </CommandList>
        </CommandDialog>
    );
}
