"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Button, useDigitalProduct } from "@alvarosky/ui";
import { SecurePdfViewer } from "@alvarosky/ui/secure-pdf-viewer";
import { X, Loader2, AlertCircle } from "lucide-react";

interface ViewerPageProps {
    params: Promise<{ id: string }>;
}

export default function ViewerPage({ params }: ViewerPageProps) {
    // Unwrap params using React.use()
    const { id } = use(params);
    const router = useRouter();
    const { getProductUrl, isLoading } = useDigitalProduct();
    const [url, setUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        async function fetchUrl() {
            if (!id) return;

            const signedUrl = await getProductUrl(id);

            if (mounted) {
                if (signedUrl) {
                    setUrl(signedUrl);
                } else {
                    setError("No se pudo cargar el documento. Verifica tu conexión o si tienes acceso.");
                }
            }
        }

        fetchUrl();

        return () => {
            mounted = false;
        };
    }, [id]); // Removed getProductUrl dependency to avoid infinite loop if reference changes

    const handleClose = () => {
        router.back();
    };

    if (isLoading || (!url && !error)) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Cargando documento...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-background p-4 text-center">
                <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                <h1 className="text-xl font-bold mb-2">Error de Acceso</h1>
                <p className="text-muted-foreground mb-6 max-w-md">{error}</p>
                <Button onClick={handleClose}>Volver</Button>
            </div>
        );
    }

    return (
        <div className="relative w-full h-screen bg-zinc-950 flex flex-col overflow-hidden">
            {/* Top Bar / Close Button */}
            <div className="absolute top-4 right-4 z-50">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={handleClose}
                    className="rounded-full bg-background/50 backdrop-blur-sm border-0 hover:bg-background/80"
                >
                    <X className="h-5 w-5" />
                </Button>
            </div>

            {/* PDF Viewer */}
            <div className="flex-1 w-full h-full overflow-auto flex items-center justify-center pt-0">
                <SecurePdfViewer
                    url={url!}
                    className="w-full h-full max-w-none p-0"
                />
            </div>
        </div>
    );
}
