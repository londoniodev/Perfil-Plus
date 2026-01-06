import Link from "next/link";
import { IconCalendar } from "../icons";

export function CTASection() {
    return (
        <section
            id="agendar"
            style={{
                padding: "8rem 0",
                textAlign: "center",
                position: "relative",
                overflow: "hidden"
            }}
        >
            <div style={{
                position: "absolute",
                inset: 0,
                background: "radial-gradient(circle at center, rgba(91,141,239,0.15), transparent 70%)",
                zIndex: -1
            }} />

            <div className="container" style={{ position: "relative", zIndex: 1 }}>
                <h2
                    className="section-title"
                    style={{
                        fontSize: "3.5rem",
                        marginBottom: "1.5rem",
                    }}
                >
                    ¿Hablamos?
                </h2>
                <p
                    className="section-subtitle"
                    style={{
                        marginBottom: "3rem",
                        margin: "0 auto 3rem",
                    }}
                >
                    Si estás en un punto de decisión, busquemos la mejor ruta juntos.
                </p>
                <Link
                    href="https://wa.me/573183771838?text=Hola%20Mauro,%20quisiera%20agendar%20un%20diagnóstico."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                    style={{
                        fontSize: "1.125rem",
                        padding: "1.25rem 2.5rem",
                    }}
                >
                    <IconCalendar />
                    Agendar Diagnóstico
                </Link>
            </div>
        </section>
    );
}
