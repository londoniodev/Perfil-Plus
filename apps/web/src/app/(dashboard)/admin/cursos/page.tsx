"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import ThemeCard from "@/components/admin/lms/ThemeCard";
import { useToast } from "@mauromera/ui";
import { API_BASE } from "@/lib/config";
import { IconPlus, IconBook } from "@mauromera/ui";
import { Button } from "@mauromera/ui";
import { PageHeader } from "@mauromera/ui";

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
        return <div className="p-8 text-center text-muted-foreground">Cargando...</div>;
    }

    if (!isAdmin) {
        return null;
    }



    // ... (code)

    if (!isAdmin) {
        return null;
    }

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
            <PageHeader
                title="Gestión de Cursos"
                description="Administra el catálogo de cursos y lecciones"
            >
                <Button asChild>
                    <Link href="/admin/cursos/temas/nuevo">
                        <IconPlus className="mr-2 h-4 w-4" />
                        Nuevo Tema
                    </Link>
                </Button>
            </PageHeader>

            <div className="flex gap-2 overflow-x-auto pb-2">
                <Button
                    variant={filter === "all" ? "default" : "outline"}
                    onClick={() => setFilter("all")}
                    size="sm"
                >
                    Todos ({themes.length})
                </Button>
                <Button
                    variant={filter === "published" ? "default" : "outline"}
                    onClick={() => setFilter("published")}
                    size="sm"
                >
                    Publicados ({themes.filter((t) => t.published).length})
                </Button>
                <Button
                    variant={filter === "draft" ? "default" : "outline"}
                    onClick={() => setFilter("draft")}
                    size="sm"
                >
                    Borradores ({themes.filter((t) => !t.published).length})
                </Button>
            </div>

            {loading ? (
                <div className="p-8 text-center text-muted-foreground">Cargando temas...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredThemes.length === 0 ? (
                        <div className="col-span-full py-16 px-4 text-center bg-muted/30 border border-dashed rounded-xl">
                            <div className="flex justify-center mb-4 text-muted-foreground"><IconBook size={48} /></div>
                            <h2 className="text-xl font-semibold mb-2">
                                {filter === "all"
                                    ? "No hay temas creados"
                                    : filter === "published"
                                        ? "No hay temas publicados"
                                        : "No hay borradores"}
                            </h2>
                            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                                {filter === "all"
                                    ? "Crea tu primer tema para comenzar a organizar tus cursos."
                                    : "Cambia el filtro para ver otros temas."}
                            </p>
                            {filter === "all" && (
                                <Button asChild>
                                    <Link href="/admin/cursos/temas/nuevo">
                                        Crear Primer Tema
                                    </Link>
                                </Button>
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
