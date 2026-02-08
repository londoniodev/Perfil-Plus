import { Skeleton } from "@alvarosky/ui";

export default function Loading() {
    return (
        <div className="container py-12">
            <div className="flex flex-col md:flex-row gap-8">
                <div className="w-full md:w-64 space-y-4">
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-[200px] w-full" />
                </div>
                <div className="flex-1 space-y-6">
                    <Skeleton className="h-10 w-full max-w-sm" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="space-y-3">
                                <Skeleton className="aspect-square w-full rounded-xl" />
                                <Skeleton className="h-4 w-2/3" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

