"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import styles from "../ebooks.module.css";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

interface Ebook {
    id: string;
    title: string;
    slug: string;
    description: string;
    coverImage: string;
    price: number;
    createdAt: string;
}

export default function EbookDetailPage() {
    const params = useParams();
    const slug = params.slug as string;

    const [ebook, setEbook] = useState<Ebook | null>(null);
    const [loading, setLoading] = useState(true);
    const [hasPurchased, setHasPurchased] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [downloading, setDownloading] = useState(false);

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    useEffect(() => {
        fetchEbook();
    }, [slug]);

    useEffect(() => {
        if (ebook && token) {
            checkPurchase();
        }
    }, [ebook, token]);

    const fetchEbook = async () => {
        try {
            const res = await fetch(`${API_BASE}/ebooks/${slug}`);
            if (!res.ok) throw new Error("Not found");
            const data = await res.json();
            setEbook(data);
        } catch {
            setEbook(null);
        } finally {
            setLoading(false);
        }
    };

    const checkPurchase = async () => {
        if (!ebook) return;
        try {
            const res = await fetch(`${API_BASE}/ebooks/${ebook.id}/check-purchase`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setHasPurchased(data.hasPurchased);
            }
        } catch {
            // Ignore
        }
    };

    const handlePurchase = async () => {
        if (!token) {
            window.location.href = `/admin/login?redirect=/ebooks/${slug}`;
            return;
        }

        if (!ebook) return;

        setProcessing(true);

        try {
            const res = await fetch(`${API_BASE}/payments/ebook/checkout`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ebookId: ebook.id,
                    frontUrl: window.location.origin,
                }),
            });

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
            alert(err.message);
        } finally {
            setProcessing(false);
        }
    };

    const handleDownload = async () => {
        if (!ebook) return;

        setDownloading(true);

        try {
            const res = await fetch(`${API_BASE}/ebooks/${ebook.id}/download`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) throw new Error("Error al obtener enlace");

            const data = await res.json();

            // Abrir enlace de descarga
            window.open(data.downloadUrl, "_blank");
        } catch (err: any) {
            alert(err.message);
        } finally {
            setDownloading(false);
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

    if (!ebook) {
        return (
            <div className={styles.ebooksPage}>
                <div className="container" style={{ padding: "10rem 0", textAlign: "center" }}>
                    <h2>E-book no encontrado</h2>
                    <Link href="/ebooks" style={{ color: "var(--primary)" }}>
                        Ver todos los e-books
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.ebooksPage}>
            <section className={styles.ebookDetail}>
                <div className="container">
                    <div className={styles.detailGrid}>
                        <div className={styles.coverWrapper}>
                            <img src={ebook.coverImage} alt={ebook.title} />
                        </div>

                        <div className={styles.ebookInfo}>
                            <Link href="/ebooks" style={{ color: "var(--primary)", textDecoration: "none", marginBottom: "1rem", display: "inline-block" }}>
                                ← Volver a e-books
                            </Link>

                            <h1>{ebook.title}</h1>

                            <div className={styles.ebookMeta}>
                                <span>📖 E-book digital (PDF)</span>
                                <span>✨ Descarga inmediata</span>
                            </div>

                            <div className={styles.description}>
                                {ebook.description.split("\n").map((p, i) => (
                                    <p key={i} style={{ marginBottom: "1rem" }}>{p}</p>
                                ))}
                            </div>

                            <div className={styles.purchaseCard}>
                                <div className={styles.price}>
                                    ${Number(ebook.price).toLocaleString("es-CO")} COP
                                </div>

                                {hasPurchased ? (
                                    <>
                                        <div className={styles.ownedBadge}>
                                            ✓ Ya tienes este e-book
                                        </div>
                                        <button
                                            onClick={handleDownload}
                                            className={`${styles.purchaseBtn} ${styles.downloadBtn}`}
                                            disabled={downloading}
                                            style={{ marginTop: "1rem" }}
                                        >
                                            {downloading ? "Preparando..." : "📥 Descargar ahora"}
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={handlePurchase}
                                            className={styles.purchaseBtn}
                                            disabled={processing}
                                        >
                                            {processing ? "Procesando..." : "Comprar ahora"}
                                        </button>
                                        <p className={styles.guarantee}>
                                            🔒 Pago seguro con Mercado Pago
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
