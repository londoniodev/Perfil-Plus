import { IconBuilding, IconUsers, IconCompass, IconHeart, IconLayers } from "../icons";

const areas = [
    {
        name: "Cultura Organizacional",
        icon: <IconBuilding />,
    },
    {
        name: "Liderazgo Consciente",
        icon: <IconUsers />,
    },
    {
        name: "Orientación Vocacional",
        icon: <IconCompass />,
    },
    {
        name: "Psicoterapia Clínica",
        icon: <IconHeart />,
    },
    {
        name: "Talleres Experienciales",
        icon: <IconLayers />,
    },
];

export function AreasImpactoSection() {
    return (
        <section
            style={{
                padding: "2rem 0",
                borderTop: "1px solid var(--border)",
                borderBottom: "1px solid var(--border)",
                background: "rgba(15, 20, 25, 0.4)",
                backdropFilter: "blur(5px)"
            }}
        >
            <div className="container">
                <p style={{
                    marginBottom: "2rem",
                    color: "var(--foreground-muted)",
                    fontSize: "0.85rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.15em",
                    textAlign: "center",
                    fontWeight: 600
                }}>
                    Áreas de impacto
                </p>
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))",
                    gap: "1rem",
                    maxWidth: "900px",
                    margin: "0 auto"
                }}>
                    {areas.map((item, i) => (
                        <div
                            key={i}
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: "0.75rem",
                                padding: "1.25rem 1rem",
                                background: "rgba(255,255,255,0.03)",
                                border: "1px solid var(--border)",
                                borderRadius: "1rem",
                                textAlign: "center",
                                transition: "all 0.3s ease"
                            }}
                            className="glow-hover"
                        >
                            <div style={{
                                width: "48px",
                                height: "48px",
                                borderRadius: "0.75rem",
                                background: "rgba(91, 141, 239, 0.1)",
                                border: "1px solid rgba(91, 141, 239, 0.2)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "var(--primary-light)"
                            }}>
                                {item.icon}
                            </div>
                            <span style={{
                                color: "var(--foreground)",
                                fontSize: "0.85rem",
                                fontWeight: 500,
                                lineHeight: 1.3
                            }}>
                                {item.name}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
