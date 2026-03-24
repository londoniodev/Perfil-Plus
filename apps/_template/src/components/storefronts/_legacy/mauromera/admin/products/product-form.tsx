"use client"

import { ProductForm as SharedProductForm } from "@alvarosky/ui"
import { useTenant } from "@/app/providers";
import { createProduct } from "@/actions/admin/create-product"
import { API_BASE } from "@/lib/config"

interface ProductFormProps {
    initialData?: any
}

export function ProductForm({ initialData }: ProductFormProps) {
    const { tenantId } = useTenant();

    return (
        <SharedProductForm
            initialData={initialData}
            onSubmit={createProduct}
            apiBase={API_BASE}
            tenantId={tenantId}
            backUrl="/admin/products"
        />
    )
}
