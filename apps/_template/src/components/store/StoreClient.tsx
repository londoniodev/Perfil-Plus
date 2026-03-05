"use client"

import { ProductCard } from "./ProductCard"
import { useCart, type PublicProduct } from "@alvarosky/restaurant-sdk"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { API_BASE } from "@/lib/config"

export function StoreClient({ tenantId, initialData = [] }: { tenantId: string, initialData: PublicProduct[] }) {
    // Ya no usamos useMenu aquí, evitamos el render blocking
    const { addItem } = useCart()
    const [liveStatus, setLiveStatus] = useState<Record<string, { isAvailable: boolean, likes: number }>>({})

    useEffect(() => {
        const fetchLiveStatus = async () => {
            try {
                const res = await fetch(`${API_BASE}/store/products/live-status`, {
                    headers: { 'x-tenant-id': tenantId }
                })
                if (res.ok) {
                    const data = await res.json()
                    setLiveStatus(data)
                }
            } catch (err) {
                console.error("Error fetching live status", err)
            }
        }

        fetchLiveStatus()
        // Polling ligero cada 30 segundos
        const interval = setInterval(fetchLiveStatus, 30000)
        return () => clearInterval(interval)
    }, [tenantId])

    // Filtramos e hidratamos datos usando initialData como base
    const rawProducts = Array.isArray(initialData) ? initialData : [];
    const storeProducts = rawProducts
        .map((p: any) => {
            const status = liveStatus[p.id]
            if (status) {
                return { ...p, isAvailable: status.isAvailable }
            }
            return p
        })
        .filter((p: any) => p.productType !== "RESTAURANT" && p.isAvailable !== false)

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
