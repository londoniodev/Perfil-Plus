"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { API_BASE, TENANT_ID } from "@/lib/config";
import { Button } from "@alvarosky/ui";
import { useToast } from "@alvarosky/ui";
import { IconDownload, IconBook, IconLoader, IconShoppingBag } from "@alvarosky/ui";
import { Card, CardContent } from "@alvarosky/ui";
import { Badge } from "@alvarosky/ui";

interface PurchasedItem {
    orderId: string;
    productId: string;
    title: string;
    coverImage: string;
    purchasedAt: string;
    price: number;
}

export default function MisComprasPage() {
    const [items, setItems] = useState<PurchasedItem[]>([]);
    const toast = useToast();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await fetch(`${API_BASE}/orders/my-orders`, {
                credentials: 'include',
                headers: { 'x-tenant-id': TENANT_ID },
            });
            if (res.ok) {
                const orders = await res.json();
                // Flatten orders into purchased items
                const purchasedItems: PurchasedItem[] = [];
                orders.forEach((order: any) => {
                    order.items.forEach((item: any) => {
                        if (item.variant.product.productType === 'DIGITAL') {
                            purchasedItems.push({
                                orderId: order.id,
                                productId: item.variant.productId,
                                title: item.variant.product.name,
                                coverImage: item.variant.product.images?.[0] || '/images/placeholder-product.jpg',
                                purchasedAt: order.createdAt,
                                price: Number(item.price)
                            });
                        }
                    });
                });
                setItems(purchasedItems);
            } else if (res.status === 401 || res.status === 403) {
                window.location.href = "/login?redirect=/compras";
            } else {
                toast.error("Error al cargar tus compras");
            }
        } catch {
            toast.error("Error de conexión al cargar compras");
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (orderId: string, productId: string) => {
        try {
            const res = await fetch(`${API_BASE}/orders/${orderId}/download/${productId}`, {
                credentials: 'include',
                headers: { 'x-tenant-id': TENANT_ID },
            });

            if (!res.ok) throw new Error("Error al obtener enlace");

            const data = await res.json();
            window.open(data.downloadUrl, "_blank");
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4 text-muted-foreground animate-pulse">
                    <IconLoader className="animate-spin" size={32} />
                    <p>Cargando tu biblioteca...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pt-24 pb-16">
            <section className="bg-muted/30 py-16 mb-12 border-b border-border/50">
                <div className="container text-center">
                    <Badge variant="outline" className="mb-4 border-primary/20 text-primary bg-primary/5">Biblioteca Personal</Badge>
                    <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4 text-foreground">Mis Compras</h1>
                    <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                        Aquí encontrarás todos los productos digitales que has comprado y podrás descargarlos.
                    </p>
                </div>
            </section>

            <section className="container">
                {items.length === 0 ? (
                    <div className="max-w-md mx-auto text-center p-12 rounded-3xl border border-dashed border-border bg-card">
                        <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-6">
                            <IconShoppingBag size={32} />
                        </div>
                        <p className="text-xl font-medium mb-2 text-foreground">Aún no has comprado nada.</p>
                        <p className="text-muted-foreground mb-8">Explora nuestra tienda para empezar.</p>
                        <Button asChild className="w-full sm:w-auto">
                            <Link href="/ebooks">
                                <IconBook size={18} className="mr-2" /> Ver Catálogo
                            </Link>
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {items.map((item, idx) => (
                            <Card key={`${item.orderId}-${idx}`} className="overflow-hidden bg-card hover:shadow-lg transition-shadow border-border/50 flex flex-col h-full">
                                <div className="aspect-[3/4] relative bg-muted overflow-hidden border-b border-border/50">
                                    <img
                                        src={item.coverImage}
                                        alt={item.title}
                                        className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
                                    />
                                </div>
                                <CardContent className="p-6 flex flex-col flex-1">
                                    <div className="mb-4 flex-1">
                                        <h3 className="text-xl font-bold mb-2 text-foreground line-clamp-2">{item.title}</h3>
                                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                            Adquirido el{" "}
                                            {new Date(item.purchasedAt).toLocaleDateString("es-CO", {
                                                day: "numeric",
                                                month: "long",
                                                year: "numeric",
                                            })}
                                        </p>
                                    </div>
                                    <Button
                                        onClick={() => handleDownload(item.orderId, item.productId)}
                                        className="w-full"
                                        variant="outline"
                                    >
                                        <IconDownload size={18} className="mr-2" /> Descargar
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

