import Link from "next/link";
import { getThemes } from "@/lib/api";
import { Theme } from "@/lib/lms-types";
import { Metadata } from "next";
import styles from "@/app/styles/cursos.module.css";

export const metadata: Metadata = {
    title: "Cursos | Mauro Mera",
    description: "Programa de formación en psicología, liderazgo y desarrollo personal.",
};

export default async function CursosPage() {
    let themes: Theme[] = [];
    let error = false;

    try {
        themes = await getThemes();
    } catch (e) {
        error = true;
        console.error("Error fetching themes:", e);
    }

    return (
        <div className={styles.lmsPage}>
            <section className={styles.lmsHero}>
                <div className="container">
                    <h1>Programa de Formación</h1>
                    <p className="hero-description">
                        Explora nuestros temas de formación en psicología, liderazgo
                        y desarrollo personal para transformar tu vida y carrera.
                    </p>
                </div>
            </section>

            <section className={styles.lmsContent}>
                <div className="container">
                    {error ? (
                        <div className={styles.emptyState}>
                            <p>No se pudieron cargar los cursos. Inténtalo más tarde.</p>
                        </div>
                    ) : themes.length === 0 ? (
                        <div className={styles.emptyState}>
                            <p>Próximamente nuevos cursos disponibles.</p>
                        </div>
                    ) : (
                        <div className={styles.themesGrid}>
                            {themes.map((theme) => (
                                <ThemeCard key={theme.id} theme={theme} />
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}

function ThemeCard({ theme }: { theme: Theme }) {
    return (
        <Link href={`/cursos/${theme.slug}`} className={styles.themeCard}>
            <div className={styles.cardImage}>
                {theme.coverImage ? (
                    <img src={theme.coverImage} alt={theme.title} />
                ) : (
                    <span className={styles.placeholderIcon}>📚</span>
                )}
            </div>
            <div className={styles.cardContent}>
                <h2>{theme.title}</h2>
                <p>{theme.description}</p>
                <div className={styles.cardMeta}>
                    <span>{theme._count?.courses || 0} cursos</span>
                    {theme.evaluation && <span>• Evaluación incluida</span>}
                </div>
            </div>
        </Link>
    );
}
