"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@alvarosky/ui";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight } from "lucide-react";

const benefits = [
    "Planes de Entrenamiento Personalizados",
    "Guía de Nutrición y Macros",
    "Check-ins Semanales de Progreso",
    "Soporte Directo vía WhatsApp",
    "Acceso a la Comunidad Exclusiva",
    "Estrategias de Mentalidad Ganadora"
];

export function CoachingSection() {
    return (
        <section className="py-24 bg-zinc-900/50 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />

            <div className="container px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="relative"
                    >
                        <div className="relative aspect-[4/5] rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl">
                            {/* Placeholder for Deborah's Image */}
                            <div className="absolute inset-0 bg-zinc-800 flex items-center justify-center">
                                <span className="text-zinc-700 font-bold text-2xl uppercase tracking-tighter opacity-20">Deborah Moscoso Portrait</span>
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent" />
                            <div className="absolute bottom-6 left-6 right-6 p-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
                                <p className="text-white font-medium italic mb-2">
                                    "Mi misión es ayudarte a descubrir la versión más fuerte y saludable de ti mismo, sin soluciones temporales, solo resultados reales."
                                </p>
                                <p className="text-emerald-400 text-sm font-bold">— Deborah Moscoso</p>
                            </div>
                        </div>
                        {/* Decorative Elements */}
                        <div className="absolute -top-6 -left-6 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl" />
                        <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl" />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="text-sm font-semibold text-emerald-500 uppercase tracking-widest mb-3">
                            Coaching Transformacional
                        </h2>
                        <h3 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                            Mucho Más que un <span className="text-emerald-500">Plan de Entrenamiento</span>
                        </h3>
                        <p className="text-zinc-400 text-lg mb-8 leading-relaxed">
                            No se trata solo de levantar pesas o contar calorías. Es un enfoque de 360 grados
                            diseñado para integrar el fitness en tu estilo de vida de manera sostenible y poderosa.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                            {benefits.map((benefit) => (
                                <div key={benefit} className="flex items-center gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                                    <span className="text-zinc-300 font-medium">{benefit}</span>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-4">
                            <Button asChild size="lg" className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white h-14 px-10 rounded-xl text-lg group">
                                <Link href="/servicios" className="flex items-center gap-2">
                                    Postular para Coaching <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </Button>
                            <p className="text-zinc-500 text-sm">
                                * Cupos limitados para garantizar atención personalizada.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
