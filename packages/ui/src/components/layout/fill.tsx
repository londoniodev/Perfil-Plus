import { cn } from "../../lib/utils";

interface FillProps extends React.HTMLAttributes<HTMLDivElement> {
    height?: number;
    minHeight?: string;
}

export function Fill({
    className,
    height,
    minHeight = "60vh",
    ...props
}: FillProps) {
    return (
        <div
            className={cn(
                "w-full flex-grow flex flex-col items-center justify-center",
                className
            )}
            style={{
                minHeight: height ? `${height}px` : minHeight
            }}
            {...props}
        >
            {/* Optional: Add a subtle loading state or placeholder if needed */}
        </div>
    );
}
