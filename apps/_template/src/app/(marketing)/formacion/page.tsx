import { headers } from "next/headers";
import { getTenantId } from "@/lib/config-server";
import { resolveFormacion } from "@/lib/storefront-resolver";

export const metadata = {
    title: "Programas de Formación",
    description: "Explora mis programas de formación, cursos y talleres diseñados para tu desarrollo profesional y personal."
};

export default async function FormacionPage() {
    const headersList = await headers();
    const tenantSlug = headersList.get("x-tenant-slug") || "";
    const tenantId = await getTenantId();

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
                price: firstCourse?.isFree ? 0 : null, // Mapeo básico si no hay consulta de productos directa
                firstCourseId: firstCourse?.id,
                courses: theme.courses || [] // Para renderizar el árbol jerárgico
            };
        });
    } catch (error: any) {
        console.error("Error fetching themes for public catalog:", error);
        return <div className="pt-40 text-center text-red-500 font-bold">Error del Servidor: {error.message}</div>
    }

    const FormacionComponent = resolveFormacion(tenantSlug);

    return <FormacionComponent themes={themes} />;
}
