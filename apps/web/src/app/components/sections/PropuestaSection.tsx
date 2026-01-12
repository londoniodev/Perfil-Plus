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
                        Decisiones conscientes, cultura plena, desarrollo del talento, autoconocimiento y salud mental.
                    </p>
                </div>

                <div className="grid-responsive">
                    {pillars.map((item, i) => (
                        <div key={i} className="card glow-hover" style={{ textAlign: "center" }}>
                            <div className="icon-box" style={{ margin: "0 auto 1.5rem" }}>
                                {item.icon}
                            </div>
                            <h3 className="card-title">
                                {item.title}
                            </h3>
                            <p className="card-text">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
