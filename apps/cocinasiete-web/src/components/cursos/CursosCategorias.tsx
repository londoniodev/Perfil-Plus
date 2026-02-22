import Link from "next/link";
import { Theme } from "@/types/lms";

interface Props {
    themes: Theme[];
}

// Material-style icon mapping for each theme slug keyword
const iconMap: Record<string, { icon: string; color: "primary" | "secondary" }> = {
    "negocios": { icon: "📊", color: "primary" },
    "salubridad": { icon: "🧼", color: "secondary" },
    "higiene": { icon: "🧼", color: "secondary" },
    "culinaria": { icon: "🍳", color: "primary" },
    "tecnicas": { icon: "🔪", color: "primary" },
    "cocina": { icon: "🍳", color: "primary" },
    "barismo": { icon: "🍸", color: "secondary" },
    "ventas": { icon: "📈", color: "primary" },
    "servicio": { icon: "🤝", color: "secondary" },
    "panaderia": { icon: "🍞", color: "primary" },
    "pasteleria": { icon: "🎂", color: "secondary" },
    "nutricion": { icon: "🥗", color: "primary" },
};

function getIconForTheme(slug: string) {
    for (const [key, val] of Object.entries(iconMap)) {
        if (slug.includes(key)) return val;
    }
    return { icon: "📚", color: "primary" as const };
}

export function CursosCategorias({ themes }: Props) {
    if (themes.length === 0) return null;

    return (
        <section className="mb-8">
            <div className="flex items-center justify-between px-6 mb-4">
                <h3 className="font-bold text-lg text-foreground">
                    Categorías
                </h3>
                <Link
                    href="/formacion"
                    className="text-xs font-bold text-primary hover:underline"
                >
                    Ver todas
                </Link>
            </div>
            <div className="flex overflow-x-auto gap-3 px-6 pb-4 no-scrollbar">
                {themes.map((theme) => {
                    const { icon, color } = getIconForTheme(theme.slug);
                    const bgClass =
                        color === "primary"
                            ? "bg-primary/10 group-hover:bg-primary"
                            : "bg-amber-500/10 group-hover:bg-amber-500";

                    return (
                        <Link
                            key={theme.id}
                            href={`/formacion/${theme.slug}`}
                            className="flex-shrink-0 flex flex-col items-center gap-2 group cursor-pointer"
                        >
                            <div
                                className={`w-16 h-16 rounded-2xl ${bgClass} flex items-center justify-center text-2xl group-hover:text-white transition-colors duration-200`}
                            >
                                {icon}
                            </div>
                            <div className="text-center">
                                <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors block max-w-[72px] truncate">
                                    {theme.title.split(" ")[0]}
                                </span>
                                <span className="text-[10px] text-muted-foreground/60">
                                    {theme._count?.courses ?? 0} curso
                                    {(theme._count?.courses ?? 0) !== 1
                                        ? "s"
                                        : ""}
                                </span>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}
