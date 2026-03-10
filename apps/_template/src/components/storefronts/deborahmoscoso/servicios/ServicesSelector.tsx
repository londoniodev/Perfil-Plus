"use client";

import Link from "next/link";
import { Button } from "@alvarosky/ui";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    IconHeart,
    IconCheck,
    IconCalendar,
    IconUsers,
} from "@alvarosky/ui";
import { cn } from "@/lib/utils";
import { GLASS_CARD_STYLES } from "@/constants/styles";

const SectionHeading = ({ title, subtitle }: { title: string; subtitle: string }) => (
    <div className="text-center mb-12">
        <h2 className="heading-h2 mb-4">{title}</h2>
        <p className="text-body max-w-2xl mx-auto">
            {subtitle}
        </p>
    </div>
);

const FeatureList = ({ items, iconColor = "var(--primary)" }: { items: string[], iconColor?: string }) => (
    <ul className="flex flex-col gap-3 text-left">
        {items.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-sm">
                <span className="mt-0.5 shrink-0" style={{ color: iconColor }}>
                    <IconCheck className="w-4 h-4" />
                </span>
                <span className="text-foreground/90">{item}</span>
            </li>
        ))}
    </ul>
);

export function ServicesSelector() {
    return (
        <section className="relative pb-20 pt-16 md:pb-32 md:pt-24 overflow-hidden">
            <div className="container relative z-10">
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <SectionHeading
                        title="Programas de Coaching y Nutrición"
                        subtitle="Transforma tu cuerpo y tu mente con acompañamiento integral, planes personalizados y la mejor suplementación."
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                        <Card className={cn(GLASS_CARD_STYLES, "h-full hover:bg-white/[0.06]")}>
                            <CardContent className="pt-8 px-6 pb-6 text-center flex flex-col items-center h-full">
                                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-fuchsia-500/10 text-fuchsia-500 mb-4 text-2xl">
                                    <IconHeart />
                                </div>
                                <h3 className="font-bold text-lg mb-2 text-fuchsia-500">Coaching Integral</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                                    Entrenamiento diseñado a tu medida con seguimiento 1 a 1 para asegurar tu progreso.
                                </p>
                                <div className="text-left w-full mt-auto">
                                    <FeatureList iconColor="rgb(217 70 239)" items={["Ajustes semanales", "Rutinas en video", "Contacto directo via WhatsApp"]} />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className={cn(GLASS_CARD_STYLES, "h-full hover:bg-white/[0.06]")}>
                            <CardContent className="pt-8 px-6 pb-6 text-center flex flex-col items-center h-full">
                                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-500/10 text-blue-500 mb-4 text-2xl">
                                    <IconUsers />
                                </div>
                                <h3 className="font-bold text-lg mb-2 text-blue-500">Planes de Nutrición</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                                    Aprende a comer sano sin dejar lo que te gusta. Planes adaptados a tus objetivos (pérdida de peso, aumento de masa).
                                </p>
                                <div className="text-left w-full mt-auto">
                                    <FeatureList iconColor="rgb(59 130 246)" items={["Recetas fáciles y rápidas", "Lista de compras", "Cálculo preciso de macros"]} />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="text-center">
                        <Button asChild size="lg" className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white min-w-[250px] shadow-lg hover:shadow-xl hover:shadow-fuchsia-500/20 transition-all hover:-translate-y-1">
                            <Link
                                href="https://wa.me/13055551234?text=Hola,%20me%20interesa%20empezar%20mi%20transformación."
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <IconCalendar className="mr-2 h-5 w-5" />
                                Agendar Asesoría Inical
                            </Link>
                        </Button>
                        <p className="text-sm text-muted-foreground mt-3">
                            Cupos limitados disponibles para el mes actual.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
