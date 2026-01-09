import Link from "next/link";
import { Metadata } from "next";
import styles from "./ebooks.module.css";
import { API_BASE } from "@/lib/config";

export const metadata: Metadata = {
    title: "E-books | Mauro Mera",
    description: "Descubre nuestra colección de e-books sobre psicología, liderazgo y desarrollo personal.",
};

interface Ebook {
    id: string;
    title: string;
    slug: string;
    description: string;
    coverImage: string;
    price: number;
}

async function getEbooks(): Promise<Ebook[]> {
    try {
        const res = await fetch(`${API_BASE}/ebooks`, {
            next: { revalidate: 60 },
        });
        if (!res.ok) return [];
        return res.json();
    } catch {
        return [];
    }
}

export default async function EbooksPage() {
    const ebooks = await getEbooks();

    const benefits = [
        {
            icon: "📱",
            title: "Acceso Inmediato",
            description: "Descarga instantánea después de tu compra. Lee desde cualquier dispositivo."
        },
        {
            icon: "🎯",
            title: "Contenido Práctico",
            description: "Herramientas y ejercicios aplicables desde el primer día."
        },
        {
            icon: "🔒",
            title: "Tuyo Para Siempre",
            description: "Una vez comprado, acceso permanente sin suscripciones."
        },
        {
            icon: "💡",
            title: "Conocimiento Experto",
            description: "Basado en años de experiencia en psicología organizacional."
        }
    ];

    return (
        <div className={styles.ebooksPage}>
            {/* Hero Section - Premium */}
            <section style={{
                paddingTop: "120px",
                paddingBottom: "4rem",
                textAlign: "center",
                position: "relative",
                overflow: "hidden"
            }}>
                {/* Background gradient */}
                <div style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "radial-gradient(ellipse at center top, rgba(91, 141, 239, 0.15) 0%, transparent 60%)",
                    pointerEvents: "none"
                }} />

                <div className="container" style={{ position: "relative", zIndex: 1 }}>
                    <span className="badge" style={{ marginBottom: "1.5rem" }}>
                        Biblioteca Digital
                    </span>
                    <h1 className="section-title" style={{
                        maxWidth: "700px",
                        margin: "0 auto 1.5rem",
                        fontSize: "clamp(2rem, 5vw, 3.5rem)"
                    }}>
                        E-books que transforman tu mentalidad
                    </h1>
                    <p className="section-subtitle" style={{
                        maxWidth: "600px",
                        margin: "0 auto 2rem"
                    }}>
                        Recursos prácticos escritos por Mauro Mera. Herramientas de psicología aplicada,
                        liderazgo y desarrollo personal que puedes implementar hoy mismo.
                    </p>
                    <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
                        <a href="#catalogo" className="btn btn-primary">
                            Ver Catálogo
                        </a>
                        <Link href="/formacion" className="btn btn-secondary">
                            Explorar Cursos
                        </Link>
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section style={{
                padding: "4rem 0",
                background: "var(--background-secondary)",
                borderTop: "1px solid var(--border)",
                borderBottom: "1px solid var(--border)"
            }}>
                <div className="container">
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                        gap: "2rem"
                    }}>
                        {benefits.map((benefit, index) => (
                            <div key={index} style={{
                                textAlign: "center",
                                padding: "1.5rem"
                            }}>
                                <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>
                                    {benefit.icon}
                                </div>
                                <h3 style={{
                                    fontSize: "1.1rem",
                                    fontWeight: 600,
                                    marginBottom: "0.5rem",
                                    color: "var(--foreground)"
                                }}>
                                    {benefit.title}
                                </h3>
                                <p style={{
                                    color: "var(--foreground-muted)",
                                    fontSize: "0.9rem",
                                    lineHeight: "1.6"
                                }}>
                                    {benefit.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Value Proposition */}
            <section style={{ padding: "5rem 0" }}>
                <div className="container">
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                        gap: "4rem",
                        alignItems: "center"
                    }}>
                        <div>
                            <h2 style={{
                                fontSize: "2rem",
                                fontWeight: 700,
                                marginBottom: "1.5rem",
                                color: "var(--foreground)",
                                lineHeight: "1.3"
                            }}>
                                Conocimiento que puedes aplicar desde hoy
                            </h2>
                            <p style={{
                                color: "var(--foreground-muted)",
                                marginBottom: "1.5rem",
                                lineHeight: "1.8"
                            }}>
                                Cada e-book está diseñado para darte herramientas prácticas y aplicables.
                                No es teoría vacía—es conocimiento basado en años de experiencia trabajando
                                con líderes, equipos y organizaciones.
                            </p>
                            <p style={{
                                color: "var(--foreground-muted)",
                                marginBottom: "2rem",
                                lineHeight: "1.8"
                            }}>
                                Ya seas un profesional buscando mejorar tu liderazgo, un emprendedor
                                construyendo su equipo, o alguien en un viaje de desarrollo personal,
                                encontrarás recursos valiosos aquí.
                            </p>
                            <div style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "0.75rem"
                            }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                    <span style={{ color: "var(--success)" }}>✓</span>
                                    <span style={{ color: "var(--foreground)" }}>Ejercicios prácticos en cada capítulo</span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                    <span style={{ color: "var(--success)" }}>✓</span>
                                    <span style={{ color: "var(--foreground)" }}>Casos de estudio reales</span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                    <span style={{ color: "var(--success)" }}>✓</span>
                                    <span style={{ color: "var(--foreground)" }}>Plantillas y recursos descargables</span>
                                </div>
                            </div>
                        </div>
                        <div style={{
                            background: "var(--card-bg)",
                            borderRadius: "1.5rem",
                            padding: "2.5rem",
                            border: "1px solid var(--border)",
                            textAlign: "center"
                        }}>
                            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>📚</div>
                            <h3 style={{
                                fontSize: "1.5rem",
                                fontWeight: 600,
                                marginBottom: "1rem",
                                color: "var(--foreground)"
                            }}>
                                Biblioteca en crecimiento
                            </h3>
                            <p style={{
                                color: "var(--foreground-muted)",
                                marginBottom: "1.5rem"
                            }}>
                                Nuevos títulos agregados regularmente.
                                Cada e-book es el resultado de meses de investigación y experiencia práctica.
                            </p>
                            <span style={{
                                background: "rgba(232, 168, 56, 0.1)",
                                color: "var(--accent)",
                                padding: "0.5rem 1rem",
                                borderRadius: "999px",
                                fontSize: "0.85rem",
                                fontWeight: 600
                            }}>
                                Próximamente: Nuevos títulos 2025
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Catalog Section */}
            <section id="catalogo" className={styles.ebooksContent} style={{
                background: "var(--background-secondary)",
                borderTop: "1px solid var(--border)"
            }}>
                <div className="container" style={{ paddingTop: "4rem", paddingBottom: "4rem" }}>
                    <div style={{ textAlign: "center", marginBottom: "3rem" }}>
                        <h2 style={{
                            fontSize: "2rem",
                            fontWeight: 700,
                            marginBottom: "1rem",
                            color: "var(--foreground)"
                        }}>
                            Catálogo de E-books
                        </h2>
                        <p style={{
                            color: "var(--foreground-muted)",
                            maxWidth: "500px",
                            margin: "0 auto"
                        }}>
                            Explora nuestra colección y encuentra el recurso perfecto para tu próximo paso.
                        </p>
                    </div>

                    {ebooks.length === 0 ? (
                        <div className={styles.emptyState} style={{
                            textAlign: "center",
                            padding: "4rem 2rem",
                            background: "var(--card-bg)",
                            borderRadius: "1rem",
                            border: "1px solid var(--border)"
                        }}>
                            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📖</div>
                            <h3 style={{
                                fontSize: "1.25rem",
                                marginBottom: "0.5rem",
                                color: "var(--foreground)"
                            }}>
                                Próximamente
                            </h3>
                            <p style={{ color: "var(--foreground-muted)" }}>
                                Estamos preparando nuevos e-books. ¡Vuelve pronto!
                            </p>
                        </div>
                    ) : (
                        <div className={styles.ebooksGrid}>
                            {ebooks.map((ebook) => (
                                <Link href={`/ebooks/${ebook.slug}`} key={ebook.id} className={styles.ebookCard}>
                                    <div className={styles.cardImage}>
                                        <img src={ebook.coverImage} alt={ebook.title} />
                                    </div>
                                    <div className={styles.cardContent}>
                                        <h2>{ebook.title}</h2>
                                        <p>{ebook.description}</p>
                                        <span className={styles.price}>
                                            ${Number(ebook.price).toLocaleString("es-CO")}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* CTA Section */}
            <section style={{ padding: "5rem 0", textAlign: "center" }}>
                <div className="container">
                    <h2 style={{
                        fontSize: "2rem",
                        fontWeight: 700,
                        marginBottom: "1rem",
                        color: "var(--foreground)"
                    }}>
                        ¿Ya tienes e-books comprados?
                    </h2>
                    <p style={{
                        color: "var(--foreground-muted)",
                        marginBottom: "2rem",
                        maxWidth: "500px",
                        margin: "0 auto 2rem"
                    }}>
                        Accede a tu biblioteca personal para leer y descargar todos tus e-books.
                    </p>
                    <Link href="/login?redirect=/ebooks/mis-compras" className="btn btn-accent">
                        Ir a Mis E-books
                    </Link>
                </div>
            </section>
        </div>
    );
}
