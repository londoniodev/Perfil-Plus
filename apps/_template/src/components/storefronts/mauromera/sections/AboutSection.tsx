"use client";

import Link from "next/link";
import { IconArrowRight } from "@alvarosky/ui";
import { Button } from "@alvarosky/ui";
import ProfileCarousel from "./ProfileCarousel";
import { siteConfig } from "@/config/site";
import { useTenant } from "@/app/providers";

export function AboutSection() {
    const { contactPhone } = useTenant();
    const phone = contactPhone || siteConfig.phone;
    const whatsappUrl = `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(siteConfig.whatsappMessage)}`;
    return (
        <section className="py-20 md:py-32 bg-background" id="quien-soy">
            <div className="container">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <ProfileCarousel />

                    <div className="space-y-8">
                        <h1 className="text-5xl md:text-6xl font-bold text-white drop-shadow-lg">
                            Soy Mauro Mera
                        </h1>
                        <ul className="space-y-3 text-lg md:text-xl text-muted-foreground/90">
                            <li className="flex items-center gap-3">
                                <span className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_10px_currentColor]" />
                                Psicólogo
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_10px_currentColor]" />
                                Consultor Experiencial
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_10px_currentColor]" />
                                Consultor Estratégico
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_10px_currentColor]" />
                                Gestor de Cultura Organizacional Certificado
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_10px_currentColor]" />
                                Entrenador de liderazgo y gestión de equipos
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_10px_currentColor]" />
                                Orientador Vocacional y Profesional
                            </li>
                        </ul>

                        <div className="space-y-6 text-lg md:text-xl text-muted-foreground leading-relaxed">
                            <p>
                                Con una trayectoria de más de 10 años, integro la psicología, pedagogía
                                experiencial, técnicas, principios accionables y tecnología para diseñar
                                experiencias de aprendizaje, autoconocimiento y transformación del
                                potencial humano.
                            </p>
                            <p>
                                Acompaño a adultos, jóvenes, equipos y organizaciones a construir claridad
                                interna, decisiones informadas y resultados sostenibles, con procesos
                                profundos y aplicables a la vida real.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button asChild size="lg" className="h-14 px-8 text-lg bg-slate-950 hover:bg-black text-white border border-white/20 shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:scale-105 transition-all duration-300 rounded-full mt-6">
                                <Link href="#metodo" className="flex items-center gap-2">
                                    Conocer mi enfoque
                                    <IconArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </Button>

                            <Button asChild variant="outline" size="lg" className="h-14 px-8 text-lg text-foreground border-foreground/20 hover:bg-foreground/5 bg-transparent hover:scale-105 transition-all duration-300 rounded-full mt-6">
                                <Link href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                                    Conversemos
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

