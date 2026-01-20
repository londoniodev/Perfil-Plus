import Link from "next/link";
import { notFound } from "next/navigation";
import { getCourseBySlug, getThemeBySlug } from "@/lib/api";
import { Metadata } from "next";
import { IconCheck, IconPlay, IconClock } from "@alvarosky/ui";
import { CourseSchema, BreadcrumbSchema } from "@/components/seo/JsonLd";
import { Progress } from "@alvarosky/ui";
import { Card, CardContent } from "@alvarosky/ui";
import { Badge } from "@alvarosky/ui";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

interface CoursePageProps {
    params: Promise<{ slug: string; courseSlug: string }>;
}

export async function generateMetadata({ params }: CoursePageProps): Promise<Metadata> {
    const { slug, courseSlug } = await params;
    try {
        const course = await getCourseBySlug(courseSlug);
        return {
            title: `${course.title} | Cursos`,
            description: course.description || `Curso de ${course.title} impartido por Mauro Mera. Aprende sobre ${course.title} con contenido práctico y aplicable.`,
            openGraph: {
                title: course.title,
                description: course.description || `Curso de ${course.title}`,
                type: "website",
                url: `${SITE_URL}/cursos/${slug}/${courseSlug}`,
            },
            twitter: {
                card: "summary_large_image",
                title: course.title,
                description: course.description,
            },
            alternates: {
                canonical: `/cursos/${slug}/${courseSlug}`,
            },
        };
    } catch {
        return { title: "Curso no encontrado | Cursos - Mauro Mera" };
    }
}

export default async function CoursePage({ params }: CoursePageProps) {
    const { slug, courseSlug } = await params;

    let course;
    try {
        course = await getCourseBySlug(courseSlug);
    } catch {
        notFound();
    }

    const progressPercent = course.progress
        ? Math.round((course.progress.completed / course.progress.total) * 100)
        : 0;

    return (
        <>
            {/* Structured Data para SEO */}
            <CourseSchema
                name={course.title}
                description={course.description || `Curso de ${course.title}`}
                url={`${SITE_URL}/cursos/${slug}/${courseSlug}`}
                educationalLevel="Intermedio"
                hasCourseInstance={{ courseMode: 'online' }}
            />
            <BreadcrumbSchema items={[
                { name: "Inicio", url: SITE_URL },
                { name: "Cursos", url: `${SITE_URL}/cursos` },
                { name: course.theme?.title || "Tema", url: `${SITE_URL}/cursos/${slug}` },
                { name: course.title, url: `${SITE_URL}/cursos/${slug}/${courseSlug}` },
            ]} />

            <div className="min-h-screen pb-12">
                <header className="py-20 md:py-24 bg-gradient-to-b from-primary/5 to-background border-b border-border/50">
                    <div className="container max-w-4xl">
                        <div className="flex flex-wrap items-center gap-2 mb-6 text-sm text-muted-foreground">
                            <Link href="/cursos" className="hover:text-primary transition-colors">Cursos</Link>
                            <span className="opacity-50">/</span>
                            <Link href={`/cursos/${slug}`} className="hover:text-primary transition-colors">{course.theme?.title}</Link>
                            <span className="opacity-50">/</span>
                            <span className="text-foreground">{course.title}</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4 tracking-tight leading-tight">{course.title}</h1>
                        <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">{course.description}</p>

                        {course.progress && (
                            <div className="mt-8 p-6 bg-card/50 border border-border/60 rounded-xl backdrop-blur-sm max-w-lg">
                                <div className="flex justify-between text-sm mb-2 font-medium">
                                    <span>Tu progreso</span>
                                    <span>{progressPercent}%</span>
                                </div>
                                <Progress value={progressPercent} className="h-2 mb-2" />
                                <p className="text-xs text-muted-foreground">
                                    {course.progress.completed} de {course.progress.total} lecciones completadas
                                </p>
                            </div>
                        )}
                    </div>
                </header>

                <section className="py-16">
                    <div className="container max-w-4xl">
                        <h2 className="text-2xl font-serif font-bold mb-8 flex items-center gap-2">
                            <IconPlay className="text-primary" size={24} />
                            Lecciones del Curso
                        </h2>

                        {!course.lessons || course.lessons.length === 0 ? (
                            <div className="text-center py-12 bg-muted/20 rounded-xl border border-dashed border-border">
                                <p>Aún no hay lecciones disponibles para este curso.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {course.lessons.map((lesson, index) => (
                                    <Link
                                        key={lesson.id}
                                        href={`/cursos/${slug}/${courseSlug}/${lesson.slug}`}
                                        className="block group"
                                    >
                                        <div className={`
                                            flex items-center gap-4 p-4 rounded-xl border transition-all duration-200
                                            ${lesson.completed
                                                ? 'bg-green-500/5 border-green-500/20 hover:bg-green-500/10'
                                                : 'bg-card border-border hover:border-primary/50 hover:shadow-md'
                                            }
                                        `}>
                                            <div className={`
                                                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shrink-0 transition-colors
                                                ${lesson.completed
                                                    ? 'bg-green-500 text-white'
                                                    : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
                                                }
                                            `}>
                                                {lesson.completed ? <IconCheck size={16} /> : index + 1}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h4 className={`text-base font-semibold mb-0.5 truncate pr-2 ${lesson.completed ? 'text-foreground/80' : 'text-foreground'}`}>
                                                    {lesson.title}
                                                </h4>
                                                {lesson.duration && (
                                                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                                        <IconClock size={12} />
                                                        {Math.floor(lesson.duration / 60)} min
                                                    </span>
                                                )}
                                            </div>

                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Badge variant="secondary" className="bg-primary text-primary-foreground hover:bg-primary/90">
                                                    Ver →
                                                </Badge>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </>
    );
}
