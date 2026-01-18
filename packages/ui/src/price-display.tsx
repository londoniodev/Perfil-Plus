import * as React from "react"
import { cn } from "./lib/utils"
import { Badge } from "./badge"

interface PriceDisplayProps {
    price: number | string // Acepta string por si viene de Decimal de Prisma
    salePrice?: number | string
    currency?: string
    size?: "sm" | "default" | "lg"
    className?: string
}

export function PriceDisplay({
    price,
    salePrice,
    currency = "USD",
    size = "default",
    className,
}: PriceDisplayProps) {
    const numericPrice = Number(price)
    const numericSalePrice = salePrice ? Number(salePrice) : undefined

    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
    })

    // Lógica de Descuento
    const hasDiscount = numericSalePrice !== undefined && numericSalePrice < numericPrice
    const currentPrice = hasDiscount ? numericSalePrice : numericPrice

    // Calcular porcentaje off
    const discountPercent = hasDiscount
        ? Math.round(((numericPrice - numericSalePrice!) / numericPrice) * 100)
        : 0

    const sizeClasses = {
        sm: "text-lg",
        default: "text-2xl",
        lg: "text-4xl",
    }

    return (
        <div className={cn("flex flex-col items-start leading-none", className)}>
            <div className="flex items-center gap-2">
                <span className={cn("font-bold tracking-tight text-foreground", sizeClasses[size])}>
                    {formatter.format(currentPrice)}
                </span>

                {hasDiscount && (
                    <Badge variant="destructive" className="text-[10px] px-1.5 h-5 rounded-sm">
                        -{discountPercent}%
                    </Badge>
                )}
            </div>

            {hasDiscount && (
                <span className="text-muted-foreground line-through text-sm opacity-80">
                    {formatter.format(numericPrice)}
                </span>
            )}
        </div>
    )
}
