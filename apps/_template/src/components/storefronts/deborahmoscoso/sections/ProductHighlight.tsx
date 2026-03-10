"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@alvarosky/ui";
import { motion } from "framer-motion";
import { ChevronRight, ShoppingBag } from "lucide-react";

const categories = [
    {
        title: "Suplementos Premium",
        description: "Eleva tu rendimiento con nuestra línea de suplementación de alta pureza.",
        image: "/images/category-supplements.jpg", // Placeholder
        href: "/tienda?category=suplementos",
        color: "bg-fuchsia-500/10",
        borderColor: "border-fuchsia-500/20"
    },
    {
        title: "Cuidado Masculino",
        description: "Rutinas simplificadas y efectivas para el hombre moderno.",
        image: "/images/category-male.jpg", // Placeholder
        href: "/tienda?category=man",
        color: "bg-blue-500/10",
        borderColor: "border-blue-500/20"
    },
    {
        title: "Cuidado Femenino",
        description: "Nutrición y cuidado diseñado específicamente para la mujer activa.",
        image: "/images/category-female.jpg", // Placeholder
        href: "/tienda?category=woman",
        color: "bg-rose-500/10",
        borderColor: "border-rose-500/20"
    }
];

export function ProductHighlight() {
    return (
        <section className="py-24 bg-zinc-950 w-full w-screen max-w-[100vw] overflow-x-hidden">
            <div className="container px-4">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                    <div className="max-w-2xl">
                        <h2 className="text-sm font-semibold text-fuchsia-500 uppercase tracking-widest mb-3">
                            Nuestras Colecciones
                        </h2>
                        <h3 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Equípate para la <span className="text-zinc-500 italic">Excelencia</span>
                        </h3>
                        <p className="text-zinc-400 text-lg">
                            Productos seleccionados y desarrollados para acompañar tu proceso de transformación física y mental.
                        </p>
                    </div>
                    <Button asChild variant="ghost" className="text-fuchsia-400 hover:text-fuchsia-300 hover:bg-fuchsia-500/10">
                        <Link href="/tienda" className="flex items-center gap-2">
                            Ver Toda la Tienda <ChevronRight className="w-4 h-4" />
                        </Link>
                    </Button>
                </div>

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={{
                        hidden: { opacity: 0 },
                        visible: {
                            opacity: 1,
                            transition: {
                                staggerChildren: 0.15
                            }
                        }
                    }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-8"
                >
                    {categories.map((category) => (
                        <motion.div
                            key={category.title}
                            variants={{
                                hidden: { opacity: 0, y: 30 },
                                visible: {
                                    opacity: 1,
                                    y: 0,
                                    transition: { duration: 0.8, ease: "easeOut" }
                                }
                            }}
                            className={`group relative overflow-hidden rounded-3xl border ${category.borderColor} ${category.color} p-8 flex flex-col h-[450px] transition-all hover:shadow-2xl hover:shadow-fuchsia-500/5`}
                        >
                            <div className="flex-1">
                                <h4 className="text-2xl font-bold text-white mb-3">{category.title}</h4>
                                <p className="text-zinc-400 leading-relaxed mb-6">
                                    {category.description}
                                </p>
                                <div className="relative w-full aspect-square max-w-[200px] mx-auto opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-transform duration-500">
                                    {/* Placeholder icon/image */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <ShoppingBag className="w-24 h-24 text-white/10" />
                                    </div>
                                </div>
                            </div>

                            <Button asChild className="w-full bg-white text-zinc-950 hover:bg-zinc-200 mt-auto rounded-xl">
                                <Link href={category.href}>
                                    Explorar Colección
                                </Link>
                            </Button>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
