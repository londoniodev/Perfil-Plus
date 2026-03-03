"use client";

import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../../../dialog";
import { Button } from "../../../button";
import { Input } from "../../../input";
import { Label } from "../../../label";

// ============================================================================
// Types
// ============================================================================

export interface PremiumDaysDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    userName: string;
    onConfirm: (days: number) => void;
    loading?: boolean;
}

// ============================================================================
// Quick-select presets
// ============================================================================

const PRESETS = [
    { label: "7 días", value: 7 },
    { label: "15 días", value: 15 },
    { label: "30 días", value: 30 },
    { label: "60 días", value: 60 },
    { label: "90 días", value: 90 },
    { label: "1 año", value: 365 },
] as const;

// ============================================================================
// Component
// ============================================================================

export function PremiumDaysDialog({
    open,
    onOpenChange,
    userName,
    onConfirm,
    loading = false,
}: PremiumDaysDialogProps) {
    const [days, setDays] = useState(30);

    const handleConfirm = () => {
        if (days < 1) return;
        onConfirm(days);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Asignar Premium</DialogTitle>
                    <DialogDescription>
                        Asignar suscripción premium a <strong>{userName}</strong>.
                        Especifica la cantidad de días.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Quick presets */}
                    <div className="flex flex-wrap gap-2">
                        {PRESETS.map((preset) => (
                            <Button
                                key={preset.value}
                                type="button"
                                size="sm"
                                variant={days === preset.value ? "default" : "outline"}
                                onClick={() => setDays(preset.value)}
                                className="text-xs"
                            >
                                {preset.label}
                            </Button>
                        ))}
                    </div>

                    {/* Custom input */}
                    <div className="flex items-center gap-3">
                        <Label htmlFor="premium-days" className="shrink-0">
                            Días:
                        </Label>
                        <Input
                            id="premium-days"
                            type="number"
                            min={1}
                            max={3650}
                            value={days}
                            onChange={(e) => setDays(Math.max(1, Number(e.target.value)))}
                            className="w-24"
                        />
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        onClick={handleConfirm}
                        disabled={loading || days < 1}
                        className="bg-emerald-600 hover:bg-emerald-700"
                    >
                        {loading ? "Asignando..." : `Asignar ${days} días`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
