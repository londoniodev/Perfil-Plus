"use client";

import { useState, useEffect, useCallback } from "react";
import { 
    Button, 
    Input, 
    Label, 
    Card, 
    CardHeader, 
    CardTitle, 
    CardDescription, 
    CardContent, 
    CardFooter 
} from "@alvarosky/ui";
import { Upload, FileCode, CheckCircle2, AlertCircle, Loader2, Globe, FileEdit, X } from "lucide-react";
import { uploadLandingHtmlAction, listLandingsAction } from "@/actions/super-admin/landing-uploader";
import { toast } from "sonner";

interface Props {
    tenantSlug: string;
}

export function S3Uploader({ tenantSlug }: Props) {
    const [file, setFile] = useState<File | null>(null);
    const [pageTitle, setPageTitle] = useState("Inicio");
    const [pageSlug, setPageSlug] = useState("home");
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
    
    // CMS States
    const [landings, setLandings] = useState<{ label: string, href: string }[]>([]);
    const [loadingLandings, setLoadingLandings] = useState(true);
    const [editMode, setEditMode] = useState<{ label: string, slug: string } | null>(null);

    const slugify = (text: string) => {
        return text
            .toString()
            .toLowerCase()
            .trim()
            .normalize("NFD") 
            .replace(/[\u0300-\u036f]/g, "") 
            .replace(/\s+/g, "-") 
            .replace(/[^\w-]+/g, "") 
            .replace(/--+/g, "-") 
            .replace(/^-+/, "") 
            .replace(/-+$/, ""); 
    };

    const handleTitleChange = (val: string) => {
        setPageTitle(val);
        // Si no estamos en edición bloqueamos la auto-generación de alias.
        // En modo edición el slug es INALTERABLE.
        if (!editMode) {
            const slug = slugify(val);
            if (slug === "inicio" || slug === "home") {
                setPageSlug("home");
            } else {
                setPageSlug(slug);
            }
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.type !== "text/html") {
                toast.error("Solo se permiten archivos HTML");
                return;
            }
            setFile(selectedFile);
            setResult(null);
        }
    };

    const fetchLandings = useCallback(async () => {
        setLoadingLandings(true);
        try {
            const res = await listLandingsAction(tenantSlug);
            if (res.success && res.data) {
                setLandings(res.data);
            }
        } catch (error) {
            toast.error("Error cargando la lista de landings publicadas.");
        } finally {
            setLoadingLandings(false);
        }
    }, [tenantSlug]);

    useEffect(() => {
        fetchLandings();
    }, [fetchLandings]);

    const handleEdit = (link: { label: string, href: string }) => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        const extractedSlug = link.href.replace(/^\//, '');
        
        setEditMode({ label: link.label, slug: extractedSlug });
        setPageTitle(link.label);
        setPageSlug(extractedSlug);
        setFile(null);
        setResult(null);
        
        const fileInput = document.getElementById("landing-file") as HTMLInputElement;
        if (fileInput) fileInput.value = "";
    };

    const handleCancelEdit = () => {
        setEditMode(null);
        setPageTitle("Inicio");
        setPageSlug("home");
        setFile(null);
        setResult(null);
        const fileInput = document.getElementById("landing-file") as HTMLInputElement;
        if (fileInput) fileInput.value = "";
    };

    const handleUpload = async () => {
        if (!file || !pageSlug) return;

        setUploading(true);
        setResult(null);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("tenantSlug", tenantSlug);
        formData.append("pageSlug", pageSlug);
        formData.append("label", pageTitle);

        try {
            const res = await uploadLandingHtmlAction(formData);

            if (res.success) {
                setResult({ success: true, message: `Página "${pageTitle}" guardada y revalidada correctamente.` });
                toast.success("¡Operación exitosa!");
                setFile(null);
                
                const fileInput = document.getElementById("landing-file") as HTMLInputElement;
                if (fileInput) fileInput.value = "";
                
                if (editMode) handleCancelEdit();
                
                await fetchLandings(); // Recargar la lista después del éxito
            } else {
                setResult({ success: false, message: res.error || "Fallo en la subida" });
                toast.error(res.error || "Error al subir");
            }
        } catch (error) {
            setResult({ success: false, message: "Error de conexión con el servidor" });
            toast.error("Error crítico en la subida");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Formulario de Subida/Edición */}
            <Card className={`border-slate-800 transition-colors ${editMode ? 'bg-indigo-950/40 border-indigo-800' : 'bg-slate-900/50'}`}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-indigo-400">
                        {editMode ? <FileEdit className="w-5 h-5 text-indigo-300" /> : <Globe className="w-5 h-5" />} 
                        {editMode ? `Actualizando Página: ${editMode.label}` : "Gestor S3 - Nueva Página"}
                    </CardTitle>
                    <CardDescription>
                        {editMode 
                            ? "Sube un archivo HTML para sobrescribir la página existente manteniendo el mismo slug (ruta)."
                            : "Sube archivos HTML directamente a MinIO. Define el nombre que aparecerá en el menú del Header."}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="page-title" className="text-slate-300">Título de la Página (Menú)</Label>
                            <Input
                                id="page-title"
                                value={pageTitle}
                                onChange={(e) => handleTitleChange(e.target.value)}
                                placeholder="Ej: Sobre Nosotros, Servicios..."
                                className="bg-slate-800/50 border-slate-700 font-medium"
                            />
                            <div className="flex items-center gap-1.5 px-2 mt-1">
                                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Ruta final:</span>
                                <code className="text-[11px] text-indigo-400 font-mono bg-indigo-500/10 px-1.5 py-0.5 rounded">
                                    /{pageSlug}
                                </code>
                                {editMode && (
                                    <span className="text-[10px] text-red-400/80 uppercase font-bold ml-2">(Ruta Bloqueada)</span>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="landing-file" className="text-slate-300">Archivo HTML</Label>
                            <div className="relative">
                                <Input
                                    id="landing-file"
                                    type="file"
                                    accept=".html"
                                    onChange={handleFileChange}
                                    className="bg-slate-800/50 border-slate-700 file:bg-slate-700 file:text-slate-300 file:border-0 file:rounded-md file:mr-4 file:px-3 file:py-1 cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>

                    {file && (
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                            <FileCode className="w-5 h-5 text-indigo-400" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">{file.name}</p>
                                <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
                            </div>
                        </div>
                    )}

                    {result && (
                        <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                            result.success 
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                            : "bg-red-500/10 border-red-500/20 text-red-400"
                        }`}>
                            {result.success ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                            <p className="text-sm font-medium">{result.message}</p>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="bg-slate-800/20 py-4 gap-3">
                    <Button 
                        onClick={handleUpload}
                        disabled={!file || !pageSlug || uploading}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all hover:scale-[1.01] active:scale-[0.99]"
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                {editMode ? "Sobrescribiendo..." : "Subiendo..."}
                            </>
                        ) : (
                            <>
                                <Upload className="w-4 h-4 mr-2" />
                                {editMode ? "Confirmar Remplazo de HTML" : "Subir Landing a S3"}
                            </>
                        )}
                    </Button>
                    
                    {editMode && (
                        <Button 
                            variant="outline" 
                            onClick={handleCancelEdit}
                            disabled={uploading}
                            className="bg-slate-800 border-slate-700 hover:bg-slate-700"
                        >
                            <X className="w-4 h-4 mr-2" />
                            Cancelar
                        </Button>
                    )}
                </CardFooter>
            </Card>

            {/* Listado de Páginas (CMS Viewer) */}
            <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader className="pb-4 border-b border-slate-800">
                    <CardTitle className="text-lg">Páginas Publicadas</CardTitle>
                    <CardDescription>
                        Listado de todas las landings vinculadas a este subdominio. Puedes reemplazar el código de manera directa sin alterar su ruta.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {loadingLandings ? (
                        <div className="flex flex-col items-center justify-center p-8 text-slate-500">
                            <Loader2 className="w-8 h-8 animate-spin mb-4 text-indigo-500/50" />
                            <p className="text-sm">Buscando rutas en la Base de Datos...</p>
                        </div>
                    ) : landings.length === 0 ? (
                        <div className="p-8 text-center text-slate-400">
                            <p>No hay páginas creadas todavía.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-800">
                            {landings.map((l, i) => (
                                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-slate-800/30 transition-colors gap-3">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-slate-200">{l.label}</span>
                                        <span className="text-xs text-slate-500 font-mono mt-1">{l.href}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {(l as any).sourceUrl && (
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                asChild
                                                className="border-slate-700 hover:bg-slate-800 text-slate-300"
                                            >
                                                <a href={(l as any).sourceUrl} target="_blank" rel="noopener noreferrer" download>
                                                    Descargar HTML
                                                </a>
                                            </Button>
                                        )}
                                        <Button 
                                            variant="secondary" 
                                            size="sm" 
                                            onClick={() => handleEdit(l)}
                                            className="bg-slate-800 hover:bg-indigo-600/20 hover:text-indigo-400 border border-slate-700 shrink-0"
                                        >
                                            <FileEdit className="w-3.5 h-3.5 mr-2" />
                                            Reemplazar HTML
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
