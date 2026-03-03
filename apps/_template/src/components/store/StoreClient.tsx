"use client"

import { ProductCard } from "./ProductCard"
import { useMenu, useCart, type PublicProduct } from "@alvarosky/restaurant-sdk"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

export function StoreClient({ tenantId }: { tenantId: string }) {
    // Reutilizamos el SDK que ya resuelve el tenantId por debajo
    const { products, isLoading, isError } = useMenu(tenantId)
    const { addItem } = useCart()

    if (isLoading) {
        return (
            <div className="w-full min-h-[50vh] flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse text-sm">Cargando catálogo...</p>
            </div>
        )
    }

    if (isError) {
        return (
            <div className="w-full py-20 text-center flex flex-col items-center">
                <p className="text-destructive font-semibold mb-2">Hubo un error cargando el catálogo.</p>
                <p className="text-sm text-muted-foreground">Intenta recargar la página más tarde.</p>
            </div>
        )
    }

    // Filtramos para asegurar que no mostremos platos de comida pura si el objetivo es un E-commerce
    // Dependiendo de tu lógica esto es opcional. Aquí dejamos pasar digitales y físicos principalmente.
    const storeProducts = products.filter((p: any) => p.productType !== "RESTAURANT" && (p.isAvailable !== false))

    const handleAddToCart = (product: PublicProduct) => {
        addItem({
            productId: product.id,
            name: product.name,
            variantId: product.variants?.[0]?.id || product.id, // Fallback si no hay variantes explícitas
            price: Number(product.variants?.[0]?.price ?? product.basePrice) || 0,
            quantity: 1,
            modifiers: [],
            image: product.images?.[0]
        })
        toast.success(`Añadido al carrito: ${product.name}`)
    }

    const handleViewDetails = (product: PublicProduct) => {
        // Por ahora lo re-dirigimos o abrimos un modal, en E-commerce suele ser una página `/tienda/producto-x`
        // o disparamos un modal. Por MVP, delegamos la acción al toast o abrimos alerta.
        // TODO: Expandir modal de detalles.
        toast.info(`Viendo detalles de: ${product.name}`)
    }

    if (!storeProducts || storeProducts.length === 0) {
        return (
            <div className="w-full py-20 text-center flex flex-col items-center border border-dashed rounded-xl bg-slate-50">
                <PackageIcon placeholder />
                <h3 className="text-lg font-bold text-slate-800 mt-4">Catálogo Vacío</h3>
                <p className="text-muted-foreground">Aún no hay productos disponibles en esta tienda.</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {storeProducts.map((product: any) => (
                <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                    onViewDetails={handleViewDetails}
                />
            ))}
        </div>
    )
}

function PackageIcon({ placeholder }: { placeholder?: boolean }) {
    return (
        <svg
            className={`w-16 h-16 ${placeholder ? 'text-slate-300' : 'text-primary'}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
        >
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
    )
}
