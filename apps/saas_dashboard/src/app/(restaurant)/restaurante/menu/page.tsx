import { redirect } from "next/navigation"
import Link from "next/link"
import { getSessionUser } from "@/lib/auth-server"
import { serverFetch } from "@/lib/api-server"
import { Button, AdminPageWrapper, IconPlus } from "@alvarosky/ui"
import { formatProductForTable } from "@alvarosky/shared"
import { ProductsTableClient } from "@/app/(shop)/tienda/productos/products-table-client"

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

    // 2. Obtener productos TIPO RESTAURANT desde NestJS API (Row-Level Security)
    const productsRes = await serverFetch<any[]>('/admin/products');
    const products = Array.isArray(productsRes) ? productsRes.filter((p: any) => p.productType === "RESTAURANT") : [];

    // 3. Transformar datos para la tabla usando utilidad centralizada (DRY)
    const tableData = products.map(formatProductForTable);

    return (
        <AdminPageWrapper
            title="Menú del Restaurante"
            description="Gestiona los platos y bebidas de tu carta"
            actions={
                <Button asChild className="transition duration-200 hover:scale-[1.01] active:scale-[0.98]">
                    <Link href="/restaurante/menu/nuevo">
                        <IconPlus className="mr-2 h-4 w-4" />
                        Nuevo Plato
                    </Link>
                </Button>
            }
        >
            <ProductsTableClient data={tableData} />
        </AdminPageWrapper>
    )
}
