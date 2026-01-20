import { PageHeader } from "@alvarosky/ui"
import { ProductForm } from "@/components/admin/products/product-form"

export default function NewProductPage() {
    return (
        <div className="space-y-6">
            <PageHeader
                title="Nuevo Producto"
                description="Crea un producto digital o físico para tu tienda"
            />

            <div className="max-w-4xl">
                <ProductForm />
            </div>
        </div>
    )
}

