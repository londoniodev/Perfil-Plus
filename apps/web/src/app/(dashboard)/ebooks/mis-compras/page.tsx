"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { API_BASE } from "@/lib/config";
import { Button } from "@mauromera/ui";
import { useToast } from "@mauromera/ui";
import { IconDownload, IconBook, IconLoader } from "@mauromera/ui";
import { Card, CardContent } from "@mauromera/ui";
import { Badge } from "@mauromera/ui";

import { Purchase } from "@/types/ecommerce";

export default function MisEbooksPage() {
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const toast = useToast();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPurchases();
    }, []);

    const fetchPurchases = async () => {
        try {
            const res = await fetch(`${API_BASE}/ebooks/my-purchases`, {
                credentials: 'include', // Usar cookies HttpOnly
            });
            if (res.ok) {
                const data = await res.json();
                setPurchases(data);
            } else if (res.status === 401 || res.status === 403) {
                // No autenticado
                window.location.href = "/login?redirect=/ebooks/mis-compras";
            } else {
                // Handle non-401/403 errors (e.g. 500)
                toast.error("Error al cargar tus compras");
            }
        } catch {
            toast.error("Error de conexión al cargar compras");
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (ebookId: string) => {
        try {
            const res = await fetch(`${API_BASE}/ebooks/${ebookId}/download`, {
                credentials: 'include'
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
                    <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4 text-foreground">Mis E-books</h1>
                    <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                        Aquí encontrarás todos los e-books que has comprado y podrás descargarlos cuando quieras.
                    </p>
                </div>
            </section>

            <section className="container">
                {purchases.length === 0 ? (
                    <div className="max-w-md mx-auto text-center p-12 rounded-3xl border border-dashed border-border bg-card">
                        <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-6">
                            <IconBook size={32} />
                        </div>
                        <p className="text-xl font-medium mb-2 text-foreground">Aún no has comprado ningún e-book.</p>
                        <p className="text-muted-foreground mb-8">Explora nuestro catálogo para empezar tu colección.</p>
                        <Button asChild className="w-full sm:w-auto">
                            <Link href="/ebooks">
                                <IconBook size={18} className="mr-2" /> Ver e-books disponibles
                            </Link>
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {purchases.map((purchase) => (
                            <Card key={purchase.id} className="overflow-hidden bg-card hover:shadow-lg transition-shadow border-border/50 flex flex-col h-full">
                                <div className="aspect-[3/4] relative bg-muted overflow-hidden border-b border-border/50">
                                    <img
                                        src={purchase.ebook.coverImage}
                                        alt={purchase.ebook.title}
                                        className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
                                    />
                                </div>
                                <CardContent className="p-6 flex flex-col flex-1">
                                    <div className="mb-4 flex-1">
                                        <h3 className="text-xl font-bold mb-2 text-foreground line-clamp-2">{purchase.ebook.title}</h3>
                                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                            Adquirido el{" "}
                                            {new Date(purchase.purchasedAt).toLocaleDateString("es-CO", {
                                                day: "numeric",
                                                month: "long",
                                                year: "numeric",
                                            })}
                                        </p>
                                    </div>
                                    <Button
                                        onClick={() => handleDownload(purchase.ebook.id)}
                                        className="w-full"
                                        variant="outline"
                                    >
                                        <IconDownload size={18} className="mr-2" /> Descargar PDF
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
