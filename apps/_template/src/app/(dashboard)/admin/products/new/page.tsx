import { PageHeader } from "@alvarosky/ui"
import { ProductForm } from "@/components/admin/products/product-form"

export default function NewProductPage() {
    return (
        <div className="space-y-6">
            <PageHeader
                title="Nuevo Producto"
                description="Crea un nuevo producto digital o físico para tu tienda"
            />

            <ProductForm />
        </div>
    )
}

