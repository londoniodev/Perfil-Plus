"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_BASE, TENANT_ID } from "@/lib/config";

import { IconBack, IconEdit, IconLock, IconEye, IconImage, IconUpload, IconSettings, IconFile, IconCheck, IconRocket, IconLoader } from "@mauromera/ui";
import { useToast } from "@mauromera/ui";
import { Button } from "@mauromera/ui";
import { Input, InputWithIcon } from "@mauromera/ui";
import { Textarea } from "@mauromera/ui";
import { Switch } from "@mauromera/ui";
import ImageUploader from "@/components/admin/ui/ImageUploader";
import { Card, CardContent, CardHeader, CardTitle } from "@mauromera/ui";
import { Label } from "@mauromera/ui";

export default function NewEbookPage() {
    const router = useRouter();
    const toast = useToast();
    const [submitting, setSubmitting] = useState(false);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [published, setPublished] = useState(false);
    const [coverUrl, setCoverUrl] = useState<string | null>(null);
    const [fullFile, setFullFile] = useState<File | null>(null);
    const [previewFile, setPreviewFile] = useState<File | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !description || !price || !coverUrl || !fullFile) {
            toast.error("Por favor completa todos los campos requeridos");
            return;
        }

        try {
            setSubmitting(true);

            // Cover image is already uploaded by ImageUploader

            const fullFormData = new FormData();
            fullFormData.append("file", fullFile);
            const fullRes = await fetch(`${API_BASE}/storage/upload/ebook`, { method: "POST", headers: { 'x-tenant-id': TENANT_ID }, credentials: "include", body: fullFormData });
            if (!fullRes.ok) throw new Error("Error al subir eBook");
            const fullData = await fullRes.json();

            let previewUrl = undefined;
            if (previewFile) {
                const previewFormData = new FormData();
                previewFormData.append("file", previewFile);
                const previewRes = await fetch(`${API_BASE}/storage/upload?folder=ebook-previews`, { method: "POST", headers: { 'x-tenant-id': TENANT_ID }, credentials: "include", body: previewFormData });
                if (previewRes.ok) previewUrl = (await previewRes.json()).url;
            }

            const res = await fetch(`${API_BASE}/admin/ebooks`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "x-tenant-id": TENANT_ID },
                credentials: "include",
                body: JSON.stringify({ title, description, price: parseFloat(price), published, coverImage: coverUrl, fileUrl: fullData.url, previewUrl }),
            });

            if (!res.ok) throw new Error("Error al crear eBook");
            toast.success("Producto creado correctamente");
            router.push("/admin/productos");
            router.refresh();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Error al crear E-book");
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
                            <CardTitle className="flex items-center gap-2"><IconEdit /> Información</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label>Título del Libro *</Label>
                                <Input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej. Liderazgo Consciente" required />
                            </div>
                            <div className="space-y-2">
                                <Label>Descripción *</Label>
                                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Escribe una descripción atractiva..." rows={5} required />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><IconFile /> Archivos</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <label className={`relative border-2 border-dashed rounded-xl p-6 cursor-pointer hover:border-primary/50 transition-colors flex flex-col items-center justify-center text-center gap-3 ${fullFile ? 'border-primary bg-primary/5' : 'border-border'}`}>
                                <input type="file" accept=".pdf,.epub" onChange={(e) => setFullFile(e.target.files?.[0] || null)} hidden />
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${fullFile ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}><IconLock /></div>
                                <div>
                                    <div className="font-medium text-foreground">{fullFile ? fullFile.name : "PDF Completo *"}</div>
                                    <div className="text-xs text-muted-foreground">Privado - Solo tras compra</div>
                                    <div className="text-[10px] text-muted-foreground mt-1 uppercase">PDF, EPUB • Máx 50MB</div>
                                </div>
                            </label>

                            <label className={`relative border-2 border-dashed rounded-xl p-6 cursor-pointer hover:border-primary/50 transition-colors flex flex-col items-center justify-center text-center gap-3 ${previewFile ? 'border-primary bg-primary/5' : 'border-border'}`}>
                                <input type="file" accept=".pdf" onChange={(e) => setPreviewFile(e.target.files?.[0] || null)} hidden />
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${previewFile ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}><IconEye /></div>
                                <div>
                                    <div className="font-medium text-foreground">{previewFile ? previewFile.name : "Vista Previa"}</div>
                                    <div className="text-xs text-muted-foreground">Público - Muestra gratuita</div>
                                    <div className="text-[10px] text-muted-foreground mt-1 uppercase">PDF • Máx 10MB</div>
                                </div>
                            </label>
                        </CardContent>
                    </Card>
                </div>

                {/* RIGHT */}
                <div className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><IconImage /> Portada</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ImageUploader
                                value={coverUrl}
                                onChange={setCoverUrl}
                                folder="ebooks-covers"
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><IconSettings /> Configuración</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label>Precio (USD) *</Label>
                                <InputWithIcon
                                    icon="$"
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    placeholder="0"
                                    min="0"
                                    step="1"
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
                        {submitting ? <><IconLoader className="mr-2 animate-spin" /> Creando...</> : <><IconRocket className="mr-2" /> Crear E-book</>}
                    </Button>
                </div>
            </form>
        </div>
    );
}
