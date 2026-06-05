"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

interface ProductPageBackButtonProps {
    primaryColor: string
    productName: string
}

export function ProductPageBackButton({ primaryColor, productName }: ProductPageBackButtonProps) {
    const router = useRouter()

    return (
        <div className="flex items-center gap-3">
            <button
                onClick={() => router.back()}
                className="group flex items-center justify-center w-10 h-10 rounded-full border border-white/10 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
                style={{ 
                    backgroundColor: `${primaryColor}15`,
                    borderColor: `${primaryColor}40`,
                }}
                aria-label="Volver"
            >
                <ArrowLeft 
                    className="h-5 w-5 transition-transform duration-200 group-hover:-translate-x-0.5" 
                    style={{ color: primaryColor }}
                />
            </button>
            <div className="flex flex-col">
                <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Tienda</span>
                <h1 className="text-lg font-bold text-white leading-tight truncate max-w-[300px] md:max-w-none">
                    {productName}
                </h1>
            </div>
        </div>
    )
}
