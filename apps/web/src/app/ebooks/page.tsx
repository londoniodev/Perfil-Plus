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

// Professional SVG Icons
function DownloadIcon() {
    return (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
    );
}

function TargetIcon() {
    return (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <circle cx="12" cy="12" r="6"></circle>
            <circle cx="12" cy="12" r="2"></circle>
        </svg>
    );
}

function ShieldIcon() {
    return (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            <polyline points="9 12 11 14 15 10"></polyline>
        </svg>
    );
}

function LightbulbIcon() {
    return (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18h6"></path>
            <path d="M10 22h4"></path>
            <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"></path>
        </svg>
    );
}

function BookStackIcon() {
    return (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            <line x1="8" y1="6" x2="16" y2="6"></line>
            <line x1="8" y1="10" x2="14" y2="10"></line>
        </svg>
    );
}

function BookOpenIcon() {
    return (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
        </svg>
    );
}

function CheckIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
    );
}

export default async function EbooksPage() {
    const ebooks = await getEbooks();

    const benefits = [
        {
            icon: <DownloadIcon />,
            title: "Acceso Inmediato",
            description: "Descarga instantánea después de tu compra. Lee desde cualquier dispositivo."
        },
        {
            icon: <TargetIcon />,
            title: "Contenido Práctico",
            description: "Herramientas y ejercicios aplicables desde el primer día."
        },
        {
            icon: <ShieldIcon />,
            title: "Tuyo Para Siempre",
            description: "Una vez comprado, acceso permanente sin suscripciones."
        },
        {
            icon: <LightbulbIcon />,
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
                                <div style={{
                                    color: "var(--primary-light)",
                                    marginBottom: "1rem",
                                    display: "flex",
                                    justifyContent: "center"
                                }}>
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
                                    <span style={{ color: "var(--success)", display: "flex" }}><CheckIcon /></span>
                                    <span style={{ color: "var(--foreground)" }}>Ejercicios prácticos en cada capítulo</span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                    <span style={{ color: "var(--success)", display: "flex" }}><CheckIcon /></span>
                                    <span style={{ color: "var(--foreground)" }}>Casos de estudio reales</span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                    <span style={{ color: "var(--success)", display: "flex" }}><CheckIcon /></span>
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
                            <div style={{
                                color: "var(--primary-light)",
                                marginBottom: "1rem",
                                display: "flex",
                                justifyContent: "center"
                            }}>
                                <BookStackIcon />
                            </div>
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
                            <div style={{
                                color: "var(--foreground-muted)",
                                marginBottom: "1rem",
                                display: "flex",
                                justifyContent: "center"
                            }}>
                                <BookOpenIcon />
                            </div>
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
