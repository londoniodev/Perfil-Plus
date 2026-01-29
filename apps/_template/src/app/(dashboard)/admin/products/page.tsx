import { redirect } from "next/navigation"
import Link from "next/link"
import { getSessionUser } from "@/lib/auth-server"
import { prisma } from "@alvarosky/database"
import { Button } from "@alvarosky/ui"
import { Plus } from "lucide-react"
import { PageWrapper } from "@/components/layout/PageWrapper"
import { ProductsTableClient } from "./products-table-client"

// Server Component - Fetches data
export default async function ProductsPage() {
    // 1. Verificar autenticación y rol
    const user = await getSessionUser()

    if (!user) {
        redirect("/auth/login")
    }

    if (user.role !== "ADMIN") {
        redirect("/")
    }

    // 2. Obtener productos con variantes
    const products = await prisma.product.findMany({
        include: {
            variants: {
                select: {
                    stock: true,
                    price: true
                }
            }
        },
        orderBy: { createdAt: "desc" }
    })

    // 3. Transformar datos para la tabla
    const tableData = products.map((product) => {
        // Calcular stock total
        const totalStock = product.variants.reduce((sum, variant) => {
            if (variant.stock === -1) return Infinity
            return sum + variant.stock
        }, 0)

        // Precio mínimo de las variantes
        const minPrice = Math.min(
            Number(product.basePrice),
            ...product.variants.map(v => Number(v.price))
        )

        return {
            id: product.id,
            name: product.name,
            image: product.images[0] || "/placeholder.jpg",
            type: product.productType as "PHYSICAL" | "DIGITAL" | "SERVICE",
            price: minPrice,
            stock: totalStock === Infinity ? "Ilimitado" : totalStock,
            published: product.published,
            createdAt: product.createdAt
        }
    })

    return (
        <PageWrapper
            title="Productos"
            description="Gestiona el catálogo de tu tienda"
            breadcrumbs={[
                { label: "Admin", href: "/admin" },
                { label: "Productos" }
            ]}
            maxWidth="full"
        >
            {/* Action Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                        {tableData.length} producto(s) en tu catálogo
                    </p>
                </div>
                <Button asChild className="transition-all duration-200 hover:scale-[1.01] active:scale-[0.98]">
                    <Link href="/admin/products/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Nuevo Producto
                    </Link>
                </Button>
            </div>

            {/* Products Table (Client Component) */}
            <ProductsTableClient data={tableData} />
        </PageWrapper>
    )
}
