"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "@/styles/ebooks.module.css";
import { API_BASE } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";
import { IconBack, IconBook, IconZap, IconCheck, IconDownload, IconEye, IconLock } from "@/components/ui/Icons";

interface Ebook {
    id: string;
    title: string;
    slug: string;
    description: string;
    coverImage: string;
    price: number;
    previewUrl?: string;
    createdAt: string;
}

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
        <div className={styles.ebooksPage}>
            <section className={styles.ebookDetail}>
                <div className="container">
                    <div className={styles.detailGrid}>
                        <div className={styles.coverWrapper}>
                            <img src={ebook.coverImage} alt={ebook.title} />
                        </div>

                        <div className={styles.ebookInfo}>
                            <Link href="/ebooks" className={styles.backLink}>
                                <IconBack /> Volver a e-books
                            </Link>

                            <h1>{ebook.title}</h1>

                            <div className={styles.ebookMeta}>
                                <span><IconBook /> E-book digital (PDF)</span>
                                <span><IconZap /> Descarga inmediata</span>
                            </div>

                            <div className={styles.description}>
                                {ebook.description.split("\n").map((p, i) => (
                                    <p key={i} className={styles.descriptionParagraph}>{p}</p>
                                ))}
                            </div>

                            <div className={styles.purchaseCard}>
                                <div className={styles.price}>
                                    ${Number(ebook.price).toLocaleString("en-US")} USD
                                </div>

                                {hasPurchased ? (
                                    <>
                                        <div className={styles.ownedBadge}>
                                            <IconCheck /> Tienes acceso a este e-book
                                        </div>
                                        <button
                                            onClick={handleDownload}
                                            className={`${styles.purchaseBtn} ${styles.downloadBtn}`}
                                            disabled={downloading}
                                            style={{ marginTop: "1rem" }}
                                        >
                                            {downloading ? "Preparando..." : <><IconDownload style={{ marginRight: "0.5rem" }} /> Descargar ahora</>}
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <div className={styles.actionButtonsContainer}>
                                            {ebook.previewUrl && (
                                                <a
                                                    href={ebook.previewUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={styles.previewBtn}
                                                >
                                                    <IconEye /> Ver Vista Previa
                                                </a>
                                            )}
                                            <button
                                                onClick={handlePurchase}
                                                className={styles.purchaseBtn}
                                                disabled={processing}
                                            >
                                                {processing ? "Procesando..." : "Comprar ahora"}
                                            </button>
                                        </div>
                                        <p className={styles.guaranteeText}>
                                            <IconLock size={14} /> Pago seguro con Mercado Pago
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
