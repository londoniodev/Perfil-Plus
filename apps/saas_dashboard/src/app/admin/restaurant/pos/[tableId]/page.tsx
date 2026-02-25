import { POSInterface } from "../_components/POSInterface"
import { getPOSProducts } from "@/actions/pos"
import { AdminPageWrapper } from "@alvarosky/ui"
import { serverFetch } from "@/lib/api-server"
import { notFound } from "next/navigation"

export default async function POSTablePage({ params }: { params: Promise<{ tableId: string }> }) {
    const { tableId } = await params

    // Fetch table details via Headless NestJS API to guarantee Anti-IDOR (Tenant scoped)
    const table = await serverFetch<any>(`/tables/${tableId}`).catch(() => null);

    if (!table) {
        notFound();
    }

    const products = await getPOSProducts()

    return (
        <AdminPageWrapper
            title={`Atendiendo ${table.label}`}
            description="Selecciona productos para agregar al pedido."
        >
            <POSInterface
                products={products}
                tableId={tableId}
                tableName={table.label}
            />
        </AdminPageWrapper>
    )
}
