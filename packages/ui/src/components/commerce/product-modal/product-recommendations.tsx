"use client"

import Image from "next/image"
import type { PublicProduct } from "@alvarosky/restaurant-sdk"
import { formatCurrency } from "@alvarosky/shared"
import { getFallbackImage } from "./product-hero"

export function ProductRecommendations({
    suggestedProducts,
    onProductSelect
}: {
    suggestedProducts: PublicProduct[]
    onProductSelect: (product: PublicProduct) => void
}) {
    if (!suggestedProducts || suggestedProducts.length === 0) return null

    return (
        <section aria-labelledby="recommendations-title" className="px-4 pb-8 mb-4">
            <h4 id="recommendations-title" className="text-sm font-bold text-slate-900 mb-4 tracking-tight">Combina bien con</h4>
            <div 
                className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4 snap-x"
                role="list"
                aria-label="Productos sugeridos"
            >
                {suggestedProducts.map(item => (
                    <div 
                        key={item.id} 
                        className="flex-shrink-0 w-[140px] group cursor-pointer snap-start" 
                        onClick={() => onProductSelect(item)}
                        role="listitem"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault()
                                onProductSelect(item)
                            }
                        }}
                    >
                        <div className="w-[140px] h-[140px] rounded-2xl overflow-hidden mb-3 relative bg-slate-100 border border-slate-200 shadow-sm">
                            <Image
                                src={item.images?.[0] || getFallbackImage(item.id, item.name)}
                                alt={`Sugerencia: ${item.name}`}
                                fill
                                sizes="150px"
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                        </div>
                        <p className="text-sm font-bold text-slate-900 truncate mb-0.5 group-hover:text-primary transition-colors">{item.name}</p>
                        <p className="text-sm text-slate-500 font-medium">{formatCurrency(Number(item.basePrice))}</p>
                    </div>
                ))}
            </div>
        </section>
    )
}
