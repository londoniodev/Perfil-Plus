import { IconSearch, IconPencil, IconZap, IconChart } from "../icons";

const steps = [
    { num: "01", icon: <IconSearch />, title: "Diagnóstico", desc: "Entender el fondo." },
    { num: "02", icon: <IconPencil />, title: "Diseño", desc: "Crear la ruta." },
    { num: "03", icon: <IconZap />, title: "Acción", desc: "Ejecutar en la realidad." },
    { num: "04", icon: <IconChart />, title: "Medición", desc: "Evaluar y ajustar." },
];

export function MetodoSection() {
    return (
        <section className="section" id="metodo">
            <div className="container">
                <div style={{ textAlign: "center", marginBottom: "5rem" }}>
                    <h2 className="section-title">El proceso</h2>
                    <p className="section-subtitle" style={{ margin: "0 auto" }}>
                        Claridad desde el primer paso hasta el resultado.
                    </p>
                </div>

                <div className="grid-responsive-4" style={{ position: "relative" }}>
                    {/* Connector Line */}
                    <div style={{
                        position: "absolute",
                        top: "32px",
                        left: "10%",
                        right: "10%",
                        height: "2px",
                        background: "linear-gradient(90deg, transparent, var(--border-light) 20%, var(--border-light) 80%, transparent)",
                        zIndex: -1
                    }} />

                    {steps.map((step, i) => (
                        <div key={i} style={{ textAlign: "center", background: "var(--background)", padding: "1rem" }}>
                            <div className="icon-box" style={{ margin: "0 auto 1.5rem", borderRadius: "50%", width: "64px", height: "64px" }}>
                                {step.icon}
                            </div>
                            <h3 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                                {step.title}
                            </h3>
                            <p style={{ color: "var(--foreground-muted)", fontSize: "0.95rem" }}>{step.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
