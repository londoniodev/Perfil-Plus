"use client";

import Link from "next/link";
import Image from "next/image";
import { IconArrowRight } from "@/components/ui/Icons";
import { Button } from "@/components/ui/Button";

export function HeroSection() {
    return (
        <section className="relative min-h-screen flex items-center overflow-hidden py-20 px-[5%] box-border">
            <div className="container">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
                    <div className="animate-reveal">
                        <h1 className="section-title hero-title">
                            Psicología y <span className="gradient-text">Desarrollo Humano.</span>
                        </h1>

                        <p className="section-subtitle mb-8">
                            Experiencias educativas individuales y grupales que transforman, con método y tecnología.
                        </p>

                        <div className="hero-buttons">
                            <Button asChild>
                                <Link href="#quien-soy">Conoce más</Link>
                            </Button>
                            <Button asChild variant="secondary">
                                <Link href="/servicios">
                                    Ver servicios
                                    <IconArrowRight />
                                </Link>
                            </Button>
                        </div>
                    </div>

                    <div className="relative flex justify-center items-end h-full order-first lg:order-last">
                        {/* Animated aura layers */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[600px] rounded-full blur-[40px] pointer-events-none z-0 bg-[radial-gradient(ellipse,_rgba(91,141,239,0.7)_0%,_rgba(91,141,239,0.3)_40%,_transparent_70%)] animate-aura-pulse" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[550px] rounded-full blur-[40px] pointer-events-none z-0 bg-[radial-gradient(ellipse,_rgba(58,98,184,0.5)_0%,_rgba(140,177,255,0.3)_50%,_transparent_70%)] animate-aura-pulse-slow" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[500px] rounded-full blur-[40px] pointer-events-none z-0 bg-[radial-gradient(ellipse,_rgba(232,168,56,0.25)_0%,_transparent_60%)] animate-aura-pulse-slower" />

                        {/* Main image */}
                        <Image
                            src="/images/hero/mauro_hero.png"
                            alt="Mauro Mera - Psicólogo y Coach"
                            width={575}
                            height={805}
                            priority
                            className="w-full h-auto max-w-[550px] drop-shadow-[0_20px_40px_rgba(0,0,0,0.4)] scale-105"
                        />

                        {/* Floating Icons */}
                        <div className="absolute top-[20%] left-[5%] z-5 bg-white/5 backdrop-blur-[10px] border border-white/10 rounded-2xl p-2 flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.2)] animate-float">
                            <Image src="/hero_icons/psychology.avif" alt="Psicología" width={60} height={60} className="object-contain" />
                        </div>
                        <div className="absolute top-[15%] right-[10%] z-5 bg-white/5 backdrop-blur-[10px] border border-white/10 rounded-2xl p-2 flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.2)] animate-float [animation-delay:2s]">
                            <Image src="/hero_icons/mentorship.avif" alt="Mentoría" width={55} height={55} className="object-contain" />
                        </div>
                        <div className="absolute bottom-[30%] left-[5%] z-5 bg-white/5 backdrop-blur-[10px] border border-white/10 rounded-2xl p-2 flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.2)] animate-float [animation-delay:4s]">
                            <Image src="/hero_icons/leadership.avif" alt="Liderazgo" width={60} height={60} className="object-contain" />
                        </div>
                        <div className="absolute bottom-[40%] right-[5%] z-5 bg-white/5 backdrop-blur-[10px] border border-white/10 rounded-2xl p-2 flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.2)] animate-float [animation-delay:1s]">
                            <Image src="/hero_icons/technology.avif" alt="Tecnología" width={65} height={65} className="object-contain" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
