
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="min-h-screen bg-white">
            {/* Header / Hero - Static content mirrored from page.tsx for stability */}
            <div className="relative overflow-hidden bg-slate-900 py-12 text-white">
                <div className="relative z-10 container mx-auto px-4 text-center">
                    <h1 className="mb-3 text-2xl font-bold tracking-tight md:text-3xl">
                        Legal Knowledge Simplified / <span className="text-brand-gold">ज्ञान हीच शक्ती</span>
                    </h1>
                    <p className="mx-auto max-w-xl text-sm leading-relaxed text-gray-300 md:text-base">
                        Access our premium collection of legal guides simplified for everyone.
                    </p>
                </div>
            </div>

            {/* Content Skeleton */}
            <div className="container mx-auto space-y-6 px-4 py-8">

                {/* Search Header Skeleton */}
                <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                    <Skeleton className="hidden h-5 w-32 bg-gray-200 sm:block" />
                    <Skeleton className="h-11 w-full rounded-xl bg-gray-200 sm:w-87.5" />
                </div>

                {/* Category Chips Skeleton */}
                <div className="flex gap-2 overflow-hidden pb-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Skeleton key={i} className="h-9 w-24 shrink-0 rounded-xl bg-gray-200" />
                    ))}
                </div>

                {/* Grid Skeleton */}
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-6">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-full space-y-3 rounded-xl border bg-white p-3 shadow-sm">
                            {/* Cover Image */}
                            <div className="relative aspect-3/4 w-full overflow-hidden rounded-md bg-gray-100">
                                <Skeleton className="h-full w-full bg-gray-200" />
                            </div>

                            {/* Content */}
                            <div className="space-y-2">
                                {/* Title */}
                                <Skeleton className="h-4 w-3/4 bg-gray-200" />
                                <Skeleton className="h-3 w-1/2 bg-gray-200" />

                                {/* Price & Button */}
                                <div className="mt-3 flex items-center justify-between border-t border-dashed pt-2">
                                    <Skeleton className="h-4 w-16 bg-gray-200" />
                                    <Skeleton className="h-8 w-20 rounded-md bg-gray-200" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
