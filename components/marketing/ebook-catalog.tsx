"use client";

import { useState } from "react";
import { Search, X, Home, Gavel, FileText, Scale, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { EbookCard } from "./ebook-card";
import { Button } from "@/components/ui/button";

interface Ebook {
    id: string;
    displayId: number;
    title: string;
    description: string;
    price: string; // Serialized Decimal
    coverImage: string | null;
    createdAt: Date;
    category: string | null;
    language: string;
    isCombo?: boolean;
    pages?: number | null;
}

const LANGUAGE_LABELS: Record<string, string> = {
    MARATHI: "मराठी",
    HINDI: "हिंदी",
    ENGLISH: "English",
};

export function EbookCatalog({ initialEbooks }: { initialEbooks: Ebook[] }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [idSearchQuery, setIdSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [selectedLanguage, setSelectedLanguage] = useState("All");

    // Category Icons mapping
    const categoryIcons: Record<string, React.ReactNode> = {
        "All": <Home className="h-3.5 w-3.5" />,
        "Civil Law": <Scale className="h-3.5 w-3.5" />,
        "Property Law": <Home className="h-3.5 w-3.5" />,
        "Criminal Law": <Gavel className="h-3.5 w-3.5" />,
        "Legal Guides": <FileText className="h-3.5 w-3.5" />,
        "Default": <BookOpen className="h-3.5 w-3.5" />
    };

    // Extract unique categories from ebooks
    const categories = ["All", ...Array.from(new Set(initialEbooks.map(e => e.category).filter(Boolean)))];

    // Derive language options from actual data (only show tabs that have books)
    const availableLanguages = Array.from(new Set(initialEbooks.map(e => e.language).filter(Boolean)));
    const showLanguageTabs = availableLanguages.length > 1;

    const filteredEbooks = initialEbooks.filter((ebook) => {
        const normalizedQuery = searchQuery.toLowerCase().trim();
        const normalizedIdQuery = idSearchQuery.trim();

        const matchesSearch = normalizedQuery === "" || (
            ebook.title.toLowerCase().includes(normalizedQuery) ||
            ebook.description.toLowerCase().includes(normalizedQuery)
        );

        const matchesId = normalizedIdQuery === "" || ebook.displayId.toString() === normalizedIdQuery;
        const matchesCategory = selectedCategory === "All" || ebook.category === selectedCategory;
        const matchesLanguage = selectedLanguage === "All" || ebook.language === selectedLanguage;

        return matchesSearch && matchesId && matchesCategory && matchesLanguage;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-6">
                {/* Search Header */}
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                    <p className="hidden text-sm font-medium whitespace-nowrap text-muted-foreground lg:block">
                        Showing {filteredEbooks.length} books
                    </p>

                    <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
                        {/* ID Search */}
                        <div className="group relative w-full sm:w-35">
                            <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center transition-colors group-focus-within:text-brand-teal">
                                <span className="text-xs font-bold text-gray-400 group-focus-within:text-brand-teal">ID</span>
                            </div>
                            <Input
                                placeholder="Book ID"
                                className="h-11 rounded-xl border-gray-200 bg-gray-50 pr-8 pl-9 text-sm shadow-sm transition-all focus:bg-white focus-visible:ring-brand-teal"
                                value={idSearchQuery}
                                onChange={(e) => {
                                    // Only allow numbers
                                    const val = e.target.value;
                                    if (val === '' || /^\d+$/.test(val)) {
                                        setIdSearchQuery(val);
                                    }
                                }}
                                type="tel" // triggers numeric keypad on mobile
                            />
                            {idSearchQuery && (
                                <button
                                    onClick={() => setIdSearchQuery("")}
                                    className="absolute inset-y-0 right-3 flex items-center text-gray-400 transition-colors hover:text-brand-teal"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </div>

                        {/* Main Search */}
                        <div className="group relative w-full sm:w-87.5">
                            <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center transition-colors group-focus-within:text-brand-teal">
                                <Search className="h-4 w-4 text-gray-400 group-focus-within:text-brand-teal" />
                            </div>
                            <Input
                                placeholder="Search by book name or topic..."
                                className="h-11 rounded-xl border-gray-200 bg-gray-50 pr-9 pl-9 text-sm shadow-sm transition-all focus:bg-white focus-visible:ring-brand-teal"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute inset-y-0 right-3 flex items-center text-gray-400 transition-colors hover:text-brand-teal"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Language Tabs - only shown when multiple languages exist */}
                {showLanguageTabs && (
                    <div className="hide-scrollbar -mx-4 flex flex-nowrap gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
                        {(["All", ...availableLanguages] as string[]).map((lang) => (
                            <button
                                key={lang}
                                onClick={() => setSelectedLanguage(lang)}
                                className={`rounded-full border px-4 py-1.5 text-xs font-bold whitespace-nowrap transition-all ${
                                    selectedLanguage === lang
                                        ? "border-brand-gold bg-brand-gold text-brand-teal"
                                        : "border-gray-200 bg-white text-gray-500 hover:border-brand-gold/50 hover:bg-amber-50"
                                }`}
                            >
                                {lang === "All" ? "सर्व भाषा" : (LANGUAGE_LABELS[lang] ?? lang)}
                            </button>
                        ))}
                    </div>
                )}

                {/* Category Chips - Scrollable on mobile */}
                {categories.length > 1 && (
                    <div className="hide-scrollbar -mx-4 flex flex-nowrap gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0 sm:pb-0">
                        {categories.map((cat) => (
                            <button
                                key={cat as string}
                                onClick={() => setSelectedCategory(cat as string)}
                                className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-bold whitespace-nowrap shadow-sm transition-all ${selectedCategory === cat
                                    ? "scale-105 border-brand-teal bg-brand-teal text-white"
                                    : "border-gray-200 bg-white text-gray-600 hover:border-brand-teal/50 hover:bg-gray-50"
                                    }`}
                            >
                                {cat === "All" ? categoryIcons["All"] : (categoryIcons[cat as string] || categoryIcons["Default"])}
                                {cat as string}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Compact Grid */}
            {filteredEbooks.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-6">
                    {filteredEbooks.map((ebook) => (
                        <div key={ebook.id} className="animate-in fade-in zoom-in-95 h-full duration-300">
                            <EbookCard ebook={ebook} searchQuery={searchQuery} className="h-full" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 py-16 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white p-3 shadow-sm">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <p className="text-sm text-muted-foreground">No books found matching criteria</p>
                    <Button
                        variant="link"
                        className="mt-1 h-auto p-0 text-xs text-brand-teal"
                        onClick={() => { setSearchQuery(""); setSelectedCategory("All"); setSelectedLanguage("All"); }}
                    >
                        Clear Filters
                    </Button>
                </div>
            )}
        </div>
    );
}
