"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import ThemeCard from "@/components/admin/lms/ThemeCard";
import styles from "@/styles/lms.module.css";
import { useToast } from "@/components/ui/Toast";
import { API_BASE } from "@/lib/config";
import { IconPlus, IconBook } from "@/components/ui/Icons";

interface Theme {
    id: string;
    title: string;
    description: string;
    coverImage: string | null;
    published: boolean;
    order: number;
    _count?: {
        courses: number;
    };
}

type FilterType = "all" | "published" | "draft";

export default function AdminCursosPage() {
    const { isAdmin, loading: authLoading } = useAuth();
    const router = useRouter();
    const toast = useToast();

    const [themes, setThemes] = useState<Theme[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<FilterType>("all");

    useEffect(() => {
        if (!authLoading && !isAdmin) {
            router.push("/perfil");
        }
    }, [isAdmin, authLoading, router]);

    useEffect(() => {
        if (isAdmin) {
            fetchThemes();
        }
    }, [isAdmin]);

    const fetchThemes = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE}/admin/lms/themes`, {
                credentials: "include",
            });

            if (!res.ok) throw new Error("Error al cargar temas");

            const data = await res.json();
            setThemes(data);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Error desconocido");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`${API_BASE}/admin/lms/themes/${id}`, {
                method: "DELETE",
                credentials: "include",
            });

            if (!res.ok) throw new Error("Error al eliminar tema");

            setThemes((prev) => prev.filter((t) => t.id !== id));
            toast.success("Tema eliminado correctamente");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Error al eliminar");
        }
    };

    const filteredThemes = themes.filter((theme) => {
        if (filter === "published") return theme.published;
        if (filter === "draft") return !theme.published;
        return true;
    });

    if (authLoading) {
        return <div className={styles.loading}>Cargando...</div>;
    }

    if (!isAdmin) {
        return null;
    }

    return (
        <div className={styles.lmsPage}>
            <div className={styles.header}>
                <h1 className={styles.title}>Gestión de Cursos</h1>
                <Link href="/admin/cursos/temas/nuevo" className={styles.addBtn}>
                    <IconPlus size={20} />
                    Nuevo Tema
                </Link>
            </div>

            <div className={styles.filters}>
                <button
                    className={`${styles.filterBtn} ${filter === "all" ? styles.active : ""}`}
                    onClick={() => setFilter("all")}
                >
                    Todos ({themes.length})
                </button>
                <button
                    className={`${styles.filterBtn} ${filter === "published" ? styles.active : ""}`}
                    onClick={() => setFilter("published")}
                >
                    Publicados ({themes.filter((t) => t.published).length})
                </button>
                <button
                    className={`${styles.filterBtn} ${filter === "draft" ? styles.active : ""}`}
                    onClick={() => setFilter("draft")}
                >
                    Borradores ({themes.filter((t) => !t.published).length})
                </button>
            </div>

            {loading ? (
                <div className={styles.loading}>Cargando temas...</div>
            ) : (
                <div className={styles.themesGrid}>
                    {filteredThemes.length === 0 ? (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyIcon}><IconBook size={32} /></div>
                            <h2 className={styles.emptyTitle}>
                                {filter === "all"
                                    ? "No hay temas creados"
                                    : filter === "published"
                                        ? "No hay temas publicados"
                                        : "No hay borradores"}
                            </h2>
                            <p className={styles.emptyText}>
                                {filter === "all"
                                    ? "Crea tu primer tema para comenzar a organizar tus cursos."
                                    : "Cambia el filtro para ver otros temas."}
                            </p>
                            {filter === "all" && (
                                <Link href="/admin/cursos/temas/nuevo" className={styles.addBtn}>
                                    Crear Primer Tema
                                </Link>
                            )}
                        </div>
                    ) : (
                        filteredThemes.map((theme) => (
                            <ThemeCard
                                key={theme.id}
                                theme={theme}
                                onDelete={handleDelete}
                            />
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
