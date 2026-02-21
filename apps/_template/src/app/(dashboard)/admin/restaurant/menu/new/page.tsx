import { ProductForm } from "@/components/admin/products/product-form"
import { API_BASE, TENANT_ID } from "@/lib/config"

export default async function CreateMenuPage() {
    // If we support editing here too, we'd fetch data. For now, it's just 'new' page logic mostly.

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold tracking-tight">Nuevo Plato</h2>
                    <p className="text-sm text-muted-foreground">
                        Agrega un nuevo ítem a tu menú
                    </p>
                </div>
            </div>

            {/* 
                We reuse ProductForm but inject defaultValues to force RESTAURANT type.
                The form logic will handle showing/hiding fields based on this type.
            */}
            <ProductForm
                initialData={{
                    productType: "RESTAURANT",
                    modifierGroups: []
                }}
            />
        </div>
    )
}
