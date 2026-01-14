import Link from "next/link";
import { Metadata } from "next";
import styles from "@/app/styles/ebooks.module.css";
import { API_BASE } from "@/lib/config";
import {
    IconDownload as DownloadIcon,
    IconTarget as TargetIcon,
    IconShield as ShieldIcon,
    IconZap as LightbulbIcon,
    IconBook as BookStackIcon, // Fallback
    IconBook as BookOpenIcon,
    IconCheck as CheckIcon,
} from "@/app/components/ui/Icons";

// ============================================================================
// METADATA Y TIPOS
// ============================================================================

export const metadata: Metadata = {
    title: "E-books | Recursos de Psicología y Liderazgo",
    description: "Descubre nuestra colección de e-books sobre psicología, liderazgo, cultura organizacional y desarrollo personal. Herramientas prácticas aplicables desde hoy.",
    keywords: ["ebooks psicología", "libros liderazgo", "desarrollo personal", "recursos digitales"],
    openGraph: {
        title: "E-books | Recursos de Psicología y Liderazgo",
        description: "Colección de e-books sobre psicología, liderazgo y desarrollo personal.",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "E-books | Mauro Mera",
        description: "Recursos prácticos de psicología aplicada y liderazgo.",
    },
    alternates: {
        canonical: "/ebooks",
    },
};

interface Ebook {
    id: string;
    title: string;
    slug: string;
    description: string;
    coverImage: string;
    price: number;
}

// ============================================================================
// DATA FETCHING
// ============================================================================

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

// ============================================================================
// DATOS ESTÁTICOS
// ============================================================================

const benefits = [
    {
        icon: <DownloadIcon />,
        title: "Acceso Inmediato",
        description: "Descarga instantánea después de tu compra. Lee desde cualquier dispositivo.",
    },
    {
        icon: <TargetIcon />,
        title: "Contenido Práctico",
        description: "Herramientas y ejercicios aplicables desde el primer día.",
    },
    {
        icon: <ShieldIcon />,
        title: "Tuyo Para Siempre",
        description: "Una vez comprado, acceso permanente sin suscripciones.",
    },
    {
        icon: <LightbulbIcon />,
        title: "Conocimiento Experto",
        description: "Basado en años de experiencia en psicología organizacional.",
    },
];

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

// ... imports unchanged

export default async function EbooksPage() {
    const ebooks = await getEbooks();

    return (
        <div className={styles.ebooksPage}>
            <HeroSection />
            <BenefitsSection benefits={benefits} />
            <ValuePropositionSection />
            <CatalogSection ebooks={ebooks} />
            <CTASection />
        </div>
    );
}

// ============================================================================
// SECCIONES
// ============================================================================

function HeroSection() {
    return (
        <section className={styles.ebooksHero}>
            {/* Background gradient */}
            <div className={styles.heroBackground} />

            <div className={`container ${styles.heroContent}`}>
                <span className={`badge ${styles.heroBadge}`}>
                    Biblioteca Digital
                </span>
                <h1 className="page-hero-title">
                    E-books que transforman tu mentalidad
                </h1>
                <p className="hero-description">
                    Recursos prácticos escritos por Mauro Mera. Herramientas de psicología aplicada,
                    liderazgo y desarrollo personal que puedes implementar hoy mismo.
                </p>
                <div className={styles.heroButtons}>
                    <a href="#catalogo" className="btn btn-primary">
                        Ver Catálogo
                    </a>
                    <Link href="/formacion" className="btn btn-secondary">
                        Explorar Cursos
                    </Link>
                </div>
            </div>
        </section>
    );
}

interface Benefit {
    icon: React.ReactNode;
    title: string;
    description: string;
}

function BenefitsSection({ benefits }: { benefits: Benefit[] }) {
    return (
        <section className={styles.benefitsSection}>
            <div className="container">
                <div className={styles.benefitsGrid}>
                    {benefits.map((benefit, index) => (
                        <div key={index} className={styles.benefitCard}>
                            <div className={styles.benefitIcon}>
                                {benefit.icon}
                            </div>
                            <h3 className="card-title">
                                {benefit.title}
                            </h3>
                            <p className={styles.benefitDescription}>
                                {benefit.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function ValuePropositionSection() {
    const features = [
        "Ejercicios prácticos en cada capítulo",
        "Casos de estudio reales",
        "Plantillas y recursos descargables",
    ];

    return (
        <section className={styles.valuePropSection}>
            <div className="container">
                <div className={styles.valuePropGrid}>
                    <div>
                        <h2 className={`${styles.sectionTitle} ${styles.valuePropTitle}`}>
                            Conocimiento que puedes aplicar desde hoy
                        </h2>
                        <p className={styles.valuePropText}>
                            Cada e-book está diseñado para darte herramientas prácticas y aplicables.
                            No es teoría vacía—es conocimiento basado en años de experiencia trabajando
                            con líderes, equipos y organizaciones.
                        </p>
                        <p className={styles.valuePropText}>
                            Ya seas un profesional buscando mejorar tu liderazgo, un emprendedor
                            construyendo su equipo, o alguien en un viaje de desarrollo personal,
                            encontrarás recursos valiosos aquí.
                        </p>
                        <div className={styles.featureList}>
                            {features.map((feature, index) => (
                                <div key={index} className={styles.featureItem}>
                                    <span className={styles.featureIcon}><CheckIcon /></span>
                                    <span className={styles.featureText}>{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className={styles.libraryCard}>
                        <div className={styles.libraryIcon}>
                            <BookStackIcon />
                        </div>
                        <h3 className="card-title">
                            Biblioteca en crecimiento
                        </h3>
                        <p className={styles.benefitDescription} style={{ marginBottom: "1.5rem" }}>
                            Nuevos títulos agregados regularmente.
                            Cada e-book es el resultado de meses de investigación y experiencia práctica.
                        </p>
                        <span className={styles.comingSoonBadge}>
                            Próximamente: Nuevos títulos 2025
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
}

function CatalogSection({ ebooks }: { ebooks: Ebook[] }) {
    return (
        <section id="catalogo" className={styles.catalogSection}>
            <div className={`container ${styles.catalogContainer}`}>
                <div className={styles.catalogHeader}>
                    <h2 className={`${styles.sectionTitle} ${styles.catalogTitle}`}>
                        Catálogo de E-books
                    </h2>
                    <p className={styles.catalogSubtitle}>
                        Explora nuestra colección y encuentra el recurso perfecto para tu próximo paso.
                    </p>
                </div>

                {ebooks.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className={styles.ebooksGrid}>
                        {ebooks.map((ebook) => (
                            <EbookCard key={ebook.id} ebook={ebook} />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

function EmptyState() {
    return (
        <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>
                <BookOpenIcon />
            </div>
            <h3 className={styles.emptyStateTitle}>
                Próximamente
            </h3>
            <p>
                Estamos preparando nuevos e-books. ¡Vuelve pronto!
            </p>
        </div>
    );
}

function EbookCard({ ebook }: { ebook: Ebook }) {
    return (
        <Link href={`/ebooks/${ebook.slug}`} className={styles.ebookCard}>
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
    );
}

function CTASection() {
    return (
        <section className={styles.ctaSection}>
            <div className="container">
                <h2 className={`${styles.sectionTitle} ${styles.ctaTitle}`}>
                    ¿Ya tienes e-books comprados?
                </h2>
                <p className={styles.ctaText}>
                    Accede a tu biblioteca personal para leer y descargar todos tus e-books.
                </p>
                <Link href="/login?redirect=/ebooks/mis-compras" className="btn btn-accent">
                    Ir a Mis E-books
                </Link>
            </div>
        </section>
    );
}
