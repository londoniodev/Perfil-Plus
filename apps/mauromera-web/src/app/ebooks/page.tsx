import Link from "next/link";
import { Metadata } from "next";
import { API_BASE, TENANT_ID, getApiHeaders } from "@/lib/config";
import {
    IconDownload as DownloadIcon,
    IconTarget as TargetIcon,
    IconShield as ShieldIcon,
    IconZap as LightbulbIcon,
    IconBook as BookStackIcon,
    IconBook as BookOpenIcon,
    IconCheck as CheckIcon,
} from "@alvarosky/ui";
import { Button } from "@alvarosky/ui";
import { Card, CardContent, CardHeader, CardFooter } from "@alvarosky/ui";
import { Badge } from "@alvarosky/ui";

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
        console.log(`[getEbooks] Fetching from ${API_BASE}/store/products?type=DIGITAL with x-tenant-id: ${TENANT_ID}`);
        const res = await fetch(`${API_BASE}/store/products?type=DIGITAL`, {
            next: { revalidate: 60 },
            headers: getApiHeaders(),
        });
        if (!res.ok) {
            console.error(`[getEbooks] Failed fetch: ${res.status} ${res.statusText}`);
            return [];
        }
        const products = await res.json();
        return products.map((p: any) => ({
            id: p.id,
            title: p.name,
            slug: p.slug,
            description: p.description,
            coverImage: p.images?.[0] || '/images/placeholder-ebook.jpg',
            price: Number(p.basePrice)
        }));
    } catch (error) {
        console.error('[getEbooks] Error:', error);
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

import { PageHeader, AdaptiveImage } from "@alvarosky/ui";

export default async function EbooksPage() {
    const ebooks = await getEbooks();

    return (
        <div className="min-h-screen bg-background">
            <PageHeader
                className="container px-4 mx-auto pt-32 md:pt-32 mb-12"
                title="E-books"
                description="Recursos digitales para potenciar tu crecimiento profesional. Herramientas de psicología aplicada y liderazgo que puedes implementar hoy mismo."
            />
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

interface Benefit {
    icon: React.ReactNode;
    title: string;
    description: string;
}

function BenefitsSection({ benefits }: { benefits: Benefit[] }) {
    return (
        <section className="py-20 bg-muted/30 border-y border-border/50">
            <div className="container">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {benefits.map((benefit, index) => (
                        <div key={index} className="p-6 rounded-2xl bg-background border border-border/50 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 text-2xl">
                                {benefit.icon}
                            </div>
                            <h3 className="text-lg font-bold mb-2">
                                {benefit.title}
                            </h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
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
        <section className="py-24 overflow-hidden">
            <div className="container">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="order-2 lg:order-1">
                        <h2 className="heading-h2 mb-6 text-foreground">
                            Conocimiento que puedes aplicar desde hoy
                        </h2>
                        <p className="text-lg text-body mb-6">
                            Cada e-book está diseñado para darte herramientas prácticas y aplicables.
                            No es teoría vacía—es conocimiento basado en años de experiencia trabajando
                            con líderes, equipos y organizaciones.
                        </p>
                        <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                            Ya seas un profesional buscando mejorar tu liderazgo, un emprendedor
                            construyendo su equipo, o alguien en un viaje de desarrollo personal,
                            encontrarás recursos valiosos aquí.
                        </p>
                        <div className="space-y-4">
                            {features.map((feature, index) => (
                                <div key={index} className="flex items-center gap-3">
                                    <span className="w-6 h-6 rounded-full bg-green-500/10 text-green-600 flex items-center justify-center shrink-0">
                                        <CheckIcon size={14} />
                                    </span>
                                    <span className="font-medium text-foreground/80">{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
                        <div className="relative p-8 md:p-12 rounded-3xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/10 text-center max-w-md w-full">
                            <div className="absolute -top-6 -right-6 w-24 h-24 bg-accent/10 rounded-full blur-2xl" />
                            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />

                            <div className="w-20 h-20 mx-auto rounded-2xl bg-background border border-border shadow-lg flex items-center justify-center text-primary mb-6 relative z-10">
                                <BookStackIcon size={40} />
                            </div>
                            <h3 className="text-2xl font-bold mb-3 relative z-10">
                                Biblioteca en crecimiento
                            </h3>
                            <p className="text-muted-foreground mb-6 relative z-10">
                                Nuevos títulos agregados regularmente.
                                Cada e-book es el resultado de meses de investigación y experiencia práctica.
                            </p>
                            <Badge variant="outline" className="relative z-10 bg-background/50 border-primary/20 text-primary py-1.5 px-3">
                                Próximamente: Nuevos títulos 2025
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function CatalogSection({ ebooks }: { ebooks: Ebook[] }) {
    return (
        <section id="catalogo" className="py-24 bg-muted/10 border-t border-border/50">
            <div className="container">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
                        Catálogo de E-books
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        Explora nuestra colección y encuentra el recurso perfecto para tu próximo paso.
                    </p>
                </div>

                {ebooks.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
        <div className="text-center py-20 bg-background rounded-3xl border border-dashed border-border max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-4">
                <BookOpenIcon size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">
                Próximamente
            </h3>
            <p className="text-muted-foreground">
                Estamos preparando nuevos e-books. ¡Vuelve pronto!
            </p>
        </div>
    );
}

// Don't import here, imports are at the top. I will do a separate replace for imports.
// Just focusing on EbookCard here

function EbookCard({ ebook }: { ebook: Ebook }) {
    return (
        <Link href={`/ebooks/${ebook.slug}`} className="block group h-full">
            <Card className="h-full overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-border/50 flex flex-col bg-background">
                <div className="relative">
                    <AdaptiveImage
                        src={ebook.coverImage}
                        alt={ebook.title}
                        aspectRatio="portrait"
                        className="transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 z-10">
                        <span className="text-white font-medium flex items-center gap-2">
                            Ver detalles <span className="text-lg">→</span>
                        </span>
                    </div>
                </div>
                <CardContent className="flex flex-col flex-1 p-6">
// ... rest matches

                    <h2 className="text-xl font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors">{ebook.title}</h2>
                    <p className="text-muted-foreground text-sm line-clamp-3 mb-4 flex-1">{ebook.description}</p>
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/30">
                        <span className="text-lg font-semibold text-primary">
                            ${Number(ebook.price).toLocaleString("es-CO")}
                        </span>
                        <span className="text-xs font-medium text-muted-foreground bg-secondary px-2.5 py-1 rounded-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                            PDF Digital
                        </span>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}

function CTASection() {
    return (
        <section className="py-24 text-center">
            <div className="container max-w-3xl">
                <div className="bg-primary/5 rounded-3xl p-8 md:p-16 border border-primary/10">
                    <h2 className="text-2xl md:text-3xl font-serif font-bold mb-4">
                        ¿Ya tienes e-books comprados?
                    </h2>
                    <p className="text-lg text-muted-foreground mb-8 text-balance">
                        Accede a tu biblioteca personal para leer y descargar todos tus e-books.
                    </p>
                    <Button asChild size="lg" className="h-12 px-8">
                        <Link href="/login?redirect=/ebooks/mis-compras">Ir a Mis E-books</Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}

