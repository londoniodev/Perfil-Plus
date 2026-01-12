import Link from "next/link";
import Image from "next/image";
import { IconCalendar, IconArrowRight } from "../icons";

export function HeroSection() {
    return (
        <section className="hero-section">
            <div className="grid-responsive-hero">
                <div className="animate-reveal">
                    <h1 className="section-title hero-title">
                        Psicología y Desarrollo Humano. <br />
                        <span className="gradient-text">Experiencias educativas individuales y grupales que transforman, con método y tecnología.</span>
                    </h1>

                    <p className="section-subtitle mb-8">
                        Acompaño a personas, equipos y organizaciones a construir claridad interna y
                        resultados sostenibles, con procesos profundos y aplicables a la vida real.
                    </p>

                    <div className="hero-buttons">
                        <Link
                            href="#quien-soy"
                            className="btn btn-primary"
                        >
                            Conoce más
                        </Link>
                        <Link href="#servicios" className="btn btn-secondary">
                            Ver servicios
                            <IconArrowRight />
                        </Link>
                    </div>
                </div>

                <div className="hero-image-container">
                    {/* Animated aura layers */}
                    <div className="hero-aura hero-aura-1" />
                    <div className="hero-aura hero-aura-2" />
                    <div className="hero-aura hero-aura-3" />

                    {/* Main image - 15% larger */}
                    <Image
                        src="/mauro_hero.png"
                        alt="Mauro Mera - Psicólogo y Coach"
                        width={575}
                        height={805}
                        priority
                        className="hero-image"
                    />

                    {/* Floating Icons */}
                    {/* Psychology - Top Left */}
                    <div className="floating-icon icon-psychology">
                        <Image src="/hero_icons/psychology.avif" alt="Psicología" width={80} height={80} style={{ objectFit: "contain" }} />
                    </div>
                    {/* Mentorship - Top Right */}
                    <div className="floating-icon icon-mentorship">
                        <Image src="/hero_icons/mentorship.avif" alt="Mentoría" width={70} height={70} style={{ objectFit: "contain" }} />
                    </div>
                    {/* Leadership - Bottom Left */}
                    <div className="floating-icon icon-leadership">
                        <Image src="/hero_icons/leadership.avif" alt="Liderazgo" width={75} height={75} style={{ objectFit: "contain" }} />
                    </div>
                    {/* Technology - Bottom Right */}
                    <div className="floating-icon icon-technology">
                        <Image src="/hero_icons/technology.avif" alt="Tecnología" width={85} height={85} style={{ objectFit: "contain" }} />
                    </div>
                </div>
            </div>
        </section>
    );
}
