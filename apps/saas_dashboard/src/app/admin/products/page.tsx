import { redirect } from "next/navigation"
import Link from "next/link"
import { getSessionUser } from "@/lib/auth-server"
import { serverFetch } from "@/lib/api-server"
import { Button, AdminPageWrapper } from "@alvarosky/ui"
import { Plus } from "lucide-react"
import { ProductsTableClient } from "./products-table-client"

// Server Component - Fetches data
export default async function ProductsPage() {
    // 1. Verificar autenticación y rol
    const user = await getSessionUser()

    if (!user) {
        redirect("/login")
    }

    if (user.role !== "ADMIN") {
        redirect("/")
    }

    // 2. Obtener productos a través state HTTP Fetch a REST NestJS (Headless Multi-Tenant)
    const productsRes = await serverFetch<any[]>('/admin/products');
    // Prevenir errores en caso de fallo del API Array 
    const products = Array.isArray(productsRes) ? productsRes.filter((p: any) => p.productType !== "RESTAURANT") : [];

    // 3. Transformar datos para la tabla
    const tableData = products.map((product: any) => {
        // Calcular stock total
        const totalStock = product.variants ? product.variants.reduce((sum: any, variant: any) => {
            if (variant.stock === -1) return Infinity
            return sum + variant.stock
        }, 0) : 0

        // Precio mínimo de las variantes
        const minPrice = product.variants && product.variants.length > 0 ? Math.min(
            Number(product.basePrice),
            ...product.variants.map((v: any) => Number(v.price))
        ) : Number(product.basePrice)

        return {
            id: product.id,
            name: product.name,
            image: product.images[0] || "/placeholder.jpg",
            type: product.productType as "PHYSICAL" | "DIGITAL" | "SERVICE",
            price: minPrice,
            stock: totalStock === Infinity ? "Ilimitado" : totalStock,
            published: product.published,
            isAvailable: product.isAvailable,
            createdAt: product.createdAt
        }
    })

    return (
        <AdminPageWrapper
            title="Productos"
            description="Gestiona el catálogo de tu tienda"
            actions={
                <Button asChild className="transition-all duration-200 hover:scale-[1.01] active:scale-[0.98]">
                    <Link href="/admin/products/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Nuevo Producto
                    </Link>
                </Button>
            }
        >
            <ProductsTableClient data={tableData} />
        </AdminPageWrapper>
    )
}
