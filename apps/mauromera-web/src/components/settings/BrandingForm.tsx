"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
    Button,
    Card, CardContent, CardDescription, CardHeader, CardTitle,
    Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,
    Input,
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
    Slider,
    Separator,
    themes // Imported from shared UI
} from "@alvarosky/ui";
import { updateTenantBranding } from "@/actions/branding-actions";

const brandingSchema = z.object({
    primary: z.string(),
    radius: z.number().min(0).max(2),
    density: z.enum(["default", "compact", "spacious"]),
});

type BrandingFormValues = z.infer<typeof brandingSchema>;

interface BrandingFormProps {
    defaultValues?: Partial<BrandingFormValues>;
}

export function BrandingForm({ defaultValues }: BrandingFormProps) {
    const [isSaving, setIsSaving] = useState(false);

    const form = useForm<BrandingFormValues>({
        resolver: zodResolver(brandingSchema),
        defaultValues: {
            primary: "zinc",
            radius: 0.5,
            density: "default",
            ...defaultValues,
        },
    });

    const watchedRadius = form.watch("radius");
    const watchedPrimary = form.watch("primary");

    async function onSubmit(data: BrandingFormValues) {
        setIsSaving(true);
        try {
            await updateTenantBranding(data);
            toast.success("Diseño actualizado correctamente");
        } catch (error) {
            console.error(error);
            toast.error("Error al actualizar el diseño");
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>Apariencia del Tenant</CardTitle>
                                <CardDescription>
                                    Personaliza los colores y estilo base de tu plataforma.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="primary"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Color Principal</FormLabel>
                                            <FormControl>
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                                    {Object.keys(themes).map((themeKey) => (
                                                        <Button
                                                            key={themeKey}
                                                            type="button"
                                                            variant={field.value === themeKey ? "default" : "outline"}
                                                            className="w-full capitalize justify-start px-3"
                                                            onClick={() => field.onChange(themeKey)}
                                                        >
                                                            <div
                                                                className={`mr-2 h-4 w-4 rounded-full`}
                                                                style={{ backgroundColor: getThemeColor(themeKey) }}
                                                            />
                                                            {themeKey}
                                                        </Button>
                                                    ))}
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="radius"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Redondeal (Border Radius): {field.value}rem</FormLabel>
                                            <FormControl>
                                                <Slider
                                                    min={0}
                                                    max={1.5}
                                                    step={0.1}
                                                    defaultValue={[field.value]}
                                                    onValueChange={(vals) => field.onChange(vals[0])}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button type="submit" disabled={isSaving}>
                                    {isSaving ? "Guardando..." : "Guardar Cambios"}
                                </Button>
                            </CardContent>
                        </Card>
                    </form>
                </Form>
            </div>

            {/* Preview Section */}
            <div className="space-y-6">
                <Card className="border-2 border-dashed">
                    <CardHeader>
                        <CardTitle>Vista Previa</CardTitle>
                        <CardDescription>Así se verán tus componentes</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col gap-4 p-4 rounded-lg bg-background border"
                            style={{
                                // Simulation of styles for preview
                                borderRadius: `${watchedRadius}rem`
                            }}>
                            <div className="flex gap-2">
                                <Button>Primary Button</Button>
                                <Button variant="secondary">Secondary</Button>
                                <Button variant="outline">Outline</Button>
                            </div>
                            <div className="flex gap-2">
                                <Button size="sm">Small</Button>
                                <Button size="lg">Large</Button>
                                <Button variant="destructive">Destructive</Button>
                            </div>
                            <Input placeholder="Input de texto" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function getThemeColor(name: string) {
    const colors: Record<string, string> = {
        zinc: "#18181b",
        slate: "#0f172a",
        stone: "#1c1917",
        gray: "#111827",
        neutral: "#171717",
        red: "#dc2626",
        rose: "#e11d48",
        orange: "#ea580c",
        green: "#16a34a",
        blue: "#2563eb",
        yellow: "#ca8a04",
        violet: "#7c3aed",
    };
    return colors[name] || "#000";
}
