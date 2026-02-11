"use client";

import { Fill } from "@alvarosky/ui";
import { CoachingInquiryForm } from "@/components/forms/CoachingInquiryForm";
import { CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const programs = [
    {
        title: "Essential Transformation",
        price: "$99/mes",
        features: ["Plan de entrenamiento base", "Guía nutricional", "Soporte mensual", "Acceso comunidad"],
        highlight: false
    },
    {
        title: "Elite Performance",
        price: "$199/mes",
        features: ["Entrenamiento personalizado 100%", "Macro tracking diario", "Check-ins semanales", "Soporte WhatsApp 24/7"],
        highlight: true
    }
];

export default function ServiciosPage() {
    return (
        <Fill className="bg-zinc-950 min-h-screen font-lexend">
            <div className="py-32 text-center bg-zinc-900/50 border-b border-zinc-800 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(217,70,239,0.1)_0%,transparent_70%)] opacity-50" />
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="relative z-10 container"
                >
                    <h1 className="text-6xl md:text-8xl font-black text-white mb-6 tracking-tighter uppercase italic">Programas de <span className="text-fuchsia-500">Coaching</span></h1>
                    <p className="text-zinc-400 max-w-2xl mx-auto text-lg md:text-xl font-bold uppercase tracking-widest opacity-80">
                        Diseñados para aquellos que están listos para elevar sus estándares y transformar su cuerpo y mente.
                    </p>
                </motion.div>
            </div>

            <div className="container px-4 py-24">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={{
                        hidden: { opacity: 0 },
                        visible: {
                            opacity: 1,
                            transition: { staggerChildren: 0.2 }
                        }
                    }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-32 max-w-5xl mx-auto"
                >
                    {programs.map((program) => (
                        <motion.div
                            key={program.title}
                            variants={{
                                hidden: { opacity: 0, y: 30 },
                                visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
                            }}
                            className={`p-12 rounded-[3rem] border-2 transition-all duration-500 ${program.highlight ? 'border-fuchsia-600 bg-fuchsia-600/5 shadow-2xl shadow-fuchsia-900/10' : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'} flex flex-col`}
                        >
                            <h3 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter">{program.title}</h3>
                            <p className="text-fuchsia-500 font-black text-5xl mb-8 tracking-tighter">{program.price}</p>
                            <ul className="space-y-6 mb-12 flex-1">
                                {program.features.map((feature) => (
                                    <li key={feature} className="flex items-center gap-4 text-zinc-300 font-bold">
                                        <CheckCircle2 className="w-6 h-6 text-fuchsia-500 flex-shrink-0" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            <div className="h-px bg-zinc-800/50 mb-8" />
                            <p className="text-[10px] text-zinc-500 text-center font-black uppercase tracking-[0.2em] italic">Aplica abajo para verificar disponibilidad</p>
                        </motion.div>
                    ))}
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1 }}
                    id="apply"
                >
                    <CoachingInquiryForm />
                </motion.div>
            </div>
        </Fill>
    );
}
