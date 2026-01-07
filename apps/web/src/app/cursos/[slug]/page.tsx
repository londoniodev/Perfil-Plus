import Link from "next/link";
import { notFound } from "next/navigation";
import { getThemeBySlug } from "@/lib/api";
import { Metadata } from "next";
import styles from "../cursos.module.css";

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
        <div className={styles.lmsPage}>
            <header className={styles.themeHeader}>
                <div className="container">
                    <div className={styles.themeMeta}>
                        <Link href="/cursos" style={{ color: "var(--primary)", textDecoration: "none" }}>
                            ← Todos los temas
                        </Link>
                    </div>
                    <h1>{theme.title}</h1>
                    <p className={styles.themeDescription}>{theme.description}</p>
                </div>
            </header>

            <section className={styles.coursesSection}>
                <div className="container">
                    <h2 className={styles.sectionTitle}>Cursos del Tema</h2>

                    {!theme.courses || theme.courses.length === 0 ? (
                        <div className={styles.emptyState}>
                            <p>Aún no hay cursos disponibles para este tema.</p>
                        </div>
                    ) : (
                        <div className={styles.coursesList}>
                            {theme.courses.map((course, index) => (
                                <Link
                                    key={course.id}
                                    href={`/cursos/${theme.slug}/${course.slug}`}
                                    className={styles.courseItem}
                                >
                                    <span className={styles.courseNumber}>{String(index + 1).padStart(2, "0")}</span>
                                    <div className={styles.courseInfo}>
                                        <h3>{course.title}</h3>
                                        <p>{course._count?.lessons || 0} lecciones</p>
                                    </div>
                                    <span className={`${styles.courseBadge} ${course.isFree ? styles.freeBadge : styles.premiumBadge}`}>
                                        {course.isFree ? "Gratis" : "Premium"}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    )}

                    {theme.evaluation && (
                        <div style={{ marginTop: "3rem" }}>
                            <h2 className={styles.sectionTitle}>Evaluación Final</h2>
                            <Link
                                href={`/cursos/${theme.slug}/evaluacion`}
                                className={styles.courseItem}
                                style={{ borderColor: "var(--primary)" }}
                            >
                                <span className={styles.courseNumber}>📝</span>
                                <div className={styles.courseInfo}>
                                    <h3>{theme.evaluation.title}</h3>
                                    <p>Pon a prueba tus conocimientos del tema</p>
                                </div>
                            </Link>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
