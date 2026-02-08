import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth-server";
import { prisma } from "@alvarosky/database";
import { Button } from "@alvarosky/ui";
import { Badge } from "@alvarosky/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@alvarosky/ui";
import { AdminPageWrapper } from "@alvarosky/ui";
import { ArrowLeft, Package, User, CreditCard, MapPin, Clock } from "lucide-react";

function formatDate(date: Date): string {
    return new Intl.DateTimeFormat("es-CO", {
        dateStyle: "long",
        timeStyle: "short",
    }).format(date);
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "USD",
    }).format(amount);
}

function getStatusBadgeVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
    switch (status) {
        case "DELIVERED":
            return "default";
        case "PENDING":
        case "APPROVED":
        case "PROCESSING":
        case "SHIPPED":
            return "secondary";
        case "CANCELLED":
        case "REFUNDED":
            return "destructive";
        default:
            return "outline";
    }
}

const statusLabels: Record<string, string> = {
    PENDING: "Pendiente",
    APPROVED: "Pago Aprobado",
    PROCESSING: "En Preparación",
    SHIPPED: "Enviado",
    DELIVERED: "Entregado",
    CANCELLED: "Cancelado",
    REFUNDED: "Reembolsado",
};

interface PageProps {
    params: Promise<{ id: string }>;
}

// Type for shippingData JSON
interface ShippingData {
    address?: string;
    city?: string;
    phone?: string;
    [key: string]: string | undefined;
}

export default async function OrderDetailPage({ params }: PageProps) {
    const resolvedParams = await params;

    // 1. Verificar autenticación y rol
    const user = await getSessionUser();
    if (!user) redirect("/auth/login");
    if (user.role !== "ADMIN") redirect("/");

    // 2. Obtener pedido con items y cliente
    const order = await prisma.order.findUnique({
        where: { id: resolvedParams.id },
        include: {
            items: {
                include: {
                    variant: {
                        include: {
                            product: {
                                select: {
                                    images: true,
                                }
                            }
                        }
                    }
                }
            },
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                }
            }
        }
    });

    if (!order) notFound();

    // Parse shippingData JSON
    const shippingData = order.shippingData as ShippingData | null;

    return (
        <AdminPageWrapper
            title={`Pedido #${order.orderNumber}`}
            description={`Creado el ${formatDate(order.createdAt)}`}
        >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* LEFT: Order Items */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                Productos ({order.items.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="divide-y divide-border">
                                {order.items.map((item) => {
                                    const productImage = item.variant?.product?.images?.[0];

                                    return (
                                        <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex gap-4">
                                            <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                                                {productImage ? (
                                                    <img
                                                        src={productImage}
                                                        alt={item.productName}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                                        <Package className="h-6 w-6" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium truncate">
                                                    {item.productName}
                                                </h4>
                                                {item.variantName && (
                                                    <p className="text-sm text-muted-foreground">
                                                        Variante: {item.variantName}
                                                    </p>
                                                )}
                                                <p className="text-sm text-muted-foreground">
                                                    Cantidad: {item.quantity}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold">
                                                    {formatCurrency(Number(item.price) * item.quantity)}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {formatCurrency(Number(item.price))} c/u
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* RIGHT: Order Info */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                Estado
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Badge variant={getStatusBadgeVariant(order.status)} className="text-sm">
                                {statusLabels[order.status] || order.status}
                            </Badge>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Cliente
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <p className="font-medium">{order.user?.name || "Sin nombre"}</p>
                            <p className="text-sm text-muted-foreground">{order.user?.email}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5" />
                                Resumen
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>{formatCurrency(Number(order.totalAmount))}</span>
                            </div>
                            {order.mpPaymentId && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">ID Pago MP</span>
                                    <span className="font-mono text-xs">{order.mpPaymentId}</span>
                                </div>
                            )}
                            <div className="border-t pt-3 flex justify-between font-semibold">
                                <span>Total</span>
                                <span>{formatCurrency(Number(order.totalAmount))}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {shippingData && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5" />
                                    Datos de Envío
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-1">
                                {shippingData.address && (
                                    <p className="text-sm">{shippingData.address}</p>
                                )}
                                {shippingData.city && (
                                    <p className="text-sm text-muted-foreground">{shippingData.city}</p>
                                )}
                                {shippingData.phone && (
                                    <p className="text-sm text-muted-foreground">Tel: {shippingData.phone}</p>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    <Button variant="outline" asChild className="w-full">
                        <Link href="/admin/orders">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Volver a Pedidos
                        </Link>
                    </Button>
                </div>
            </div>
        </AdminPageWrapper>
    );
}
