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
    // Agrupamos los logos en pares para el diseño móvil (2 filas)
    // Para desktop, podríamos mantenerlos individuales o usar la misma estructura
    // Si queremos 2 filas en móvil pero 1 en desktop, necesitamos CSS media queries o estructura inteligente.
    // La solicitud es: "logos pasen en filas de 2".
    // Vamos a crear pares.
    const pairedLogos = [];
    for (let i = 0; i < clientLogos.length; i += 2) {
        pairedLogos.push([clientLogos[i], clientLogos[i + 1] || null]);
    }

    // Duplicamos los pares para el efecto infinito
    const duplicatedPairs = [...pairedLogos, ...pairedLogos];

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
                <h2
                    className="section-title"
                    style={{
                        marginBottom: "2rem",
                        // fontSize removed to use class definition
                    }}
                >
                    Empresas que confían en nosotros
                </h2>
            </div>

            <div className="carousel-container">
                <div className="carousel-track">
                    {duplicatedPairs.map((pair, index) => (
                        <div
                            key={`pair-${index}`}
                            className="carousel-item"
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "2rem", // Espacio vertical entre los 2 logos
                                justifyContent: "center"
                            }}
                        >
                            {/* Logo 1 */}
                            {pair[0] && (
                                <Image
                                    src={pair[0].src}
                                    alt={pair[0].alt}
                                    width={200}
                                    height={80}
                                    className="carousel-logo"
                                    style={{
                                        objectFit: "contain",
                                        width: "auto",
                                        height: "60px", // Un poco más pequeños para que quepan 2 filas
                                    }}
                                />
                            )}

                            {/* Logo 2 */}
                            {pair[1] && (
                                <Image
                                    src={pair[1].src}
                                    alt={pair[1].alt}
                                    width={200}
                                    height={80}
                                    className="carousel-logo"
                                    style={{
                                        objectFit: "contain",
                                        width: "auto",
                                        height: "60px",
                                    }}
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
