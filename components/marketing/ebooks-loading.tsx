import { Skeleton } from "@/components/ui/skeleton";

export function EbooksLoading() {
    return (
        <section className="overflow-hidden bg-gray-50/50 py-12 md:py-20">
            <div className="container mx-auto px-4">
                {/* Header Skeleton */}
                <div className="mb-8 flex flex-col items-center space-y-3 text-center">
                    <Skeleton className="mb-2 h-8 w-3/4 md:h-12 md:w-1/2 lg:w-1/3" />
                    <Skeleton className="h-4 w-full max-w-2xl md:h-6 md:w-2/3" />
                </div>

                {/* Carousel Skeleton */}
                <div className="relative mx-auto max-w-6xl">
                    <div className="overflow-hidden">
                        <div className="-ml-4 flex">
                            {/* Mocking 3 visible items for desktop, fewer for mobile */}
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="min-w-0 flex-[0_0_80%] pl-4 sm:flex-[0_0_50%] lg:flex-[0_0_25%]">
                                    <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
                                        {/* Image */}
                                        <Skeleton className="h-70 w-full" />

                                        {/* Content */}
                                        <div className="flex grow flex-col gap-3 p-4">
                                            <Skeleton className="h-4 w-1/4" />
                                            <Skeleton className="h-6 w-3/4" />
                                            <div className="space-y-1">
                                                <Skeleton className="h-3 w-full" />
                                                <Skeleton className="h-3 w-5/6" />
                                            </div>
                                            <div className="mt-auto flex gap-2 pt-4">
                                                <Skeleton className="h-10 w-full rounded-xl" />
                                                <Skeleton className="h-10 w-12 rounded-xl" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Button Skeleton */}
                <div className="mt-12 flex justify-center text-center">
                    <Skeleton className="h-12 w-40 rounded-full" />
                </div>
            </div>
        </section>
    );
}
