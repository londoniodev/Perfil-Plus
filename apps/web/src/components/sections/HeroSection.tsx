"use client";

import Link from "next/link";
import Image from "next/image";
import { IconArrowRight } from "@/components/ui/Icons";
import { Button } from "@/components/ui/Button";

export function HeroSection() {
    return (
        <section className="relative min-h-screen flex items-center overflow-hidden py-20 px-[5%] box-border bg-gradient-to-b from-background via-background to-slate-950">
            <div className="container">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
                    <div className="animate-reveal">
                        <h1 className="section-title hero-title text-foreground">
                            Psicología y <span className="gradient-text">Desarrollo Humano.</span>
                        </h1>

                        <p className="section-subtitle mb-8 text-muted-foreground text-lg md:text-xl max-w-xl">
                            Experiencias educativas individuales y grupales que transforman, con método y tecnología.
                        </p>

                        <div className="hero-buttons">
                            <Button asChild size="lg" className="text-base px-8 h-12">
                                <Link href="#quien-soy">Conoce más</Link>
                            </Button>
                            <Button asChild variant="outline" size="lg" className="text-base h-12 border-primary/20 hover:border-primary/50 text-foreground bg-transparent hover:bg-primary/10">
                                <Link href="/servicios">
                                    Ver servicios
                                    <IconArrowRight className="ml-2 w-5 h-5" />
                                </Link>
                            </Button>
                        </div>
                    </div>

                    <div className="relative flex justify-center items-end h-full order-first lg:order-last min-h-[500px] lg:min-h-[700px]">
                        {/* Animated aura layers with improved opacity for dark mode */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[600px] rounded-full blur-[60px] pointer-events-none z-0 bg-[radial-gradient(ellipse,_rgba(91,141,239,0.4)_0%,_rgba(91,141,239,0.1)_40%,_transparent_70%)] animate-aura-pulse" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[550px] rounded-full blur-[60px] pointer-events-none z-0 bg-[radial-gradient(ellipse,_rgba(91,141,239,0.3)_0%,_rgba(140,177,255,0.15)_50%,_transparent_70%)] animate-aura-pulse-slow" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[500px] rounded-full blur-[50px] pointer-events-none z-0 bg-[radial-gradient(ellipse,_rgba(232,168,56,0.15)_0%,_transparent_60%)] animate-aura-pulse-slower" />

                        {/* Main image */}
                        <Image
                            src="/images/hero/mauro_hero.png"
                            alt="Mauro Mera - Psicólogo y Coach"
                            width={575}
                            height={805}
                            priority
                            className="w-full h-auto max-w-[550px] drop-shadow-[0_20px_60px_rgba(0,0,0,0.5)] scale-105 relative z-10"
                        />

                        {/* Floating Icons with glassmorphism */}
                        <div className="absolute top-[18%] left-[2%] z-20 bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-3 flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.3)] animate-float">
                            <Image src="/hero_icons/psychology.avif" alt="Psicología" width={55} height={55} className="object-contain opacity-90" />
                        </div>
                        <div className="absolute top-[12%] right-[5%] z-20 bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-3 flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.3)] animate-float [animation-delay:2s]">
                            <Image src="/hero_icons/mentorship.avif" alt="Mentoría" width={50} height={50} className="object-contain opacity-90" />
                        </div>
                        <div className="absolute bottom-[25%] left-[0%] z-20 bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-3 flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.3)] animate-float [animation-delay:4s]">
                            <Image src="/hero_icons/leadership.avif" alt="Liderazgo" width={55} height={55} className="object-contain opacity-90" />
                        </div>
                        <div className="absolute bottom-[35%] right-[0%] z-20 bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-3 flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.3)] animate-float [animation-delay:1s]">
                            <Image src="/hero_icons/technology.avif" alt="Tecnología" width={60} height={60} className="object-contain opacity-90" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
