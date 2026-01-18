import * as React from "react"
import { cn } from "./lib/utils"
import { Check } from "lucide-react"

interface ProductSpecsProps {
    specs: Record<string, string | number | null> | null // Tipo compatible con Prisma Json
    className?: string
}

export function ProductSpecs({ specs, className }: ProductSpecsProps) {
    if (!specs || Object.keys(specs).length === 0) return null

    // Mapeo simple de claves a etiquetas legibles
    const formatLabel = (key: string) => {
        // Convierte "camelCase" a "Title Case" (ej: fileSize -> File Size)
        return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
    }

    return (
        <div className={cn("grid grid-cols-2 gap-3", className)}>
            {Object.entries(specs).map(([key, value]) => {
                if (value === null) return null
                return (
                    <div key={key} className="flex items-start gap-3 p-3 rounded-md border bg-muted/20">
                        <div className="mt-0.5 text-muted-foreground">
                            <Check className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col text-sm">
                            <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
                                {formatLabel(key)}
                            </span>
                            <span className="font-semibold text-foreground truncate" title={String(value)}>
                                {String(value)}
                            </span>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
