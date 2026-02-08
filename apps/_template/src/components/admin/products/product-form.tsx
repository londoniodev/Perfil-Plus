"use client"

import { ProductForm as SharedProductForm } from "@alvarosky/ui"
import { createProduct } from "@/actions/admin/create-product"
import { API_BASE, TENANT_ID } from "@/lib/config"

interface ProductFormProps {
    initialData?: any
}

export function ProductForm({ initialData }: ProductFormProps) {
    return (
        <SharedProductForm
            initialData={initialData}
            onSubmit={createProduct}
            apiBase={API_BASE}
            tenantId={TENANT_ID}
            backUrl="/admin/products"
        />
    )
}
