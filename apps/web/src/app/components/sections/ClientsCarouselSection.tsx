import Image from "next/image";

// Lista de logos optimizados (WebP sin fondo)
const clientLogos = Array.from({ length: 17 }, (_, i) => ({
    id: i + 1,
    src: `/clients_logo_optimized/${i + 1}.webp`,
    alt: `Cliente ${i + 1}`,
}));

export function ClientsCarouselSection() {
    // Duplicamos los logos para crear efecto infinito
    const duplicatedLogos = [...clientLogos, ...clientLogos];

    return (
        <section
            style={{
                padding: "3rem 0",
                overflow: "hidden",
                background: "rgba(0, 0, 0, 0.2)",
                borderTop: "1px solid var(--border)",
                borderBottom: "1px solid var(--border)",
            }}
        >
            <div
                style={{
                    maxWidth: "1400px",
                    margin: "0 auto",
                    paddingBottom: "1.5rem",
                    textAlign: "center",
                }}
            >
                <p
                    style={{
                        fontSize: "0.875rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        color: "var(--foreground-muted)",
                        fontFamily: "var(--font-mono)",
                    }}
                >
                    Empresas que confían en nosotros
                </p>
            </div>

            <div className="carousel-container">
                <div className="carousel-track">
                    {duplicatedLogos.map((logo, index) => (
                        <div
                            key={`${logo.id}-${index}`}
                            className="carousel-item"
                        >
                            <Image
                                src={logo.src}
                                alt={logo.alt}
                                width={200}
                                height={80}
                                unoptimized
                                className="carousel-logo"
                                style={{
                                    objectFit: "contain",
                                    width: "auto",
                                    height: "80px",
                                }}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
