import * as React from "react"
import { cn } from "./lib/utils"
import { Separator } from "./separator"

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    title: string
    description?: string
    separated?: boolean
    variant?: "default" | "admin"
}

export function PageHeader({
    title,
    description,
    separated = false,
    variant = "default",
    className,
    children,
    ...props
}: PageHeaderProps) {
    const isCentered = variant === "default"

    return (
        <section
            className={cn(
                "flex flex-col gap-1 py-4 md:py-8 mt-[30px]",
                isCentered ? "items-center text-center" : "items-start text-left w-full",
                className
            )}
            {...props}
        >
            <div className={cn(
                "flex flex-col gap-1.5",
                isCentered ? "max-w-4xl mx-auto" : "w-full"
            )}>
                {/* Header (Título Responsivo) */}
                <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl lg:text-4xl">
                    {title}
                </h1>

                {/* Footer (Descripción con balance de texto) */}
                {description && (
                    <p className="text-sm text-muted-foreground text-balance md:text-base lg:text-lg">
                        {description}
                    </p>
                )}
            </div>

            {/* Slot para contenido extra (botones, filtros) */}
            {children && (
                <div className={cn(
                    "mt-4 flex flex-wrap gap-2",
                    isCentered ? "items-center justify-center" : "w-full justify-start"
                )}>
                    {children}
                </div>
            )}

            {/* Separador Opcional */}
            {separated && <Separator className="mt-6" />}
        </section>
    )
}


