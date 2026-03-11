import * as React from "react"
import { cn } from "./lib/utils"
import { Separator } from "./separator"

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    title: string
    description?: string
    badge?: string
    badgeIcon?: React.ReactNode
    separated?: boolean
    variant?: "default" | "admin" | "marketing"
}

export function PageHeader({
    title,
    description,
    badge,
    badgeIcon,
    separated = false,
    variant = "default",
    className,
    children,
    ...props
}: PageHeaderProps) {
    const isCentered = variant === "default" || variant === "marketing"
    const isMarketing = variant === "marketing"

    return (
        <section
            className={cn(
                "flex flex-col gap-1",
                !isMarketing && "py-2 md:py-8 mt-4 md:mt-8",
                isCentered ? "items-center text-center" : "items-start text-left w-full",
                className
            )}
            {...props}
        >
            <div className={cn(
                "flex flex-col gap-1.5",
                isCentered ? "max-w-4xl mx-auto" : "w-full"
            )}>
                {/* Badge (Solo para Marketing o si se pasa explícito) */}
                {badge && (
                    <div className="flex justify-center mb-4">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
                            {badgeIcon && <span className="[&>svg]:w-4 [&>svg]:h-4">{badgeIcon}</span>}
                            {badge}
                        </div>
                    </div>
                )}

                {/* Header (Título Responsivo) */}
                <h1 className={cn(
                    "tracking-tight",
                    isMarketing 
                        ? "text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4 text-white" 
                        : "text-2xl md:text-3xl lg:text-4xl font-bold text-foreground"
                )}>
                    {title}
                </h1>

                {/* Footer (Descripción con balance de texto) */}
                {description && (
                    <p className={cn(
                        "text-muted-foreground text-balance",
                        isMarketing 
                            ? "text-base sm:text-lg max-w-2xl mx-auto leading-relaxed" 
                            : "text-sm md:text-base lg:text-lg"
                    )}>
                        {description}
                    </p>
                )}
            </div>

            {/* Slot para contenido extra (botones, filtros) */}
            {children && (
                <div className={cn(
                    "mt-4 flex flex-wrap gap-2 w-full",
                    isCentered ? "items-center justify-center" : "justify-start",
                    "[&>button]:flex-1 sm:[&>button]:flex-none sm:w-auto"
                )}>
                    {children}
                </div>
            )}

            {/* Separador Opcional */}
            {separated && <Separator className="mt-6" />}
        </section>
    )
}


