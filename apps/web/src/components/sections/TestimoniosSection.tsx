"use client";

import { IconQuote } from "@mauromera/ui";
import { Card, CardContent } from "@mauromera/ui";
import { cn } from "@/lib/utils";
import { GLASS_CARD_STYLES } from "@/lib/constants/styles";

const testimonials = [
    {
        quote: "El proceso me ayudó a entender patrones que llevaba años repitiendo. Ahora tomo decisiones con más claridad.",
        author: "Confidencial",
        role: "Psicoterapia",
    },
    {
        quote: "Mauro logró que nuestro equipo de liderazgo conversara de lo importante, no solo de lo urgente.",
        author: "Gerente de Talento",
        role: "Sector Tech",
    },
    {
        quote: "Explora le dio a mi hijo herramientas para decidir su carrera con información real, no con ansiedad.",
        author: "Padre de familia",
        role: "Orientación Vocacional",
    },
];

export function TestimoniosSection() {
    return (
        <section className="py-20 md:py-32 bg-muted/30">
            <div className="container">
                <div className="text-center mb-16">
                    <h2 className="text-5xl md:text-6xl font-bold text-white drop-shadow-lg mb-8">Voces de la experiencia</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((test, i) => (
                        <Card key={i} className={cn(GLASS_CARD_STYLES, "p-0 relative overflow-hidden h-full")}>
                            {/* Static Icon for decoration */}
                            <IconQuote className="absolute top-4 left-4 text-white/5 text-8xl pointer-events-none select-none" />

                            <CardContent className="p-8 relative z-10 h-full flex flex-col">
                                <p className="text-lg text-muted-foreground mb-8 italic relative leading-relaxed flex-1">
                                    "{test.quote}"
                                </p>
                                <div className="border-t border-white/5 pt-4">
                                    <p className="font-bold text-white mb-1.5 text-base">{test.author}</p>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-muted-foreground">
                                        {test.role}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
