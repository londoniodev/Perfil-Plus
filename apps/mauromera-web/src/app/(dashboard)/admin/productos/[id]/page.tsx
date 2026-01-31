"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_BASE, TENANT_ID } from "@/lib/config";

import { IconBack, IconEdit, IconLock, IconEye, IconImage, IconSettings, IconFile, IconSave, IconLoader } from "@alvarosky/ui";
import { useToast } from "@alvarosky/ui";
import { Button } from "@alvarosky/ui";
import { Input, InputWithIcon } from "@alvarosky/ui";
import { Textarea } from "@alvarosky/ui";
import { Switch } from "@alvarosky/ui";
import ImageUploader from "@/components/admin/ui/ImageUploader";
import { Card, CardContent, CardHeader, CardTitle } from "@alvarosky/ui";
import { Label } from "@alvarosky/ui";

export default function EditEbookPage(props: { params: Promise<{ id: string }> }) {
    const params = use(props.params);
    const router = useRouter();
    const toast = useToast();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [published, setPublished] = useState(false);
    const [coverUrl, setCoverUrl] = useState<string | null>(null);
    const [hasFullFile, setHasFullFile] = useState(false);
    const [hasPreviewFile, setHasPreviewFile] = useState(false);

    const [fullFile, setFullFile] = useState<File | null>(null);
    const [previewFile, setPreviewFile] = useState<File | null>(null);

    useEffect(() => { fetchEbook(); }, []);

    const fetchEbook = async () => {
        try {
            const res = await fetch(`${API_BASE}/admin/products/${params.id}`, { headers: { 'x-tenant-id': TENANT_ID }, credentials: "include" });
            if (!res.ok) throw new Error("Error");
            const data = await res.json();
            setTitle(data.title);
            setDescription(data.description);
            setPrice(data.price);
            setPublished(data.published);
            setCoverUrl(data.coverImage);
            setHasFullFile(!!data.fileUrl);
            setHasPreviewFile(!!data.previewUrl);
        } catch {
            router.push("/admin/productos");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSubmitting(true);

            // Cover image handled by ImageUploader

            let fileUrl = undefined;
            if (fullFile) {
                const formData = new FormData();
                formData.append("file", fullFile);
                const res = await fetch(`${API_BASE}/storage/upload/ebook`, { method: "POST", headers: { 'x-tenant-id': TENANT_ID }, credentials: "include", body: formData });
                if (res.ok) fileUrl = (await res.json()).url;
            }

            let previewUrl = undefined;
            if (previewFile) {
                const formData = new FormData();
                formData.append("file", previewFile);
                const res = await fetch(`${API_BASE}/storage/upload?folder=ebook-previews`, { method: "POST", headers: { 'x-tenant-id': TENANT_ID }, credentials: "include", body: formData });
                if (res.ok) previewUrl = (await res.json()).url;
            }

            const res = await fetch(`${API_BASE}/admin/products/${params.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", "x-tenant-id": TENANT_ID },
                credentials: "include",
                body: JSON.stringify({
                    title, description, price: parseFloat(price), published,
                    coverImage: coverUrl,
                    ...(fileUrl && { fileUrl }),
                    ...(previewUrl && { previewUrl }),
                }),
            });

            if (!res.ok) throw new Error("Error");
            toast.success("Producto actualizado correctamente");
            router.push("/admin/productos");
            router.refresh();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Error al actualizar E-book");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center"><IconLoader className="animate-spin" /></div>;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Editar Producto</h1>
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
                                <Label>Título</Label>
                                <Input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Descripción</Label>
                                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} required />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><IconFile /> Archivos</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <label className={`relative border-2 border-dashed rounded-xl p-6 cursor-pointer hover:border-primary/50 transition-colors flex flex-col items-center justify-center text-center gap-3 ${(fullFile || hasFullFile) ? 'border-primary bg-primary/5' : 'border-border'}`}>
                                <input type="file" accept=".pdf,.epub" onChange={(e) => setFullFile(e.target.files?.[0] || null)} hidden />
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${(fullFile || hasFullFile) ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}><IconLock /></div>
                                <div>
                                    <div className="font-medium text-foreground">{fullFile ? fullFile.name : (hasFullFile ? "PDF Cargado" : "PDF Completo *")}</div>
                                    <div className="text-xs text-muted-foreground">Click para reemplazar</div>
                                    <div className="text-[10px] text-muted-foreground mt-1 uppercase">PDF, EPUB • Máx 50MB</div>
                                </div>
                            </label>

                            <label className={`relative border-2 border-dashed rounded-xl p-6 cursor-pointer hover:border-primary/50 transition-colors flex flex-col items-center justify-center text-center gap-3 ${(previewFile || hasPreviewFile) ? 'border-primary bg-primary/5' : 'border-border'}`}>
                                <input type="file" accept=".pdf" onChange={(e) => setPreviewFile(e.target.files?.[0] || null)} hidden />
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${(previewFile || hasPreviewFile) ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}><IconEye /></div>
                                <div>
                                    <div className="font-medium text-foreground">{previewFile ? previewFile.name : (hasPreviewFile ? "Preview Cargado" : "Vista Previa")}</div>
                                    <div className="text-xs text-muted-foreground">Click para reemplazar</div>
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
                                    required
                                />
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
                                <div className="space-y-0.5">
                                    <Label>Estado</Label>
                                    <div className="text-xs text-muted-foreground">{published ? "Visible en tienda" : "Borrador"}</div>
                                </div>
                                <Switch checked={published} onCheckedChange={setPublished} />
                            </div>
                        </CardContent>
                    </Card>

                    <Button type="submit" disabled={submitting} className="w-full h-12 text-base">
                        {submitting ? <><IconLoader className="mr-2 animate-spin" /> Guardando...</> : <><IconSave className="mr-2" /> Guardar Cambios</>}
                    </Button>
                </div>
            </form>
        </div>
    );
}
