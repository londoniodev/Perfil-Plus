import { redirect } from "next/navigation"
import { getSessionUser } from "@/lib/auth-server"
import { prisma } from "@alvarosky/database"
import { PageHeader } from "@alvarosky/ui"
import { OrdersTable } from "@/components/admin/orders/orders-table"

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

    return (
        <div className="space-y-6">
            <PageHeader
                title="Órdenes"
                description="Gestiona las ventas y pedidos de tu tienda"
            />

            <OrdersTable orders={orders} />
        </div>
    )
}

