"use client";

import { Card, CardContent } from "@alvarosky/ui";

import { Award, Star, Plane, Crown, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { GLASS_CARD_STYLES } from "@/constants/styles";

export function LogrosContent() {
    const fadeIn = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    const stagger = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.3
            }
        }
    };

    // Generic placeholder component
    const ImagePlaceholder = ({ label }: { label: string }) => (
        <div className="w-full aspect-video md:aspect-[4/3] bg-zinc-800/50 rounded-2xl border border-zinc-700/50 flex flex-col items-center justify-center text-zinc-500 overflow-hidden relative group">
            <ImageIcon className="w-12 h-12 mb-3 opacity-50 group-hover:scale-110 transition-transform duration-500" />
            <span className="text-sm font-medium tracking-wide uppercase">{label}</span>
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer" />
        </div>
    );

    return (
        <section className="relative w-full w-screen max-w-[100vw] min-h-[100dvh] bg-zinc-950 overflow-x-hidden pt-24 pb-32">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[150px] pointer-events-none" />
            <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[150px] pointer-events-none" />

            <div className="container mx-auto relative z-10 px-4">
                <div
                    className="max-w-4xl mx-auto text-center mb-20"
                >
                    <div className="mb-6">
                        <span className="px-4 py-1.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-wider inline-block">
                            Trayectoria de Éxito
                        </span>
                    </div>

                    <h1
                        className="text-4xl md:text-5xl lg:text-7xl font-black text-white mb-6 tracking-tight leading-tight"
                    >
                        Mis <span className="text-amber-500">Logros</span>
                    </h1>

                    <p
                        className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed"
                    >
                        Cada reconocimiento es el reflejo de vidas impactadas, líderes desarrollados y una promesa de libertad cumplida a través de la disciplina.
                    </p>
                </div>

                <div className="max-w-6xl mx-auto space-y-24">
                    {/* Logro 1: Círculos de Oro */}
                    <div
                        className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
                    >
                        <div className="order-2 lg:order-1">
                            <ImagePlaceholder label="Imagen: 2 Círculos de Oro" />
                        </div>
                        <div className="order-1 lg:order-2 flex flex-col justify-center">
                            <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 mb-6 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                                <Award className="w-8 h-8" />
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ganadora de 2 Círculos de Oro</h2>
                            <p className="text-lg text-zinc-400 leading-relaxed mb-6">
                                El Círculo de Oro no es solo un galardón, es el símbolo de haber construido una organización masiva, sólida y altamente productiva. Es la recompensa al trabajo incansable, la duplicación exponencial y el compromiso inquebrantable con el equipo.
                            </p>
                        </div>
                    </div>

                    {/* Logro 2: Life Platino */}
                    <div
                        className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
                    >
                        <div className="order-1 flex flex-col justify-center">
                            <div className="w-16 h-16 rounded-full bg-slate-200/20 flex items-center justify-center text-slate-300 mb-6 shadow-[0_0_30px_rgba(203,213,225,0.1)]">
                                <Crown className="w-8 h-8" />
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Life Platino</h2>
                            <p className="text-lg text-zinc-400 leading-relaxed mb-6">
                                Alcanzar el rango de Platino representa llegar a las grandes ligas del liderazgo empresarial en Lifehuni. Significa llevar a cientos de personas hacia su propia independencia, demostrando que con una visión clara, los resultados extraordinarios son inevitables.
                            </p>
                        </div>
                        <div className="order-2">
                            <ImagePlaceholder label="Imagen: Life Platino / Rango" />
                        </div>
                    </div>

                    {/* Logro 3: Extravaganzas */}
                    <div
                        className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
                    >
                        <div className="order-2 lg:order-1">
                            <ImagePlaceholder label="Imagen: Extravaganzas (Eventos masivos)" />
                        </div>
                        <div className="order-1 lg:order-2 flex flex-col justify-center">
                            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                                <Star className="w-8 h-8" />
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">2 Extravaganzas Internacionales</h2>
                            <p className="text-lg text-zinc-400 leading-relaxed mb-6">
                                Las Extravaganzas son el corazón de nuestra cultura. Estar calificada a dos de estos magnos eventos valida la consistencia en el cumplimiento de metas supremas. Es la celebración dorada del crecimiento continuo junto a miles de líderes en los mejores escenarios y convenciones globales.
                            </p>
                        </div>
                    </div>

                    {/* Logro 4: Turquía */}
                    <div
                        className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
                    >
                        <div className="order-1 flex flex-col justify-center">
                            <div className="w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 mb-6 shadow-[0_0_30px_rgba(6,182,212,0.2)]">
                                <Plane className="w-8 h-8" />
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Calificación a Turquía</h2>
                            <p className="text-lg text-zinc-400 leading-relaxed mb-6">
                                Más que un viaje, Turquía simboliza la expansión de fronteras. Ganar el incentivo internacional de mayor prestigio materializa la promesa de que el empoderamiento y el trabajo duro te recompensan conociendo el mundo en condiciones de absoluta abundancia.
                            </p>
                        </div>
                        <div className="order-2">
                            <ImagePlaceholder label="Imagen: Viaje a Turquía" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
