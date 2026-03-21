"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
    Button,
    Badge,
    PriceDisplay,
    IconEdit,
    IconTrash,
    IconExternalLink,
} from "@alvarosky/ui"
import dynamic from "next/dynamic"

const AdminDataSheet = dynamic(() => import("@alvarosky/ui").then((mod) => mod.AdminDataSheet))
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
        RESTAURANT: { label: "Menú", variant: "secondary" },
    }

    return (
        <>
            <ProductsTable
                data={data}
                onView={handleView}
                onDelete={handleDelete}
                onToggleAvailable={handleToggleAvailable}
            />

            {/* Quick View Sheet abstracted into AdminDataSheet (DRY) */}
            <AdminDataSheet
                open={isSheetOpen}
                onOpenChange={setIsSheetOpen}
                title="Detalles del Producto"
                description="Vista rápida de la información del producto"
                image={selectedProduct?.image}
                fields={selectedProduct ? [
                    { label: "Nombre", value: selectedProduct.name },
                    { 
                        label: "Estado", 
                        value: null, 
                        render: () => (
                            <div className="flex items-center gap-2">
                                <Badge variant={productTypeBadge[selectedProduct.type].variant}>
                                    {productTypeBadge[selectedProduct.type].label}
                                </Badge>
                                <Badge variant={selectedProduct.published ? "default" : "outline"}>
                                    {selectedProduct.published ? "Activo" : "Borrador"}
                                </Badge>
                            </div>
                        )
                    },
                    { 
                        label: "Precio", 
                        value: null, 
                        render: () => <PriceDisplay price={selectedProduct.price} size="lg" /> 
                    },
                    { 
                        label: "Stock", 
                        value: selectedProduct.stock === "Ilimitado" ? "∞" : selectedProduct.stock 
                    },
                ] : []}
                actions={selectedProduct && (
                    <>
                        <Button asChild className="w-full">
                            <Link href={
                                selectedProduct.type === "RESTAURANT"
                                    ? `/restaurante/menu/${selectedProduct.id}`
                                    : `/tienda/productos/${selectedProduct.id}`
                            }>
                                <IconEdit className="mr-2 h-4 w-4" />
                                Editar Producto
                            </Link>
                        </Button>
                        <Button variant="outline" asChild className="w-full">
                            <Link href={`/productos/${selectedProduct.id}`} target="_blank">
                                <IconExternalLink className="mr-2 h-4 w-4" />
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
                            <IconTrash className="mr-2 h-4 w-4" />
                            Eliminar
                        </Button>
                    </>
                )}
            />
        </>
    )
}
