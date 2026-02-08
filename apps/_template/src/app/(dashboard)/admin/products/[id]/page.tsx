"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_BASE, TENANT_ID } from "@/lib/config";

import { ArrowLeft, Save, Loader2, Package, Settings, ImageIcon, Tag, FileText } from "lucide-react";
import { useToast } from "@alvarosky/ui";
import { Button } from "@alvarosky/ui";
import { Input, InputWithIcon } from "@alvarosky/ui";
import { Textarea } from "@alvarosky/ui";
import { Switch } from "@alvarosky/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@alvarosky/ui";
import { Label } from "@alvarosky/ui";
import { Badge, AdminPageWrapper } from "@alvarosky/ui";
import { ImageUploader } from "@alvarosky/ui";
import { API_BASE, TENANT_ID } from "@/lib/config";

interface ProductData {
    id: string;
    name: string;
    slug: string;
    description: string;
    basePrice: number;
    images: string[];
    productType: "PHYSICAL" | "DIGITAL" | "SERVICE";
    published: boolean;
    digitalFileUrl?: string;
}

export default function EditProductPage(props: { params: Promise<{ id: string }> }) {
    const params = use(props.params);
    const router = useRouter();
    const toast = useToast();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [description, setDescription] = useState("");
    const [basePrice, setBasePrice] = useState("");
    const [published, setPublished] = useState(false);
    const [productType, setProductType] = useState<"PHYSICAL" | "DIGITAL" | "SERVICE">("PHYSICAL");
    const [images, setImages] = useState<string[]>([]);

    useEffect(() => { fetchProduct(); }, []);

    const fetchProduct = async () => {
        try {
            const res = await fetch(`${API_BASE}/admin/products/${params.id}`, {
                headers: { "x-tenant-id": TENANT_ID },
                credentials: "include"
            });
            if (!res.ok) throw new Error("Error fetching product");
            const data: ProductData = await res.json();
            setName(data.name);
            setSlug(data.slug);
            setDescription(data.description || "");
            setBasePrice(String(data.basePrice));
            setPublished(data.published);
            setProductType(data.productType);
            setImages(data.images || []);
        } catch {
            toast.error("Error al cargar el producto");
            router.push("/admin/products");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSubmitting(true);

            const res = await fetch(`${API_BASE}/admin/products/${params.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "x-tenant-id": TENANT_ID
                },
                credentials: "include",
                body: JSON.stringify({
                    name,
                    slug,
                    description,
                    basePrice: parseFloat(basePrice),
                    published,
                    productType,
                    images,
                }),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || "Error al actualizar");
            }

            toast.success("Producto actualizado correctamente");
            router.push("/admin/products");
            router.refresh();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Error al actualizar producto");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
            </div>
        );
    }

    return (
        <AdminPageWrapper
            title="Editar Producto"
            description={`Editando: ${name}`}
        >
            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* LEFT: Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Información del Producto
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nombre *</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Ej: Curso de Marketing Digital"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="slug">Slug (URL)</Label>
                                <Input
                                    id="slug"
                                    type="text"
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value)}
                                    placeholder="curso-marketing-digital"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Se usará en la URL: /tienda/{slug || "..."}
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Descripción</Label>
                                <Textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={5}
                                    placeholder="Describe tu producto..."
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ImageIcon className="h-5 w-5" />
                                Imágenes
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ImageUploader
                                apiBase={API_BASE}
                                tenantId={TENANT_ID}
                                value={images[0] || null}
                                onChange={(url) => setImages(url ? [url] : [])}
                                folder="products"
                            />
                            <p className="text-xs text-muted-foreground mt-2">
                                Imagen principal del producto
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* RIGHT: Sidebar */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="h-5 w-5" />
                                Configuración
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label>Tipo de Producto</Label>
                                <div className="flex gap-2 flex-wrap">
                                    {(["PHYSICAL", "DIGITAL", "SERVICE"] as const).map((type) => (
                                        <Badge
                                            key={type}
                                            variant={productType === type ? "default" : "outline"}
                                            className="cursor-pointer"
                                            onClick={() => setProductType(type)}
                                        >
                                            {type === "PHYSICAL" ? "Físico" : type === "DIGITAL" ? "Digital" : "Servicio"}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="price">Precio Base (USD) *</Label>
                                <InputWithIcon
                                    icon="$"
                                    id="price"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={basePrice}
                                    onChange={(e) => setBasePrice(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
                                <div className="space-y-0.5">
                                    <Label>Estado</Label>
                                    <div className="text-xs text-muted-foreground">
                                        {published ? "Visible en tienda" : "Borrador"}
                                    </div>
                                </div>
                                <Switch checked={published} onCheckedChange={setPublished} />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex flex-col gap-3">
                        <Button type="submit" disabled={submitting} className="w-full h-12 text-base">
                            {submitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Guardar Cambios
                                </>
                            )}
                        </Button>
                        <Button type="button" variant="outline" asChild className="w-full">
                            <Link href="/admin/products">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Cancelar
                            </Link>
                        </Button>
                    </div>
                </div>
            </form>
        </AdminPageWrapper>
    );
}
