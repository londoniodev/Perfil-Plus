import Image from "next/image";

/**
 * Lista de logos de clientes.
 * Para agregar uno nuevo: añade un objeto con src y alt.
 * Para quitar uno: simplemente borra la línea.
 * Asegúrate que el archivo exista en /public/clients_logo_optimized/
 */
const clientLogos = [
    { src: "/clients_logo_optimized/1.webp", alt: "Fundación Valle del Lili" },
    { src: "/clients_logo_optimized/2.webp", alt: "Cliente 2" },
    { src: "/clients_logo_optimized/3.webp", alt: "Cliente 3" },
    { src: "/clients_logo_optimized/4.webp", alt: "Cliente 4" },
    // { src: "/clients_logo_optimized/5.webp", alt: "Cliente 5" }, // Eliminado
    { src: "/clients_logo_optimized/6.webp", alt: "Cliente 6" },
    { src: "/clients_logo_optimized/7.webp", alt: "Cliente 7" },
    { src: "/clients_logo_optimized/8.webp", alt: "Cliente 8" },
    { src: "/clients_logo_optimized/9.webp", alt: "Cliente 9" },
    { src: "/clients_logo_optimized/10.webp", alt: "Cliente 10" },
    { src: "/clients_logo_optimized/11.webp", alt: "Cliente 11" },
    { src: "/clients_logo_optimized/12.webp", alt: "Cliente 12" },
    { src: "/clients_logo_optimized/13.webp", alt: "Cliente 13" },
    { src: "/clients_logo_optimized/14.webp", alt: "Cliente 14" },
    { src: "/clients_logo_optimized/15.webp", alt: "Cliente 15" },
    { src: "/clients_logo_optimized/16.webp", alt: "Organización Hercules" },
    { src: "/clients_logo_optimized/17.webp", alt: "Cliente 17" },
];

export function ClientsCarouselSection() {
    // Duplicamos los logos para crear efecto infinito
    const duplicatedLogos = [...clientLogos, ...clientLogos];

    // Si no hay logos, no renderizar la sección
    if (clientLogos.length === 0) return null;

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
                            key={`logo-${index}`}
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

