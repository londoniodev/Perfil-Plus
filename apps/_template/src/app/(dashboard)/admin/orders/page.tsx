import { redirect } from "next/navigation"
import { getSessionUser } from "@/lib/auth-server"
import { prisma } from "@alvarosky/database"
import { PageHeader } from "@alvarosky/ui"
import { OrdersTableClient } from "./orders-table-client"

export default async function OrdersPage() {
    // 1. Verificar autenticación y rol
    const user = await getSessionUser()

    if (!user) {
        redirect("/auth/login")
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

    return (
        <div className="space-y-6">
            <PageHeader
                title="Órdenes"
                description="Gestiona las ventas y pedidos de tu tienda"
            />

            {/* Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="rounded-lg border bg-card p-4">
                    <p className="text-sm text-muted-foreground">Total Órdenes</p>
                    <p className="text-2xl font-bold">{orders.length}</p>
                </div>
                <div className="rounded-lg border bg-card p-4">
                    <p className="text-sm text-muted-foreground">Pendientes</p>
                    <p className="text-2xl font-bold text-yellow-600">
                        {orders.filter(o => o.status === "PENDING").length}
                    </p>
                </div>
                <div className="rounded-lg border bg-card p-4">
                    <p className="text-sm text-muted-foreground">Completadas</p>
                    <p className="text-2xl font-bold text-green-600">
                        {orders.filter(o => o.status === "DELIVERED").length}
                    </p>
                </div>
                <div className="rounded-lg border bg-card p-4">
                    <p className="text-sm text-muted-foreground">Ingresos</p>
                    <p className="text-2xl font-bold">
                        ${orders.reduce((sum, o) => sum + Number(o.totalAmount), 0).toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Orders Table */}
            <OrdersTableClient data={tableData} />
        </div>
    )
}
