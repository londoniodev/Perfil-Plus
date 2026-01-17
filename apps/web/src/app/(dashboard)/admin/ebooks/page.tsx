"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { API_BASE } from "@/lib/config";

import { IconPlus, IconEdit, IconTrash, IconBook, IconLoader } from "@mauromera/ui";
import { useToast } from "@mauromera/ui";
import { Button } from "@mauromera/ui";
import { Card, CardContent } from "@mauromera/ui";
import { Badge } from "@mauromera/ui";

import { Ebook } from "@/types/ecommerce";

export default function AdminEbooksPage() {
    const { isAdmin, loading: authLoading } = useAuth();
    const router = useRouter();
    const toast = useToast();
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
            toast.success("E-book eliminado correctamente");
        } catch (err) {
            toast.error("Error al eliminar el E-book");
        }
    };

    if (authLoading) return <div className="flex h-screen items-center justify-center"><IconLoader className="animate-spin" /></div>;
    if (!isAdmin) return null;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Biblioteca de E-books</h1>
                    <p className="text-muted-foreground mt-1">{ebooks.length} libros en tu catálogo</p>
                </div>
                <Button asChild>
                    <Link href="/admin/ebooks/new">
                        <IconPlus className="mr-2" /> Nuevo E-book
                    </Link>
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <IconLoader className="animate-spin text-muted-foreground" size={32} />
                </div>
            ) : ebooks.length === 0 ? (
                <Card className="border-dashed py-12">
                    <CardContent className="flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4 text-muted-foreground">
                            <IconBook size={32} />
                        </div>
                        <h2 className="text-xl font-semibold mb-2">No hay e-books</h2>
                        <p className="text-muted-foreground mb-6">Crea tu primer e-book para comenzar a vender.</p>
                        <Button asChild variant="secondary">
                            <Link href="/admin/ebooks/new">
                                <IconPlus className="mr-2" /> Crear E-book
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {ebooks.map((ebook) => (
                        <Card key={ebook.id} className="overflow-hidden flex flex-col group hover:shadow-lg transition-all">
                            <div className="relative aspect-[3/4] overflow-hidden bg-muted border-b border-border/50">
                                <img
                                    src={ebook.coverImage}
                                    alt={ebook.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                {!ebook.published && (
                                    <div className="absolute top-3 right-3">
                                        <Badge variant="destructive" className="shadow-sm">Borrador</Badge>
                                    </div>
                                )}
                            </div>
                            <CardContent className="p-5 flex flex-col flex-1">
                                <h3 className="font-bold text-lg leading-tight mb-2 line-clamp-2" title={ebook.title}>{ebook.title}</h3>
                                <div className="flex items-center justify-between mt-auto mb-4 text-sm text-muted-foreground">
                                    <span className="font-semibold text-foreground">${Number(ebook.price).toLocaleString("es-CO")}</span>
                                    <span>{ebook._count?.purchases || 0} ventas</span>
                                </div>
                                <div className="flex items-center gap-2 mt-2 pt-4 border-t border-border/50">
                                    <Button asChild variant="ghost" size="sm" className="flex-1 justify-start px-2 hover:bg-muted text-muted-foreground hover:text-foreground">
                                        <Link href={`/admin/ebooks/${ebook.id}`}>
                                            <IconEdit className="mr-2 h-4 w-4" /> Editar
                                        </Link>
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                                        onClick={() => handleDelete(ebook.id)}
                                    >
                                        <IconTrash className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
