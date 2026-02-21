import { POSInterface } from "../_components/POSInterface"
import { getPOSProducts } from "@/actions/pos"
import { AdminPageWrapper } from "@alvarosky/ui"
import { prisma } from "@alvarosky/database"
import { notFound } from "next/navigation"



export default async function POSTablePage({ params }: { params: Promise<{ tableId: string }> }) {
    const { tableId } = await params

    // Fetch table details
    const table = await prisma.table.findUnique({
        where: { id: tableId }
    })

    if (!table) {
        notFound()
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
