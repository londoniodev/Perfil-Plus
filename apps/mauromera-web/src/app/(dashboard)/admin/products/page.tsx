import { redirect } from "next/navigation"
import { getSessionUser } from "@/lib/auth-server"
import { prisma } from "@alvarosky/database"
import { PageHeader, Button, ProductsTable } from "@alvarosky/ui"
import { Plus } from "lucide-react"
import Link from "next/link"

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

    // 3. Transformar datos para DataTable
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
            type: product.productType,
            price: minPrice,
            stock: totalStock === Infinity ? "Ilimitado" : totalStock,
            published: product.published,
            createdAt: product.createdAt
        }
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <PageHeader
                    title="Productos"
                    description="Gestiona el catálogo de tu tienda"
                />
                <Button asChild>
                    <Link href="/admin/products/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Nuevo Producto
                    </Link>
                </Button>
            </div>

            <ProductsTable data={tableData} />
        </div>
    )
}
