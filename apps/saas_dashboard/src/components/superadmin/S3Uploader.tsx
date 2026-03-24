"use client";

import { useState } from "react";
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
import { Upload, FileCode, CheckCircle2, AlertCircle, Loader2, Globe } from "lucide-react";
import { uploadLandingHtmlAction } from "@/actions/super-admin/landing-uploader";
import { toast } from "sonner";

interface Props {
    tenantSlug: string;
}

export function S3Uploader({ tenantSlug }: Props) {
    const [file, setFile] = useState<File | null>(null);
    const [pageSlug, setPageSlug] = useState("home");
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

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

    const handleUpload = async () => {
        if (!file || !pageSlug) return;

        setUploading(true);
        setResult(null);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("tenantSlug", tenantSlug);
        formData.append("pageSlug", pageSlug.toLowerCase().trim());

        try {
            const res = await uploadLandingHtmlAction(formData);

            if (res.success) {
                setResult({ success: true, message: `Página "${pageSlug}" subida y revalidada correctamente.` });
                toast.success("¡Subida exitosa!");
                setFile(null);
                // Reset file input
                const fileInput = document.getElementById("landing-file") as HTMLInputElement;
                if (fileInput) fileInput.value = "";
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
        <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-indigo-400">
                    <Globe className="w-5 h-5" /> Landing / S3 Manager
                </CardTitle>
                <CardDescription>
                    Sube archivos HTML directamente a MinIO. Si el slug no es "home", se añadirá automáticamente al Header del tenant.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="page-slug" className="text-slate-300">Slug de la Página</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-slate-500 text-sm">/</span>
                            <Input
                                id="page-slug"
                                value={pageSlug}
                                onChange={(e) => setPageSlug(e.target.value)}
                                placeholder="home, promociones, nosotros..."
                                className="bg-slate-800/50 border-slate-700 pl-6 font-mono text-sm"
                            />
                        </div>
                        <p className="text-[10px] text-slate-500">
                            "home" sobreescribe la raíz. Otros crearán subrutas.
                        </p>
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
            <CardFooter className="bg-slate-800/20 py-4">
                <Button 
                    onClick={handleUpload}
                    disabled={!file || !pageSlug || uploading}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                    {uploading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Subiendo y Revalidando...
                        </>
                    ) : (
                        <>
                            <Upload className="w-4 h-4 mr-2" />
                            Subir Landing a S3
                        </>
                    )}
                </Button>
            </CardFooter>
        </Card>
    );
}
