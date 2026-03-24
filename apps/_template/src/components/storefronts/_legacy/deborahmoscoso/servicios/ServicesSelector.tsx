"use client";

import Link from "next/link";
import { Button } from "@alvarosky/ui";
import {
    Card,
    CardContent,
    IconHeart,
    IconCheck,
    IconCalendar,
    IconUsers,
} from "@alvarosky/ui";
import { cn } from "@/lib/utils";
import { GLASS_CARD_STYLES } from "@/constants/styles";

import { Activity, ArrowRight, ShieldCheck, Dumbbell } from "lucide-react";

const FeatureList = ({ items, iconColor = "var(--primary)" }: { items: string[], iconColor?: string }) => (
    <ul className="flex flex-col gap-3 text-left">
        {items.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-sm">
                <span className="mt-0.5 shrink-0" style={{ color: iconColor }}>
                    <IconCheck className="w-5 h-5" />
                </span>
                <span className="text-zinc-300 leading-relaxed">{item}</span>
            </li>
        ))}
    </ul>
);

export function ServicesSelector() {
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
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="container mx-auto relative z-10 px-4">
                <div
                    className="max-w-4xl mx-auto text-center"
                >
                    <div className="mb-6">
                        <span className="px-4 py-1.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-wider inline-block">
                            Respaldo Profesional
                        </span>
                    </div>

                    <h1
                        className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight leading-tight"
                    >
                        Bienestar 360° con <span className="text-blue-500">Ciencia Real</span>
                    </h1>

                    <p
                        className="text-lg md:text-xl text-zinc-300 mb-10 leading-relaxed max-w-3xl mx-auto opacity-90"
                    >
                        No solo tengo las ganas, tengo el conocimiento para acompañarte. Mi asesoría no se basa en modas, sino en ciencia y experiencia clínica demostrable.
                    </p>
                </div>

                <div
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mt-12 mb-20"
                >
                    <div>
                        <Card className={cn(GLASS_CARD_STYLES, "h-full hover:bg-white/[0.06] border-blue-500/10 hover:border-blue-500/30 transition-colors relative overflow-hidden group")}>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-full pointer-events-none group-hover:bg-blue-500/10 transition-colors" />
                            <CardContent className="pt-8 px-8 pb-8 flex flex-col h-full relative z-10">
                                <div className="w-14 h-14 rounded-full flex items-center justify-center bg-blue-500/10 text-blue-500 mb-6 group-hover:scale-110 transition-transform">
                                    <ShieldCheck className="w-7 h-7" />
                                </div>
                                <h3 className="font-bold text-2xl mb-4 text-white">Farmacéutica y Nutrición</h3>
                                <p className="text-zinc-400 leading-relaxed mb-6 flex-grow">
                                    Diseño planes nutricionales fundamentados en la bioquímica de tu cuerpo para entender exactamente qué necesitas a nivel celular y metabólico.
                                </p>
                                <div className="mt-auto">
                                    <FeatureList iconColor="rgb(59 130 246)" items={["Análisis metabólico celular", "Nutrición clínica", "Suplementación inteligente"]} />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div>
                        <Card className={cn(GLASS_CARD_STYLES, "h-full hover:bg-white/[0.06] border-fuchsia-500/10 hover:border-fuchsia-500/30 transition-colors relative overflow-hidden group")}>
                            <div className="absolute inset-0 bg-gradient-to-b from-fuchsia-500/5 to-transparent pointer-events-none" />
                            <CardContent className="pt-8 px-8 pb-8 flex flex-col h-full relative z-10">
                                <div className="w-14 h-14 rounded-full flex items-center justify-center bg-fuchsia-500/20 text-fuchsia-400 mb-6 shadow-[0_0_15px_rgba(217,70,239,0.3)] group-hover:scale-110 transition-transform">
                                    <Activity className="w-7 h-7" />
                                </div>
                                <h3 className="font-bold text-2xl mb-4 text-white">Coach en Menopausia</h3>
                                <p className="text-zinc-400 leading-relaxed mb-6 flex-grow">
                                    Acompañamiento especializado en una etapa vital de transformación femenina. Aprenderemos a gestionar síntomas, peso y energía con ciencia.
                                </p>
                                <div className="mt-auto">
                                    <FeatureList iconColor="rgb(217 70 239)" items={["Equilibrio hormonal natural", "Gestión de peso resistente", "Soporte cognitivo y anímico"]} />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div>
                        <Card className={cn(GLASS_CARD_STYLES, "h-full hover:bg-white/[0.06] border-fuchsia-500/10 hover:border-fuchsia-500/30 transition-colors relative overflow-hidden group")}>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/5 rounded-bl-full pointer-events-none group-hover:bg-fuchsia-500/10 transition-colors" />
                            <CardContent className="pt-8 px-8 pb-8 flex flex-col h-full relative z-10">
                                <div className="w-14 h-14 rounded-full flex items-center justify-center bg-fuchsia-500/10 text-fuchsia-500 mb-6 group-hover:scale-110 transition-transform">
                                    <Dumbbell className="w-7 h-7" />
                                </div>
                                <h3 className="font-bold text-2xl mb-4 text-white">Entrenamiento Personal</h3>
                                <p className="text-zinc-400 leading-relaxed mb-6 flex-grow">
                                    Porque un cuerpo fuerte sostiene una mente imparable. Rutinas estructuradas para longevidad, fuerza y composición corporal.
                                </p>
                                <div className="mt-auto">
                                    <FeatureList iconColor="rgb(217 70 239)" items={["Fuerza adaptada a mujeres", "Recomposición corporal", "Prevención de lesiones"]} />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <div
                    className="max-w-3xl mx-auto rounded-3xl bg-zinc-900 border border-zinc-800 p-8 md:p-12 text-center shadow-2xl relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">¿Lista para tu transformación?</h2>
                    <p className="text-zinc-400 mb-8 max-w-xl mx-auto text-lg">
                        Te ayudo a moldear tus hábitos para que tu salud sea el motor de tus sueños, no el freno.
                    </p>

                    <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white min-w-[250px] h-14 text-lg rounded-full shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all hover:-translate-y-1">
                        <Link
                            href="https://wa.me/13055551234?text=Hola%20Deborah,%20vi%20tus%20servicios%20y%20me%20gustaría%20agendar%20una%20revisión%20inical."
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Agendar Asesoría Inical
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}
