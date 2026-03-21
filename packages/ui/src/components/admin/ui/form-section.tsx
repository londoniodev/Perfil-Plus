import * as React from "react"
import { cn } from "../../../lib/utils"

interface AdminFormSectionProps extends React.HTMLAttributes<HTMLDivElement> {
    title?: string
    description?: string
    /**
     * Si es true, el contenido se organizará en un grid de 2 columnas en pantallas medianas
     * @default false
     */
    grid?: boolean
}

export function AdminFormSection({
    title,
    description,
    children,
    className,
    grid = false,
    ...props
}: AdminFormSectionProps) {
    return (
        <div
            className={cn(
                "p-6 border border-border/40 rounded-lg bg-primary/5 space-y-4 shadow-sm",
                className
            )}
            {...props}
        >
            {(title || description) && (
                <div className="space-y-1">
                    {title && <h3 className="font-semibold text-lg leading-none tracking-tight">{title}</h3>}
                    {description && <p className="text-sm text-muted-foreground">{description}</p>}
                </div>
            )}
            <div className={cn(
                "w-full",
                grid ? "grid gap-6 md:grid-cols-2" : "space-y-4"
            )}>
                {children}
            </div>
        </div>
    )
}
