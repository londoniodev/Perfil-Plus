"use client"

import { ProductCard } from "./ProductCard"
import { type PublicProduct } from "@alvarosky/restaurant-sdk"
import { useCart } from "@/store/use-cart"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { API_BASE } from "@/lib/config"
import { Search, SlidersHorizontal } from "lucide-react"

export function StoreClient({ tenantId, initialData = [] }: { tenantId: string, initialData: PublicProduct[] }) {
    // Ya no usamos useMenu aquí, evitamos el render blocking
    const { addItem } = useCart()
    const router = useRouter()
    const [liveStatus, setLiveStatus] = useState<Record<string, { isAvailable: boolean, likes: number }>>({})
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("all")
    const [sortOrder, setSortOrder] = useState<"asc" | "desc" | "none">("none")

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
    
    // Extraer categorías únicas para los filtros
    const categories = Array.from(
        new Set(
            rawProducts.flatMap((p: any) => p.categories?.map((c: any) => c.category?.name))
        )
    ).filter(Boolean) as string[];

    const storeProducts = rawProducts
        .map((p: any) => {
            const status = liveStatus[p.id]
            if (status) {
                return { ...p, isAvailable: status.isAvailable }
            }
            return p
        })
        .filter((p: any) => p.productType !== "RESTAURANT" && p.isAvailable !== false)
        .filter((p: any) => {
            const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase())
            const matchesCategory = selectedCategory === "all" || 
                p.categories?.some((c: any) => c.category?.name === selectedCategory)
            
            return matchesSearch && matchesCategory
        })
        .sort((a: any, b: any) => {
            if (sortOrder === "asc") return Number(a.basePrice) - Number(b.basePrice)
            if (sortOrder === "desc") return Number(b.basePrice) - Number(a.basePrice)
            return 0
        })

    const handleAddToCart = (product: PublicProduct) => {
        addItem({
            productId: product.id,
            variantId: product.variants?.[0]?.id || product.id,
            title: product.name,
            subtitle: product.variants?.[0]?.name || undefined,
            imageSrc: product.images?.[0] || "",
            price: Number(product.variants?.[0]?.price ?? product.basePrice) || 0,
            quantity: 1,
            productType: (product as any).productType || "PHYSICAL",
            modifiers: []
        })
        toast.success(`Añadido al carrito: ${product.name}`)
    }

    const handleViewDetails = (product: PublicProduct & { slug?: string }) => {
        if (!product.slug && !product.id) return
        router.push(`/tienda/${product.slug || product.id}`)
    }

    const isFilteredEmpty = storeProducts.length === 0;
    const isInitialEmpty = rawProducts.length === 0;

    if (isInitialEmpty) {
        return (
            <div className="w-full py-20 text-center flex flex-col items-center border border-white/10 rounded-xl bg-white/5 backdrop-blur-md">
                <PackageIcon placeholder />
                <h3 className="text-lg font-bold text-white mt-4">Catálogo Vacío</h3>
                <p className="text-zinc-400 mt-2">Aún no hay productos disponibles en esta tienda.</p>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Filtros Barra */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white/5 backdrop-blur-md p-4 rounded-xl border border-white/10 relative z-20">
                <div className="relative w-full md:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-zinc-900/80 border border-zinc-800 rounded-lg text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700 transition-colors"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    {/* Select Categorías */}
                    <div className="flex-1 md:flex-initial relative min-w-[140px]">
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full pl-4 pr-10 py-2 bg-zinc-900/80 border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:border-zinc-700 appearance-none cursor-pointer transition-colors"
                        >
                            <option value="all">Todas las Categorías</option>
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                        <SlidersHorizontal className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
                    </div>

                    {/* Select Orden Precio */}
                    <div className="flex-1 md:flex-initial relative min-w-[140px]">
                        <select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value as any)}
                            className="w-full pl-4 pr-10 py-2 bg-zinc-900/80 border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:border-zinc-700 appearance-none cursor-pointer transition-colors"
                        >
                            <option value="none">Ordenar por Precio</option>
                            <option value="asc">Menor a Mayor</option>
                            <option value="desc">Mayor a Menor</option>
                        </select>
                        <SlidersHorizontal className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Grilla o Estado Vacío Filtrado */}
            {isFilteredEmpty ? (
                <div className="w-full py-20 text-center flex flex-col items-center border border-white/5 rounded-xl bg-white/2">
                    <Search className="h-10 w-10 text-zinc-500 opacity-40" />
                    <h3 className="text-lg font-bold text-white mt-4">Sin resultados</h3>
                    <p className="text-zinc-400 mt-2">No encontramos productos que coincidan con tu búsqueda.</p>
                </div>
            ) : (
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
            )}
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
