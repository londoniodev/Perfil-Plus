import { Skeleton } from "@mauromera/ui";

export default function Loading() {
    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-[200px]" />
                <Skeleton className="h-10 w-[120px]" />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-32 rounded-xl" />
                ))}
            </div>

            <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                ))}
            </div>
        </div>
    );
}
