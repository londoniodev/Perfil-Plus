import { headers } from "next/headers";
import { Fill } from "@alvarosky/ui";
import MauroFormacion from "@/components/storefronts/mauromera/formacion/FormacionContent";
import { prisma } from "@alvarosky/database";
import { getTenantId } from "@/lib/config-server";

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
    } catch (error) {
        console.error("Error fetching themes for public catalog:", error);
    }

    switch (tenantSlug) {
        case "mauromera":
            return <MauroFormacion themes={themes} />;
        default:
            return (
                <Fill>
                    <h1 className="text-2xl font-bold mb-4">Formación</h1>
                    <p className="text-muted-foreground">Próximamente programas de formación.</p>
                </Fill>
            );
    }
}
