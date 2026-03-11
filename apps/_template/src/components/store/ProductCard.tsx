"use client"

import Image from "next/image"
import { Package, CloudDownload, ShoppingCart } from "lucide-react"
import { Button } from "@alvarosky/ui"
import { formatCurrency } from "@/lib/utils"

export interface ProductCardProps {
    product: {
        id: string
        name: string
        description?: string
        images?: string[]
        basePrice: number
        productType: "PHYSICAL" | "DIGITAL" | "RESTAURANT" | "SERVICE" | string
        isAvailable?: boolean
    }
    onAddToCart?: (product: any) => void
    onViewDetails?: (product: any) => void
}

export function ProductCard({ product, onAddToCart, onViewDetails }: ProductCardProps) {
    const isDigital = product.productType === "DIGITAL"
    const isPhysical = product.productType === "PHYSICAL"

    const imageUrl = product.images?.[0] || "/placeholder.png"
    const isAvailable = product.isAvailable !== false

    return (
        <div className="group relative flex flex-col bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden hover:shadow-xl hover:shadow-primary/5 hover:border-white/20 transition-all duration-300">
            {/* Badges */}
            <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
                {isDigital && (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-100/90 backdrop-blur-sm text-blue-700 text-xs font-bold rounded-full shadow-sm">
                        <CloudDownload className="w-3.5 h-3.5" /> Descarga Digital
                    </span>
                )}
                {!isAvailable && (
                    <span className="px-2.5 py-1 bg-slate-900/90 backdrop-blur-sm text-white text-xs font-bold rounded-full shadow-sm">
                        AGOTADO
                    </span>
                )}
            </div>

            {/* Image Section */}
            <div
                className="relative aspect-square w-full bg-white/5 overflow-hidden cursor-pointer"
                onClick={() => onViewDetails?.(product)}
                role="button"
                tabIndex={0}
                aria-label={`Ver detalles de ${product.name}`}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        onViewDetails?.(product)
                    }
                }}
            >
                <Image
                    src={imageUrl}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
            </div>

            {/* Content Section */}
            <div className="flex flex-col flex-1 p-5">
                <div className="flex-1">
                    <h3
                        className="font-bold text-lg text-white line-clamp-2 leading-tight cursor-pointer hover:text-primary transition-colors"
                        onClick={() => onViewDetails?.(product)}
                    >
                        {product.name}
                    </h3>
                    {product.description && (
                        <p className="mt-2 text-sm text-zinc-400 line-clamp-2">
                            {product.description}
                        </p>
                    )}
                </div>

                <div className="mt-4 pt-4 border-t border-white/10 flex items-end justify-between gap-4">
                    <div className="flex flex-col">
                        <span className="text-xs text-zinc-400 font-medium mb-0.5">Precio</span>
                        <span className="font-extrabold text-xl text-white tracking-tight">
                            {formatCurrency(Number(product.basePrice))}
                        </span>
                    </div>

                    <Button
                        onClick={() => onAddToCart ? onAddToCart(product) : onViewDetails?.(product)}
                        disabled={!isAvailable}
                        size="sm"
                        className="rounded-full shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all active:scale-95"
                        aria-label="Añadir al carrito"
                    >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Añadir
                    </Button>
                </div>
            </div>
        </div>
    )
}
