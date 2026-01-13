"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import styles from "../cursos/lms.module.css"; // Reusing LMS styles for consistency
import { API_BASE } from "@/lib/config";

interface Ebook {
    id: string;
    title: string;
    slug: string;
    description: string;
    coverImage: string;
    price: number;
    published: boolean;
    _count?: {
        purchases: number;
    };
    createdAt: string;
}

export default function AdminEbooksPage() {
    const { isAdmin, loading: authLoading } = useAuth();
    const router = useRouter();

    const [ebooks, setEbooks] = useState<Ebook[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!authLoading && !isAdmin) {
            router.push("/perfil");
        }
    }, [isAdmin, authLoading, router]);

    useEffect(() => {
        if (isAdmin) {
            fetchEbooks();
        }
    }, [isAdmin]);

    const fetchEbooks = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE}/admin/ebooks`, {
                credentials: "include",
            });

            if (!res.ok) throw new Error("Error al cargar e-books");

            const data = await res.json();
            setEbooks(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error desconocido");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Estás seguro de eliminar este e-book? Esta acción no se puede deshacer.")) return;

        try {
            const res = await fetch(`${API_BASE}/admin/ebooks/${id}`, {
                method: "DELETE",
                credentials: "include",
            });

            if (!res.ok) throw new Error("Error al eliminar e-book");

            setEbooks((prev) => prev.filter((e) => e.id !== id));
        } catch (err) {
            alert(err instanceof Error ? err.message : "Error al eliminar");
        }
    };

    if (authLoading) return <div className={styles.loading}>Cargando...</div>;
    if (!isAdmin) return null;

    return (
        <div className={styles.lmsPage}>
            <div className={styles.header}>
                <h1 className={styles.title}>Gestión de E-books</h1>
                <Link href="/admin/ebooks/new" className={styles.addBtn}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Nuevo E-book
                </Link>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            {loading ? (
                <div className={styles.loading}>Cargando e-books...</div>
            ) : ebooks.length === 0 ? (
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>📖</div>
                    <h2 className={styles.emptyTitle}>No hay e-books creados</h2>
                    <p className={styles.emptyText}>Crea tu primer e-book para comenzar a vender.</p>
                    <Link href="/admin/ebooks/new" className={styles.addBtn}>
                        Crear Primer E-book
                    </Link>
                </div>
            ) : (
                <div className={styles.themesGrid}>
                    {ebooks.map((ebook) => (
                        <div key={ebook.id} className={styles.card} style={{ position: "relative" }}>
                            <div className={styles.cardImage} style={{ height: "200px", overflow: "hidden" }}>
                                <img
                                    src={ebook.coverImage}
                                    alt={ebook.title}
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />
                                {!ebook.published && (
                                    <span style={{
                                        position: "absolute",
                                        top: "10px",
                                        right: "10px",
                                        background: "rgba(0,0,0,0.7)",
                                        color: "white",
                                        padding: "4px 8px",
                                        borderRadius: "4px",
                                        fontSize: "0.8rem"
                                    }}>
                                        Borrador
                                    </span>
                                )}
                            </div>
                            <div className={styles.cardContent}>
                                <h3 className={styles.cardTitle}>{ebook.title}</h3>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", color: "#888", marginBottom: "1rem" }}>
                                    <span>${ebook.price}</span>
                                    <span>{ebook._count?.purchases || 0} ventas</span>
                                </div>
                                <div className={styles.cardActions}>
                                    <Link href={`/admin/ebooks/${ebook.id}`} className={styles.editBtn}>
                                        Editar
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(ebook.id)}
                                        className={styles.deleteBtn}
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
