import Link from "next/link";
import { prisma } from "@alvarosky/database";
import { AdaptiveImage } from "@alvarosky/ui";

export async function CursosPopulares() {
    const courses = await prisma.course.findMany({
        where: { published: true },
        include: {
            theme: true,
            _count: { select: { lessons: true } },
        },
        orderBy: { order: "asc" },
        take: 4,
    });

    if (courses.length === 0) return null;

    return (
        <section className="container mx-auto px-4 mb-16">
            <h2 className="text-2xl font-bold mb-8">Populares esta semana</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {courses.map((course) => (
                    <Link
                        key={course.id}
                        href={`/formacion/${course.theme?.slug}/${course.slug}`}
                        className="group block rounded-xl overflow-hidden border border-border bg-card hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
                    >
                        {/* Course Image */}
                        <div className="relative aspect-[16/10] overflow-hidden">
                            {course.coverImage ? (
                                <AdaptiveImage
                                    src={course.coverImage}
                                    alt={course.title}
                                    aspectRatio="video"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                                    <svg className="w-12 h-12 text-primary/25" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
                                    </svg>
                                </div>
                            )}

                            {/* Category Badge */}
                            {course.theme && (
                                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-primary/90 text-primary-foreground text-[10px] font-bold uppercase tracking-wide">
                                    {course.theme.title}
                                </div>
                            )}

                            {/* Free Badge */}
                            {course.isFree && (
                                <div className="absolute top-3 right-3 px-2 py-1 rounded-md bg-green-500/90 text-white text-[10px] font-bold">
                                    Gratis
                                </div>
                            )}
                        </div>

                        {/* Course Content */}
                        <div className="p-5">
                            <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
                                {course.title}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                                {course.description}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1.5">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 0 1 0 .656l-5.603 3.113a.375.375 0 0 1-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112Z" />
                                    </svg>
                                    <span>
                                        {course._count.lessons} lección{course._count.lessons !== 1 ? "es" : ""}
                                    </span>
                                </div>
                                <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                                <span className="text-primary font-semibold">
                                    {course.isFree ? "Gratis" : "Premium"}
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
