import { IconQuote } from "@/app/components/ui/Icons";
import styles from "@/app/styles/sections.module.css";

const testimonials = [
    {
        quote: "El proceso me ayudó a entender patrones que llevaba años repitiendo. Ahora tomo decisiones con más claridad.",
        author: "Confidencial",
        role: "Psicoterapia",
    },
    {
        quote: "Mauro logró que nuestro equipo de liderazgo conversara de lo importante, no solo de lo urgente.",
        author: "Gerente de Talento",
        role: "Sector Tech",
    },
    {
        quote: "Explora le dio a mi hijo herramientas para decidir su carrera con información real, no con ansiedad.",
        author: "Padre de familia",
        role: "Orientación Vocacional",
    },
];

export function TestimoniosSection() {
    return (
        <section className={`${styles.section} ${styles.sectionAlt}`}>
            <div className="container">
                <div className={styles.sectionTitle}>
                    <h2 className="section-title">Voces de la experiencia</h2>
                </div>

                <div className={styles.gridResponsive}>
                    {testimonials.map((test, i) => (
                        <div key={i} className={`card ${styles.testimonialCard}`}>
                            <div className={styles.quoteIcon}>
                                <IconQuote />
                            </div>
                            <p className={styles.quoteText}>
                                "{test.quote}"
                            </p>
                            <div>
                                <p style={{ fontWeight: 700, marginBottom: "0.25rem", fontSize: "1rem" }}>{test.author}</p>
                                <span className={`badge ${styles.authorRole}`}>{test.role}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
