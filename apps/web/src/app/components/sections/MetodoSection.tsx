import Image from "next/image";

const steps = [
    {
        num: "01",
        title: "Diagnóstico",
        description: "Entendemos el contexto, los desafíos y las oportunidades reales antes de actuar.",
        image: "/proceso/diagnostico.avif",
        accentColor: "rgba(91, 141, 239, 0.8)",
        gradient: "linear-gradient(135deg, rgba(91, 141, 239, 0.2) 0%, rgba(58, 98, 184, 0.1) 100%)",
    },
    {
        num: "02",
        title: "Diseño",
        description: "Creamos una ruta clara con metodología, tiempos y objetivos medibles.",
        image: "/proceso/diseno.avif",
        accentColor: "rgba(232, 168, 56, 0.8)",
        gradient: "linear-gradient(135deg, rgba(232, 168, 56, 0.2) 0%, rgba(200, 140, 40, 0.1) 100%)",
    },
    {
        num: "03",
        title: "Acción",
        description: "Ejecutamos el plan en la realidad con acompañamiento continuo.",
        image: "/proceso/accion.avif",
        accentColor: "rgba(255, 193, 7, 0.8)",
        gradient: "linear-gradient(135deg, rgba(255, 193, 7, 0.2) 0%, rgba(200, 150, 5, 0.1) 100%)",
    },
    {
        num: "04",
        title: "Medición",
        description: "Evaluamos resultados, ajustamos y consolidamos los aprendizajes.",
        image: "/proceso/medicion.avif",
        accentColor: "rgba(76, 175, 80, 0.8)",
        gradient: "linear-gradient(135deg, rgba(76, 175, 80, 0.2) 0%, rgba(56, 142, 60, 0.1) 100%)",
    },
];

export function MetodoSection() {
    return (
        <section className="section" id="metodo">
            <div className="container">
                <div style={{ textAlign: "center", marginBottom: "4rem" }}>
                    <h2 className="section-title">El proceso</h2>
                    <p className="section-subtitle" style={{ margin: "0 auto" }}>
                        Claridad desde el primer paso hasta el resultado.
                    </p>
                </div>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
                        gap: "1.5rem",
                        maxWidth: "1200px",
                        margin: "0 auto",
                    }}
                >
                    {steps.map((step, i) => (
                        <div
                            key={i}
                            className="proceso-card"
                            style={{
                                position: "relative",
                                borderRadius: "1.25rem",
                                overflow: "hidden",
                                background: step.gradient,
                                border: "1px solid var(--border)",
                                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                                aspectRatio: "4/5",
                            }}
                        >
                            {/* Background Image */}
                            <div
                                className="proceso-card-bg"
                                style={{
                                    position: "absolute",
                                    inset: 0,
                                    opacity: 0.25,
                                    transition: "opacity 0.4s ease",
                                }}
                            >
                                <Image
                                    src={step.image}
                                    alt={step.title}
                                    fill
                                    style={{ objectFit: "cover" }}
                                />
                            </div>

                            {/* Step number badge */}
                            <div
                                style={{
                                    position: "absolute",
                                    top: "1.25rem",
                                    right: "1.25rem",
                                    width: "48px",
                                    height: "48px",
                                    borderRadius: "50%",
                                    background: "rgba(0, 0, 0, 0.4)",
                                    border: `2px solid ${step.accentColor}`,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontFamily: "var(--font-mono)",
                                    fontSize: "0.9rem",
                                    fontWeight: 700,
                                    color: step.accentColor,
                                    zIndex: 3,
                                }}
                            >
                                {step.num}
                            </div>

                            {/* Content overlay */}
                            <div
                                style={{
                                    position: "relative",
                                    zIndex: 2,
                                    height: "100%",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "flex-end",
                                    padding: "1.5rem",
                                    background: "linear-gradient(to top, rgba(13, 17, 23, 0.95) 0%, rgba(13, 17, 23, 0.6) 40%, transparent 70%)",
                                }}
                            >
                                {/* Accent bar */}
                                <div
                                    style={{
                                        width: "50px",
                                        height: "4px",
                                        background: step.accentColor,
                                        borderRadius: "2px",
                                        marginBottom: "1rem",
                                    }}
                                />
                                <h3
                                    style={{
                                        color: "var(--foreground)",
                                        fontSize: "1.35rem",
                                        fontWeight: 700,
                                        marginBottom: "0.5rem",
                                    }}
                                >
                                    {step.title}
                                </h3>
                                <p
                                    style={{
                                        color: "var(--foreground-muted)",
                                        fontSize: "0.9rem",
                                        lineHeight: 1.6,
                                        margin: 0,
                                    }}
                                >
                                    {step.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
