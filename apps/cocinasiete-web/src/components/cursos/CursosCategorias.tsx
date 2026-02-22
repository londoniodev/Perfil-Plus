import Link from "next/link";
import { prisma } from "@alvarosky/database";

export async function CursosCategorias() {
    const themes = await prisma.theme.findMany({
        where: { published: true },
        orderBy: { order: "asc" },
        include: { _count: { select: { courses: true } } },
    });

    if (themes.length === 0) return null;

    // Icon mapping by common theme slugs
    const iconMap: Record<string, string> = {
        higiene: "🧼",
        cocina: "🍳",
        admin: "📊",
        barismo: "🍸",
        ventas: "📈",
        servicio: "🤝",
        panaderia: "🍞",
        pasteleria: "🎂",
        nutricion: "🥗",
    };

    return (
        <section className="container mx-auto px-4 mb-12">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Categorías</h2>
            </div>
            <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar">
                {themes.map((theme) => (
                    <Link
                        key={theme.id}
                        href={`/cursos?tema=${theme.slug}`}
                        className="flex-shrink-0 flex flex-col items-center gap-3 group cursor-pointer transition-transform hover:scale-105"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center text-2xl group-hover:bg-primary/15 group-hover:border-primary/40 transition-colors duration-300">
                            {iconMap[theme.slug] || "📚"}
                        </div>
                        <div className="text-center">
                            <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors block">
                                {theme.title}
                            </span>
                            <span className="text-[10px] text-muted-foreground/60">
                                {theme._count.courses} curso{theme._count.courses !== 1 ? "s" : ""}
                            </span>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
