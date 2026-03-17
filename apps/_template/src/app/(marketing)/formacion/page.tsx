import { headers } from "next/headers";
import { getTenantId } from "@/lib/config-server";
import { prisma } from "@alvarosky/database";
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
        // Obtenemos los temas reales para el tenant actual con el trailer del primer curso
        const rawThemes = await prisma.theme.findMany({
            where: { tenantId, published: true },
            orderBy: { order: 'asc' },
            include: {
                courses: {
                    where: { published: true },
                    orderBy: { order: 'asc' },
                    take: 1,
                    include: {
                        lessons: {
                            where: { published: true },
                            orderBy: { order: 'asc' },
                            take: 1,
                            select: { videoUrl: true }
                        }
                    }
                }
            }
        });

        // Obtenemos los productos para mapear precios (buscando en specs.courseId)
        const products = await prisma.product.findMany({
            where: { tenantId, published: true, productType: "DIGITAL" },
            select: { basePrice: true, specs: true }
        });

        // Mapeamos los temas con el trailer y el precio del primer curso
        themes = rawThemes.map(theme => {
            const firstCourse = theme.courses?.[0];
            const teaserVideo = firstCourse?.lessons?.[0]?.videoUrl || null;
            
            // Buscar precio en productos vinculados al primer curso
            const product = products.find(p => {
                const specs = typeof p.specs === 'string' ? JSON.parse(p.specs) : p.specs;
                return specs?.courseId === firstCourse?.id;
            });

            return {
                id: theme.id,
                title: theme.title,
                description: theme.description,
                imageUrl: theme.coverImage,
                price: product ? Number(product.basePrice) : (firstCourse?.isFree ? 0 : null),
                teaserVideo,
                firstCourseId: firstCourse?.id
            };
        });
    } catch (error: any) {
        console.error("Error fetching themes for public catalog:", error);
        return <div className="pt-40 text-center text-red-500 font-bold">Error del Servidor: {error.message}</div>
    }

    const FormacionComponent = resolveFormacion(tenantSlug);

    return <FormacionComponent themes={themes} />;
}
