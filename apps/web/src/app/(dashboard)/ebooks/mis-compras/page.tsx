"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "../../../ebooks/ebooks.module.css";
import { API_BASE } from "@/lib/config";

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
            }
        } catch {
            // Ignore for now
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
            alert(err.message);
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
                            <Link href="/ebooks" className="btn btn-primary" style={{ marginTop: "1rem" }}>
                                Ver e-books disponibles
                            </Link>
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
                                    <button
                                        onClick={() => handleDownload(purchase.ebook.id)}
                                        className="btn btn-primary"
                                        style={{ alignSelf: "center" }}
                                    >
                                        📥 Descargar
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
