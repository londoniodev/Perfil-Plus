"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "@/styles/ebooks.module.css";
import { API_BASE } from "@/lib/config";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { IconDownload, IconBook } from "@/components/ui/Icons";

interface Purchase {
    id: string;
    purchasedAt: string;
    ebook: {
        id: string;
        title: string;
        slug: string;
        coverImage: string;
    };
}

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
            <div className={styles.ebooksPage}>
                <div className="container" style={{ padding: "10rem 0", textAlign: "center" }}>
                    Cargando...
                </div>
            </div>
        );
    }

    return (
        <div className={styles.ebooksPage}>
            <section className={styles.ebooksHero}>
                <div className="container">
                    <h1>Mis E-books</h1>
                    <p>Aquí encontrarás todos los e-books que has comprado.</p>
                </div>
            </section>

            <section className={styles.ebooksContent}>
                <div className="container">
                    {purchases.length === 0 ? (
                        <div className={styles.emptyState}>
                            <p>Aún no has comprado ningún e-book.</p>
                            <Button asChild className="mt-md">
                                <Link href="/ebooks">
                                    <IconBook size={18} /> Ver e-books disponibles
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <div className={styles.purchasesList}>
                            {purchases.map((purchase) => (
                                <div key={purchase.id} className={styles.purchaseItem}>
                                    <div className={styles.purchaseItemImage}>
                                        <img src={purchase.ebook.coverImage} alt={purchase.ebook.title} />
                                    </div>
                                    <div className={styles.purchaseItemInfo}>
                                        <h3>{purchase.ebook.title}</h3>
                                        <p>
                                            Comprado el{" "}
                                            {new Date(purchase.purchasedAt).toLocaleDateString("es-CO", {
                                                day: "numeric",
                                                month: "long",
                                                year: "numeric",
                                            })}
                                        </p>
                                    </div>
                                    <Button
                                        onClick={() => handleDownload(purchase.ebook.id)}
                                        style={{ alignSelf: "center" }}
                                    >
                                        <IconDownload size={18} /> Descargar
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
