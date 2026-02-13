import { redirect } from "next/navigation"
import Link from "next/link"
import { getSessionUser } from "@/lib/auth-server"
import { prisma } from "@alvarosky/database"
import { Button, AdminPageWrapper } from "@alvarosky/ui"
import { Plus } from "lucide-react"
import { ProductsTableClient } from "../../products/products-table-client"

// Server Component - Fetches data
export default async function RestaurantMenuPage() {
    // 1. Verificar autenticación y rol
    const user = await getSessionUser()

    if (!user) {
        redirect("/login")
    }

    if (user.role !== "ADMIN") {
        redirect("/")
    }

    // 2. Obtener productos TIPO RESTAURANT
    const products = await prisma.product.findMany({
        where: {
            productType: "RESTAURANT" as any
        },
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
    const tableData = products.map((product: any) => {
        // Calcular stock total (Para restaurante suele ser ilimitado, pero mantenemos lógica)
        const totalStock = product.variants ? product.variants.reduce((sum: any, variant: any) => {
            if (variant.stock === -1) return Infinity
            return sum + variant.stock
        }, 0) : 0

        // Precio mínimo
        const minPrice = product.variants && product.variants.length > 0 ? Math.min(
            Number(product.basePrice),
            ...product.variants.map((v: any) => Number(v.price))
        ) : Number(product.basePrice)

        return {
            id: product.id,
            name: product.name,
            image: product.images[0] || "/placeholder.jpg",
            type: product.productType as any,
            price: minPrice,
            stock: totalStock === Infinity ? "Ilimitado" : totalStock,
            published: product.published,
            createdAt: product.createdAt
        }
    })

    return (
        <AdminPageWrapper
            title="Menú del Restaurante"
            description="Gestiona los platos y bebidas de tu carta"
            actions={
                <Button asChild className="transition-all duration-200 hover:scale-[1.01] active:scale-[0.98]">
                    <Link href="/admin/restaurant/menu/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Nuevo Plato
                    </Link>
                </Button>
            }
        >
            <ProductsTableClient data={tableData} />
        </AdminPageWrapper>
    )
}
