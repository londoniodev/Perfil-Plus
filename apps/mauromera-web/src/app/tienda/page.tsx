import { PageHeader, ProductCard } from "@alvarosky/ui"
import { PrismaClient } from "@prisma/client"
import Link from "next/link"

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic' // Para asegurar que siempre muestre stock fresco

export default async function TiendaPage() {
    // Fetch de datos (Server Side)
    // Filtramos los productos de restaurante ya que la tienda es para productos físicos, digitales o de servicio
    const products = await prisma.product.findMany({
        where: {
            published: true,
            productType: {
                not: "RESTAURANT" as any
            }
        },
        orderBy: { createdAt: 'desc' },
    })

    return (
        <div className="container py-8 md:py-12">
            {/* Header Estandarizado */}
            <PageHeader
                title="Tienda Oficial"
                description="Explora nuestra colección de recursos digitales y productos exclusivos."
                separated
            />

            {/* Grid de Productos */}
            <section className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                    <Link key={product.id} href={`/tienda/${product.slug}`}>
                        <ProductCard
                            title={product.name}
                            slug={product.slug}
                            imageSrc={product.images[0] || "/placeholder.jpg"}
                            // Importante: Prisma devuelve Decimal, UI espera number/string.
                            // Convertimos a Number para evitar warnings de serialización de Next.js
                            price={Number(product.basePrice)}
                            productType={product.productType as "DIGITAL" | "PHYSICAL" | "SERVICE"}
                        />
                    </Link>
                ))}
            </section>

            {/* Estado Vacío (Opcional) */}
            {products.length === 0 && (
                <div className="py-20 text-center text-muted-foreground">
                    No hay productos disponibles en este momento.
                </div>
            )}
        </div>
    )
}

