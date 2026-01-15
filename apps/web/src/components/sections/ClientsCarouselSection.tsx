import Image from "next/image";

/**
 * Lista de logos de clientes.
 */
const clientLogos = [
    { src: "/clients_logo_optimized/1.webp", alt: "Fundación Valle del Lili" },
    { src: "/clients_logo_optimized/2.webp", alt: "Cliente 2" },
    { src: "/clients_logo_optimized/3.webp", alt: "Cliente 3" },
    { src: "/clients_logo_optimized/4.webp", alt: "Cliente 4" },
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
    const halfLength = Math.ceil(clientLogos.length / 2);
    const row1 = clientLogos.slice(0, halfLength);
    const row2 = clientLogos.slice(halfLength);

    const duplicatedRow1 = [...row1, ...row1];
    const duplicatedRow2 = [...row2, ...row2];

    if (clientLogos.length === 0) return null;

    return (
        <section className="py-16 md:py-24 overflow-hidden bg-background">
            <div className="container text-center mb-12">
                <h2 className="section-title">
                    Empresas que confían en nosotros
                </h2>
            </div>

            {/* Row 1 - Normal Scroll */}
            <div className="mb-6 flex overflow-hidden relative w-full [mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)]">
                <div className="flex min-w-full shrink-0 gap-8 animate-scroll-left items-center">
                    {duplicatedRow1.map((logo, index) => (
                        <div key={`row1-${index}`} className="flex-shrink-0 px-4 grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100">
                            <Image
                                src={logo.src}
                                alt={logo.alt}
                                width={160}
                                height={60}
                                className="object-contain h-12 w-auto max-w-[180px]"
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Row 2 - Reverse Scroll */}
            <div className="flex overflow-hidden relative w-full [mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)]">
                <div className="flex min-w-full shrink-0 gap-8 animate-scroll-right items-center">
                    {duplicatedRow2.map((logo, index) => (
                        <div key={`row2-${index}`} className="flex-shrink-0 px-4 grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100">
                            <Image
                                src={logo.src}
                                alt={logo.alt}
                                width={160}
                                height={60}
                                className="object-contain h-12 w-auto max-w-[180px]"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
