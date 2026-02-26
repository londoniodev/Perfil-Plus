import { AdminPageWrapper } from "@alvarosky/ui"
import { ProductForm } from "@/components/admin/products/product-form"
import { API_BASE, TENANT_ID } from "@/lib/config"

export default async function CreateMenuPage() {
    return (
        <AdminPageWrapper
            title="Nuevo Plato"
            description="Agrega un nuevo ítem a tu menú"
            className="flex-1 space-y-4"
        >
            <ProductForm
                initialData={{
                    productType: "RESTAURANT",
                    modifierGroups: []
                }}
            />
        </AdminPageWrapper>
    )
}
