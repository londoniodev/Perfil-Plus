"use client"

import * as React from "react"
import { Button } from "../../button"
import { Download, ShoppingCart, RefreshCw } from "lucide-react"
import { useDigitalProduct } from "../../hooks/use-digital-product"
import { cn } from "../../lib/utils"

// Defining minimal types to avoid hard dependency on Prisma/Shared if possible, 
// or I could import from shared if configured.
// Ideally UI package shouldn't depend on database package, but shared types is fine.
// For now, I'll define interfaces based on what I saw in shared/src/types.ts and Prisma.

interface Product {
    id: string
    productType: "DIGITAL" | "PHYSICAL" | "SERVICE"
    [key: string]: any
}

interface OrderItem {
    variant: {
        product: {
            id: string
        }
    }
}

interface Order {
    id: string
    items: OrderItem[]
    status: string // APPROVED, etc.
}

interface ProductActionButtonProps extends React.ComponentProps<typeof Button> {
    product: Product
    userOrders?: Order[]
    onAddToCart?: () => void
}

export function ProductActionButton({
    product,
    userOrders = [],
    onAddToCart,
    className,
    ...props
}: ProductActionButtonProps) {

    // Find if purchased and APPROVED
    // Note: status check should probably happen at caller level or here. 
    // ordersService.findMyOrders returns only approved-ish orders, so we assume if present it's valid.
    const purchase = userOrders.find(order =>
        order.items.some(item => item.variant?.product?.id === product.id)
    )

    const { download, isDownloading } = useDigitalProduct({
        productId: product.id,
        orderId: purchase?.id
    })

    if (purchase) {
        if (product.productType === "DIGITAL") {
            return (
                <Button
                    size="lg"
                    variant="default"
                    onClick={download}
                    disabled={isDownloading}
                    className={cn("w-full gap-2", className)}
                    {...props}
                >
                    <Download className="h-5 w-5" />
                    {isDownloading ? "Descargando..." : "Descargar Ahora"}
                </Button>
            )
        }

        return (
            <Button
                variant="outline"
                className={cn("w-full gap-2", className)}
                onClick={onAddToCart}
                {...props}
            >
                <RefreshCw className="h-4 w-4" />
                Comprar Nuevamente
            </Button>
        )
    }

    // Default: Add to Cart (Marketing)
    return (
        <Button
            size="xl"
            className={cn("w-full shadow-lg gap-2 text-lg font-semibold", className)}
            onClick={onAddToCart}
            {...props}
        >
            <ShoppingCart className="h-6 w-6" />
            Agregar al Carrito
        </Button>
    )
}
