"use client";

import Link from "next/link";
import NextImage from "next/image";
import { IconCheck, IconExternalLink } from "@/components/ui/Icons";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import styles from "@/styles/sections.module.css";
import { cn } from "@/lib/utils";
import { GLASS_CARD_STYLES } from "@/lib/constants/styles";

export function ServiciosSection() {
    return (
        <section className={styles.section} id="servicios">
            <div className="container">
                <div className={styles.sectionTitle}>
                    <h2 className="section-title">Rutas de acompañamiento</h2>
                    <p className={styles.sectionSubtitle}>
                        Soluciones diseñadas para tu momento actual.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Service 1 - Psicoterapia */}
                    <Card className={cn(GLASS_CARD_STYLES, "p-0 relative h-full flex flex-col overflow-hidden group")}>
                        <div className="relative h-48 w-full shrink-0 overflow-hidden">
                            <NextImage
                                src="/services/psicoterapia.avif"
                                alt="Psicoterapia y Coaching"
                                fill
                                style={{ objectFit: "cover" }}
                                className="group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0f1419] to-transparent opacity-90" />
                        </div>
                        <CardContent className="p-8 flex flex-col flex-1 relative z-10 -mt-2">
                            <h3 className="font-bold text-xl mb-3 text-white">
                                Psicoterapia y Coaching personalizado
                            </h3>
                            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                                Espacio clínico para ordenar el mundo interno y sanar.
                            </p>
                            <ul className="space-y-3 mb-8">
                                {["Ansiedad y estrés", "Duelo y crisis", "Vínculos sanos", "Propósito de vida"].map((item, i) => (
                                    <li key={i} className="flex gap-2.5 items-start text-sm text-foreground/80">
                                        <span className="text-success mt-0.5"><IconCheck className="w-4 h-4" /></span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-auto">
                                <Button asChild variant="secondary" fullWidth className="bg-white/5 hover:bg-white/10 border-white/5">
                                    <Link href="/servicios#psicoterapia">Ver detalles</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Service 2 - Consultoría (Empresas) */}
                    <Card className={cn(GLASS_CARD_STYLES, "p-0 relative h-full flex flex-col overflow-hidden group")}>
                        <div className="relative h-48 w-full shrink-0 overflow-hidden">
                            <NextImage
                                src="/services/consultoria.avif"
                                alt="Consultoría Organizacional"
                                fill
                                style={{ objectFit: "cover" }}
                                className="group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0f1419] to-transparent opacity-90" />
                        </div>
                        <CardContent className="p-8 flex flex-col flex-1 relative z-10 -mt-2">
                            <h3 className="font-bold text-xl mb-3 text-white">
                                Consultoría Organizacional
                            </h3>
                            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                                Alineación de cultura, liderazgo y equipos con resultados de negocio.
                            </p>
                            <ul className="space-y-3 mb-8">
                                {["Cultura y cambio", "Escuelas de liderazgo", "Talleres de equipo", "Eventos corporativos"].map((item, i) => (
                                    <li key={i} className="flex gap-2.5 items-start text-sm text-foreground/80">
                                        <span className="text-primary mt-0.5"><IconCheck className="w-4 h-4" /></span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-auto">
                                <Button asChild variant="secondary" fullWidth className="bg-white/5 hover:bg-white/10 border-white/5">
                                    <Link href="/servicios#empresas">Ver detalles</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Service 3 - Orientación (Explora) */}
                    <Card className={cn(GLASS_CARD_STYLES, "p-0 relative h-full flex flex-col overflow-visible border-accent/20 shadow-xl shadow-accent/5 group transform hover:-translate-y-1 transition-all duration-300")}>
                        {/* Featured Badge */}
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0f1419] border border-accent/40 text-accent px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest z-30 shadow-lg whitespace-nowrap">
                            Tecnología + IA
                        </div>

                        <div className="relative h-48 w-full shrink-0 overflow-hidden rounded-t-[inherit]">
                            <NextImage
                                src="/services/orientacion.avif"
                                alt="Orientación Vocacional"
                                fill
                                style={{ objectFit: "cover" }}
                                className="group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0f1419] to-transparent opacity-90" />
                        </div>
                        <CardContent className="p-8 flex flex-col flex-1 relative z-10 -mt-2">
                            <h3 className="font-bold text-xl mb-3 text-white">
                                Orientación Vocacional
                            </h3>
                            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                                Claridad, seguimiento y lenguaje simple para decisiones complejas.
                            </p>
                            <ul className="space-y-3 mb-8">
                                {["Evaluación 360° con IA", "Sesiones 1 a 1", "App de resultados", "Ruta de carrera"].map((item, i) => (
                                    <li key={i} className="flex gap-2.5 items-start text-sm text-foreground/80">
                                        <span className="text-accent mt-0.5"><IconCheck className="w-4 h-4" /></span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-auto">
                                <Button asChild variant="accent" fullWidth className="font-bold shadow-lg shadow-accent/20 hover:shadow-accent/40">
                                    <Link
                                        href="https://app.universoexplora.tech"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Iniciar Explora
                                        <IconExternalLink className="ml-2 w-4 h-4" />
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    );
}
