import { cn } from "./lib/utils"

function Skeleton({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                "rounded-md bg-gradient-to-r from-muted/40 via-muted/80 to-muted/40 bg-[length:400%_100%] animate-[shimmer_2s_infinite_linear]",
                className
            )}
            {...props}
        />
    )
}

export { Skeleton }


