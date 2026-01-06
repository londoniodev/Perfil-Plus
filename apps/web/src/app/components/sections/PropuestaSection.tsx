import { IconBrain, IconSparkles, IconCpu } from "../icons";

const pillars = [
    {
        icon: <IconBrain />,
        title: "Psicología aplicada",
        desc: "Comprender lo que pasa adentro para actuar mejor afuera.",
    },
    {
        icon: <IconSparkles />,
        title: "Diseño de experiencias",
        desc: "Talleres y procesos que se viven, no solo se entienden.",
    },
    {
        icon: <IconCpu />,
        title: "Tecnología e IA",
        desc: "Claridad, seguimiento y lenguaje simple para decisiones complejas.",
    },
];

export function PropuestaSection() {
    return (
        <section className="section">
            <div className="container">
                <div style={{ textAlign: "center", marginBottom: "5rem" }}>
                    <h2 className="section-title">Lo humano y lo medible</h2>
                    <p className="section-subtitle" style={{ margin: "0 auto" }}>
                        Decisiones conscientes, cultura saludable y cuidado del mundo interno.
                    </p>
                </div>

                <div className="grid-responsive">
                    {pillars.map((item, i) => (
                        <div key={i} className="card glow-hover" style={{ textAlign: "center" }}>
                            <div className="icon-box" style={{ margin: "0 auto 1.5rem" }}>
                                {item.icon}
                            </div>
                            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1rem" }}>
                                {item.title}
                            </h3>
                            <p style={{ color: "var(--foreground-muted)" }}>{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
