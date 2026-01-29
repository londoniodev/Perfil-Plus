import { redirect } from "next/navigation"
import { getSessionUser } from "@/lib/auth-server"
import { prisma } from "@alvarosky/database"
import { PageWrapper } from "@/components/layout/PageWrapper"
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

    // 3. Transform data for table
    const tableData = orders.map(order => ({
        id: order.id,
        orderNumber: order.id.slice(-8).toUpperCase(),
        customerName: order.user.name || "Sin nombre",
        customerEmail: order.user.email,
        status: order.status,
        paymentStatus: order.paymentStatus,
        total: Number(order.total),
        itemCount: order.items.length,
        items: order.items.map(item => ({
            name: item.variant.product.name,
            image: item.variant.product.images[0] || "/placeholder.jpg",
            quantity: item.quantity,
            price: Number(item.price),
            type: item.variant.product.productType
        })),
        createdAt: order.createdAt,
    }))

    return (
        <PageWrapper
            title="Órdenes"
            description="Gestiona las ventas y pedidos de tu tienda"
            breadcrumbs={[
                { label: "Admin", href: "/admin" },
                { label: "Órdenes" }
            ]}
            maxWidth="full"
        >
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
                        {orders.filter(o => o.status === "COMPLETED" || o.status === "DELIVERED").length}
                    </p>
                </div>
                <div className="rounded-lg border bg-card p-4">
                    <p className="text-sm text-muted-foreground">Ingresos</p>
                    <p className="text-2xl font-bold">
                        ${orders.reduce((sum, o) => sum + Number(o.total), 0).toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Orders Table */}
            <OrdersTableClient data={tableData} />
        </PageWrapper>
    )
}
