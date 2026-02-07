"use client";

import React from "react";
import { Button } from "../../button";
import { Card, CardContent } from "../../card";
import { cn } from "../../lib/utils";

// ============================================
// Types
// ============================================
export interface ActiveSubscriptionCardProps {
    endDate: string | null;
    onCancel: () => void;
    onViewCourses?: () => void;
    /** Link to courses page */
    coursesHref?: string;
    /** Custom class for the card */
    className?: string;
    /** Custom glass card styles */
    glassStyles?: string;
}

// ============================================
// Component
// ============================================
export function ActiveSubscriptionCard({
    endDate,
    onCancel,
    onViewCourses,
    coursesHref = "/cursos",
    className,
    glassStyles = "backdrop-blur-xl bg-card/50 border border-border/50"
}: ActiveSubscriptionCardProps) {
    const formattedDate = endDate
        ? new Date(endDate).toLocaleDateString("es-CO", {
            day: "numeric",
            month: "long",
            year: "numeric",
        })
        : "próximo mes";

    return (
        <Card className={cn(glassStyles, "max-w-[500px] mx-auto text-center border-success/30 bg-success/5", className)}>
            <CardContent className="p-8 md:p-12">
                <div className="text-5xl mb-6 animate-pulse">✨</div>
                <h3 className="text-2xl font-serif text-success mb-2 font-bold">¡Eres miembro Premium!</h3>
                <p className="text-foreground-muted mb-8 text-lg">
                    Tu suscripción está activa hasta el <strong className="text-foreground">{formattedDate}</strong>
                </p>

                <div className="space-y-6">
                    {onViewCourses ? (
                        <Button onClick={onViewCourses} fullWidth size="lg" className="shadow-lg shadow-success/20">
                            Ir a los cursos
                        </Button>
                    ) : (
                        <Button asChild fullWidth size="lg" className="shadow-lg shadow-success/20">
                            <a href={coursesHref}>Ir a los cursos</a>
                        </Button>
                    )}

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
