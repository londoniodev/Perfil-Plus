import { serverFetch } from "@/lib/api-server"
import { ProductForm } from "@/components/admin/products/product-form"
import { AdminPageWrapper } from "@alvarosky/ui"
import { notFound } from "next/navigation"
import { BreadcrumbSetter } from "@/components/admin/products/BreadcrumbSetter"

interface EditProductPageProps {
    params: Promise<{ id: string }>
}

async function getProduct(id: string) {
    try {
        const product = await serverFetch<any>(`/admin/products/${id}`)
        if (!product) return null

        // Transform decimal to number for form (Backend usually returns numbers but we ensure)
        return {
            ...product,
            basePrice: Number(product.basePrice),
            variants: product.variants?.map((v: any) => ({
                ...v,
                price: Number(v.price)
            })) || [],
            modifierGroups: product.modifierGroups?.map((g: any) => ({
                ...g,
                modifiers: g.modifiers?.map((m: any) => ({
                    ...m,
                    priceAdjustment: Number(m.priceAdjustment)
                })) || []
            })) || []
        }
    } catch (error) {
        console.error("Error fetching product via API:", error)
        return null
    }
}

export default async function EditProductPage({ params }: EditProductPageProps) {
    const { id } = await params
    const product = await getProduct(id)

    if (!product) {
        notFound()
    }

    return (
        <AdminPageWrapper
            title="Editar Producto"
            description={`Editando: ${product.name}`}
            className="space-y-6"
        >
            {/* Override the raw product ID in breadcrumbs with the product name */}
            <BreadcrumbSetter segment={id} label={product.name} />
            <ProductForm initialData={product} />
        </AdminPageWrapper>
    )
}
