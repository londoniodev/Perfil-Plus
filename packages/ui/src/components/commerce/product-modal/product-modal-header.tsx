"use client"

import { ArrowLeft } from "lucide-react"

export function ProductModalHeader({ 
    onClose 
}: { 
    onClose: () => void 
}) {
    return (
        <header className="flex items-center justify-between px-4 py-3 sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-slate-200 shrink-0">
            <div className="flex items-center gap-3">
                <button 
                    onClick={onClose} 
                    className="text-slate-600 hover:text-slate-900 transition-colors -ml-1"
                    aria-label="Cerrar modal"
                >
                    <ArrowLeft className="w-6 h-6" aria-hidden="true" />
                </button>
                <div className="text-lg font-bold text-slate-900" id="product-modal-title">Detalle</div>
            </div>
        </header>
    )
}
