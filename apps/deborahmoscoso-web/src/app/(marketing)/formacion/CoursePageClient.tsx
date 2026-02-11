"use client";

import { motion } from "framer-motion";
import { ArrowRight, Star, Clock, Users, PlayCircle, Filter } from "lucide-react";
import { Button } from "@alvarosky/ui";
import Link from "next/link";

interface CoursePageClientProps {
    courses: any[];
    stats: any[];
}

export function CoursePageClient({ courses, stats }: CoursePageClientProps) {
    return (
        <div className="bg-zinc-950 min-h-screen">
            {/* Immersive Hero Section */}
            <section className="relative h-[70vh] flex items-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1548691905-57c36cc8d93f?q=80&w=2069&auto=format&fit=crop"
                        alt="Fitness Training"
                        className="w-full h-full object-cover opacity-40"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
                </div>

                <div className="container px-4 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="max-w-3xl"
                    >
                        <span className="text-fuchsia-500 font-black uppercase tracking-[0.3em] text-xs mb-6 block italic">
                            Deborah Moscoso Academy
                        </span>
                        <h1 className="text-6xl md:text-8xl font-black text-white mb-8 tracking-tighter leading-none">
                            ENTRENA CON <br />
                            <span className="text-fuchsia-500 italic">LA ELITE</span>
                        </h1>
                        <p className="text-zinc-400 text-lg md:text-xl max-w-xl mb-10 leading-relaxed">
                            Programas de entrenamiento diseñados científicamente para maximizar tu potencial físico y mental. Sin rodeos, solo resultados.
                        </p>
                        <div className="flex gap-4">
                            <Button size="lg" className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white rounded-2xl px-8 h-14 font-bold uppercase tracking-widest text-xs">
                                Ver Programas
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Stats Bar */}
            <section className="bg-zinc-900 border-y border-zinc-800 py-12">
                <div className="container px-4">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={{
                            hidden: { opacity: 0 },
                            visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
                        }}
                        className="grid grid-cols-2 lg:grid-cols-4 gap-8"
                    >
                        {stats.map((stat) => (
                            <motion.div
                                key={stat.label}
                                variants={{
                                    hidden: { opacity: 0, y: 10 },
                                    visible: { opacity: 1, y: 0 }
                                }}
                                className="text-center group"
                            >
                                <div className="text-4xl md:text-5xl font-black text-fuchsia-600 mb-2 group-hover:scale-110 transition-transform">
                                    {stat.value}
                                </div>
                                <div className="text-zinc-500 text-sm font-bold uppercase tracking-widest">
                                    {stat.label}
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            <div id="programas" className="container px-4 py-32">
                {/* Elite Training Programs Section */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8"
                >
                    <div>
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 relative inline-block">
                            Elite Training Programs
                            <div className="absolute -bottom-2 left-0 w-24 h-1 bg-fuchsia-600" />
                        </h2>
                    </div>
                    <p className="text-zinc-500 max-w-xs text-right text-sm leading-relaxed">
                        Cada programa incluye acceso vitalicio, soporte de la comunidad y plan nutricional personalizado.
                    </p>
                </motion.div>

                {/* Improved Course Grid */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={{
                        hidden: { opacity: 0 },
                        visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
                    }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    {courses.map((course) => (
                        <motion.div
                            key={course.id}
                            variants={{
                                hidden: { opacity: 0, y: 30 },
                                visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
                            }}
                            className="group bg-zinc-900/50 border border-zinc-800 rounded-3xl overflow-hidden flex flex-col hover:border-fuchsia-500/30 transition-all duration-500"
                        >
                            <div className="relative h-72 overflow-hidden">
                                <img
                                    src={course.coverImage || "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop"}
                                    alt={course.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-zinc-950/20 group-hover:bg-zinc-950/0 transition-colors" />
                                {course.isFree && (
                                    <div className="absolute top-6 left-6 bg-fuchsia-600 text-white text-[10px] font-black tracking-widest px-3 py-1 rounded-full">
                                        FREE ACCESS
                                    </div>
                                )}
                            </div>

                            <div className="p-8 flex-1 flex flex-col">
                                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-fuchsia-500 transition-colors">
                                    {course.title}
                                </h3>
                                <p className="text-zinc-500 text-sm mb-8 leading-relaxed line-clamp-2">
                                    {course.description}
                                </p>

                                <div className="mt-auto border-t border-zinc-800 pt-6">
                                    <Button asChild className="w-full bg-fuchsia-600 hover:bg-fuchsia-500 text-white h-14 rounded-2xl group/btn">
                                        <Link href={`/formacion/${course.slug}`} className="flex items-center justify-center gap-2 font-bold uppercase tracking-widest text-xs">
                                            Inscribirse Ahora <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}
