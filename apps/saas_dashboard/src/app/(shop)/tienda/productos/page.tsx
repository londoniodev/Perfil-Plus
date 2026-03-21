import { redirect } from "next/navigation"
import Link from "next/link"
import { getSessionUser } from "@/lib/auth-server"
import { serverFetch } from "@/lib/api-server"
import { Button, AdminPageWrapper, IconPlus } from "@alvarosky/ui"
import { formatProductForTable } from "@alvarosky/shared"
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

    // 3. Transformar datos para la tabla usando utilidad centralizada (DRY)
    const tableData = products.map(formatProductForTable);

    return (
        <AdminPageWrapper
            title="Productos"
            description="Gestiona el catálogo de tu tienda"
            actions={
                <Button asChild className="transition duration-200 hover:scale-[1.01] active:scale-[0.98]">
                    <Link href="/tienda/productos/nuevo">
                        <IconPlus className="mr-2 h-4 w-4" />
                        Nuevo Producto
                    </Link>
                </Button>
            }
        >
            <ProductsTableClient data={tableData} />
        </AdminPageWrapper>
    )
}
