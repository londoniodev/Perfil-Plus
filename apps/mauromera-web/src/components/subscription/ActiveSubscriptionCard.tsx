"use client";

import Link from "next/link";
import { Button } from "@alvarosky/ui";
import { Card, CardContent } from "@alvarosky/ui";
import { cn } from "@/lib/utils";
import { GLASS_CARD_STYLES, GLASS_CARD_HOVER } from "@/constants/styles";

interface ActiveSubscriptionCardProps {
    endDate: string | null;
    onCancel: () => void;
}

/**
 * Tarjeta que muestra el estado de una suscripción activa.
 */
export default function ActiveSubscriptionCard({ endDate, onCancel }: ActiveSubscriptionCardProps) {
    const formattedDate = endDate
        ? new Date(endDate).toLocaleDateString("es-CO", {
            day: "numeric",
            month: "long",
            year: "numeric",
        })
        : "próximo mes";

    return (
        <Card className={cn(GLASS_CARD_STYLES, "max-w-[500px] mx-auto text-center border-success/30 bg-success/5")}>
            <CardContent className="p-8 md:p-12">
                <div className="text-5xl mb-6 animate-pulse">✨</div>
                <h3 className="text-2xl font-serif text-success mb-2 font-bold">¡Eres miembro Premium!</h3>
                <p className="text-foreground-muted mb-8 text-lg">
                    Tu suscripción está activa hasta el <strong className="text-foreground">{formattedDate}</strong>
                </p>

                <div className="space-y-6">
                    <Button asChild fullWidth size="lg" className="shadow-lg shadow-success/20">
                        <Link href="/cursos">Ir a los cursos</Link>
                    </Button>

                    <div>
                        <button
                            onClick={onCancel}
                            className="text-sm text-foreground-muted hover:text-error transition-colors underline decoration-border/30 underline-offset-4 hover:decoration-error"
                        >
                            Cancelar suscripción
                        </button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

