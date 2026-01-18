"use client"

import * as React from "react"
import { Product, ProductVariant } from "@prisma/client"
import {
    PriceDisplay,
    ProductSpecs,
    AdaptiveImage,
    Button,
    Badge
} from "@mauromera/ui"
import { Check, ShoppingCart, Download } from "lucide-react"
import { cn } from "@mauromera/ui/lib/utils"
import { useCart } from "@/store/use-cart"
import { useToast } from "@mauromera/ui"

interface ProductConfiguratorProps {
    product: Product & { variants: ProductVariant[] }
}

export function ProductConfigurator({ product }: ProductConfiguratorProps) {
    const cart = useCart()
    const toast = useToast()

    // Estado: Variante seleccionada (Por defecto la default o la primera con stock)
    const [selectedVariant, setSelectedVariant] = React.useState<ProductVariant>(
        product.variants.find(v => v.isDefault) || product.variants[0]
    )

    const isDigital = product.productType === "DIGITAL"
    const hasVariants = product.variants.length > 1
    const isOutOfStock = selectedVariant.stock === 0

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
                        onClick={() => {
                            try {
                                cart.addItem({
                                    productId: product.id,
                                    variantId: selectedVariant.id,
                                    title: product.name,
                                    subtitle: selectedVariant.name || "Estándar",
                                    imageSrc: product.images[0],
                                    price: Number(selectedVariant.price),
                                    quantity: 1,
                                    productType: product.productType
                                });
                                toast.success("Producto agregado al carrito");
                            } catch (error) {
                                console.error(error);
                                toast.error("Error al añadir al carrito");
                            }
                        }}
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
                <div className="pt-6 border-t">
                    <h3 className="mb-4 text-sm font-medium">Especificaciones</h3>
                    <ProductSpecs specs={product.specs as Record<string, string | number>} />
                </div>
            </div>
        </div>
    )
}
