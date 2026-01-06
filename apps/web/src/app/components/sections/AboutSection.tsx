import Link from "next/link";
import { IconArrowRight } from "../icons";

export function AboutSection() {
    return (
        <section className="section" id="sobre-mi">
            <div className="container grid-responsive-profile">
                <div
                    className="card"
                    style={{
                        width: "100%",
                        aspectRatio: "1",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--foreground-muted)",
                        position: "relative"
                    }}
                >
                    <div className="grid-pattern" style={{ position: "absolute", inset: 0, opacity: 0.3 }}></div>
                    Foto de Mauro
                </div>

                <div>
                    <h2 className="section-title">Soy Mauro Mera</h2>
                    <p
                        className="section-subtitle"
                        style={{
                            marginBottom: "2.5rem",
                            color: "var(--foreground)",
                        }}
                    >
                        Psicólogo, consultor organizacional y coach. Integro psicología, pedagogía
                        experiencial y herramientas digitales (incluida IA) para diseñar experiencias de
                        transformación profundas, claras y accionables.
                    </p>
                    <Link href="#metodo" className="btn btn-ghost">
                        Conocer mi enfoque
                        <IconArrowRight />
                    </Link>
                </div>
            </div>
        </section>
    );
}
