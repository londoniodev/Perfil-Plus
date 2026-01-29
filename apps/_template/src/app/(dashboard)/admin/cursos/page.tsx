"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import ThemeCard from "@/components/admin/lms/ThemeCard";
import { toast } from "sonner";
import { API_BASE, TENANT_ID } from "@/lib/config";
import {
    Button,
    Separator,
    SidebarTrigger,
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbSeparator,
    BreadcrumbPage,
    Tabs,
    TabsList,
    TabsTrigger,
} from "@alvarosky/ui";
import { Plus, BookOpen, Loader2 } from "lucide-react";

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
                headers: { 'x-tenant-id': TENANT_ID },
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
                headers: { 'x-tenant-id': TENANT_ID },
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

    const stats = {
        total: themes.length,
        published: themes.filter((t) => t.published).length,
        draft: themes.filter((t) => !t.published).length,
    };

    if (authLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!isAdmin) return null;

    return (
        <div className="flex flex-col min-h-screen">
            {/* Header with Breadcrumbs */}
            <header className="flex h-14 lg:h-[60px] shrink-0 items-center gap-2 border-b bg-background px-4 lg:px-6 sticky top-0 z-10">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem className="hidden md:block">
                            <BreadcrumbLink asChild>
                                <Link href="/perfil">Dashboard</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator className="hidden md:block" />
                        <BreadcrumbItem className="hidden md:block">
                            <BreadcrumbLink asChild>
                                <Link href="/admin">Admin</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator className="hidden md:block" />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Cursos</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </header>

            {/* Content */}
            <div className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
                <div className="max-w-7xl space-y-8">
                    {/* Page Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="space-y-1">
                            <h1 className="text-2xl font-bold tracking-tight">Gestión de Cursos</h1>
                            <p className="text-muted-foreground">
                                Administra el catálogo de cursos y lecciones
                            </p>
                        </div>
                        <Button asChild className="transition-all duration-200 hover:scale-[1.01] active:scale-[0.98]">
                            <Link href="/admin/cursos/temas/nuevo">
                                <Plus className="mr-2 h-4 w-4" />
                                Nuevo Tema
                            </Link>
                        </Button>
                    </div>

                    <Separator />

                    {/* Stats Cards */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="rounded-lg border bg-card p-4">
                            <p className="text-sm text-muted-foreground">Total Temas</p>
                            <p className="text-2xl font-bold">{stats.total}</p>
                        </div>
                        <div className="rounded-lg border bg-card p-4">
                            <p className="text-sm text-muted-foreground">Publicados</p>
                            <p className="text-2xl font-bold text-green-600">{stats.published}</p>
                        </div>
                        <div className="rounded-lg border bg-card p-4">
                            <p className="text-sm text-muted-foreground">Borradores</p>
                            <p className="text-2xl font-bold text-yellow-600">{stats.draft}</p>
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterType)} className="w-full">
                        <TabsList>
                            <TabsTrigger value="all">
                                Todos ({stats.total})
                            </TabsTrigger>
                            <TabsTrigger value="published">
                                Publicados ({stats.published})
                            </TabsTrigger>
                            <TabsTrigger value="draft">
                                Borradores ({stats.draft})
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>

                    {/* Content Grid */}
                    {loading ? (
                        <div className="flex h-48 items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredThemes.length === 0 ? (
                                <div className="col-span-full py-16 px-4 text-center bg-muted/30 border border-dashed rounded-xl">
                                    <div className="flex justify-center mb-4 text-muted-foreground">
                                        <BookOpen className="h-12 w-12" />
                                    </div>
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
                                                <Plus className="mr-2 h-4 w-4" />
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
            </div>
        </div>
    );
}
