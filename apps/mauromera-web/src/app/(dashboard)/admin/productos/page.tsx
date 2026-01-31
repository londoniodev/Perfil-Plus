"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { API_BASE, TENANT_ID } from "@/lib/config";

import { IconPlus, IconEdit, IconTrash, IconBook, IconLoader } from "@alvarosky/ui";
import { useToast } from "@alvarosky/ui";
import { Button } from "@alvarosky/ui";
import { Card, CardContent } from "@alvarosky/ui";
import { Badge } from "@alvarosky/ui";
import { PageHeader } from "@alvarosky/ui";

// Tipo temporal - después conectaremos con el nuevo modelo Product
interface Product {
    id: string;
    name: string;
    slug: string;
    basePrice: number;
    images: string[];
    productType: "DIGITAL" | "PHYSICAL";
    published: boolean;
    _count?: {
        variants?: number;
    };
}

export default function AdminProductosPage() {
    const { isAdmin, loading: authLoading } = useAuth();
    const router = useRouter();
    const toast = useToast();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !isAdmin) router.push("/perfil");
    }, [isAdmin, authLoading, router]);

    useEffect(() => {
        if (isAdmin) fetchProducts();
    }, [isAdmin]);

    const fetchProducts = async () => {
        try {
            // Usar el nuevo endpoint de productos
            const res = await fetch(`${API_BASE}/admin/products`, { headers: { 'x-tenant-id': TENANT_ID }, credentials: "include" });
            if (!res.ok) throw new Error("Error");
            const data = await res.json();
            // Los productos ya vienen en el formato correcto
            setProducts(data.map((p: any) => ({
                id: p.id,
                name: p.name,
                slug: p.slug,
                basePrice: p.basePrice || 0,
                images: p.images || [],
                productType: p.productType || "DIGITAL",
                published: p.published,
                _count: p._count
            })));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Eliminar este producto?")) return;
        try {
            await fetch(`${API_BASE}/admin/products/${id}`, { method: "DELETE", headers: { 'x-tenant-id': TENANT_ID }, credentials: "include" });
            setProducts((prev) => prev.filter((p) => p.id !== id));
            toast.success("Producto eliminado correctamente");
        } catch (err) {
            toast.error("Error al eliminar el producto");
        }
    };

    if (authLoading) return <div className="flex h-screen items-center justify-center"><IconLoader className="animate-spin" /></div>;
    if (!isAdmin) return null;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <PageHeader
                title="Gestión de Productos"
                description={`${products.length} productos en tu catálogo`}
            >
                <Button asChild>
                    <Link href="/admin/productos/new">
                        <IconPlus className="mr-2 h-4 w-4" /> Nuevo Producto
                    </Link>
                </Button>
            </PageHeader>

            {loading ? (
                <div className="flex justify-center py-20">
                    <IconLoader className="animate-spin text-muted-foreground" size={32} />
                </div>
            ) : products.length === 0 ? (
                <Card className="border-dashed py-12">
                    <CardContent className="flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4 text-muted-foreground">
                            <IconBook size={32} />
                        </div>
                        <h2 className="text-xl font-semibold mb-2">No hay productos</h2>
                        <p className="text-muted-foreground mb-6">Crea tu primer producto para comenzar a vender.</p>
                        <Button asChild variant="secondary">
                            <Link href="/admin/productos/new">
                                <IconPlus className="mr-2" /> Crear Producto
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <Card key={product.id} className="overflow-hidden flex flex-col group hover:shadow-lg transition-all">
                            <div className="relative aspect-[3/4] overflow-hidden bg-muted border-b border-border/50">
                                <img
                                    src={product.images[0] || "/placeholder.jpg"}
                                    alt={product.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                {!product.published && (
                                    <div className="absolute top-3 right-3">
                                        <Badge variant="destructive" className="shadow-sm">Borrador</Badge>
                                    </div>
                                )}
                                <div className="absolute top-3 left-3">
                                    <Badge
                                        className={product.productType === "DIGITAL" ? "bg-blue-600" : "bg-green-600"}
                                    >
                                        {product.productType === "DIGITAL" ? "Digital" : "Físico"}
                                    </Badge>
                                </div>
                            </div>
                            <CardContent className="p-5 flex flex-col flex-1">
                                <h3 className="font-bold text-lg leading-tight mb-2 line-clamp-2" title={product.name}>
                                    {product.name}
                                </h3>
                                <div className="flex items-center justify-between mt-auto mb-4 text-sm text-muted-foreground">
                                    <span className="font-semibold text-foreground">
                                        ${Number(product.basePrice).toLocaleString("es-CO")}
                                    </span>
                                    <span>{product._count?.variants || 0} variantes</span>
                                </div>
                                <div className="flex items-center gap-2 mt-2 pt-4 border-t border-border/50">
                                    <Button asChild variant="ghost" size="sm" className="flex-1 justify-start px-2 hover:bg-muted text-muted-foreground hover:text-foreground">
                                        <Link href={`/admin/productos/${product.id}`}>
                                            <IconEdit className="mr-2 h-4 w-4" /> Editar
                                        </Link>
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                                        onClick={() => handleDelete(product.id)}
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

