"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/Card";
import { IconCheck } from "@/components/ui/Icons";
import { GLASS_CARD_STYLES } from "@/lib/constants/styles";

interface PricingCardProps {
    onSubscribe: () => void;
    processing: boolean;
}

/**
 * Características del plan de suscripción.
 */
const features = [
    "Acceso a todos los cursos premium",
    "Lecciones en video HD",
    "Evaluaciones y certificaciones",
    "Contenido exclusivo del blog",
    "Material de apoyo descargable",
    "Soporte prioritario",
];

/**
 * Tarjeta de precios para suscripción mensual.
 */
export default function PricingCard({ onSubscribe, processing }: PricingCardProps) {
    return (
        <Card className={cn("w-full max-w-[380px] mx-auto", GLASS_CARD_STYLES)}>
            <CardHeader className="text-center pb-4 pt-8">
                <h2 className="text-sm font-bold text-primary-light uppercase tracking-widest mb-2">
                    Plan Mensual
                </h2>
                <div className="flex items-baseline justify-center">
                    <span className="text-2xl font-light text-foreground-muted mr-1">US$</span>
                    <span className="text-5xl font-black text-white tracking-tight">15</span>
                    <span className="text-lg text-foreground-muted ml-2">/mes</span>
                </div>
            </CardHeader>

            <CardContent className="px-8 pb-8">
                {/* Separador sutil */}
                <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8" />

                <ul className="space-y-4 mb-8">
                    {features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3 text-sm">
                            <div className="mt-0.5 min-w-[18px]">
                                <IconCheck className="w-5 h-5 text-accent" />
                            </div>
                            <span className="text-foreground/90 leading-relaxed">
                                {feature}
                            </span>
                        </li>
                    ))}
                </ul>

                <Button
                    onClick={onSubscribe}
                    fullWidth
                    disabled={processing}
                    className="w-full py-6 text-base font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all"
                >
                    {processing ? "Procesando..." : "Suscribirme ahora"}
                </Button>

                <p className="text-xs text-foreground-muted text-center mt-4 px-2 leading-relaxed opacity-70">
                    Pago seguro con Mercado Pago. Puedes cancelar cuando quieras.
                </p>
            </CardContent>
        </Card>
    );
}
