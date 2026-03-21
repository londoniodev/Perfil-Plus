"use client";

import React from "react";
import { Button } from "../../button";
import { Card, CardContent, CardHeader } from "../../card";
import { Check } from "lucide-react";
import { cn } from "../../lib/utils";

// ============================================
// Types
// ============================================
export interface PricingCardProps {
    onSubscribe: () => void;
    processing: boolean;
    /** Plan name */
    planName?: string;
    /** Price amount */
    price?: number;
    /** Currency symbol */
    currency?: string;
    /** Billing period */
    period?: string;
    /** Features list */
    features?: string[];
    /** Custom glass card styles */
    glassStyles?: string;
    /** Payment provider name */
    paymentProvider?: string;
    className?: string;
}

// Default features
const DEFAULT_FEATURES = [
    "Acceso a todos los cursos premium",
    "Lecciones en video HD",
    "Evaluaciones y certificaciones",
    "Contenido exclusivo del blog",
    "Material de apoyo descargable",
    "Soporte prioritario",
];

// ============================================
// Component
// ============================================
export function PricingCard({
    onSubscribe,
    processing,
    planName = "Plan Mensual",
    price = 15,
    currency = "US$",
    period = "/mes",
    features = DEFAULT_FEATURES,
    glassStyles = "backdrop-blur-xl bg-card/50 border border-border/50",
    paymentProvider = "Mercado Pago",
    className
}: PricingCardProps) {
    return (
        <Card className={cn("w-full max-w-[380px] mx-auto", glassStyles, className)}>
            <CardHeader className="text-center pb-4 pt-8">
                <h2 className="text-sm font-bold text-primary-light uppercase tracking-widest mb-2">
                    {planName}
                </h2>
                <div className="flex items-baseline justify-center">
                    <span className="text-2xl font-light text-foreground-muted mr-1">{currency}</span>
                    <span className="text-5xl font-black text-white tracking-tight">{price}</span>
                    <span className="text-lg text-foreground-muted ml-2">{period}</span>
                </div>
            </CardHeader>

            <CardContent className="px-8 pb-8">
                {/* Subtle separator */}
                <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8" />

                <ul className="space-y-4 mb-8">
                    {features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3 text-sm">
                            <div className="mt-0.5 min-w-[18px]">
                                <Check className="w-5 h-5 text-accent" />
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
                    className="w-full py-6 text-base font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition"
                >
                    {processing ? "Procesando..." : "Suscribirme ahora"}
                </Button>

                <p className="text-xs text-foreground-muted text-center mt-4 px-2 leading-relaxed opacity-70">
                    Pago seguro con {paymentProvider}. Puedes cancelar cuando quieras.
                </p>
            </CardContent>
        </Card>
    );
}
