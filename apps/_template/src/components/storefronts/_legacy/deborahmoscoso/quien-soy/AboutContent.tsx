"use client";

import Link from "next/link";
import { Button, Card, CardContent } from "@alvarosky/ui";
import { motion } from "framer-motion";
import { Heart, Compass, Shield, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { GLASS_CARD_STYLES } from "@/constants/styles";

export function AboutContent() {
    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    const stagger = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    return (
        <section className="relative w-full w-screen max-w-[100vw] min-h-[100dvh] bg-zinc-950 flex flex-col items-center overflow-x-hidden pt-24 pb-32">
            {/* Background Effects */}
            <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-fuchsia-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="container mx-auto relative z-10 px-4">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={stagger}
                    className="max-w-4xl mx-auto text-center"
                >
                    <motion.div variants={fadeIn} className="mb-6">
                        <span className="px-4 py-1.5 rounded-full text-xs font-semibold bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20 uppercase tracking-wider inline-block">
                            Mi Historia
                        </span>
                    </motion.div>

                    <motion.h1
                        variants={fadeIn}
                        className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-8 tracking-tight leading-tight"
                    >
                        Resiliencia con <span className="text-fuchsia-500 italic">Propósito</span>
                    </motion.h1>

                    <motion.div variants={fadeIn} className="prose prose-zinc prose-invert max-w-3xl mx-auto text-lg md:text-xl text-zinc-300 leading-relaxed mb-16 opacity-90 space-y-6">
                        <p>
                            Soy Deborah, una mujer que cree firmemente que las oportunidades no llegan, <strong>se crean</strong>. Mi vida ha sido un viaje de contrastes: desde la disciplina de un hogar con raíces militares y principios bíblicos, hasta los retos de ser el único sostén de mis hijos.
                        </p>
                        <p>
                            He pasado por el éxito bancario, la adrenalina del comercio internacional en Ecuador y la dureza de enfrentar deudas y extorsiones.
                        </p>
                    </motion.div>
                </motion.div>

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={stagger}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-20"
                >
                    <motion.div variants={fadeIn}>
                        <Card className={cn(GLASS_CARD_STYLES, "h-full hover:bg-white/[0.06] border-fuchsia-500/10 hover:border-fuchsia-500/30 transition-colors")}>
                            <CardContent className="pt-8 px-6 pb-6 text-center flex flex-col items-center h-full">
                                <div className="w-14 h-14 rounded-full flex items-center justify-center bg-fuchsia-500/10 text-fuchsia-500 mb-6 group-hover:scale-110 transition-transform">
                                    <Shield className="w-7 h-7" />
                                </div>
                                <h3 className="font-bold text-xl mb-3 text-white">Disciplina Intacta</h3>
                                <p className="text-sm text-zinc-400 leading-relaxed">
                                    Templada en bases sólidas, sé que la disciplina supera cualquier obstáculo, transformando crisis en cimientos.
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div variants={fadeIn}>
                        <Card className={cn(GLASS_CARD_STYLES, "h-full hover:bg-white/[0.06] border-indigo-500/10 hover:border-indigo-500/30 transition-colors relative overflow-hidden")}>
                            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />
                            <CardContent className="pt-8 px-6 pb-6 text-center flex flex-col items-center h-full relative z-10">
                                <div className="w-14 h-14 rounded-full flex items-center justify-center bg-indigo-500/20 text-indigo-400 mb-6 shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                                    <Compass className="w-7 h-7" />
                                </div>
                                <h3 className="font-bold text-xl mb-3 text-white">Liderazgo y Contrastes</h3>
                                <p className="text-sm text-zinc-400 leading-relaxed">
                                    Del mundo corporativo a liderar mi vida. Aprendí que el liderazgo no es mandar, es servir.
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div variants={fadeIn}>
                        <Card className={cn(GLASS_CARD_STYLES, "h-full hover:bg-white/[0.06] border-fuchsia-500/10 hover:border-fuchsia-500/30 transition-colors")}>
                            <CardContent className="pt-8 px-6 pb-6 text-center flex flex-col items-center h-full">
                                <div className="w-14 h-14 rounded-full flex items-center justify-center bg-fuchsia-500/10 text-fuchsia-500 mb-6 group-hover:scale-110 transition-transform">
                                    <Heart className="w-7 h-7" />
                                </div>
                                <h3 className="font-bold text-xl mb-3 text-white">Forjando Futuro</h3>
                                <p className="text-sm text-zinc-400 leading-relaxed">
                                    Hoy, tras superar mis límites, dedico mi vida a enseñarte que tu pasado no detiene tu futuro.
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                </motion.div>

                {/* --- NUEVA SECCIÓN: Mamá Luchadora --- */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={stagger}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto mb-24 mt-8"
                >
                    <motion.div variants={fadeIn} className="relative order-2 lg:order-1 flex flex-col gap-6">
                        <Card className={cn(GLASS_CARD_STYLES, "h-full bg-white/[0.02] border-fuchsia-500/10 hover:border-fuchsia-500/30 transition-colors")}>
                            <CardContent className="p-8">
                                <h3 className="font-bold text-xl mb-4 text-white flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-fuchsia-500/20 flex items-center justify-center text-fuchsia-400">
                                        <Heart className="w-5 h-5" />
                                    </div>
                                    Misión Constante
                                </h3>
                                <p className="text-zinc-400 leading-relaxed text-sm">
                                    Hoy, tras 20 años construyendo una familia unida y viendo a mis hijos volar alto, mi misión es <strong>empoderar a otras mujeres</strong>.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className={cn(GLASS_CARD_STYLES, "h-full bg-white/[0.02] border-indigo-500/10 hover:border-indigo-500/30 transition-colors")}>
                            <CardContent className="p-8">
                                <h3 className="font-bold text-xl mb-4 text-white flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                        <Shield className="w-5 h-5" />
                                    </div>
                                    El Verdadero Secreto
                                </h3>
                                <p className="text-zinc-400 leading-relaxed text-sm">
                                    Quiero demostrarte que puedes ser una madre presente y una empresaria exitosa. El secreto está en la firmeza de tus valores y la claridad de tu visión.
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div variants={fadeIn} className="relative order-1 lg:order-2">
                        <div className="absolute -inset-4 bg-gradient-to-tr from-fuchsia-500/10 to-indigo-500/20 blur-2xl rounded-full opacity-60 pointer-events-none" />
                        <div className="relative bg-zinc-900/40 border border-zinc-800/50 p-8 md:p-10 rounded-3xl backdrop-blur-md">
                            <span className="px-4 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-wider inline-block mb-6">
                                Empoderamiento Real
                            </span>
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
                                Mamá Luchadora y <span className="text-indigo-400">Líder por Naturaleza</span>
                            </h2>
                            <div className="space-y-4 text-zinc-300 leading-relaxed">
                                <p>
                                    Eduqué a mis hijos bajo la premisa de que no dependemos de nadie más que de Dios y de nuestro propio esfuerzo. Nunca busqué generar lástima; <strong>busqué generar resultados</strong>.
                                </p>
                                <p>
                                    Ser mamá ha sido mi mayor escuela de negociación, resiliencia y paciencia, forjando el carácter de la líder que soy hoy.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
                {/* ------------------------------------- */}

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="max-w-4xl mx-auto rounded-3xl bg-zinc-900 border border-zinc-800 p-8 md:p-12 text-center shadow-2xl relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">"Tu pasado no define tu futuro, pero tu disciplina sí lo hace"</h2>
                    <p className="text-zinc-400 mb-8 max-w-xl mx-auto">
                        Es el momento de reescribir tu historia. Sea en nutrición, entrenamiento o negocios, estoy aquí para mostrarte el camino desde mi propia experiencia.
                    </p>

                    <Button asChild size="lg" className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white min-w-[250px] h-14 text-lg rounded-full shadow-[0_0_20px_rgba(217,70,239,0.4)] hover:shadow-[0_0_30px_rgba(217,70,239,0.6)] transition-all hover:-translate-y-1">
                        <Link
                            href="https://wa.me/13055551234?text=Hola%20Deborah,%20leí%20tu%20historia%20y%20me%20inspira.%20Quiero%20empezar%20mi%20propio%20cambio."
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Comienza tu transformación
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </Link>
                    </Button>
                </motion.div>
            </div>
        </section>
    );
}
