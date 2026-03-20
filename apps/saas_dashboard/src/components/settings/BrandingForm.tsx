"use client";

import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { brandingSchema, BrandingFormValues, FONT_CATALOG, RADIUS_OPTIONS } from "@alvarosky/features";
import {
    Button,
    Card, CardContent, CardDescription, CardHeader, CardTitle,
    Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,
    Input,
    Label,
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
    Separator,
    cn,
    themes,
    SingleImageDropzone
} from "@alvarosky/ui";
import { Check, Loader2 } from "lucide-react";
import { updateTenantBranding } from "@/actions/branding-actions";
import { API_BASE, TENANT_ID } from "@/lib/config";
import { toast } from "sonner";

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

// Helper utility to get a rough hex color for the preview buttons
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

interface BrandingFormProps {
    defaultValues?: Partial<BrandingFormValues>;
}

export const BrandingForm = forwardRef<any, BrandingFormProps>(({ defaultValues }, ref) => {
    const colorInputRef = useRef<HTMLInputElement>(null);
    const [authToken, setAuthToken] = useState("");

    useImperativeHandle(ref, () => ({
        submit: () => {
            return form.handleSubmit(onSubmit)();
        }
    }));

    // Read auth token on client side
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setAuthToken(localStorage.getItem("token") || "");
        }
    }, []);

    const form = useForm<BrandingFormValues>({
        resolver: zodResolver(brandingSchema) as any,
        defaultValues: {
            primary: "zinc",
            radius: 0.5,
            density: "default",
            mode: "system",
            logoUrl: "",
            faviconUrl: "",
            secondaryColor: "",
            fontFamily: "",
            ...(defaultValues as any),
        },
    });

    // Hidratar formulario cuando cambian los valores iniciales
    useEffect(() => {
        if (defaultValues) {
            form.reset({
                primary: "zinc",
                radius: 0.5,
                density: "default",
                mode: "system",
                logoUrl: "",
                faviconUrl: "",
                secondaryColor: "",
                fontFamily: "",
                ...(defaultValues as any),
            })
        }
    }, [defaultValues, form])

    const watchedPrimary = form.watch("primary");

    // Logic for Custom Hex
    const isCustomPrimary = watchedPrimary && !themes[watchedPrimary as keyof typeof themes];
    const [customHex, setCustomHex] = useState<string>(
        isCustomPrimary && watchedPrimary.includes(" ") ? hslToHex(watchedPrimary) : "#000000"
    );

    // Sync customHex when watchedPrimary changes (if custom)
    useEffect(() => {
        if (isCustomPrimary && watchedPrimary.includes(" ")) {
            setCustomHex(hslToHex(watchedPrimary));
        }
    }, [watchedPrimary, isCustomPrimary]);

    const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const hex = e.target.value;
        setCustomHex(hex);
        // Only update form if valid hex
        if (/^#[0-9A-F]{6}$/i.test(hex)) {
            form.setValue("primary", hexToHSL(hex), { shouldDirty: true });
        }
    };

    async function onSubmit(data: BrandingFormValues) {
        try {
            await updateTenantBranding(data);
            toast.success("Diseño actualizado correctamente");
        } catch (error) {
            console.error(error);
            toast.error("Error al actualizar el diseño");
        }
    }

    return (
        <div className="w-full">
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
                                                    aria-label="Color personalizado Hex"
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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t">
                                <FormField
                                    control={form.control}
                                    name="logoUrl"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Logo de la Plataforma</FormLabel>
                                            <FormControl>
                                                <SingleImageDropzone
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    endpoint={`${API_BASE}/storage/upload/image`}
                                                    token={authToken}
                                                    tenantId={TENANT_ID}
                                                    folder="branding"
                                                />
                                            </FormControl>
                                            <FormDescription>Se mostrará en el header y correos.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="faviconUrl"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Favicon (Icono Navegador)</FormLabel>
                                            <FormControl>
                                                <SingleImageDropzone
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    endpoint={`${API_BASE}/storage/upload/image`}
                                                    token={authToken}
                                                    tenantId={TENANT_ID}
                                                    folder="branding"
                                                />
                                            </FormControl>
                                            <FormDescription>Imagen cuadrada pequeña (.ico, .png).</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <Separator />

                            {/* ── Tipografía ── */}
                            <FormField
                                control={form.control}
                                name="fontFamily"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tipografía</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value || "Inter"}>
                                            <FormControl>
                                                <SelectTrigger aria-label="Seleccionar tipografía">
                                                    <SelectValue placeholder="Selecciona una fuente" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {FONT_CATALOG.map((font) => (
                                                    <SelectItem
                                                        key={font.value}
                                                        value={font.value}
                                                    >
                                                        <span style={{ fontFamily: `"${font.value}", sans-serif` }}>
                                                            {font.label}
                                                        </span>
                                                        <span className="ml-2 text-xs text-muted-foreground">
                                                            {font.type}
                                                        </span>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>
                                            Fuente principal para toda la plataforma.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* ── Border Radius ── */}
                            <FormField
                                control={form.control}
                                name="radius"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Redondeo de Bordes</FormLabel>
                                        <FormControl>
                                            <div className="flex flex-wrap gap-3">
                                                {RADIUS_OPTIONS.map((option) => (
                                                    <button
                                                        key={option.value}
                                                        type="button"
                                                        onClick={() => field.onChange(option.value)}
                                                        className={cn(
                                                            "flex flex-col items-center gap-1.5 p-3 border-2 transition-all min-w-[72px]",
                                                            field.value === option.value
                                                                ? "border-primary bg-primary/5 shadow-sm"
                                                                : "border-border hover:border-muted-foreground/30"
                                                        )}
                                                        style={{ borderRadius: `${option.value}rem` }}
                                                        aria-label={`Radio de borde: ${option.label}`}
                                                        aria-pressed={field.value === option.value}
                                                    >
                                                        {/* Preview visual */}
                                                        <div
                                                            className="w-10 h-10 bg-primary/20 border border-primary/40"
                                                            style={{ borderRadius: `${option.value * 8}px` }}
                                                        />
                                                        <span className="text-xs font-medium text-muted-foreground">
                                                            {option.label}
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        </FormControl>
                                        <FormDescription>
                                            Afecta botones, tarjetas y todos los componentes.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                        </CardContent>
                    </Card>
                    <div className="flex justify-end pt-4">
                        <Button type="submit" disabled={form.formState.isSubmitting} className="min-w-[150px]">
                            {form.formState.isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Guardando...
                                </>
                            ) : (
                                "Guardar Cambios"
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
});
