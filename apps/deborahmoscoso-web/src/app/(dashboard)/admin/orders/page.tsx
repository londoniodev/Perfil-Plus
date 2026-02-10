import { redirect } from "next/navigation"
import { getSessionUser } from "@/lib/auth-server"
import { prisma } from "@alvarosky/database"
import { PriceDisplay, AdminPageWrapper } from "@alvarosky/ui"
import { OrdersTableClient } from "./orders-table-client"

export default async function OrdersPage() {
    // 1. Verificar autenticación y rol
    const user = await getSessionUser()

    if (!user) {
        redirect("/login")
    }

    if (user.role !== "ADMIN") {
        redirect("/")
    }

    // 2. Obtener órdenes con relaciones
    const orders = await prisma.order.findMany({
        include: {
            user: {
                select: {
                    email: true,
                    name: true
                }
            },
            items: {
                include: {
                    variant: {
                        include: {
                            product: {
                                select: {
                                    name: true,
                                    images: true,
                                    productType: true
                                }
                            }
                        }
                    }
                }
            }
        },
        orderBy: { createdAt: "desc" }
    })

    // 3. Transform data for table to match OrderData from @alvarosky/ui
    const tableData = orders.map(order => ({
        id: order.id,
        orderNumber: order.id.slice(-8).toUpperCase(),
        status: order.status,
        totalAmount: Number(order.totalAmount),
        createdAt: order.createdAt,
        user: {
            name: order.user.name,
            email: order.user.email
        },
        shippingData: {}, // Map if available in prisma schema
        items: order.items.map(item => ({
            id: item.id,
            quantity: item.quantity,
            price: Number(item.price),
            variant: {
                name: (item.variant as any).name, // Cast if necessary or fix include
                product: {
                    name: item.variant.product.name,
                    images: item.variant.product.images
                }
            }
        }))
    }))

    // 4. Calculate stats
    const totalSales = orders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
    const totalOrders = orders.length;
    const averageTicket = totalOrders > 0 ? totalSales / totalOrders : 0;
    const pendingOrders = orders.filter(o => o.status === "PENDING").length;

    const stats = {
        totalSales,
        totalOrders,
        averageTicket,
        pendingOrders
    };

    return (
        <AdminPageWrapper
            title="Órdenes"
            description="Gestiona las ventas y pedidos de tu tienda"
        >
            {/* Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="rounded-xl border bg-card text-card-foreground shadow p-4">
                    <div className="text-sm font-medium text-muted-foreground">Total Ventas</div>
                    <div className="text-2xl font-bold mt-2">
                        <PriceDisplay price={stats.totalSales} />
                    </div>
                </div>
                <div className="rounded-xl border bg-card text-card-foreground shadow p-4">
                    <div className="text-sm font-medium text-muted-foreground">Órdenes</div>
                    <div className="text-2xl font-bold mt-2">{stats.totalOrders}</div>
                </div>
                <div className="rounded-xl border bg-card text-card-foreground shadow p-4">
                    <div className="text-sm font-medium text-muted-foreground">Ticket Medio</div>
                    <div className="text-2xl font-bold mt-2">
                        <PriceDisplay price={stats.averageTicket} />
                    </div>
                </div>
                <div className="rounded-xl border bg-card text-card-foreground shadow p-4">
                    <div className="text-sm font-medium text-muted-foreground">Pendientes</div>
                    <div className="text-2xl font-bold mt-2">{stats.pendingOrders}</div>
                </div>
            </div>

            {/* Orders Table */}
            <OrdersTableClient data={tableData} />
        </AdminPageWrapper>
    )
}
