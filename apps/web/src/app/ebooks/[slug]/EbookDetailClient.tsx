"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { API_BASE } from "@/lib/config";
import { useToast } from "@mauromera/ui";
import { IconBack, IconBook, IconZap, IconCheck, IconDownload, IconEye, IconLock } from "@mauromera/ui";
import { Card, CardContent } from "@mauromera/ui";
import { Button } from "@mauromera/ui";
import { Badge } from "@mauromera/ui";
import { Separator } from "@mauromera/ui";

import { Ebook } from "@/types/ecommerce";

interface EbookDetailClientProps {
    ebook: Ebook;
}

export default function EbookDetailClient({ ebook }: EbookDetailClientProps) {
    const [hasPurchased, setHasPurchased] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const toast = useToast();

    // Verificación de sesión basada en Cookie
    const user = typeof window !== "undefined" ? localStorage.getItem("user") : null;

    useEffect(() => {
        if (user) {
            checkPurchase();
        }
    }, [user]);

    const checkPurchase = async () => {
        try {
            const res = await fetch(`${API_BASE}/ebooks/${ebook.id}/check-purchase`, {
                credentials: "include",
            });

            // If token expired, clear local storage but don't redirect (just show as not purchased)
            if (res.status === 401) {
                localStorage.removeItem("user");
                localStorage.removeItem("token");
                localStorage.removeItem("refreshToken");
                return;
            }

            if (res.ok) {
                const data = await res.json();
                setHasPurchased(data.hasPurchased);
            }
        } catch {
            // Ignore network errors
        }
    };

    const handlePurchase = async () => {
        if (!user) {
            window.location.href = `/login?redirect=/ebooks/${ebook.slug}`;
            return;
        }

        setProcessing(true);

        try {
            const res = await fetch(`${API_BASE}/payments/ebook/checkout`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    ebookId: ebook.id,
                    frontUrl: window.location.origin,
                }),
            });

            // Handle expired token / unauthorized
            if (res.status === 401) {
                // Clear stale local data
                localStorage.removeItem("user");
                localStorage.removeItem("token");
                localStorage.removeItem("refreshToken");

                // Redirect to login with return URL
                window.location.href = `/login?redirect=/ebooks/${ebook.slug}&reason=session_expired`;
                return;
            }

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Error al procesar");
            }

            const data = await res.json();

            if (data.initPoint) {
                window.location.href = data.initPoint;
            } else if (data.sandboxInitPoint) {
                window.location.href = data.sandboxInitPoint;
            }
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setProcessing(false);
        }
    };

    const handleDownload = async () => {
        setDownloading(true);

        try {
            const res = await fetch(`${API_BASE}/ebooks/${ebook.id}/download`, {
                credentials: "include",
            });

            if (!res.ok) throw new Error("Error al obtener enlace");

            const data = await res.json();
            window.open(data.downloadUrl, "_blank");
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background pt-24 pb-16">
            <div className="container max-w-6xl">
                <div className="mb-8">
                    <Button variant="ghost" asChild className="pl-0 hover:pl-2 transition-all gap-2 text-muted-foreground">
                        <Link href="/ebooks">
                            <IconBack size={18} /> Volver a e-books
                        </Link>
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-start">
                    {/* Cover Image */}
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border/50 bg-muted/20">
                        <img
                            src={ebook.coverImage}
                            alt={ebook.title}
                            className="w-full h-auto object-cover"
                        />
                    </div>

                    {/* Book Info */}
                    <div className="space-y-8">
                        <div>
                            <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary border-primary/20">
                                E-book Digital
                            </Badge>
                            <h1 className="text-3xl md:text-5xl font-serif font-bold mb-6 text-foreground leading-tight">
                                {ebook.title}
                            </h1>

                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-8">
                                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted">
                                    <IconBook size={16} /> PDF Descargable
                                </span>
                                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted">
                                    <IconZap size={16} /> Entrega Inmediata
                                </span>
                            </div>

                            <Separator className="mb-8" />

                            <div className="prose prose-lg dark:prose-invert text-muted-foreground">
                                {ebook.description.split("\n").map((p, i) => (
                                    <p key={i} className="mb-4 leading-relaxed">{p}</p>
                                ))}
                            </div>
                        </div>

                        {/* Purchase Card */}
                        <Card className="border-border shadow-lg bg-card/50 backdrop-blur-sm">
                            <CardContent className="p-8">
                                <div className="flex items-baseline justify-between mb-6">
                                    <span className="text-3xl font-bold text-foreground">
                                        ${Number(ebook.price).toLocaleString("en-US")} <span className="text-sm font-normal text-muted-foreground">USD</span>
                                    </span>
                                    {!hasPurchased && <Badge variant="outline" className="border-green-500/30 text-green-600 bg-green-500/5">Pago Único</Badge>}
                                </div>

                                {hasPurchased ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-400">
                                            <IconCheck className="shrink-0" />
                                            <span className="font-medium">¡Tienes acceso a este e-book!</span>
                                        </div>
                                        <Button
                                            onClick={handleDownload}
                                            disabled={downloading}
                                            className="w-full h-12 text-base shadow-lg shadow-primary/20"
                                        >
                                            {downloading ? "Preparando..." : <><IconDownload className="mr-2" /> Descargar ahora</>}
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex flex-col gap-3">
                                            <Button
                                                onClick={handlePurchase}
                                                disabled={processing}
                                                className="w-full h-12 text-base shadow-lg shadow-primary/20"
                                            >
                                                {processing ? "Procesando..." : "Comprar ahora"}
                                            </Button>

                                            {ebook.previewUrl && (
                                                <Button asChild variant="outline" className="w-full h-12">
                                                    <a
                                                        href={ebook.previewUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <IconEye className="mr-2" /> Ver Vista Previa
                                                    </a>
                                                </Button>
                                            )}
                                        </div>
                                        <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-4">
                                            <IconLock size={12} /> Pago 100% seguro procesado por Mercado Pago
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
