"use client";

import Link from "next/link";
import { Button } from "@alvarosky/ui";
import { motion } from "framer-motion";

export function HeroSection() {
    return (
        <section className="relative w-full w-screen max-w-[100vw] min-h-[90vh] flex items-center justify-center overflow-hidden bg-zinc-950">
            {/* Immersive Background */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop"
                    alt="Deborah Moscoso"
                    className="w-full h-full object-cover opacity-30"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-950/60 to-zinc-950 z-10" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(217,70,239,0.15)_0%,transparent_70%)]" />
            </div>

            <div className="container relative z-20 px-4 pt-20 text-center">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: { opacity: 0 },
                        visible: {
                            opacity: 1,
                            transition: {
                                staggerChildren: 0.2,
                                delayChildren: 0.3
                            }
                        }
                    }}
                    className="max-w-4xl mx-auto"
                >
                    <motion.h1
                        variants={{
                            hidden: { opacity: 0, y: 40 },
                            visible: { opacity: 1, y: 0, transition: { duration: 1, ease: [0.22, 1, 0.36, 1] } }
                        }}
                        className="text-5xl md:text-7xl lg:text-[8rem] font-black tracking-tighter text-white mb-8 leading-[0.9]"
                    >
                        COACHING & <br />
                        <span className="text-fuchsia-500 italic">SUPLEMENTACIÓN</span>
                    </motion.h1>
                    <motion.p
                        variants={{
                            hidden: { opacity: 0, y: 20 },
                            visible: { opacity: 0.8, y: 0, transition: { duration: 0.8 } }
                        }}
                        className="text-xl md:text-2xl text-zinc-300 mb-12 max-w-2xl mx-auto leading-relaxed opacity-80"
                    >
                        Programas de coaching de alto rendimiento, planes de nutrición personalizados y tienda oficial de suplementación premium.
                    </motion.p>
                    <motion.div
                        variants={{
                            hidden: { opacity: 0, scale: 0.9 },
                            visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
                        }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <Button asChild size="lg" className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white min-w-[200px] h-14 text-lg rounded-full">
                            <Link href="/servicios">
                                Comienza Tu Transformación
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="lg" className="border-fuchsia-500/50 text-fuchsia-400 hover:bg-fuchsia-500/10 min-w-[200px] h-14 text-lg rounded-full">
                            <Link href="/tienda">
                                Explorar Tienda
                            </Link>
                        </Button>
                    </motion.div>
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
