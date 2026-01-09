import Link from "next/link";
import { notFound } from "next/navigation";
import { getCourseBySlug, getThemeBySlug } from "@/lib/api";
import { Metadata } from "next";
import styles from "../../cursos.module.css";

interface CoursePageProps {
    params: Promise<{ slug: string; courseSlug: string }>;
}

export async function generateMetadata({ params }: CoursePageProps): Promise<Metadata> {
    const { courseSlug } = await params;
    try {
        const course = await getCourseBySlug(courseSlug);
        return {
            title: `${course.title} | Cursos - Mauro Mera`,
            description: course.description,
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
        <div className={styles.lmsPage}>
            <header className={styles.courseHeader}>
                <div className="container">
                    <div className={styles.breadcrumb}>
                        <Link href="/cursos">Cursos</Link>
                        <span>/</span>
                        <Link href={`/cursos/${slug}`}>{course.theme?.title}</Link>
                        <span>/</span>
                        <span>{course.title}</span>
                    </div>
                    <h1>{course.title}</h1>
                    <p className={styles.themeDescription}>{course.description}</p>

                    {course.progress && (
                        <>
                            <div className={styles.progressBar}>
                                <div className={styles.progressFill} style={{ width: `${progressPercent}%` }} />
                            </div>
                            <p className={styles.progressText}>
                                {course.progress.completed} de {course.progress.total} lecciones completadas ({progressPercent}%)
                            </p>
                        </>
                    )}
                </div>
            </header>

            <section className={styles.coursesSection}>
                <div className="container">
                    <h2 className={styles.sectionTitle}>Lecciones</h2>

                    {!course.lessons || course.lessons.length === 0 ? (
                        <div className={styles.emptyState}>
                            <p>Aún no hay lecciones disponibles para este curso.</p>
                        </div>
                    ) : (
                        <div className={styles.lessonsList}>
                            {course.lessons.map((lesson, index) => (
                                <Link
                                    key={lesson.id}
                                    href={`/cursos/${slug}/${courseSlug}/${lesson.slug}`}
                                    className={`${styles.lessonItem} ${lesson.completed ? styles.completed : ""}`}
                                >
                                    <span className={`${styles.lessonStatus} ${lesson.completed ? styles.complete : styles.pending}`}>
                                        {lesson.completed ? "✓" : index + 1}
                                    </span>
                                    <div className={styles.lessonInfo}>
                                        <h4>{lesson.title}</h4>
                                        {lesson.duration && (
                                            <span className={styles.lessonDuration}>
                                                {Math.floor(lesson.duration / 60)} min
                                            </span>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
