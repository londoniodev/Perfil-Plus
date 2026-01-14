"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { API_BASE } from "@/lib/config";
import styles from "@/app/styles/ebook-list.module.css";

interface Ebook {
    id: string;
    title: string;
    slug: string;
    description: string;
    coverImage: string;
    price: number;
    published: boolean;
    _count?: { purchases: number };
    createdAt: string;
}

import { IconPlus, IconEdit, IconTrash, IconBook } from "@/app/components/ui/Icons";

export default function AdminEbooksPage() {
    const { isAdmin, loading: authLoading } = useAuth();
    const router = useRouter();
    const [ebooks, setEbooks] = useState<Ebook[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !isAdmin) router.push("/perfil");
    }, [isAdmin, authLoading, router]);

    useEffect(() => {
        if (isAdmin) fetchEbooks();
    }, [isAdmin]);

    const fetchEbooks = async () => {
        try {
            const res = await fetch(`${API_BASE}/admin/ebooks`, { credentials: "include" });
            if (!res.ok) throw new Error("Error");
            setEbooks(await res.json());
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Eliminar este e-book?")) return;
        try {
            await fetch(`${API_BASE}/admin/ebooks/${id}`, { method: "DELETE", credentials: "include" });
            setEbooks((prev) => prev.filter((e) => e.id !== id));
        } catch (err) {
            alert("Error al eliminar");
        }
    };

    if (authLoading) return <div className={styles.loading}>Cargando...</div>;
    if (!isAdmin) return null;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Biblioteca de E-books</h1>
                    <p className={styles.subtitle}>{ebooks.length} libros en tu catálogo</p>
                </div>
                <Link href="/admin/ebooks/new" className={styles.addBtn}>
                    <IconPlus /> Nuevo E-book
                </Link>
            </div>

            {loading ? (
                <div className={styles.loading}>Cargando e-books...</div>
            ) : ebooks.length === 0 ? (
                <div className={styles.empty}>
                    <div className={styles.emptyIcon}><IconBook /></div>
                    <h2>No hay e-books</h2>
                    <p>Crea tu primer e-book para comenzar a vender.</p>
                    <Link href="/admin/ebooks/new" className={styles.addBtn}>
                        <IconPlus /> Crear E-book
                    </Link>
                </div>
            ) : (
                <div className={styles.booksGrid}>
                    {ebooks.map((ebook) => (
                        <div key={ebook.id} className={styles.bookCard}>
                            <div className={styles.bookCover}>
                                <img src={ebook.coverImage} alt={ebook.title} />
                                {!ebook.published && <span className={styles.draftBadge}>Borrador</span>}
                            </div>
                            <div className={styles.bookInfo}>
                                <h3 className={styles.bookTitle}>{ebook.title}</h3>
                                <div className={styles.bookMeta}>
                                    <span className={styles.bookPrice}>${Number(ebook.price).toLocaleString("es-CO")}</span>
                                    <span className={styles.bookSales}>{ebook._count?.purchases || 0} ventas</span>
                                </div>
                                <div className={styles.bookActions}>
                                    <Link href={`/admin/ebooks/${ebook.id}`} className={styles.editBtn}>
                                        <IconEdit /> Editar
                                    </Link>
                                    <button onClick={() => handleDelete(ebook.id)} className={styles.deleteBtn}>
                                        <IconTrash />
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
