import Link from "next/link";
import Image from "next/image";
import { IconBrain, IconStar, IconCpu } from "@/app/components/ui/Icons";
import styles from "@/app/styles/sections.module.css";

const pillars = [
    {
        icon: <IconBrain />,
        title: "Psicología aplicada",
        desc: "Comprender lo que pasa adentro para actuar mejor afuera.",
        image: "/propuesta/propuesta_psychology.png",
        accent: "rgba(91, 141, 239, 1)", // Blue
        gradient: "linear-gradient(135deg, rgba(91, 141, 239, 0.2) 0%, rgba(58, 98, 184, 0.1) 100%)",
    },
    {
        icon: <IconStar />,
        title: "Experiencias educativas para las organizaciones",
        desc: "Talleres y programas vivenciales para el desarrollo de habilidades y competencias.",
        image: "/propuesta/propuesta_education.png",
        accent: "rgba(232, 168, 56, 1)", // Gold/Orange
        gradient: "linear-gradient(135deg, rgba(232, 168, 56, 0.2) 0%, rgba(200, 140, 40, 0.1) 100%)",
    },
    {
        icon: <IconCpu />,
        title: "Tecnología e IA",
        desc: "Claridad, seguimiento y lenguaje simple para decisiones complejas.",
        image: "/propuesta/propuesta_tech.png",
        accent: "rgba(56, 189, 189, 1)", // Cyan/Teal
        gradient: "linear-gradient(135deg, rgba(56, 189, 189, 0.2) 0%, rgba(40, 150, 150, 0.1) 100%)",
    },
];

export function PropuestaSection() {
    return (
        <section className={styles.section}>
            <div className="container">
                <div className={styles.sectionTitle}>
                    <h2 className="section-title">Lo humano y lo medible</h2>
                    <p className={styles.sectionSubtitle}>
                        Decisiones conscientes, cultura plena, desarrollo del talento, autoconocimiento y salud mental.
                    </p>
                </div>

                <div className={styles.gridResponsive}>
                    {pillars.map((item, i) => (
                        <div
                            key={i}
                            className={`card glow-hover ${styles.pillarCard}`}
                        >
                            {/* Abstract Background Image */}
                            <div className={styles.cardBgAnimation}>
                                <Image
                                    src={item.image}
                                    alt=""
                                    fill
                                    sizes="(max-width: 768px) 100vw, 400px"
                                    loading="lazy"
                                    unoptimized
                                    style={{
                                        objectFit: "cover",
                                        mixBlendMode: "screen",
                                    }}
                                />
                                {/* Gradient Overlay for better text readability */}
                                <div className={styles.cardOverlay} />
                            </div>

                            {/* Icon Container */}
                            <div
                                className={styles.iconBox}
                                style={{
                                    color: item.accent,
                                    background: item.gradient,
                                    border: `1px solid ${item.accent}30`,
                                    boxShadow: `0 0 20px ${item.accent}15`,
                                }}
                            >
                                {item.icon}
                            </div>

                            <h3 className={styles.pillarTitle}>
                                {item.title}
                            </h3>
                            <p className={styles.pillarDesc}>
                                {item.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
