"use client";

import Image from "next/image";
import { IconBrain, IconStar, IconCpu } from "@alvarosky/ui";
import { Card } from "@alvarosky/ui";

const pillars = [
    {
        icon: <IconBrain />,
        title: "Psicología aplicada",
        desc: "Comprender lo que pasa adentro para actuar mejor afuera.",
        image: "/propuesta/propuesta_psychology.png",
        accent: "rgba(91, 141, 239, 1)",
        gradient: "linear-gradient(135deg, rgba(91, 141, 239, 0.2) 0%, rgba(58, 98, 184, 0.1) 100%)",
    },
    {
        icon: <IconStar />,
        title: "Experiencias educativas para las organizaciones",
        desc: "Talleres y programas vivenciales para el desarrollo de habilidades y competencias.",
        image: "/propuesta/propuesta_education.png",
        accent: "rgba(232, 168, 56, 1)",
        gradient: "linear-gradient(135deg, rgba(232, 168, 56, 0.2) 0%, rgba(200, 140, 40, 0.1) 100%)",
    },
    {
        icon: <IconCpu />,
        title: "Tecnología e IA",
        desc: "Claridad, seguimiento y lenguaje simple para decisiones complejas.",
        image: "/propuesta/propuesta_tech.png",
        accent: "rgba(56, 189, 189, 1)",
        gradient: "linear-gradient(135deg, rgba(56, 189, 189, 0.2) 0%, rgba(40, 150, 150, 0.1) 100%)",
    },
];

export function PropuestaSection() {
    return (
        <section className="py-20 md:py-32 bg-background">
            <div className="container">
                <div className="text-center mb-16">
                    <h2 className="text-5xl md:text-6xl font-bold text-white drop-shadow-lg mb-8">Lo humano y lo medible</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto mt-4">
                        Decisiones conscientes, cultura plena, desarrollo del talento, autoconocimiento y salud mental.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {pillars.map((item) => (
                        <Card
                            key={item.title}
                            className="group relative overflow-hidden text-center p-0 rounded-3xl border-white/10 bg-[#0a0e14]/60 hover:border-white/20 transition duration-500 shadow-2xl"
                        >
                            {/* Background Animation Layer */}
                            <div className="absolute inset-0 z-0 select-none pointer-events-none overflow-hidden rounded-3xl">
                                <div className="relative w-full h-full transform transition-transform duration-700 ease-out group-hover:scale-110 opacity-25 group-hover:opacity-40">
                                    <Image
                                        src={item.image}
                                        alt=""
                                        fill
                                        sizes="(max-width: 768px) 100vw, 400px"
                                        className="object-cover mix-blend-screen"
                                        unoptimized
                                    />
                                </div>
                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-b from-[#0f1419]/80 via-[#0f1419]/90 to-[#0f1419] z-0" />
                            </div>

                            {/* Content Layer */}
                            <div className="relative z-10 p-10 flex flex-col items-center h-full">
                                <div
                                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 backdrop-blur-sm"
                                    style={{
                                        color: item.accent,
                                        background: item.gradient,
                                        border: `1px solid ${item.accent}30`,
                                        boxShadow: `0 0 30px ${item.accent}15`,
                                    }}
                                >
                                    {item.icon}
                                </div>

                                <h3 className="text-xl font-bold mb-4 text-white group-hover:text-primary transition-colors duration-300">
                                    {item.title}
                                </h3>
                                <p className="text-muted-foreground leading-relaxed text-base">
                                    {item.desc}
                                </p>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}

