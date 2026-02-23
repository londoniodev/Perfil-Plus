import { redirect } from "next/navigation"
import { getSessionUser } from "@/lib/auth-server"
import { serverFetch } from "@/lib/api-server"
import { PageHeader, Badge, PriceDisplay, AdaptiveImage, Button } from "@alvarosky/ui"
import { Package, Download, Truck, Clock, ShoppingBag, CheckCircle2, XCircle } from "lucide-react"
import Link from "next/link"

export default async function ComprasPage() {
    // 1. Verificar autenticación
    const user = await getSessionUser()

    if (!user) {
        redirect("/login")
    }

    // 2. Consultar órdenes del usuario mediante Headless API
    const ordersRes = await serverFetch<any[]>('/orders/my-orders').catch(() => []);
    const orders = Array.isArray(ordersRes) ? ordersRes : [];

    return (
        <div className="container py-12">
            <PageHeader
                title="Mis Pedidos"
                description="Revisa el estado de tus compras y descarga tus productos digitales"
            />

            <div className="mt-8">
                {orders.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <OrderCard key={order.id} order={order} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

// Estado vacío
function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 border-2 border-dashed rounded-lg">
            <Package className="h-16 w-16 text-muted-foreground mb-4 opacity-20" />
            <h3 className="text-xl font-semibold mb-2">No tienes pedidos aún</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
                Explora nuestra tienda y encuentra productos increíbles
            </p>
            <Button asChild>
                <Link href="/tienda">
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Ir a la Tienda
                </Link>
            </Button>
        </div>
    )
}

// Tarjeta de Orden
function OrderCard({ order }: { order: any }) {
    const statusConfig = getStatusConfig(order.status)
    const hasDigitalProducts = order.items.some((item: any) =>
        item.variant.product.productType === "DIGITAL"
    )

    return (
        <div className="border rounded-lg overflow-hidden">
            {/* Header de la Orden */}
            <div className="bg-muted/50 px-6 py-4 border-b">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-lg">{order.orderNumber}</h3>
                            <Badge
                                variant={statusConfig.variant as any}
                                className="flex items-center gap-1"
                            >
                                {statusConfig.icon}
                                {statusConfig.label}
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString("es-ES", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                            })}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Total:</span>
                        <PriceDisplay price={Number(order.totalAmount)} size="lg" />
                    </div>
                </div>
            </div>

            {/* Alerta para órdenes pendientes */}
            {order.status === "PENDING" && (
                <div className="bg-yellow-50 dark:bg-yellow-900/10 border-b border-yellow-200 dark:border-yellow-900/50 px-6 py-3">
                    <div className="flex items-center gap-2 text-sm text-yellow-800 dark:text-yellow-400">
                        <Clock className="h-4 w-4" />
                        <span>
                            Tu pago está siendo procesado. Te notificaremos cuando se confirme.
                        </span>
                    </div>
                </div>
            )}

            {/* Items de la Orden */}
            <div className="p-6 space-y-4">
                {order.items.map((item: any) => (
                    <OrderItem
                        key={item.id}
                        item={item}
                        orderStatus={order.status}
                    />
                ))}
            </div>
        </div>
    )
}

// Item de Orden Individual
function OrderItem({ item, orderStatus }: { item: any, orderStatus: string }) {
    const product = item.variant.product
    const isDigital = product.productType === "DIGITAL"
    const isApproved = orderStatus === "APPROVED"

    // Extraer URL de descarga desde specs (JSON)
    const downloadUrl = isDigital && typeof product.specs === 'object' && product.specs !== null
        ? (product.specs as any).downloadUrl || (product.specs as any).fileUrl || (product.specs as any).url
        : null

    return (
        <div className="flex gap-4 pb-4 border-b last:border-0">
            {/* Imagen del Producto */}
            <div className="h-24 w-24 shrink-0 overflow-hidden rounded-md border">
                <AdaptiveImage
                    src={product.images[0] || "/placeholder.jpg"}
                    aspectRatio="square"
                    alt={product.name}
                />
            </div>

            {/* Información del Producto */}
            <div className="flex-1 space-y-2">
                <div>
                    <h4 className="font-medium line-clamp-1">{product.name}</h4>
                    {item.variant.name && (
                        <p className="text-sm text-muted-foreground">{item.variant.name}</p>
                    )}
                </div>

                <div className="flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground">
                        Cantidad: <span className="font-medium text-foreground">{item.quantity}</span>
                    </span>
                    <PriceDisplay price={Number(item.price)} size="sm" />
                </div>

                {/* Acciones según tipo de producto y estado */}
                <div className="pt-2">
                    {/* Caso A: Producto Digital Aprobado */}
                    {isDigital && isApproved && downloadUrl && (
                        <Button size="sm" asChild>
                            <a href={downloadUrl} download target="_blank" rel="noopener noreferrer">
                                <Download className="mr-2 h-4 w-4" />
                                Descargar
                            </a>
                        </Button>
                    )}

                    {/* Caso A (fallback): Digital pero sin URL */}
                    {isDigital && isApproved && !downloadUrl && (
                        <div className="text-sm text-muted-foreground italic">
                            Contacta a soporte para obtener tu descarga
                        </div>
                    )}

                    {/* Caso B: Producto Físico Aprobado */}
                    {!isDigital && isApproved && (
                        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                            <Truck className="h-4 w-4" />
                            <span>Preparando envío</span>
                        </div>
                    )}

                    {/* Caso C: Orden Pendiente (mostrado a nivel de orden, no item) */}
                    {/* Ya manejado en OrderCard */}
                </div>
            </div>
        </div>
    )
}

// Configuración de badges según estado
function getStatusConfig(status: string) {
    switch (status) {
        case "APPROVED":
            return {
                label: "Completado",
                variant: "default",
                icon: <CheckCircle2 className="h-3 w-3" />
            }
        case "PENDING":
            return {
                label: "Pendiente",
                variant: "secondary",
                icon: <Clock className="h-3 w-3" />
            }
        case "PROCESSING":
            return {
                label: "En Preparación",
                variant: "secondary",
                icon: <Package className="h-3 w-3" />
            }
        case "SHIPPED":
            return {
                label: "Enviado",
                variant: "default",
                icon: <Truck className="h-3 w-3" />
            }
        case "CANCELLED":
            return {
                label: "Cancelado",
                variant: "destructive",
                icon: <XCircle className="h-3 w-3" />
            }
        case "REFUNDED":
            return {
                label: "Reembolsado",
                variant: "outline",
                icon: <XCircle className="h-3 w-3" />
            }
        default:
            return {
                label: status,
                variant: "outline",
                icon: null
            }
    }
}

