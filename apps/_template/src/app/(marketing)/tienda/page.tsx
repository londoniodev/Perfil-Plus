import { headers } from "next/headers"
import { StoreClient } from "@/components/store/StoreClient"
import { API_BASE } from "@/lib/config"

export const metadata = {
    title: "Tienda Oficial - Nuestros Productos",
    description: "Explora y adquiere nuestros productos físicos y descargas digitales."
}

export default async function TiendaPage() {
    const headersList = await headers()
    // Resolving x-tenant-id passed down from Edge Middleware
    const tenantId = headersList.get("x-tenant-id") || "template"

    // Pre-fetch catálogo pesado con ISR de 5 minutos
    let initialData = []
    try {
        const res = await fetch(`${API_BASE}/store/products?allVariants=true`, {
            headers: { 'x-tenant-id': tenantId },
            next: { revalidate: 300 }
        })
        if (res.ok) {
            initialData = await res.json()
        }
    } catch (e) {
        console.error("Failed to fetch initial store data:", e)
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Storefront Header */}
            <header className="bg-white border-b border-slate-200 py-12 px-6 sm:px-10 lg:px-20 text-center">
                <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
                    Nuestra Tienda
                </h1>
                <p className="max-w-2xl mx-auto text-lg text-slate-500">
                    Descubre nuestra colección de productos exclusivos. Compra segura, rápida y con entrega inmediata para archivos digitales.
                </p>
            </header>

            {/* Main Catalog View */}
            <main className="flex-1 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-20 py-12">
                <StoreClient tenantId={tenantId} initialData={initialData} />
            </main>
        </div>
    )
}
