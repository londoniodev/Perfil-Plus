"use client";

import { IconQuote } from "@/components/ui/Icons";
import styles from "@/styles/sections.module.css";
import { Card, CardContent } from "@/components/ui/Card";
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
        <section className={`${styles.section} ${styles.sectionAlt}`}>
            <div className="container">
                <div className={styles.sectionTitle}>
                    <h2 className="section-title">Voces de la experiencia</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((test, i) => (
                        <Card key={i} className={cn(GLASS_CARD_STYLES, "p-0 relative overflow-hidden h-full")}>
                            {/* Static Icon for decoration */}
                            <IconQuote className="absolute top-4 left-4 text-white/5 text-8xl pointer-events-none select-none" />

                            <CardContent className="p-8 relative z-10 h-full flex flex-col">
                                <p className="text-lg text-foreground-muted mb-8 italic relative leading-relaxed flex-1">
                                    "{test.quote}"
                                </p>
                                <div className="border-t border-white/5 pt-4">
                                    <p className="font-bold text-white mb-1.5 text-base">{test.author}</p>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-foreground-muted/80">
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
