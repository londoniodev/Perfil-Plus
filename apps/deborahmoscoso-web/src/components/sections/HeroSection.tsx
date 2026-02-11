"use client";

import Link from "next/link";
import { Button } from "@alvarosky/ui";
import { motion } from "framer-motion";

export function HeroSection() {
    return (
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-zinc-950">
            {/* Background Overlay */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-950/50 to-zinc-950 z-10" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.1)_0%,transparent_70%)]" />
            </div>

            <div className="container relative z-20 px-4 pt-20 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-4xl mx-auto"
                >
                    <span className="inline-block px-3 py-1 mb-6 text-xs font-semibold tracking-wider text-emerald-400 uppercase bg-emerald-400/10 rounded-full border border-emerald-400/20">
                        Coaching Elite & Bienestar
                    </span>
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white mb-6">
                        Transforma Tu Vida, <br />
                        <span className="text-emerald-500">Eleva Tu Rendimiento</span>
                    </h1>
                    <p className="text-lg md:text-xl text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Coaching fitness de alto rendimiento y estrategias de bienestar integral
                        diseñadas para el éxito. El físico y la mentalidad que mereces comienzan aquí.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[200px] h-14 text-lg rounded-full">
                            <Link href="/servicios">
                                Comienza Tu Transformación
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="lg" className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 min-w-[200px] h-14 text-lg rounded-full">
                            <Link href="/tienda">
                                Explorar Tienda
                            </Link>
                        </Button>
                    </div>
                </motion.div>

                {/* Trusted By / Social Proof placeholder */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 1 }}
                    className="mt-20 pt-10 border-t border-zinc-900"
                >
                    <p className="text-sm font-medium text-zinc-500 uppercase tracking-widest mb-6">
                        Confiado por más de 500+ clientes en su camino al éxito
                    </p>
                    <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale invert">
                        {/* Logo Placeholders can go here */}
                        <div className="h-8 w-32 bg-zinc-800 rounded animate-pulse" />
                        <div className="h-8 w-32 bg-zinc-800 rounded animate-pulse" />
                        <div className="h-8 w-32 bg-zinc-800 rounded animate-pulse" />
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
