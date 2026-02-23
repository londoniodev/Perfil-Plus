"use client";

import { useState, useRef } from "react";
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

// --- Helpers ---
function hexToHSL(hex: string): string {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
        r = parseInt("0x" + hex[1] + hex[1]);
        g = parseInt("0x" + hex[2] + hex[2]);
        b = parseInt("0x" + hex[3] + hex[3]);
    } else if (hex.length === 7) {
        r = parseInt("0x" + hex[1] + hex[2]);
        g = parseInt("0x" + hex[3] + hex[4]);
        b = parseInt("0x" + hex[5] + hex[6]);
    }
    r /= 255;
    g /= 255;
    b /= 255;
    const cmin = Math.min(r, g, b),
        cmax = Math.max(r, g, b),
        delta = cmax - cmin;
    let h = 0, s = 0, l = 0;

    if (delta === 0) h = 0;
    else if (cmax === r) h = ((g - b) / delta) % 6;
    else if (cmax === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;

    h = Math.round(h * 60);
    if (h < 0) h += 360;

    l = (cmax + cmin) / 2;
    s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
    s = +(s * 100).toFixed(1);
    l = +(l * 100).toFixed(1);

    return `${h} ${s}% ${l}%`;
}

function hslToHex(hsl: string): string {
    const parts = hsl.split(' ');
    if (parts.length < 3) return "#000000";

    let h = parseFloat(parts[0]);
    let s = parseFloat(parts[1].replace('%', ''));
    let l = parseFloat(parts[2].replace('%', ''));

    s /= 100;
    l /= 100;

    let c = (1 - Math.abs(2 * l - 1)) * s,
        x = c * (1 - Math.abs(((h / 60) % 2) - 1)),
        m = l - c / 2,
        r = 0, g = 0, b = 0;

    if (0 <= h && h < 60) { r = c; g = x; b = 0; }
    else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
    else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
    else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
    else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
    else if (300 <= h && h < 360) { r = c; g = 0; b = x; }

    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    const toHex = (n: number) => {
        const hex = n.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    };
    return "#" + toHex(r) + toHex(g) + toHex(b);
}

const brandingSchema = z.object({
    primary: z.string(),
    radius: z.number().min(0).max(2),
    density: z.enum(["default", "compact", "spacious"]),
    mode: z.enum(["light", "dark", "system"]).default("system"),
});

type BrandingFormValues = z.infer<typeof brandingSchema>;

interface BrandingFormProps {
    defaultValues?: Partial<BrandingFormValues>;
}

export function BrandingForm({ defaultValues }: BrandingFormProps) {
    const [isSaving, setIsSaving] = useState(false);
    const colorInputRef = useRef<HTMLInputElement>(null);

    const form = useForm<BrandingFormValues>({
        resolver: zodResolver(brandingSchema) as any, // Bypass zod/hookform strict typing conflict
        defaultValues: {
            primary: "zinc",
            radius: 0.5,
            density: "default",
            mode: "system",
            ...(defaultValues as any),
        },
    });


    const watchedRadius = form.watch("radius");
    const watchedPrimary = form.watch("primary");

    // Logic for Custom Hex
    const isCustomPrimary = watchedPrimary && !themes[watchedPrimary as keyof typeof themes];
    const [customHex, setCustomHex] = useState<string>(
        isCustomPrimary && watchedPrimary.startsWith("#") ? watchedPrimary : (
            isCustomPrimary && watchedPrimary.includes(" ") ? hslToHex(watchedPrimary) : "#000000"
        )
    );

    const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const hex = e.target.value;
        setCustomHex(hex);
        // Only update form if valid hex
        if (/^#[0-9A-F]{6}$/i.test(hex)) {
            // Guardamos el HEX exacto para evitar payload rejects the WAF o URLErrors con '%'
            form.setValue("primary", hex, { shouldDirty: true });
        }
    };

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
                                                            role="button"
                                                            tabIndex={0}
                                                            onKeyDown={(e) => {
                                                                if (e.key === "Enter" || e.key === " ") {
                                                                    e.preventDefault();
                                                                    field.onChange(themeKey);
                                                                }
                                                            }}
                                                            className={cn(
                                                                "h-10 w-10 rounded-full cursor-pointer flex items-center justify-center transition-all hover:scale-110",
                                                                field.value === themeKey ? "ring-2 ring-offset-2 ring-primary" : "ring-1 ring-border"
                                                            )}
                                                            style={{ backgroundColor: getThemeColor(themeKey) }}
                                                            onClick={() => field.onChange(themeKey)}
                                                            title={themeKey}
                                                            aria-label={`Seleccionar color ${themeKey}`}
                                                            aria-pressed={field.value === themeKey}
                                                        >
                                                            {field.value === themeKey && (
                                                                <Check className="h-4 w-4 text-white drop-shadow-md" />
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </FormControl>

                                            {/* Custom Hex Section */}
                                            <div className="mt-4 pt-4 border-t">
                                                <Label className="text-sm font-medium mb-1.5 block">O color personalizado (Hex)</Label>
                                                <div className="flex items-center gap-3">
                                                    <div className="relative w-10 h-10 rounded-full overflow-hidden border shadow-sm shrink-0">
                                                        <input
                                                            type="color"
                                                            ref={colorInputRef}
                                                            className="absolute -top-2 -left-2 w-16 h-16 p-0 border-0 cursor-pointer opacity-0"
                                                            value={customHex}
                                                            onChange={handleHexChange}
                                                        />
                                                        <div
                                                            className="w-full h-full"
                                                            style={{ backgroundColor: customHex }}
                                                            onClick={() => colorInputRef.current?.click()}
                                                        />
                                                    </div>
                                                    <Input
                                                        value={customHex}
                                                        onChange={handleHexChange}
                                                        placeholder="#000000"
                                                        className="font-mono w-32 uppercase"
                                                        maxLength={7}
                                                    />
                                                    {isCustomPrimary && (
                                                        <div className="text-xs text-muted-foreground animate-in fade-in">
                                                            <Check className="h-3 w-3 inline mr-1 text-green-500" />
                                                            Aplicado
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Separator />

                                <FormField
                                    control={form.control}
                                    name="mode"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Esquema de Color (Tema)</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value || "system"}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecciona el tema por defecto" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="system">Sincronizar con el Sistema</SelectItem>
                                                    <SelectItem value="light">Claro (Light)</SelectItem>
                                                    <SelectItem value="dark">Oscuro (Dark)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormDescription>
                                                Elige si tu panel y sistema administrativo será oscuro o claro por defecto.
                                            </FormDescription>
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
                            className="flex flex-col gap-4 p-6 rounded-lg bg-background border shadow-sm transition-all duration-300 relative"
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
