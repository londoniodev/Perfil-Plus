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
    Switch,
    Label,
    Separator,
    cn,
    themes // Imported from shared UI
} from "@alvarosky/ui";
import { Check } from "lucide-react";
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
                                                <div className="flex flex-wrap gap-3">
                                                    {Object.keys(themes).map((themeKey) => (
                                                        <div
                                                            key={themeKey}
                                                            className={cn(
                                                                "h-10 w-10 rounded-full cursor-pointer flex items-center justify-center transition-all hover:scale-110",
                                                                field.value === themeKey ? "ring-2 ring-offset-2 ring-primary" : "ring-1 ring-border"
                                                            )}
                                                            style={{ backgroundColor: getThemeColor(themeKey) }}
                                                            onClick={() => field.onChange(themeKey)}
                                                            title={themeKey}
                                                        >
                                                            {field.value === themeKey && (
                                                                <Check className="h-4 w-4 text-white drop-shadow-md" />
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Separator />

                                <FormField
                                    control={form.control}
                                    name="radius"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Redondeal (Border Radius): {field.value}rem</FormLabel>
                                            <FormControl>
                                                <Slider
                                                    min={0}
                                                    max={1}
                                                    step={0.25} // 0, 0.25, 0.5, 0.75, 1
                                                    defaultValue={[field.value]}
                                                    value={[field.value]}
                                                    onValueChange={(vals) => field.onChange(vals[0])}
                                                    className="py-4"
                                                />
                                            </FormControl>
                                            <FormDescription className="flex justify-between text-xs text-muted-foreground">
                                                <span>0</span>
                                                <span>0.5</span>
                                                <span>1.0</span>
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Separator />

                                <FormField
                                    control={form.control}
                                    name="density"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                                            <div className="space-y-0.5">
                                                <FormLabel>Modo Espacioso</FormLabel>
                                                <FormDescription>
                                                    Aumenta el espacio entre elementos (Density).
                                                </FormDescription>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value === "spacious"}
                                                    onCheckedChange={(checked) => field.onChange(checked ? "spacious" : "default")}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <Button type="submit" disabled={isSaving} className="w-full sm:w-auto">
                                    {isSaving ? "Guardando..." : "Guardar Cambios"}
                                </Button>
                            </CardContent>
                        </Card>
                    </form>
                </Form>
            </div>

            {/* Preview Section */}
            <div className="space-y-6">
                <Card className="border-2 border-dashed bg-muted/50 hidden md:block">
                    <CardHeader>
                        <CardTitle>Vista Previa</CardTitle>
                        <CardDescription>Simulación en tiempo real</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div
                            className="flex flex-col gap-4 p-6 rounded-lg bg-background border shadow-sm transition-all duration-300"
                            style={{
                                borderRadius: `${watchedRadius}rem`,
                                // Note: Colors are hard to preview exactly without a provider wrapper,
                                // but we simulate spacing and radius.
                            }}
                        >
                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold">Título de Ejemplo</h3>
                                <p className="text-sm text-muted-foreground">
                                    Así se verán los textos y contenedores con el radio seleccionado.
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <Button>Primary Action</Button>
                                <Button variant="secondary">Secondary</Button>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <Button variant="outline" size="sm">Small</Button>
                                <Button variant="ghost" size="icon"><span className="text-lg">👻</span></Button>
                                <Button variant="destructive">Destructive</Button>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="preview-input">Input de Texto</Label>
                                <Input id="preview-input" placeholder="Escribe algo..." />
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch id="preview-switch" />
                                <Label htmlFor="preview-switch">Toggle de ejemplo</Label>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

// Helper utility to get a rough hex color for the preview buttons
// (This wouldn't be exact since we normally use CSS vars, but helps the UI)
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
