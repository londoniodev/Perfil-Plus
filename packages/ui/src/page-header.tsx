import * as React from "react"
import { cn } from "./lib/utils"
import { Separator } from "./separator"

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    title: string
    description?: string
    separated?: boolean
}

export function PageHeader({
    title,
    description,
    separated = false,
    className,
    children,
    ...props
}: PageHeaderProps) {
    return (
        <section
            className={cn("flex flex-col gap-1 py-4 md:py-8 mt-[30px] items-center text-center", className)}
            {...props}
        >
            <div className="flex flex-col gap-1.5 max-w-4xl mx-auto">
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
            {children && <div className="mt-4 flex flex-wrap items-center justify-center gap-2">{children}</div>}

            {/* Separador Opcional */}
            {separated && <Separator className="mt-6" />}
        </section>
    )
}
