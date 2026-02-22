import Link from "next/link";
import { prisma } from "@alvarosky/database";
import { AdaptiveImage } from "@alvarosky/ui";

export async function CursosNuevos() {
    const courses = await prisma.course.findMany({
        where: { published: true },
        include: {
            theme: true,
            _count: { select: { lessons: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 6,
    });

    if (courses.length === 0) return null;

    return (
        <section className="container mx-auto px-4 mb-16">
            <h2 className="text-2xl font-bold mb-8">Nuevos lanzamientos</h2>

            <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar">
                {courses.map((course) => (
                    <Link
                        key={course.id}
                        href={`/formacion/${course.theme?.slug}/${course.slug}`}
                        className="flex-shrink-0 w-72 rounded-xl border border-border bg-card p-3 flex gap-4 items-center group cursor-pointer hover:border-primary/40 hover:shadow-md transition-all duration-300"
                    >
                        {/* Mini thumbnail */}
                        <div className="w-20 h-20 rounded-lg flex-shrink-0 overflow-hidden">
                            {course.coverImage ? (
                                <AdaptiveImage
                                    src={course.coverImage}
                                    alt={course.title}
                                    aspectRatio="square"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-primary/25" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
                                    </svg>
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex flex-col justify-center min-w-0">
                            {course.theme && (
                                <span className="text-[10px] font-bold uppercase text-primary mb-1 truncate">
                                    {course.theme.title}
                                </span>
                            )}
                            <h3 className="font-semibold text-sm leading-tight mb-1 group-hover:text-primary transition-colors line-clamp-2">
                                {course.title}
                            </h3>
                            <span className="text-xs text-muted-foreground">
                                {course._count.lessons} lección{course._count.lessons !== 1 ? "es" : ""}
                            </span>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
