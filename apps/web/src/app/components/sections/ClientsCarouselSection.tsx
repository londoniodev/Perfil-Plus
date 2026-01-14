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
    // Dividir logos en 2 filas para efecto ladrillo
    const halfLength = Math.ceil(clientLogos.length / 2);
    const row1 = clientLogos.slice(0, halfLength);
    const row2 = clientLogos.slice(halfLength);

    // Duplicar para efecto infinito
    const duplicatedRow1 = [...row1, ...row1];
    const duplicatedRow2 = [...row2, ...row2];

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
                <h2
                    className="section-title"
                    style={{
                        marginBottom: "2rem",
                    }}
                >
                    Empresas que confían en nosotros
                </h2>
            </div>

            {/* Fila 1 - Normal */}
            <div className="carousel-container" style={{ marginBottom: "1.5rem" }}>
                <div className="carousel-track">
                    {duplicatedRow1.map((logo, index) => (
                        <div
                            key={`row1-${index}`}
                            className="carousel-item"
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                padding: "0 2rem",
                            }}
                        >
                            <Image
                                src={logo.src}
                                alt={logo.alt}
                                width={200}
                                height={80}
                                className="carousel-logo"
                                style={{
                                    objectFit: "contain",
                                    width: "auto",
                                    height: "60px",
                                }}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Fila 2 - Intercalada (offset) - Movimiento inverso */}
            <div className="carousel-container">
                <div className="carousel-track carousel-track-reverse">
                    {duplicatedRow2.map((logo, index) => (
                        <div
                            key={`row2-${index}`}
                            className="carousel-item"
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                padding: "0 2rem",
                            }}
                        >
                            <Image
                                src={logo.src}
                                alt={logo.alt}
                                width={200}
                                height={80}
                                className="carousel-logo"
                                style={{
                                    objectFit: "contain",
                                    width: "auto",
                                    height: "60px",
                                }}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
