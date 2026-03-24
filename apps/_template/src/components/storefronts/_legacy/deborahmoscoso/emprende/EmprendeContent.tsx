"use client";

import Link from "next/link";
import { Button, Card, CardContent } from "@alvarosky/ui";
import { motion } from "framer-motion";
import { IconHeart, IconUsers } from "@alvarosky/ui";
import { TrendingUp, Target, Award, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { GLASS_CARD_STYLES } from "@/constants/styles";

export function EmprendeContent() {
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
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-fuchsia-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="container mx-auto relative z-10 px-4">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={stagger}
                    className="max-w-4xl mx-auto text-center"
                >
                    <motion.div variants={fadeIn} className="mb-6">
                        <span className="px-4 py-1.5 rounded-full text-xs font-semibold bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20 uppercase tracking-wider inline-block">
                            Oportunidad de Negocio
                        </span>
                    </motion.div>

                    <motion.h1
                        variants={fadeIn}
                        className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight leading-tight"
                    >
                        Lifehuni: Tu Vehículo hacia la <span className="text-fuchsia-500 italic">Libertad</span>
                    </motion.h1>

                    <motion.p
                        variants={fadeIn}
                        className="text-lg md:text-xl text-zinc-300 mb-10 leading-relaxed max-w-3xl mx-auto opacity-90"
                    >
                        ¿Te imaginas construir un patrimonio mientras recuperas tu salud? En Lifehuni no solo vendemos suplementos naturales con respaldo científico; creamos puentes hacia la independencia financiera.
                    </motion.p>
                </motion.div>

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={stagger}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-16 mb-20"
                >
                    <motion.div variants={fadeIn}>
                        <Card className={cn(GLASS_CARD_STYLES, "h-full hover:bg-white/[0.06] border-fuchsia-500/10 hover:border-fuchsia-500/30 transition-colors")}>
                            <CardContent className="pt-8 px-6 pb-6 text-center flex flex-col items-center h-full">
                                <div className="w-14 h-14 rounded-full flex items-center justify-center bg-fuchsia-500/10 text-fuchsia-500 mb-6 group-hover:scale-110 transition-transform">
                                    <TrendingUp className="w-7 h-7" />
                                </div>
                                <h3 className="font-bold text-xl mb-3 text-white">Crecimiento Real</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Yo misma pasé de tener ingresos en cero durante la pandemia a liderar de manera exitosa mi propia economía y tiempo.
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div variants={fadeIn}>
                        <Card className={cn(GLASS_CARD_STYLES, "h-full hover:bg-white/[0.06] border-fuchsia-500/10 hover:border-fuchsia-500/30 transition-colors relative overflow-hidden")}>
                            <div className="absolute inset-0 bg-gradient-to-b from-fuchsia-500/5 to-transparent pointer-events-none" />
                            <CardContent className="pt-8 px-6 pb-6 text-center flex flex-col items-center h-full relative z-10">
                                <div className="w-14 h-14 rounded-full flex items-center justify-center bg-fuchsia-500/20 text-fuchsia-400 mb-6 shadow-[0_0_15px_rgba(217,70,239,0.3)]">
                                    <IconUsers className="w-7 h-7" />
                                </div>
                                <h3 className="font-bold text-xl mb-3 text-white">Comunidad de 1000+</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Únete a un equipo gigante donde el éxito se celebra en comunidad. Formo y lidero a más de mil personas en este proyecto.
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div variants={fadeIn}>
                        <Card className={cn(GLASS_CARD_STYLES, "h-full hover:bg-white/[0.06] border-fuchsia-500/10 hover:border-fuchsia-500/30 transition-colors")}>
                            <CardContent className="pt-8 px-6 pb-6 text-center flex flex-col items-center h-full">
                                <div className="w-14 h-14 rounded-full flex items-center justify-center bg-fuchsia-500/10 text-fuchsia-500 mb-6">
                                    <Target className="w-7 h-7" />
                                </div>
                                <h3 className="font-bold text-xl mb-3 text-white">Modelo Inteligente</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    El Network Marketing ético permite vivir del 1% de 100 personas y no agotar el 100% de tu propia energía vital.
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="max-w-3xl mx-auto rounded-3xl bg-zinc-900 border border-zinc-800 p-8 md:p-12 text-center shadow-2xl relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                    <Award className="w-12 h-12 text-fuchsia-500 mx-auto mb-6" />
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">¿Estás listo para dar el salto?</h2>
                    <p className="text-zinc-400 mb-8 max-w-xl mx-auto">
                        Mi marca <strong>SoyDeborah SoySaludable</strong> es la prueba viviente de que con profesionalismo y la plataforma correcta, puedes cambiar tus resultados.
                    </p>

                    <Button asChild size="lg" className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white min-w-[250px] h-14 text-lg rounded-full shadow-[0_0_20px_rgba(217,70,239,0.4)] hover:shadow-[0_0_30px_rgba(217,70,239,0.6)] transition-all hover:-translate-y-1">
                        <Link
                            href="https://wa.me/13055551234?text=Hola%20Deborah,%20leí%20sobre%20Lifehuni%20en%20tu%20web%20y%20quiero%20conocer%20más%20sobre%20la%20oportunidad%20de%20negocio."
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Quiero ser parte del equipo
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </Link>
                    </Button>
                </motion.div>
            </div>
        </section>
    );
}
