import { headers } from "next/headers";
import { getTenantId } from "@/lib/config-server";
import TrainingCatalog from "@/components/marketing/TrainingCatalog";
import { notFound } from "next/navigation";
import { TenantFeature } from "@alvarosky/features";
import { getTenantFeatures } from "@alvarosky/shared";

export const metadata = {
    title: "Programas de Formación",
    description: "Explora mis programas de formación, cursos y talleres diseñados para tu desarrollo profesional y personal."
};

export default async function FormacionPage() {
    const headersList = await headers();
    const tenantId = await getTenantId();

    // 1. Verificar si el Tenant tiene la característica de LMS / Academia dictada por SSOT
    const features = getTenantFeatures(headersList);
    const lmsFeature: TenantFeature = "LMS";

    if (!features.has(lmsFeature)) {
        return notFound(); // 404 para tenants sin academia activa
    }

    let themes: any[] = [];
    try {
        const _apiUrl = (process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://api:3001/api').replace(/\/+$/, "");
        const API_URL = _apiUrl.endsWith('/api') ? _apiUrl : `${_apiUrl}/api`;
        const finalEndpoint = `${API_URL}/lms/themes?include=courses`;

        const response = await fetch(finalEndpoint, {
            cache: 'no-store', // O 'force-cache' si quieres ISR
            headers: {
                'Content-Type': 'application/json',
                'x-tenant-id': tenantId,
                'x-internal-token': process.env.INTERNAL_API_KEY || 'default_dev_secret_key',
            }
        });

        if (!response.ok) {
            throw new Error(`Error API: ${response.status} ${response.statusText}`);
        }

        const rawThemes = await response.json();

        // Mapeamos los temas al formato amigable para la vista
        themes = rawThemes.map((theme: any) => {
            const firstCourse = theme.courses?.[0];
            const teaserVideo = firstCourse?.lessons?.[0]?.videoUrl || null;
            
            return {
                id: theme.id,
                title: theme.title,
                description: theme.description,
                imageUrl: theme.coverImage,
                teaserVideo, 
                price: firstCourse?.isFree ? 0 : null, 
                firstCourseId: firstCourse?.id,
                courses: theme.courses || [] 
            };
        });
    } catch (error: any) {
        console.error("Error fetching themes for public catalog:", error);
        // Error más amigable con el diseño oscuro
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 pt-32">
                 <div className="text-center p-8 border border-red-500/20 rounded-3xl bg-red-500/5 max-w-md">
                    <p className="text-red-500 font-bold mb-2">Error de Conexión</p>
                    <p className="text-zinc-400">No pudimos cargar el catálogo en este momento. Por favor, intenta de nuevo más tarde.</p>
                 </div>
            </div>
        );
    }

    return <TrainingCatalog themes={themes} />;
}

