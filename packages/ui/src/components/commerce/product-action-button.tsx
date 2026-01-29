"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "../../button"
import { ShoppingCart, RefreshCw, BookOpen } from "lucide-react"
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
    const router = useRouter()

    // Find if purchased and APPROVED
    const purchase = userOrders.find(order =>
        order.items.some(item => item.variant?.product?.id === product.id)
    )

    if (purchase) {
        // Case: Digital Content (Course, E-book) -> Viewer
        if (product.productType === "DIGITAL" || product.productType === "SERVICE") {
            // Assuming SERVICE might also have a dashboard/viewer area, or strict to DIGITAL.
            // Prompt mentions "Leer Ahora" for generic access.
            return (
                <Button
                    size="lg"
                    variant="default"
                    onClick={() => router.push(`/viewer/${product.slug}`)}
                    className={cn("w-full gap-2", className)}
                    {...props}
                >
                    <BookOpen className="h-5 w-5" />
                    Leer Ahora
                </Button>
            )
        }

        // Case: Physical -> Buy Again
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
