import Link from "next/link";
import { Theme, Course } from "@/types/lms";
import { AdaptiveImage } from "@alvarosky/ui";

interface Props {
    themes: Theme[];
}

export function CursosNuevos({ themes }: Props) {
    // Flatten courses, sort by createdAt desc (most recent), take 6
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

    // Take last 6 (newest) — if no createdAt, reverse by order
    const courses = allCourses.reverse().slice(0, 6);

    if (courses.length === 0) return null;

    return (
        <section className="mb-8">
            <h3 className="px-6 font-bold text-xl text-foreground mb-4">
                Nuevos lanzamientos
            </h3>
            <div className="flex overflow-x-auto gap-4 px-6 pb-6 no-scrollbar">
                {courses.map((course) => (
                    <Link
                        key={course.id}
                        href={`/formacion/${course.themeSlug ?? ""}/${course.slug}`}
                        className="flex-shrink-0 w-64 bg-card rounded-xl p-3 shadow-sm border border-border flex gap-3 items-center group cursor-pointer hover:border-primary/40 hover:shadow-md transition duration-300"
                    >
                        {/* Mini thumbnail */}
                        <div className="w-20 h-20 rounded-lg flex-shrink-0 overflow-hidden bg-muted">
                            {course.coverImage ? (
                                <AdaptiveImage
                                    src={course.coverImage}
                                    alt={course.title}
                                    aspectRatio="square"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center">
                                    <svg
                                        className="w-6 h-6 text-primary/25"
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
                        </div>

                        {/* Info */}
                        <div className="flex flex-col justify-center min-w-0">
                            {course.themeName && (
                                <span className="text-[10px] font-bold uppercase text-primary mb-1 truncate">
                                    {course.themeName.split(" ")[0]}
                                </span>
                            )}
                            <h5 className="font-semibold text-sm text-foreground leading-tight mb-1 group-hover:text-primary transition-colors line-clamp-2">
                                {course.title}
                            </h5>
                            <span className="text-xs text-muted-foreground">
                                {course._count?.lessons ?? 0} lección
                                {(course._count?.lessons ?? 0) !== 1
                                    ? "es"
                                    : ""}
                            </span>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
