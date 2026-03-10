import { notFound } from "next/navigation"
import { serverFetch } from "@/lib/api-server"
import { PageHeader } from "@alvarosky/ui"
import { ProductConfigurator } from "@/components/shop/product-configurator"

interface ProductPageProps {
    params: Promise<{ slug: string }> // En Next.js 15+, params es una Promise
}

export default async function ProductPage({ params }: ProductPageProps) {
    // Await params (requerido en Next.js 15+)
    const { slug } = await params

    // Fetch seguro con Variantes usando Headless REST API (NestJS)
    const product = await serverFetch<any>(`/store/products/${slug}`).catch(() => null);

    if (!product) {
        return notFound()
    }

    // Si no hay variantes activas (edge case), mostramos mensaje
    if (product.variants.length === 0) {
        return (
            <div className="container py-20">
                <p className="text-center text-muted-foreground">
                    Este producto no está disponible actualmente.
                </p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col pt-24">
            <div className="container py-8 md:py-12 relative z-10">
                {/* Breadcrumbs simplificados */}
                <div className="mb-8">
                    <PageHeader
                        title="Tienda"
                        description={`/ ${product.name}`}
                        className="py-0 md:py-0 text-white"
                    />
                </div>

                {/* Renderizamos el Cliente Component */}
                <div className="dark text-foreground">
                    <ProductConfigurator product={product} />
                </div>
            </div>
        </div>
    )
}
