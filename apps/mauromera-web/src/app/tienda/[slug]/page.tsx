import { notFound } from "next/navigation"
import { PrismaClient } from "@prisma/client"
import { PageHeader } from "@alvarosky/ui"
import { ProductConfigurator } from "@/components/shop/product-configurator"
import { TENANT_ID } from "@/lib/config"

const prisma = new PrismaClient()

interface ProductPageProps {
    params: Promise<{ slug: string }> // En Next.js 15+, params es una Promise
}

export default async function ProductPage({ params }: ProductPageProps) {
    // Await params (requerido en Next.js 15+)
    const { slug } = await params

    // Fetch seguro con Variantes
    const product = await prisma.product.findFirst({
        where: { slug, tenantId: TENANT_ID },
        include: {
            variants: {
                orderBy: { price: 'asc' }
            }
        }
    })

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
        <div className="container py-8 md:py-12">
            {/* Breadcrumbs simplificados */}
            <div className="mb-8">
                <PageHeader
                    title="Tienda"
                    description={`/ ${product.name}`}
                    className="py-0 md:py-0"
                />
            </div>

            {/* Renderizamos el Cliente Component */}
            <ProductConfigurator product={product} />
        </div>
    )
}
