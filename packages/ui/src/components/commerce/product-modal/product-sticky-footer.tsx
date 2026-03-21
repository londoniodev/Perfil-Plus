"use client"

import { Minus, Plus } from "lucide-react"
import { formatCurrency } from "@alvarosky/shared"

export function ProductStickyFooter({
    quantity,
    totalPrice,
    setQuantity,
    onAdd
}: {
    quantity: number
    totalPrice: number
    setQuantity: (updater: (q: number) => number) => void
    onAdd: () => void
}) {
    return (
        <section aria-label="Añadir al carrito" className="absolute bottom-0 w-full z-30">
            <div className="bg-white/95 backdrop-blur-xl border-t border-slate-200 px-4 py-4 pb-8 sm:pb-4 shadow-[0_-20px_40px_rgba(0,0,0,0.05)]">
                <div className="flex items-center justify-between gap-4 max-w-lg mx-auto">
                    <div className="flex items-center gap-3 bg-slate-100 rounded-xl p-1.5 h-14 border border-slate-200 shadow-inner" role="group" aria-label="Cantidad">
                        <button 
                            onClick={() => setQuantity(q => Math.max(1, q - 1))} 
                            className="w-10 h-full flex items-center justify-center hover:bg-white hover:shadow-sm rounded-lg text-slate-700 transition-all focus-visible:ring-2 focus-visible:ring-primary outline-none"
                            aria-label="Disminuir cantidad"
                        >
                            <Minus className="w-5 h-5" aria-hidden="true" />
                        </button>
                        <span className="font-bold text-slate-900 w-6 text-center text-lg" aria-live="polite">
                            {quantity}
                        </span>
                        <button 
                            onClick={() => setQuantity(q => q + 1)} 
                            className="w-10 h-full flex items-center justify-center hover:bg-white hover:shadow-sm rounded-lg text-slate-700 transition-all focus-visible:ring-2 focus-visible:ring-primary outline-none"
                            aria-label="Aumentar cantidad"
                        >
                            <Plus className="w-5 h-5" aria-hidden="true" />
                        </button>
                    </div>

                    <button
                        onClick={onAdd}
                        className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-14 px-6 rounded-xl shadow-lg shadow-primary/25 flex items-center justify-between gap-2 transition-all active:scale-[0.98] whitespace-nowrap text-lg focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary outline-none"
                    >
                        <span>Añadir</span>
                        <span className="bg-black/10 px-2 py-1 rounded-lg text-sm">{formatCurrency(totalPrice)}</span>
                    </button>
                </div>
            </div>
        </section>
    )
}
