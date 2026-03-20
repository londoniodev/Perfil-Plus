"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, redirect } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { ThemeCard } from "@alvarosky/ui";
import { toast } from "sonner";
import { API_BASE, TENANT_ID } from "@/lib/config";
import {
    Button,
    Separator,
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
    AdminPageWrapper,
    Input,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    StatusFilter,
    StatusFilterType
} from "@alvarosky/ui";
import { Plus, BookOpen, Loader2, Search } from "lucide-react";

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

type SortType = "newest" | "oldest" | "title" | "order";

const ITEMS_PER_PAGE = 9;

export default function AdminCursosPage() {
    const { isAdmin, loading: authLoading } = useAuth();
    const router = useRouter();

    const [themes, setThemes] = useState<Theme[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<StatusFilterType>("all");
    const [sort, setSort] = useState<SortType>("order");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    if (!authLoading && !isAdmin) {
        redirect("/perfil");
    }

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

    // Filtrar, buscar y ordenar
    const filteredAndSortedThemes = useMemo(() => {
        let result = [...themes];

        // Filtrar por estado
        if (filter === "published") result = result.filter(t => t.published);
        if (filter === "draft") result = result.filter(t => !t.published);

        // Filtrar por búsqueda
        if (search) {
            const searchLower = search.toLowerCase();
            result = result.filter(theme =>
                theme.title.toLowerCase().includes(searchLower) ||
                theme.description?.toLowerCase().includes(searchLower)
            );
        }

        // Ordenar
        result.sort((a, b) => {
            switch (sort) {
                case "newest":
                    return b.order - a.order; // Assuming higher order = newer
                case "oldest":
                    return a.order - b.order;
                case "title":
                    return a.title.localeCompare(b.title);
                case "order":
                default:
                    return a.order - b.order;
            }
        });

        return result;
    }, [themes, filter, search, sort]);

    // Paginación
    const totalPages = Math.ceil(filteredAndSortedThemes.length / ITEMS_PER_PAGE);
    const paginatedThemes = useMemo(() => {
        const start = (page - 1) * ITEMS_PER_PAGE;
        return filteredAndSortedThemes.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredAndSortedThemes, page]);

    // Reset page when filters change
    useEffect(() => {
        setPage(1);
    }, [filter, search, sort]);

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
        <AdminPageWrapper
            title="Gestión de Cursos"
            description="Administra el catálogo de cursos y lecciones"
            actions={
                <Button asChild>
                    <Link href="/academia/cursos/temas/nuevo">
                        <Plus className="mr-2 h-4 w-4" />
                        Nuevo Tema
                    </Link>
                </Button>
            }
        >

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
            <StatusFilter
                value={filter}
                onValueChange={setFilter}
                stats={stats}
            />

            {/* Search and Sort Controls */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por título o descripción..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Select value={sort} onValueChange={(v) => setSort(v as SortType)}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Ordenar por" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="order">Por orden</SelectItem>
                        <SelectItem value="newest">Más recientes</SelectItem>
                        <SelectItem value="oldest">Más antiguos</SelectItem>
                        <SelectItem value="title">Título A-Z</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Content Grid */}
            {loading ? (
                <div className="flex h-48 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedThemes.length === 0 ? (
                        <div className="col-span-full py-16 px-4 text-center bg-muted/30 border border-dashed rounded-xl">
                            <div className="flex justify-center mb-4 text-muted-foreground">
                                <BookOpen className="h-12 w-12" />
                            </div>
                            <h2 className="text-xl font-semibold mb-2">
                                {search
                                    ? "No se encontraron resultados"
                                    : filter === "all"
                                        ? "No hay temas creados"
                                        : filter === "published"
                                            ? "No hay temas publicados"
                                            : "No hay borradores"}
                            </h2>
                            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                                {search
                                    ? "Intenta con otros términos de búsqueda."
                                    : filter === "all"
                                        ? "Crea tu primer tema para comenzar a organizar tus cursos."
                                        : "Cambia el filtro para ver otros temas."}
                            </p>
                            {filter === "all" && !search && (
                                <Button asChild>
                                    <Link href="/academia/cursos/temas/nuevo">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Crear Primer Tema
                                    </Link>
                                </Button>
                            )}
                        </div>
                    ) : (
                        paginatedThemes.map((theme) => (
                            <ThemeCard
                                key={theme.id}
                                theme={theme}
                                onEdit={(id) => router.push(`/academia/cursos/temas/${id}`)}
                                onDelete={handleDelete}
                            />
                        ))
                    )}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-6">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious 
                                    onClick={() => setPage(Math.max(1, page - 1))}
                                    className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                />
                            </PaginationItem>
                            
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => {
                                // Simple logic: show all if few, or show current range + first/last
                                if (
                                    totalPages <= 7 || 
                                    pageNumber === 1 || 
                                    pageNumber === totalPages || 
                                    (pageNumber >= page - 1 && pageNumber <= page + 1)
                                ) {
                                    return (
                                        <PaginationItem key={pageNumber}>
                                            <PaginationLink 
                                                isActive={page === pageNumber}
                                                onClick={() => setPage(pageNumber)}
                                                className="cursor-pointer"
                                            >
                                                {pageNumber}
                                            </PaginationLink>
                                        </PaginationItem>
                                    );
                                }
                                
                                if (
                                    (pageNumber === 2 && page > 3) || 
                                    (pageNumber === totalPages - 1 && page < totalPages - 2)
                                ) {
                                    return (
                                        <PaginationItem key={pageNumber}>
                                            <PaginationEllipsis />
                                        </PaginationItem>
                                    );
                                }

                                return null;
                            })}

                            <PaginationItem>
                                <PaginationNext 
                                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                                    className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}
        </AdminPageWrapper>
    );
}
