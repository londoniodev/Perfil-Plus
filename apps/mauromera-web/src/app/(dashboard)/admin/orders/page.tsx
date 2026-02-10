import { redirect } from "next/navigation"
import { getSessionUser } from "@/lib/auth-server"
import { prisma } from "@alvarosky/database"
import { AdminPageWrapper } from "@alvarosky/ui"
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
        orderNumber: order.orderNumber || order.id.slice(-8).toUpperCase(),
        status: order.status,
        totalAmount: Number(order.totalAmount),
        createdAt: order.createdAt,
        user: {
            name: order.user?.name,
            email: order.user?.email
        },
        shippingData: (order as any).shippingData || {},
        items: order.items.map(item => ({
            id: item.id,
            quantity: item.quantity,
            price: Number(item.price),
            variant: {
                name: (item.variant as any).name,
                product: {
                    name: item.variant.product.name,
                    images: item.variant.product.images
                }
            }
        }))
    }))

    return (
        <AdminPageWrapper
            title="Órdenes"
            description="Gestiona las ventas y pedidos de tu tienda"
        >
            <OrdersTableClient data={tableData} />
        </AdminPageWrapper>
    )
}
