"use client"

import * as React from "react"
import { PriceDisplay } from "../../price-display"
import { ProductSpecs } from "../../product-specs"
import { AdaptiveImage } from "../../adaptive-image"
import { Button } from "../../button"
import { Badge } from "../../badge"
import { useToast } from "../../toast"
import { Check, ShoppingCart, Download, FileText, Share2, ArrowLeft } from "lucide-react"
import { cn } from "../../lib/utils"

// ============================================
// Types
// ============================================

export interface ProductVariantData {
    id: string
    name: string | null
    price: number | string
    stock: number
    isDefault?: boolean
}

export interface ProductData {
    id: string
    name: string
    description: string | null
    images: string[]
    productType: "PHYSICAL" | "DIGITAL"
    specs?: Record<string, string | number>
    variants: ProductVariantData[]
}

export interface AddToCartItem {
    productId: string
    variantId: string
    title: string
    subtitle: string
    imageSrc: string
    price: number
    quantity: number
    productType: string
}

export interface ProductConfiguratorProps {
    product: ProductData
    /** Callback when user adds item to cart */
    onAddToCart: (item: AddToCartItem) => void
    /** Tenant primary color for themed elements */
    primaryColor?: string
}

// ============================================
// ProductConfigurator Component
// ============================================

export function ProductConfigurator({ product, onAddToCart, primaryColor = '#e11d48' }: ProductConfiguratorProps) {
    const toast = useToast()

    // Estado: Variante seleccionada (Por defecto la default o la primera con stock)
    const [selectedVariant, setSelectedVariant] = React.useState<ProductVariantData>(
        product.variants.find(v => v.isDefault) || product.variants[0]
    )
    const [mounted, setMounted] = React.useState(false)
    const [isExpanded, setIsExpanded] = React.useState(false)
    const [activeImageIndex, setActiveImageIndex] = React.useState(0)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    const isDigital = product.productType === "DIGITAL"
    const hasVariants = product.variants.length > 1
    const isOutOfStock = selectedVariant.stock === 0

    const handleAddToCart = () => {
        try {
            onAddToCart({
                productId: product.id,
                variantId: selectedVariant.id,
                title: product.name,
                subtitle: selectedVariant.name || "Estándar",
                imageSrc: product.images[activeImageIndex] || product.images[0] || "",
                price: Number(selectedVariant.price),
                quantity: 1,
                productType: product.productType
            })
            toast.success("Producto agregado al carrito")
        } catch (error) {
            console.error(error)
            toast.error("Error al añadir al carrito")
        }
    }

    return (
        <div className="grid md:grid-cols-2 gap-6 lg:gap-10">
            {/* COLUMNA IZQUIERDA: Back + Galería */}
            <div 
                className={cn(
                    "space-y-4 transition duration-700 ease-out transform",
                    mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                )}
            >
                {/* Botón de regreso con color del tenant */}
                <button
                    onClick={() => window.history.back()}
                    className="group flex items-center gap-2.5 cursor-pointer transition-all duration-200 hover:gap-3"
                    aria-label="Volver a la tienda"
                >
                    <div 
                        className="flex items-center justify-center w-9 h-9 rounded-full border transition-all duration-300 group-hover:scale-110 active:scale-95"
                        style={{ 
                            backgroundColor: `${primaryColor}12`,
                            borderColor: `${primaryColor}30`,
                        }}
                    >
                        <ArrowLeft 
                            className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" 
                            style={{ color: primaryColor }}
                        />
                    </div>
                    <span className="text-sm font-medium text-zinc-400 group-hover:text-white transition-colors duration-200">Tienda</span>
                </button>
                <div 
                    onClick={() => setIsExpanded(!isExpanded)}
                    className={cn(
                        "w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] md:w-full md:left-auto md:right-auto md:ml-0 md:mr-0 z-0 overflow-hidden md:rounded-2xl bg-zinc-900 border border-white/5 cursor-pointer shadow-xl group lg:mx-auto lg:max-h-[calc(100dvh-220px)]",
                        isDigital ? "lg:max-w-[calc((100dvh-220px)*0.67)]" : "lg:max-w-[calc((100dvh-220px)*0.9)]"
                    )}
                >
                    <AdaptiveImage
                        src={product.images[activeImageIndex] || "/placeholder.jpg"}
                        alt={product.name}
                        aspectRatio={isDigital ? "portrait" : "9/10"}
                        priority
                        className="transition-transform duration-700 hover:scale-105"
                    />
                    {isDigital && (
                        <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground shadow-md font-semibold">Digital</Badge>
                    )}
                    
                    {/* Overlay de Título para Móvil (Se oculta al expandir) */}
                    <div className={cn(
                        "absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/80 to-transparent md:hidden flex flex-col justify-end min-h-[160px] transition-opacity duration-300",
                        isExpanded ? "opacity-0" : "opacity-100"
                    )}>
                        <h1 className="text-2xl font-bold tracking-wide text-white leading-tight">
                            {product.name}
                        </h1>
                    </div>
                </div>

                {/* Lista horizontal de Miniaturas (Thumbnails) */}
                {product.images && product.images.length > 1 && (
                    <div className="flex gap-3 overflow-x-auto py-2 px-1 scrollbar-hide justify-center md:justify-start">
                        {product.images.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveImageIndex(idx)}
                                className={cn(
                                    "relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 transform active:scale-95 shrink-0 shadow-sm",
                                    activeImageIndex === idx
                                        ? "border-primary scale-105 shadow-lg shadow-primary/20"
                                        : "border-white/5 bg-white/[0.02] hover:border-white/20 hover:scale-102"
                                )}
                            >
                                <img
                                    src={img}
                                    alt={`${product.name} mini ${idx + 1}`}
                                    className="w-full h-full object-cover"
                                />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* COLUMNA DERECHA: Info y Acciones */}
            <div 
                className={cn(
                    "flex flex-col gap-8 transition duration-700 delay-200 ease-out transform",
                    mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                )}
            >
                <div className="space-y-4">
                    <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl hidden md:block">
                        {product.name}
                    </h1>

                    {/* Botón de Compartir */}
                    <div className="flex">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-xs flex items-center gap-2 border-white/5 bg-white/[0.02] text-zinc-300 hover:text-white hover:bg-white/[0.08] hover:border-white/15 rounded-full transition-all duration-300 px-4 py-2"
                            onClick={() => {
                                if (navigator.share) {
                                    navigator.share({
                                        title: product.name,
                                        url: window.location.href
                                    }).catch(() => {})
                                } else {
                                    navigator.clipboard.writeText(window.location.href);
                                    toast.success("Enlace copiado al portapapeles");
                                }
                            }}
                        >
                            <Share2 className="h-3.5 w-3.5" />
                            Compartir Producto
                        </Button>
                    </div>

                    <p className="text-zinc-300 text-base leading-relaxed font-light">
                        {product.description}
                    </p>
                </div>

                {/* Selector de Variantes (Solo si existen múltiples) */}
                {hasVariants && (
                    <div className="space-y-3">
                        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Opciones Disponibles</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {product.variants.map((variant) => (
                                <button
                                    key={variant.id}
                                    onClick={() => setSelectedVariant(variant)}
                                    disabled={variant.stock === 0}
                                    className={cn(
                                        "relative flex items-center justify-between gap-4 rounded-xl border p-4 text-sm font-medium transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-ring transform hover:scale-[1.02] active:scale-[0.98] text-left",
                                        selectedVariant.id === variant.id
                                            ? "border-primary bg-primary/10 text-white shadow-lg shadow-primary/10 ring-1 ring-primary"
                                            : "border-white/5 bg-white/[0.02] text-zinc-300 hover:border-white/10 hover:bg-white/[0.05] hover:text-white",
                                        variant.stock === 0 && "opacity-40 cursor-not-allowed hover:scale-100 active:scale-100"
                                    )}
                                >
                                    <div className="flex flex-col items-start gap-0.5">
                                        <span className="font-semibold text-white tracking-wide">{variant.name || "Estándar"}</span>
                                        <span className="text-xs text-zinc-400 font-normal">
                                            {variant.stock > 0 ? (
                                                variant.stock < 10 ? (
                                                    <span className="text-amber-500 font-medium">¡Solo quedan {variant.stock}!</span>
                                                ) : (
                                                    "Disponible"
                                                )
                                            ) : (
                                                "Agotado"
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex items-center">
                                        {selectedVariant.id === variant.id ? (
                                            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-primary-foreground animate-in zoom-in-50 duration-200">
                                                <Check className="h-3 w-3 stroke-[3]" />
                                            </div>
                                        ) : (
                                            <div className="w-5 h-5 rounded-full border border-white/20" />
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Zona de Precio y Acción - Compacta y Premium */}
                <div className="mt-2 p-5 rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/5 shadow-2xl space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Precio Total</span>
                            <PriceDisplay
                                price={Number(selectedVariant.price)}
                                size="lg"
                                className="text-white font-extrabold tracking-tight text-2xl"
                            />
                        </div>
                        {/* Indicador de Stock */}
                        {!isDigital && (
                            <Badge 
                                variant={isOutOfStock ? "destructive" : "outline"} 
                                className={cn(
                                    "px-2.5 py-0.5 rounded-full text-[11px] font-semibold border",
                                    isOutOfStock 
                                        ? "bg-red-500/10 border-red-500/20 text-red-400" 
                                        : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                )}
                            >
                                {isOutOfStock ? "Agotado" : "En Stock"}
                            </Badge>
                        )}
                    </div>

                    <Button
                        size="lg"
                        className={cn(
                            "w-full text-sm font-bold h-12 rounded-xl transition-all duration-300 flex items-center justify-center gap-2",
                            isOutOfStock
                                ? "bg-zinc-850 border border-zinc-800 text-zinc-500 cursor-not-allowed"
                                : "bg-primary hover:bg-primary/95 text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/35 transform hover:-translate-y-0.5 active:translate-y-0"
                        )}
                        disabled={isOutOfStock}
                        onClick={handleAddToCart}
                    >
                        {isDigital ? (
                            <>
                                <Download className="h-4 w-4 animate-pulse" /> Descargar Ahora
                            </>
                        ) : (
                            <>
                                <ShoppingCart className="h-4 w-4" />
                                {isOutOfStock ? "Sin Stock" : "Añadir al Carrito"}
                            </>
                        )}
                    </Button>

                    <p className="text-[11px] text-center text-zinc-500 font-medium">
                        {isDigital ? "✨ Entrega inmediata vía email." : "🚚 Envío calculado en el siguiente paso."}
                    </p>
                </div>

                {/* Especificaciones Técnicas (JSON) */}
                {product.specs && Object.keys(product.specs).filter(k => k !== 'attachments').length > 0 && (
                    <div className="pt-6 border-t border-white/10">
                        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-400">Especificaciones</h3>
                        <ProductSpecs specs={Object.fromEntries(Object.entries(product.specs).filter(([k]) => k !== 'attachments'))} />
                    </div>
                )}

                {/* Documentos Adjuntos (Dinámicos) */}
                {product.specs?.attachments && Array.isArray(product.specs.attachments) && product.specs.attachments.length > 0 && (
                    <div className="pt-6 border-t border-white/10 space-y-3">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Documentos Adjuntos</h3>
                        <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                            {product.specs.attachments.map((doc: any, i: number) => (
                                doc.url && (
                                    <Button key={i} variant="outline" className="w-full sm:w-auto border-white/5 bg-white/[0.02] text-zinc-300 hover:text-white hover:bg-white/[0.08]" asChild>
                                        <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                            <FileText className="mr-2 h-4 w-4 text-primary" />
                                            {doc.name || `Documento ${i + 1}`}
                                        </a>
                                    </Button>
                                )
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
