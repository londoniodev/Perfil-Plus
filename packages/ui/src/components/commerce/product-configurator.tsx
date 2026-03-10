"use client"

import * as React from "react"
import { PriceDisplay } from "../../price-display"
import { ProductSpecs } from "../../product-specs"
import { AdaptiveImage } from "../../adaptive-image"
import { Button } from "../../button"
import { Badge } from "../../badge"
import { useToast } from "../../toast"
import { Check, ShoppingCart, Download, FileText } from "lucide-react"
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
}

// ============================================
// ProductConfigurator Component
// ============================================

export function ProductConfigurator({ product, onAddToCart }: ProductConfiguratorProps) {
    const toast = useToast()

    // Estado: Variante seleccionada (Por defecto la default o la primera con stock)
    const [selectedVariant, setSelectedVariant] = React.useState<ProductVariantData>(
        product.variants.find(v => v.isDefault) || product.variants[0]
    )

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
                imageSrc: product.images[0],
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
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* COLUMNA IZQUIERDA: Galería */}
            <div className="space-y-4">
                <div className="relative overflow-hidden rounded-xl border bg-muted">
                    <AdaptiveImage
                        src={product.images[0] || "/placeholder.jpg"}
                        alt={product.name}
                        aspectRatio={isDigital ? "portrait" : "square"}
                        priority
                        className="transition-all"
                    />
                    {isDigital && (
                        <Badge className="absolute top-4 left-4 bg-blue-600">Digital</Badge>
                    )}
                </div>
            </div>

            {/* COLUMNA DERECHA: Info y Acciones */}
            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                        {product.name}
                    </h1>
                    <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
                        {product.description}
                    </p>
                </div>

                {/* Selector de Variantes (Solo si existen múltiples) */}
                {hasVariants && (
                    <div className="space-y-3">
                        <span className="text-sm font-medium text-muted-foreground">Opciones Disponibles:</span>
                        <div className="flex flex-wrap gap-3">
                            {product.variants.map((variant) => (
                                <button
                                    key={variant.id}
                                    onClick={() => setSelectedVariant(variant)}
                                    disabled={variant.stock === 0}
                                    className={cn(
                                        "relative flex items-center justify-between gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                        selectedVariant.id === variant.id
                                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                                            : "hover:bg-muted/50 hover:text-foreground",
                                        variant.stock === 0 && "opacity-50 cursor-not-allowed"
                                    )}
                                >
                                    <span className="flex flex-col items-start">
                                        <span>{variant.name || "Estándar"}</span>
                                        {variant.stock > 0 && variant.stock < 10 && (
                                            <span className="text-[10px] text-orange-600 font-normal">
                                                ¡Solo quedan {variant.stock}!
                                            </span>
                                        )}
                                    </span>

                                    {selectedVariant.id === variant.id && (
                                        <Check className="h-4 w-4 text-primary" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Zona de Precio y Acción */}
                <div className="mt-4 p-6 rounded-xl border bg-card text-card-foreground shadow-sm space-y-6">
                    <div className="flex items-end justify-between">
                        <div className="space-y-1">
                            <span className="text-sm font-medium text-muted-foreground">Precio Total</span>
                            <PriceDisplay
                                price={Number(selectedVariant.price)}
                                size="lg"
                            />
                        </div>
                        {/* Indicador de Stock */}
                        {!isDigital && (
                            <Badge variant={isOutOfStock ? "destructive" : "outline"} className="h-fit">
                                {isOutOfStock ? "Agotado" : "En Stock"}
                            </Badge>
                        )}
                    </div>

                    <Button
                        size="lg"
                        className="w-full text-lg h-12"
                        disabled={isOutOfStock}
                        onClick={handleAddToCart}
                    >
                        {isDigital ? (
                            <>
                                <Download className="mr-2 h-5 w-5" /> Descargar Ahora
                            </>
                        ) : (
                            <>
                                <ShoppingCart className="mr-2 h-5 w-5" />
                                {isOutOfStock ? "Sin Stock" : "Añadir al Carrito"}
                            </>
                        )}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                        {isDigital
                            ? "Entrega inmediata vía email tras la compra."
                            : "Envío calculado en el siguiente paso."}
                    </p>
                </div>

                {/* Especificaciones Técnicas (JSON) */}
                {product.specs && Object.keys(product.specs).filter(k => k !== 'attachments').length > 0 && (
                    <div className="pt-6 border-t">
                        <h3 className="mb-4 text-sm font-medium">Especificaciones</h3>
                        <ProductSpecs specs={Object.fromEntries(Object.entries(product.specs).filter(([k]) => k !== 'attachments'))} />
                    </div>
                )}

                {/* Documentos Adjuntos (Dinámicos) */}
                {product.specs?.attachments && Array.isArray(product.specs.attachments) && product.specs.attachments.length > 0 && (
                    <div className="pt-6 border-t space-y-3">
                        <h3 className="text-sm font-medium">Documentos Adjuntos</h3>
                        <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                            {product.specs.attachments.map((doc: any, i: number) => (
                                doc.url && (
                                    <Button key={i} variant="outline" className="w-full sm:w-auto" asChild>
                                        <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                            <FileText className="mr-2 h-4 w-4" />
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
