import { getMyActiveOrders } from "@/actions/driver"
import { DriverOrderCard } from "@/components/driver/DriverOrderCard"
import { PackageX } from "lucide-react"
import { Suspense } from "react"
import { Skeleton } from "@alvarosky/ui"

export const dynamic = "force-dynamic"
export const revalidate = 0

async function DriverOrdersList() {
    const orders = await getMyActiveOrders()

    if (orders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <PackageX className="w-16 h-16 mb-4 opacity-50" />
                <h3 className="text-xl font-bold text-gray-700">Sin Asignaciones</h3>
                <p className="text-sm mt-2">Actualmente no tienes pedidos pendientes.</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-4">
            {orders.map((order: any) => (
                <DriverOrderCard 
                    key={order.id} 
                    order={order} 
                    onDelivered={async () => {
                        "use server"
                        // Dummy server action for revalidation if needed from client proxy
                    }} 
                />
            ))}
        </div>
    )
}

function OrdersSkeleton() {
    return (
        <div className="flex flex-col gap-4">
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
        </div>
    )
}

export default function DriverDashboardPage() {
    return (
        <main className="min-h-screen bg-gray-50 pb-20">
            {/* Header Móvil */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm px-4 py-4 mb-6">
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">Mis Pedidos</h1>
                <p className="text-sm text-gray-500">Ruta sugerida. Entregas pendientes.</p>
            </div>

            {/* Layout centrado y restringido a Mobile (max-w-md) para confort de una mano */}
            <div className="px-4 max-w-md mx-auto">
                <Suspense fallback={<OrdersSkeleton />}>
                    <DriverOrdersList />
                </Suspense>
            </div>
        </main>
    )
}
