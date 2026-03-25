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
    SingleImageDropzone
} from "@alvarosky/ui";
import { Loader2 } from "lucide-react";
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
            fontFamily: "Inter",
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
                fontFamily: "Inter",
                ...(defaultValues as any),
            })
        }
    }, [defaultValues, form])

    const watchedPrimary = form.watch("primary");
    const [customHex, setCustomHex] = useState<string>("#000000");

    // Sync customHex when watchedPrimary changes
    useEffect(() => {
        if (watchedPrimary && watchedPrimary.includes(" ")) {
            setCustomHex(hslToHex(watchedPrimary));
        }
    }, [watchedPrimary]);

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
            console.log("[BrandingForm] Enviando datos:", data);
            await updateTenantBranding(data);
            toast.success("Diseño actualizado correctamente");
        } catch (error) {
            console.error("[BrandingForm] Error en onSubmit:", error);
            toast.error("Error al actualizar el diseño");
        }
    }

    const onInvalid = (errors: any) => {
        console.warn("[BrandingForm] Errores de validación:", errors);
        const firstError = Object.values(errors)[0] as any;
        if (firstError?.message) {
            toast.error(`Error en el formulario: ${firstError.message}`);
        }
    };

    return (
        <div className="w-full">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Apariencia del Tenant</CardTitle>
                            <CardDescription>
                                Personaliza los colores y estilo base de tu plataforma.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <FormField
                                    control={form.control}
                                    name="logoUrl"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Logo Horizontal</FormLabel>
                                            <FormControl>
                                                <SingleImageDropzone
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    endpoint={`${API_BASE}/storage/upload/image`}
                                                    token={authToken}
                                                    tenantId={TENANT_ID}
                                                    folder="branding"
                                                    onUploadSuccess={(url) => {
                                                        toast.success("Logo horizontal subido correctamente");
                                                        field.onChange(url);
                                                    }}
                                                    onUploadError={(err) => toast.error(`Error subiendo logo: ${err}`)}
                                                />
                                            </FormControl>
                                            <FormDescription>Utilizado en headers y correos electrónicos.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="faviconUrl"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Logo Cuadrado / Favicon</FormLabel>
                                            <FormControl>
                                                <SingleImageDropzone
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    endpoint={`${API_BASE}/storage/upload/image`}
                                                    token={authToken}
                                                    tenantId={TENANT_ID}
                                                    folder="branding"
                                                    onUploadSuccess={(url) => {
                                                        toast.success("Favicon subido correctamente");
                                                        field.onChange(url);
                                                    }}
                                                    onUploadError={(err) => toast.error(`Error subiendo favicon: ${err}`)}
                                                />
                                            </FormControl>
                                            <FormDescription>Utilizado en el Menú Digital, favicon y móviles.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <Separator />

                            {/* ── Controles de Estilo en Fila ── */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                                {/* Tipografía */}
                                <FormField
                                    control={form.control}
                                    name="fontFamily"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tipografía</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value || "Inter"}>
                                                <FormControl>
                                                    <SelectTrigger aria-label="Seleccionar tipografía">
                                                        <SelectValue placeholder="Fuente" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {FONT_CATALOG.map((font) => (
                                                        <SelectItem key={font.value} value={font.value}>
                                                            <span style={{ fontFamily: `"${font.value}", sans-serif` }}>{font.label}</span>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Color (Hex) */}
                                <FormItem>
                                    <FormLabel>Color Principal (Hex)</FormLabel>
                                    <div className="flex items-center gap-2">
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
                                            placeholder="#0000"
                                            className="font-mono uppercase h-10"
                                            maxLength={7}
                                        />
                                    </div>
                                    <FormMessage />
                                </FormItem>

                                {/* Border Radius */}
                                <FormField
                                    control={form.control}
                                    name="radius"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Bordes</FormLabel>
                                            <Select 
                                                onValueChange={(val) => field.onChange(parseFloat(val))} 
                                                value={field.value?.toString()}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Radio" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {RADIUS_OPTIONS.map((opt) => (
                                                        <SelectItem key={opt.value} value={opt.value.toString()}>
                                                            {opt.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                        </CardContent>
                    </Card>
                    <div className="flex justify-center pt-4">
                        <Button type="submit" disabled={form.formState.isSubmitting} className="min-w-[200px] h-12 text-lg">
                            {form.formState.isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
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
