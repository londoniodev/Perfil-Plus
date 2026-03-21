import Link from "next/link";
import { Theme, Course } from "@/types/lms";
import { AdaptiveImage } from "@alvarosky/ui";

interface Props {
    themes: Theme[];
}

function formatDuration(courses: Course[]): string {
    // Sum lesson durations from the _count
    const totalLessons = courses.reduce(
        (sum, c) => sum + (c._count?.lessons ?? 0),
        0
    );
    // Approximate: ~20 min per lesson
    const totalMinutes = totalLessons * 20;
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
    if (hours > 0) return `${hours}h`;
    return `${mins}m`;
}

export function CursosPopulares({ themes }: Props) {
    // Flatten all courses from all themes, take first 4
    const allCourses: (Course & { themeName?: string; themeSlug?: string })[] =
        [];

    for (const theme of themes) {
        if (theme.courses) {
            for (const course of theme.courses) {
                allCourses.push({
                    ...course,
                    themeName: theme.title,
                    themeSlug: theme.slug,
                });
            }
        }
    }

    // Sort by order, take top 4
    const courses = allCourses
        .sort((a, b) => a.order - b.order)
        .slice(0, 4);

    if (courses.length === 0) return null;

    return (
        <section id="cursos" className="px-6 mb-8">
            <h3 className="font-bold text-xl text-foreground mb-5">
                Populares esta semana
            </h3>
            <div className="grid gap-5">
                {courses.map((course) => (
                    <Link
                        key={course.id}
                        href={`/formacion/${course.themeSlug ?? ""}/${course.slug}`}
                        className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden flex flex-col group hover:border-primary/40 hover:shadow-md transition duration-300"
                    >
                        {/* Course Image */}
                        <div className="h-40 relative overflow-hidden bg-muted">
                            {course.coverImage ? (
                                <AdaptiveImage
                                    src={course.coverImage}
                                    alt={course.title}
                                    aspectRatio="video"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                                    <svg
                                        className="w-12 h-12 text-primary/25"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={1}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5"
                                        />
                                    </svg>
                                </div>
                            )}

                            {/* Category Badge */}
                            {course.themeName && (
                                <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md bg-primary/90 text-primary-foreground text-[10px] font-bold uppercase tracking-wide">
                                    {course.themeName.split(" ")[0]}
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
                        <div className="p-4 flex flex-col flex-grow">
                            <h4 className="font-bold text-lg text-foreground leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">
                                {course.title}
                            </h4>
                            <div className="flex items-center text-muted-foreground text-xs mb-3 gap-3">
                                <div className="flex items-center gap-1.5">
                                    <svg
                                        className="w-3.5 h-3.5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M15.91 11.672a.375.375 0 0 1 0 .656l-5.603 3.113a.375.375 0 0 1-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112Z"
                                        />
                                    </svg>
                                    <span>
                                        {course._count?.lessons ?? 0} lección
                                        {(course._count?.lessons ?? 0) !== 1
                                            ? "es"
                                            : ""}
                                    </span>
                                </div>
                            </div>
                            <div className="mt-auto flex items-center justify-between">
                                <p className="text-sm text-muted-foreground line-clamp-1">
                                    {course.description?.substring(0, 60)}...
                                </p>
                                <span className="text-primary font-bold text-sm flex-shrink-0 ml-2">
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
