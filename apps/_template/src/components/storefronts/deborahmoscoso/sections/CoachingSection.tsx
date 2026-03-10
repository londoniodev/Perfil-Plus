"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@alvarosky/ui";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight } from "lucide-react";

const benefits = [
    "Planes de Entrenamiento Personalizados",
    "Guía de Nutrición y Macros Científica",
    "Check-ins Semanales de Alto Impacto",
    "Soporte Directo y Seguimiento Diario",
    "Acceso a la Comunidad Elite",
    "Estrategias de Mentalidad Ganadora"
];

export function CoachingSection() {
    return (
        <section className="py-32 bg-zinc-950 relative w-full w-screen max-w-[100vw] overflow-hidden font-lexend">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-fuchsia-500/30 to-transparent" />

            <div className="container px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="relative"
                    >
                        <div className="relative aspect-[3/4] rounded-[3rem] overflow-hidden border border-zinc-800 shadow-[0_0_50px_rgba(217,70,239,0.1)]">
                            <img
                                src="https://images.unsplash.com/photo-1594381898411-846e7d193883?q=80&w=1974&auto=format&fit=crop"
                                alt="Deborah Moscoso Elite Coach"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-80" />
                            <div className="absolute bottom-10 left-10 right-10 p-8 bg-zinc-900/40 backdrop-blur-xl rounded-[2rem] border border-white/5">
                                <p className="text-white font-bold italic mb-4 leading-relaxed tracking-tight text-lg">
                                    "Tu transformación no es una opción, es un compromiso con tu excelencia. Hagámoslo realidad."
                                </p>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-px bg-fuchsia-500" />
                                    <p className="text-fuchsia-500 text-xs font-black uppercase tracking-[0.3em]">DEBORAH MOSCOSO</p>
                                </div>
                            </div>
                        </div>
                        {/* Dramatic Lighting Overlay */}
                        <div className="absolute -top-20 -left-20 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-[120px]" />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="text-fuchsia-600 font-black uppercase tracking-[0.4em] text-[10px] mb-6 block">
                            Transformation Coaching
                        </span>
                        <h2 className="text-5xl md:text-7xl font-black text-white mb-8 leading-[0.9] tracking-tighter">
                            ELITE <span className="text-fuchsia-500 italic">COACHING</span> EXPERIENCE
                        </h2>
                        <p className="text-zinc-400 text-lg md:text-xl mb-10 leading-relaxed opacity-80">
                            No es solo un plan de entrenamiento. Es una reingeniería completa de tu físico, nutrición y mentalidad para alcanzar un nivel de rendimiento que nunca pensaste posible.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-12 mb-12">
                            {benefits.map((benefit) => (
                                <div key={benefit} className="flex items-center gap-4 group">
                                    <div className="w-6 h-6 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center group-hover:bg-fuchsia-500 group-hover:text-white transition-all duration-300">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                    </div>
                                    <span className="text-zinc-300 font-bold text-sm tracking-tight">{benefit}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-8">
                            <Button asChild className="w-full sm:w-auto bg-fuchsia-600 hover:bg-fuchsia-700 text-white h-16 px-12 rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-fuchsia-900/20 group">
                                <Link href="/servicios" className="flex items-center gap-3">
                                    Apply Now <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                                </Link>
                            </Button>
                            <div className="flex -space-x-4">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="w-10 h-10 rounded-full border-2 border-zinc-950 bg-zinc-800 flex items-center justify-center overflow-hidden">
                                        <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="Student" />
                                    </div>
                                ))}
                                <div className="w-10 h-10 rounded-full border-2 border-zinc-950 bg-zinc-900 flex items-center justify-center text-[10px] font-bold text-white">
                                    +5k
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
