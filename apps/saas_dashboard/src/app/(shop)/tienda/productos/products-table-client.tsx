"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    Button,
    Badge,
    Separator,
    PriceDisplay,
} from "@alvarosky/ui"
import { Pencil, Trash2, ExternalLink } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { ProductsTable, ProductTableData } from "@alvarosky/ui"
import { toggleProductAvailability } from "@/actions/admin/toggle-product-availability"
import { deleteProduct } from "@/actions/admin/delete-product"

interface ProductsTableClientProps {
    data: ProductTableData[]
}

export function ProductsTableClient({ data }: ProductsTableClientProps) {
    const router = useRouter()
    const [selectedProduct, setSelectedProduct] = useState<ProductTableData | null>(null)
    const [isSheetOpen, setIsSheetOpen] = useState(false)

    const handleView = (product: ProductTableData) => {
        setSelectedProduct(product)
        setIsSheetOpen(true)
    }

    const handleDelete = async (productId: string) => {
        if (!confirm("¿Estás seguro de eliminar este producto?")) return

        try {
            const result = await deleteProduct(productId)

            if (result.success) {
                toast.success("Producto eliminado correctamente")
                router.refresh()
            } else {
                toast.error(result.error || "Error al eliminar el producto")
            }
        } catch (error) {
            toast.error("Error de conexión")
        }
    }

    const handleToggleAvailable = async (productId: string, isAvailable: boolean) => {
        const loadingToast = toast.loading("Actualizando disponibilidad...")

        try {
            const result = await toggleProductAvailability(productId, isAvailable)

            if (result.success) {
                toast.success(isAvailable ? "Producto visible en tienda" : "Producto oculto de la tienda", {
                    id: loadingToast
                })
            } else {
                toast.error(result.error || "Error al actualizar", {
                    id: loadingToast
                })
                // Trigger a refresh to revert the optimistic UI update if needed, though 
                // revalidatePath in the server action usually handles the data sync.
                router.refresh()
            }
        } catch (error) {
            toast.error("Error de conexión", {
                id: loadingToast
            })
            router.refresh()
        }
    }

    const productTypeBadge: Record<string, { label: string; variant: "secondary" | "default" | "outline" }> = {
        PHYSICAL: { label: "Físico", variant: "secondary" },
        DIGITAL: { label: "Digital", variant: "default" },
        SERVICE: { label: "Servicio", variant: "outline" },
        RESTAURANT: { label: "Menú", variant: "secondary" }, // Reusing secondary or creating new one
    }

    return (
        <>
            <ProductsTable
                data={data}
                onView={handleView}
                onDelete={handleDelete}
                onToggleAvailable={handleToggleAvailable}
            />

            {/* Quick View Sheet */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="sm:max-w-lg">
                    <SheetHeader>
                        <SheetTitle>Detalles del Producto</SheetTitle>
                        <SheetDescription>
                            Vista rápida de la información del producto
                        </SheetDescription>
                    </SheetHeader>

                    {selectedProduct && (
                        <div className="mt-6 space-y-6">
                            {/* Product Image */}
                            <div className="aspect-video relative overflow-hidden rounded-lg border bg-muted">
                                <Image
                                    src={selectedProduct.image}
                                    alt={selectedProduct.name}
                                    fill
                                    sizes="(max-width: 640px) 100vw, 500px"
                                    className="object-cover"
                                />
                            </div>

                            {/* Product Info */}
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-semibold">{selectedProduct.name}</h3>
                                    <div className="flex items-center gap-2 mt-2">
                                        <Badge variant={productTypeBadge[selectedProduct.type].variant}>
                                            {productTypeBadge[selectedProduct.type].label}
                                        </Badge>
                                        <Badge variant={selectedProduct.published ? "default" : "outline"}>
                                            {selectedProduct.published ? "Activo" : "Borrador"}
                                        </Badge>
                                    </div>
                                </div>

                                <Separator />

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Precio</p>
                                        <PriceDisplay price={selectedProduct.price} size="lg" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Stock</p>
                                        <p className="text-lg font-semibold">
                                            {selectedProduct.stock === "Ilimitado" ? "∞" : selectedProduct.stock}
                                        </p>
                                    </div>
                                </div>

                                <Separator />

                                {/* Actions */}
                                <div className="flex flex-col gap-2">
                                    <Button asChild className="w-full">
                                        <Link href={
                                            selectedProduct.type === "RESTAURANT"
                                                ? `/restaurante/menu/${selectedProduct.id}`
                                                : `/tienda/productos/${selectedProduct.id}`
                                        }>
                                            <Pencil className="mr-2 h-4 w-4" />
                                            Editar Producto
                                        </Link>
                                    </Button>
                                    <Button variant="outline" asChild className="w-full">
                                        <Link href={`/productos/${selectedProduct.id}`} target="_blank">
                                            <ExternalLink className="mr-2 h-4 w-4" />
                                            Ver en Tienda
                                        </Link>
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        className="w-full"
                                        onClick={() => {
                                            handleDelete(selectedProduct.id)
                                            setIsSheetOpen(false)
                                        }}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Eliminar
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </>
    )
}
