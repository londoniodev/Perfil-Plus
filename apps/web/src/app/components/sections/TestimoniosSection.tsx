import { IconQuote } from "../icons";

const testimonials = [
    {
        quote: "El proceso me ayudó a entender patrones que llevaba años repitiendo. Ahora tomo decisiones con más claridad.",
        author: "Confidencial",
        role: "Psicoterapia",
    },
    {
        quote: "Mauro logró que nuestro equipo de liderazgo conversara de lo importante, no solo de lo urgente.",
        author: "Gerente de Talento",
        role: "Sector Tech",
    },
    {
        quote: "Explora le dio a mi hijo herramientas para decidir su carrera con información real, no con ansiedad.",
        author: "Padre de familia",
        role: "Orientación Vocacional",
    },
];

export function TestimoniosSection() {
    return (
        <section className="section section-alt">
            <div className="container">
                <div style={{ textAlign: "center", marginBottom: "4rem" }}>
                    <h2 className="section-title">Voces de la experiencia</h2>
                </div>

                <div className="grid-responsive">
                    {testimonials.map((test, i) => (
                        <div key={i} className="card" style={{ position: "relative" }}>
                            <div style={{ position: "absolute", top: "1.5rem", left: "1.5rem", opacity: 0.1 }}>
                                <IconQuote />
                            </div>
                            <p
                                style={{
                                    fontSize: "1.125rem",
                                    color: "var(--foreground)",
                                    marginBottom: "2rem",
                                    lineHeight: 1.6,
                                    fontStyle: "italic",
                                    paddingTop: "1.5rem",
                                }}
                            >
                                "{test.quote}"
                            </p>
                            <div>
                                <p style={{ fontWeight: 700, marginBottom: "0.25rem", fontSize: "1rem" }}>{test.author}</p>
                                <span className="badge" style={{ fontSize: "0.7rem", padding: "0.2rem 0.6rem" }}>{test.role}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
