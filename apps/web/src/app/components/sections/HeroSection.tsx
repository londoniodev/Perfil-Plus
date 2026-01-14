"use client";

import Link from "next/link";
import Image from "next/image";
import { IconArrowRight } from "@/app/components/ui/Icons";
import styles from "@/app/styles/sections.module.css";

export function HeroSection() {
    return (
        <section className={styles.heroSection}>
            <div className="container">
                <div className={styles.heroGrid}>
                    <div className="animate-reveal">
                        <h1 className="section-title hero-title">
                            Psicología y <span className="gradient-text">Desarrollo Humano.</span>
                        </h1>

                        <p className="section-subtitle mb-8">
                            Experiencias educativas individuales y grupales que transforman, con método y tecnología.
                        </p>

                        <div className="hero-buttons">
                            <Link
                                href="#quien-soy"
                                className="btn btn-primary"
                            >
                                Conoce más
                            </Link>
                            <Link href="/servicios" className="btn btn-secondary">
                                Ver servicios
                                <IconArrowRight />
                            </Link>
                        </div>
                    </div>

                    <div className={styles.heroImageContainer}>
                        {/* Animated aura layers */}
                        <div className={`${styles.heroAura} ${styles.heroAura1}`} />
                        <div className={`${styles.heroAura} ${styles.heroAura2}`} />
                        <div className={`${styles.heroAura} ${styles.heroAura3}`} />

                        {/* Main image - Optimized with Next.js Image */}
                        <Image
                            src="/mauro_hero.png"
                            alt="Mauro Mera - Psicólogo y Coach"
                            width={575}
                            height={805}
                            priority
                            style={{
                                width: "100%",
                                height: "auto",
                                maxWidth: "550px",
                                filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.4))",
                                transform: "scale(1.05)"
                            }}
                        />

                        {/* Floating Icons */}
                        <div className={`${styles.floatingIcon} ${styles.iconPsychology}`}>
                            <Image src="/hero_icons/psychology.avif" alt="Psicología" width={60} height={60} style={{ objectFit: "contain" }} />
                        </div>
                        <div className={`${styles.floatingIcon} ${styles.iconMentorship}`}>
                            <Image src="/hero_icons/mentorship.avif" alt="Mentoría" width={55} height={55} style={{ objectFit: "contain" }} />
                        </div>
                        <div className={`${styles.floatingIcon} ${styles.iconLeadership}`}>
                            <Image src="/hero_icons/leadership.avif" alt="Liderazgo" width={60} height={60} style={{ objectFit: "contain" }} />
                        </div>
                        <div className={`${styles.floatingIcon} ${styles.iconTechnology}`}>
                            <Image src="/hero_icons/technology.avif" alt="Tecnología" width={65} height={65} style={{ objectFit: "contain" }} />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
