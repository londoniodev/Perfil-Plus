"use client";

import { Control, Controller } from "react-hook-form";
import { Checkbox, Label, Card } from "@alvarosky/ui";
import { AVAILABLE_FEATURES } from "@alvarosky/types";
import { Box } from "lucide-react";

interface FeatureSelectorProps {
    control: Control<any>;
    name?: string; // Por defecto "features"
}

export function FeatureSelector({ control, name = "features" }: FeatureSelectorProps) {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {AVAILABLE_FEATURES.map((feature) => (
                <Controller
                    key={feature.value}
                    name={name}
                    control={control}
                    render={({ field }) => {
                        // field.value debería ser un array de strings: ['shop', 'blog']
                        const isChecked = field.value?.includes(feature.value);

                        return (
                            <div
                                className={`
                  flex items-start space-x-3 p-4 rounded-lg border transition-all cursor-pointer hover:bg-muted/50
                  ${isChecked ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'bg-card'}
                `}
                                onClick={() => {
                                    const current = field.value || [];
                                    const updated = isChecked
                                        ? current.filter((v: string) => v !== feature.value)
                                        : [...current, feature.value];
                                    field.onChange(updated);
                                }}
                            >
                                <Checkbox
                                    checked={isChecked}
                                    onCheckedChange={() => { }} // Manejado por el onClick del padre para mejor UX
                                    className="mt-1"
                                />
                                <div className="space-y-1">
                                    <Label className="text-base font-medium cursor-pointer pointer-events-none">
                                        {feature.label}
                                    </Label>
                                    {/* Aquí podríamos agregar descripción si la tuviéramos en el config */}
                                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Box className="w-3 h-3" /> Feature Core
                                    </div>
                                </div>
                            </div>
                        );
                    }}
                />
            ))}
        </div>
    );
}
