import Link from "next/link";
import { notFound } from "next/navigation";
import { getThemeBySlug } from "@/lib/api";
import { Metadata } from "next";
import { IconClipboard, IconBook } from "@mauromera/ui";
import { Badge } from "@mauromera/ui";
import { Card, CardContent } from "@mauromera/ui";

interface ThemePageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ThemePageProps): Promise<Metadata> {
    const { slug } = await params;
    try {
        const theme = await getThemeBySlug(slug);
        return {
            title: `${theme.title} | Cursos - Mauro Mera`,
            description: theme.description,
        };
    } catch {
        return { title: "Tema no encontrado | Cursos - Mauro Mera" };
    }
}

export default async function ThemePage({ params }: ThemePageProps) {
    const { slug } = await params;

    let theme;
    try {
        theme = await getThemeBySlug(slug);
    } catch {
        notFound();
    }

    return (
        <div className="min-h-screen pb-12">
            <header className="py-24 pt-32 text-center bg-gradient-to-b from-primary/5 to-background border-b border-border/50">
                <div className="container">
                    <div className="flex justify-center mb-8">
                        <Link
                            href="/cursos"
                            className="text-primary hover:text-primary/80 transition-colors flex items-center gap-2 text-sm font-medium bg-primary/5 px-4 py-2 rounded-full"
                        >
                            ← Todos los temas
                        </Link>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6 tracking-tight">{theme.title}</h1>
                    <p className="max-w-2xl mx-auto text-muted-foreground text-lg leading-relaxed">{theme.description}</p>
                </div>
            </header>

            <section className="py-16">
                <div className="container max-w-4xl">
                    <h2 className="text-2xl font-serif font-bold mb-8 flex items-center gap-3">
                        <IconBook className="text-primary" />
                        Cursos del Tema
                    </h2>

                    {!theme.courses || theme.courses.length === 0 ? (
                        <div className="text-center py-16 bg-muted/20 rounded-2xl border border-dashed border-border/60">
                            <p className="text-muted-foreground">Aún no hay cursos disponibles para este tema.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {theme.courses.map((course, index) => (
                                <Link
                                    key={course.id}
                                    href={`/cursos/${theme.slug}/${course.slug}`}
                                    className="block group h-full"
                                >
                                    <Card className="h-full hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/50 group-hover:-translate-y-0.5 flex flex-col">
                                        <CardContent className="flex flex-col p-6 h-full">
                                            <div className="flex items-start justify-between mb-4">
                                                <span className="text-4xl font-serif font-bold text-muted-foreground/10 group-hover:text-primary/20 transition-colors">
                                                    {String(index + 1).padStart(2, "0")}
                                                </span>
                                                <Badge
                                                    variant={course.isFree ? "secondary" : "default"}
                                                    className={course.isFree ? "bg-green-500/10 text-green-600 hover:bg-green-500/20" : "bg-custom-gold text-white"}
                                                >
                                                    {course.isFree ? "Gratis" : "Premium"}
                                                </Badge>
                                            </div>

                                            <div className="mb-4 flex-1">
                                                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">{course.title}</h3>
                                                <p className="text-sm text-muted-foreground flex items-center gap-2">
                                                    <IconBook size={14} />
                                                    {course._count?.lessons || 0} lecciones
                                                </p>
                                            </div>

                                            {course.progress && course.progress.total > 0 && (
                                                <div className="mt-auto pt-4 border-t border-border/50">
                                                    <div className="flex justify-between text-xs mb-1.5 font-medium text-muted-foreground">
                                                        <span>Progreso</span>
                                                        <span>{Math.round((course.progress.completed / course.progress.total) * 100)}%</span>
                                                    </div>
                                                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-primary transition-all duration-500"
                                                            style={{ width: `${(course.progress.completed / course.progress.total) * 100}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    )}

                    {theme.evaluation && (
                        <div className="mt-16">
                            <h2 className="text-2xl font-serif font-bold mb-8 flex items-center gap-3">
                                <IconClipboard className="text-primary" />
                                Evaluación Final
                            </h2>
                            <Link
                                href={`/cursos/${theme.slug}/evaluacion`}
                                className="block group"
                            >
                                <Card className="border-primary/40 bg-primary/5 hover:bg-primary/10 transition-colors">
                                    <CardContent className="flex items-center gap-6 p-6">
                                        <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                            <IconClipboard size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold mb-1 text-primary">{theme.evaluation.title}</h3>
                                            <p className="text-sm text-muted-foreground">Pon a prueba tus conocimientos del tema</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
