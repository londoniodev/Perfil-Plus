"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_BASE, TENANT_ID } from "@/lib/config";

import {
    IconBack, IconEdit, IconLock, IconEye, IconImage, IconUpload,
    IconSettings, IconFile, IconCheck, IconRocket, IconLoader, IconBox, IconList
} from "@alvarosky/ui";
import { useToast } from "@alvarosky/ui";
import { Button } from "@alvarosky/ui";
import { Input, InputWithIcon } from "@alvarosky/ui";
import { Textarea } from "@alvarosky/ui";
import { Switch } from "@alvarosky/ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@alvarosky/ui";
import ImageUploader from "@/components/admin/ui/ImageUploader";
import { Card, CardContent, CardHeader, CardTitle } from "@alvarosky/ui";
import { Label } from "@alvarosky/ui";

type ProductType = "DIGITAL" | "PHYSICAL";

export default function NewProductPage() {
    const router = useRouter();
    const toast = useToast();
    const [submitting, setSubmitting] = useState(false);

    // General
    const [productType, setProductType] = useState<ProductType>("DIGITAL");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [published, setPublished] = useState(false);
    const [coverUrl, setCoverUrl] = useState<string | null>(null);
    const [stock, setStock] = useState("0");
    const [sku, setSku] = useState("");

    // Digital Specific
    const [fullFile, setFullFile] = useState<File | null>(null);
    const [previewFile, setPreviewFile] = useState<File | null>(null);

    // Initial Slug generation
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !description || !price || !coverUrl) {
            toast.error("Por favor completa los campos principales");
            return;
        }

        if (productType === "DIGITAL" && !fullFile) {
            toast.error("Un producto digital requiere un archivo adjunto");
            return;
        }

        try {
            setSubmitting(true);

            let specs: any = {};
            let fileUrl = "";
            let previewUrl = "";

            // 1. Upload Files for Digital Products
            if (productType === "DIGITAL" && fullFile) {
                const fullFormData = new FormData();
                fullFormData.append("file", fullFile);

                // Upload Ebook/File
                const fullRes = await fetch(`${API_BASE}/storage/upload/ebook`, {
                    method: "POST",
                    headers: { 'x-tenant-id': TENANT_ID },
                    credentials: "include",
                    body: fullFormData
                });
                if (!fullRes.ok) throw new Error("Error al subir archivo principal");
                const fullData = await fullRes.json();
                fileUrl = fullData.url;

                // Preview File
                if (previewFile) {
                    const previewFormData = new FormData();
                    previewFormData.append("file", previewFile);
                    const previewRes = await fetch(`${API_BASE}/storage/upload?folder=ebook-previews`, {
                        method: "POST",
                        headers: { 'x-tenant-id': TENANT_ID },
                        credentials: "include",
                        body: previewFormData
                    });
                    if (previewRes.ok) {
                        const previewData = await previewRes.json();
                        previewUrl = previewData.url;
                    }
                }

                // Construir Specs para Digital
                specs = {
                    fileUrl,
                    previewUrl,
                    format: fullFile.name.split('.').pop()?.toUpperCase() || 'Digital',
                    size: (fullFile.size / 1024 / 1024).toFixed(2) + ' MB'
                };
            } else {
                // Specs para Físico (Placeholder por ahora)
                specs = {
                    weight: "0kg",
                    dimensions: "0x0"
                };
            }

            // 2. Create Product Payload
            const payload = {
                name: title,
                slug: slug || undefined, // Backend should handle duplication or validation
                description,
                productType,
                basePrice: parseFloat(price),
                images: [coverUrl],
                specs,
                published,
                stock: productType === "PHYSICAL" ? parseInt(stock) : -1,
                sku: sku || undefined
            };

            const res = await fetch(`${API_BASE}/admin/products`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "x-tenant-id": TENANT_ID },
                credentials: "include",
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || "Error al crear producto");
            }

            toast.success("Producto creado correctamente");
            router.push("/admin/productos");
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : "Error al crear producto");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Nuevo Producto</h1>
                <Button variant="ghost" asChild>
                    <Link href="/admin/productos">
                        <IconBack className="mr-2" /> Cancelar
                    </Link>
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* LEFT */}
                <div className="lg:col-span-2 space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><IconEdit /> Información Básica</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label>Tipo de Producto</Label>
                                <Select value={productType} onValueChange={(val: ProductType) => setProductType(val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona tipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="DIGITAL">Digital (E-book, Archivo)</SelectItem>
                                        <SelectItem value="PHYSICAL">Físico (Ropa, Accesorios)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Nombre del Producto *</Label>
                                <Input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej. Liderazgo Consciente" required />
                                <p className="text-xs text-muted-foreground">URL: /productos/{slug}</p>
                            </div>

                            <div className="space-y-2">
                                <Label>Descripción *</Label>
                                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Escribe una descripción atractiva..." rows={5} required />
                            </div>
                        </CardContent>
                    </Card>

                    {/* DIGITAL FILES CARD */}
                    {productType === "DIGITAL" && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><IconFile /> Archivos Digitales</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <label className={`relative border-2 border-dashed rounded-xl p-6 cursor-pointer hover:border-primary/50 transition-colors flex flex-col items-center justify-center text-center gap-3 ${fullFile ? 'border-primary bg-primary/5' : 'border-border'}`}>
                                    <input type="file" accept=".pdf,.epub,.zip" onChange={(e) => setFullFile(e.target.files?.[0] || null)} hidden />
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${fullFile ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}><IconLock /></div>
                                    <div>
                                        <div className="font-medium text-foreground">{fullFile ? fullFile.name : "Archivo Principal *"}</div>
                                        <div className="text-xs text-muted-foreground">Se envía tras la compra</div>
                                        <div className="text-[10px] text-muted-foreground mt-1 uppercase">PDF, EPUB, ZIP • Máx 50MB</div>
                                    </div>
                                </label>

                                <label className={`relative border-2 border-dashed rounded-xl p-6 cursor-pointer hover:border-primary/50 transition-colors flex flex-col items-center justify-center text-center gap-3 ${previewFile ? 'border-primary bg-primary/5' : 'border-border'}`}>
                                    <input type="file" accept=".pdf,.jpg,.png" onChange={(e) => setPreviewFile(e.target.files?.[0] || null)} hidden />
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${previewFile ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}><IconEye /></div>
                                    <div>
                                        <div className="font-medium text-foreground">{previewFile ? previewFile.name : "Vista Previa (Opcional)"}</div>
                                        <div className="text-xs text-muted-foreground">Muestra gratuita pública</div>
                                        <div className="text-[10px] text-muted-foreground mt-1 uppercase">PDF, IMAGEN • Máx 10MB</div>
                                    </div>
                                </label>
                            </CardContent>
                        </Card>
                    )}

                    {/* PHYSICAL INVENTORY CARD */}
                    {productType === "PHYSICAL" && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><IconBox /> Inventario Físico</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>SKU (Código)</Label>
                                    <Input value={sku} onChange={(e) => setSku(e.target.value)} placeholder="Ej. T-SHIRT-BLK-001" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Stock Inicial</Label>
                                    <Input
                                        type="number"
                                        value={stock}
                                        onChange={(e) => setStock(e.target.value)}
                                        min="0"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* RIGHT */}
                <div className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><IconImage /> Imagen Principal</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ImageUploader
                                value={coverUrl}
                                onChange={setCoverUrl}
                                folder="products-covers"
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><IconSettings /> Configuración</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label>Precio Base (USD) *</Label>
                                <InputWithIcon
                                    icon="$"
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    placeholder="0.00"
                                    min="0"
                                    step="0.01"
                                    required
                                />
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
                                <div className="space-y-0.5">
                                    <Label>Publicar</Label>
                                    <div className="text-xs text-muted-foreground">{published ? "Visible en tienda" : "Guardado como borrador"}</div>
                                </div>
                                <Switch checked={published} onCheckedChange={setPublished} />
                            </div>
                        </CardContent>
                    </Card>

                    <Button type="submit" disabled={submitting} className="w-full h-12 text-base">
                        {submitting ? <><IconLoader className="mr-2 animate-spin" /> Procesando...</> : <><IconRocket className="mr-2" /> Crear Producto</>}
                    </Button>
                </div>
            </form>
        </div>
    );
}

