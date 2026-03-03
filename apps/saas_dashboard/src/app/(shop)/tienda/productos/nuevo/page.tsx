import { AdminPageWrapper } from "@alvarosky/ui"
import { ProductForm } from "@/components/admin/products/product-form"

export default function NewProductPage() {
    return (
        <AdminPageWrapper
            title="Nuevo Producto"
            description="Crea un nuevo producto digital o físico para tu tienda"
        >
            <ProductForm />
        </AdminPageWrapper>
    )
}

