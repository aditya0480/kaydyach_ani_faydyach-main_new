
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Loading() {
    return (
        <div className="min-h-screen bg-background pb-32 md:pb-12">
            {/* Breadcrumb / Back Navigation context */}
            <div className="sticky top-0 z-30 border-b border-gray-100 bg-white/80 backdrop-blur-md">
                <div className="container mx-auto flex h-12 items-center px-4 md:h-14">
                    <Button variant="ghost" disabled className="-ml-2 h-auto py-2 text-muted-foreground">
                        <span className="flex items-center gap-2 text-xs md:text-sm">
                            <ArrowLeft className="h-4 w-4" /> Back to Store (सर्व पुस्तके)
                        </span>
                    </Button>
                </div>
            </div>

            <div className="container mx-auto max-w-6xl px-4 py-4 md:py-6">
                <div className="grid gap-4 lg:grid-cols-12 lg:gap-10">

                    {/* Left Column: Visuals Skeleton */}
                    <div className="space-y-4 md:space-y-6 lg:col-span-4">
                        {/* Ebook Gallery Skeleton */}
                        <div className="space-y-4">
                            <div className="relative aspect-3/4 w-full overflow-hidden rounded-xl bg-gray-100 shadow-sm">
                                <Skeleton className="h-full w-full bg-gray-200" />
                            </div>
                            {/* Thumbnails */}
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {[1, 2, 3].map((i) => (
                                    <Skeleton key={i} className="h-20 w-16 shrink-0 rounded-md bg-gray-200" />
                                ))}
                            </div>
                        </div>

                        {/* Preview Section Skeleton */}
                        <div className="pt-2">
                            <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-gray-300 md:mb-3 md:text-base">
                                <BookOpen className="h-4 w-4 text-gray-200" />
                                <Skeleton className="h-4 w-32 bg-gray-200" />
                            </h3>
                            <Skeleton className="h-10 w-full rounded-full bg-gray-200" />
                        </div>
                    </div>

                    {/* Right Column: Details Skeleton */}
                    <div className="flex h-fit flex-col items-start lg:sticky lg:top-20 lg:col-span-8">

                        {/* Title & Price Header Skeleton */}
                        <div className="mb-4 w-full border-b border-gray-100 pb-4 md:mb-6 md:pb-6">
                            <div className="mb-2 flex flex-wrap items-center gap-2 md:mb-3">
                                <Skeleton className="h-5 w-24 rounded-full bg-gray-200" />
                                <Skeleton className="h-5 w-20 rounded-full bg-gray-200" />
                                <Skeleton className="h-5 w-16 rounded-full bg-gray-200" />
                            </div>

                            <Skeleton className="mb-4 h-10 w-3/4 bg-gray-200 md:mb-6 md:h-12" />
                            <Skeleton className="mb-4 h-8 w-1/2 bg-gray-200 md:h-10" />

                            <div className="flex w-fit items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3 md:gap-4 md:p-4">
                                <div className="flex flex-col gap-1">
                                    <Skeleton className="h-3 w-12 bg-gray-200" />
                                    <Skeleton className="h-8 w-24 bg-gray-200" />
                                </div>
                                <div className="mx-1 h-8 w-px bg-gray-200 md:mx-2"></div>
                                <Skeleton className="h-6 w-16 rounded-md bg-gray-200" />
                            </div>
                        </div>

                        {/* Description Skeleton */}
                        <div className="mb-4 w-full space-y-3 py-2">
                            <Skeleton className="h-5 w-40 bg-gray-200" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-full bg-gray-200" />
                                <Skeleton className="h-4 w-full bg-gray-200" />
                                <Skeleton className="h-4 w-5/6 bg-gray-200" />
                                <Skeleton className="h-4 w-4/6 bg-gray-200" />
                            </div>
                        </div>

                        {/* Sticky Action Footer Placeholder */}
                        <div className="relative mt-2 w-full overflow-hidden rounded-xl border border-gray-100 bg-white p-4 shadow-lg">
                            <div className="flex flex-col gap-3">
                                <div className="mb-1 flex justify-between">
                                    <Skeleton className="h-3 w-20 bg-gray-200" />
                                    <Skeleton className="h-3 w-20 bg-gray-200" />
                                </div>
                                <Skeleton className="h-12 w-full rounded-full bg-gray-200" />
                                <Skeleton className="mx-auto h-3 w-40 bg-gray-200" />
                            </div>
                        </div>

                        {/* Steps Skeleton */}
                        <div className="mt-8 mb-8 grid w-full grid-cols-3 gap-2 md:gap-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex flex-col items-center gap-2">
                                    <Skeleton className="h-12 w-12 rounded-full bg-gray-200" />
                                    <Skeleton className="h-3 w-20 bg-gray-200" />
                                </div>
                            ))}
                        </div>

                    </div>
                </div>
            </div>
            {/* Mobile Sticky Buy Bar Skeleton */}
            <div className="fixed right-0 bottom-(--sticky-bar-bottom) left-0 z-40 border-t border-gray-100 bg-white p-3 md:hidden">
                <div className="flex items-center gap-3">
                    <div className="flex flex-col gap-1">
                        <Skeleton className="h-3 w-10 bg-gray-200" />
                        <Skeleton className="h-5 w-16 bg-gray-200" />
                    </div>
                    <div className="flex-1">
                        <Skeleton className="h-10 w-full rounded-full bg-gray-200" />
                    </div>
                </div>
            </div>
        </div>
    );
}
