import { getMyActiveOrders } from "@/actions/driver"
import { DriverOrderCard } from "@/components/driver/DriverOrderCard"
import { DriverMobileHeader } from "@/components/driver/DriverMobileHeader"
import { PackageX } from "lucide-react"
import { Suspense } from "react"
import { Skeleton } from "@alvarosky/ui"

export const dynamic = "force-dynamic"
export const revalidate = 0

async function DriverOrdersList() {
    const orders = await getMyActiveOrders()

    if (orders.length === 0) {
        return (
            <section className="flex flex-col items-center justify-center h-64 text-muted-foreground" aria-label="Sin pedidos">
                <PackageX className="w-16 h-16 mb-4 opacity-30" aria-hidden="true" />
                <h2 className="text-xl font-bold text-foreground">Sin Asignaciones</h2>
                <p className="text-sm mt-2">Actualmente no tienes pedidos pendientes.</p>
            </section>
        )
    }

    return (
        <section className="flex flex-col gap-4" aria-label="Lista de pedidos asignados">
            {orders.map((order: any) => (
                <DriverOrderCard 
                    key={order.id} 
                    order={order} 
                    onDelivered={async () => {
                        "use server"
                    }} 
                />
            ))}
        </section>
    )
}

function OrdersSkeleton() {
    return (
        <div className="flex flex-col gap-4">
            <Skeleton className="h-[300px] w-full rounded-2xl bg-white/5 border border-white/10" />
            <Skeleton className="h-[300px] w-full rounded-2xl bg-white/5 border border-white/10" />
        </div>
    )
}

export default function DriverDashboardPage() {
    return (
        <main className="min-h-screen bg-background pb-20">
            <DriverMobileHeader />

            <div className="px-4 max-w-md mx-auto relative z-0">
                <Suspense fallback={<OrdersSkeleton />}>
                    <DriverOrdersList />
                </Suspense>
            </div>
        </main>
    )
}
