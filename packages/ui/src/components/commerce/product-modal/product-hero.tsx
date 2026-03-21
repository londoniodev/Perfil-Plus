"use client"

import Image from "next/image"
import { BadgeCheck, MoreHorizontal, Tag } from "lucide-react"
import type { PublicProduct } from "@alvarosky/restaurant-sdk"
import { formatCurrency } from "@alvarosky/shared"

const FOOD_FALLBACK_IMAGES = [
    '/dashboard/images/food/food-1.png', // burger
    '/dashboard/images/food/food-2.png', // fries
    '/dashboard/images/food/food-3.png', // smoothie
    '/dashboard/images/food/food-4.png', // salad
    '/dashboard/images/food/food-5.png', // pizza
    '/dashboard/images/food/food-6.png', // dessert
]

export function getFallbackImage(id: string, name?: string): string {
    if (name) {
        const lowerName = name.toLowerCase();
        if (lowerName.includes('burger') || lowerName.includes('hamburguesa')) return FOOD_FALLBACK_IMAGES[0];
        if (lowerName.includes('papa') || lowerName.includes('frie') || lowerName.includes('salchipapa')) return FOOD_FALLBACK_IMAGES[1];
        if (lowerName.includes('jugo') || lowerName.includes('smoothie') || lowerName.includes('limonada') || lowerName.includes('gaseosa') || lowerName.includes('malteada')) return FOOD_FALLBACK_IMAGES[2];
        if (lowerName.includes('ensalada') || lowerName.includes('salad') || lowerName.includes('nuggets')) return FOOD_FALLBACK_IMAGES[3];
        if (lowerName.includes('pizza') || lowerName.includes('perro caliente')) return FOOD_FALLBACK_IMAGES[4];
        if (lowerName.includes('postre') || lowerName.includes('brownie') || lowerName.includes('dessert')) return FOOD_FALLBACK_IMAGES[5];
    }
    const sum = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return FOOD_FALLBACK_IMAGES[sum % FOOD_FALLBACK_IMAGES.length]
}

export function ProductHero({
    product,
    unitPrice,
    restaurantName,
    restaurantLogo
}: {
    product: PublicProduct
    unitPrice: number
    restaurantName: string
    restaurantLogo: string
}) {
    return (
        <section aria-labelledby="product-modal-title">
            <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full p-0.5 bg-gradient-to-tr from-primary to-primary/60">
                            <div className="w-full h-full rounded-full border-2 border-white overflow-hidden relative">
                                <Image
                                    src={restaurantLogo || '/placeholder.png'}
                                    alt={`Logo de ${restaurantName}`}
                                    fill
                                    sizes="40px"
                                    className="object-cover bg-white"
                                />
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center gap-1">
                            <h3 className="text-sm font-bold text-slate-900">{restaurantName}</h3>
                            <BadgeCheck className="w-4 h-4 text-blue-500 fill-blue-500" aria-hidden="true" />
                        </div>
                        <p className="text-xs text-slate-500">{product.name}</p>
                    </div>
                </div>
                <button 
                    className="text-slate-400 hover:text-slate-600 transition-colors focus-visible:ring-2 focus-visible:ring-primary rounded"
                    aria-label="Más opciones del restaurante"
                >
                    <MoreHorizontal className="w-6 h-6" aria-hidden="true" />
                </button>
            </div>

            <div className="relative w-full aspect-square bg-slate-100">
                <Image
                    src={product.images?.[0] || getFallbackImage(product.id, product.name)}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                    className="object-cover"
                />
                <div className="absolute bottom-4 left-4 bg-white/90 shadow-sm backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1 border border-slate-200/50">
                    <Tag className="w-3 h-3 text-slate-700" aria-hidden="true" />
                    <span className="text-slate-900 text-xs font-bold">{formatCurrency(unitPrice)}</span>
                </div>
            </div>
        </section>
    )
}
