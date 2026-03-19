"use client";

import { useRef, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    BrandSettingsSchema,
    BrandSettingsFormValues,
    ALLOWED_FONTS,
    LAYOUT_TYPES,
} from "@alvarosky/shared";
import {
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    Input,
    Label,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Separator,
    Slider,
    cn,
    SingleImageDropzone
} from "@alvarosky/ui";
import { Check, Loader2, Palette, Type, Layout, Circle, Image as ImageIcon } from "lucide-react";
import { API_BASE, TENANT_ID } from "@/lib/config";
import { updateBrandSettings } from "@/actions/brand-settings-actions";
import { toast } from "sonner";

// ============================================================================
// Types
// ============================================================================
interface BrandSettingsFormProps {
    defaultValues?: Partial<BrandSettingsFormValues>;
}

// ============================================================================
// Component
// ============================================================================
export function BrandSettingsForm({ defaultValues }: BrandSettingsFormProps) {
    const primaryColorRef = useRef<HTMLInputElement>(null);
    const secondaryColorRef = useRef<HTMLInputElement>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [authToken, setAuthToken] = useState("");

    // Read auth token on client side for image uploads
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setAuthToken(localStorage.getItem("token") || "");
        }
    }, []);

    const form = useForm<BrandSettingsFormValues>({
        resolver: zodResolver(BrandSettingsSchema) as any,
        defaultValues: {
            primaryColor: "#09090b",
            secondaryColor: "#f4f4f5",
            borderRadius: 0.5,
            fontFamily: "Inter, sans-serif",
            layoutType: "CLASSIC",
            ...defaultValues,
        },
    });

    const watchedRadius = form.watch("borderRadius");
    const watchedPrimary = form.watch("primaryColor");
    const watchedSecondary = form.watch("secondaryColor");
    const watchedFont = form.watch("fontFamily");

    async function onSubmit(data: BrandSettingsFormValues) {
        setIsSubmitting(true);
        try {
            const result = await updateBrandSettings(data);
            if (result.success) {
                toast.success("Configuración de marca actualizada correctamente");
            } else {
                toast.error(result.error || "Error al guardar");
            }
        } catch (error: any) {
            toast.error(error.message || "Error inesperado al guardar");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="w-full max-w-4xl">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                    {/* ─── Colores ─── */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Palette className="h-5 w-5 text-primary" aria-hidden="true" />
                                Colores de Marca
                            </CardTitle>
                            <CardDescription>
                                Define los colores principales y secundarios de tu plataforma. Estos se aplicarán globalmente a todos los componentes.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                                {/* Primary Color */}
                                <FormField
                                    control={form.control}
                                    name="primaryColor"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Color Principal</FormLabel>
                                            <FormControl>
                                                <div className="flex items-center gap-3">
                                                    <div className="relative w-12 h-12 rounded-[var(--radius)] overflow-hidden border border-border shadow-sm shrink-0 cursor-pointer">
                                                        <input
                                                            type="color"
                                                            ref={primaryColorRef}
                                                            className="absolute -top-2 -left-2 w-20 h-20 p-0 border-0 cursor-pointer opacity-0"
                                                            value={field.value}
                                                            onChange={(e) => field.onChange(e.target.value)}
                                                            aria-label="Selector de color principal"
                                                        />
                                                        <div
                                                            className="w-full h-full"
                                                            style={{ backgroundColor: field.value }}
                                                            onClick={() => primaryColorRef.current?.click()}
                                                        />
                                                    </div>
                                                    <Input
                                                        value={field.value}
                                                        onChange={(e) => field.onChange(e.target.value)}
                                                        placeholder="#09090b"
                                                        className="font-mono w-32 uppercase"
                                                        maxLength={7}
                                                        aria-label="Color principal en formato HEX"
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormDescription>Botones, enlaces y acentos principales.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Secondary Color */}
                                <FormField
                                    control={form.control}
                                    name="secondaryColor"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Color Secundario</FormLabel>
                                            <FormControl>
                                                <div className="flex items-center gap-3">
                                                    <div className="relative w-12 h-12 rounded-[var(--radius)] overflow-hidden border border-border shadow-sm shrink-0 cursor-pointer">
                                                        <input
                                                            type="color"
                                                            ref={secondaryColorRef}
                                                            className="absolute -top-2 -left-2 w-20 h-20 p-0 border-0 cursor-pointer opacity-0"
                                                            value={field.value}
                                                            onChange={(e) => field.onChange(e.target.value)}
                                                            aria-label="Selector de color secundario"
                                                        />
                                                        <div
                                                            className="w-full h-full"
                                                            style={{ backgroundColor: field.value }}
                                                            onClick={() => secondaryColorRef.current?.click()}
                                                        />
                                                    </div>
                                                    <Input
                                                        value={field.value}
                                                        onChange={(e) => field.onChange(e.target.value)}
                                                        placeholder="#f4f4f5"
                                                        className="font-mono w-32 uppercase"
                                                        maxLength={7}
                                                        aria-label="Color secundario en formato HEX"
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormDescription>Fondos secundarios, badges y áreas destacadas.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* ─── Tipografía y Layout ─── */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Type className="h-5 w-5 text-primary" aria-hidden="true" />
                                Tipografía y Diseño
                            </CardTitle>
                            <CardDescription>
                                Selecciona la fuente y el estilo visual de tu marca.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                                {/* Font Family */}
                                <FormField
                                    control={form.control}
                                    name="fontFamily"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tipografía</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecciona una fuente" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {ALLOWED_FONTS.map((font: string) => (
                                                        <SelectItem key={font} value={font}>
                                                            <span style={{ fontFamily: font.split(",")[0] }}>
                                                                {font.split(",")[0].trim()}
                                                            </span>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormDescription>Se cargará dinámicamente desde Google Fonts.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Layout Type */}
                                <FormField
                                    control={form.control}
                                    name="layoutType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tipo de Layout</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecciona un layout" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {LAYOUT_TYPES.map((layout: string) => (
                                                        <SelectItem key={layout} value={layout}>
                                                            <span className="flex items-center gap-2">
                                                                <Layout className="h-4 w-4" aria-hidden="true" />
                                                                {layout === "CLASSIC" ? "Clásico" : layout === "INSTAGRAM" ? "Instagram" : "Minimalista"}
                                                            </span>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormDescription>Estructura visual de las páginas públicas del tenant.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <Separator />

                            {/* Border Radius Slider */}
                            <FormField
                                control={form.control}
                                name="borderRadius"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Radio de Bordes</FormLabel>
                                        <FormControl>
                                            <div className="space-y-4">
                                                <Slider
                                                    min={0}
                                                    max={2}
                                                    step={0.1}
                                                    value={[field.value]}
                                                    onValueChange={(val) => field.onChange(val[0])}
                                                    aria-label="Control de radio de bordes"
                                                />
                                                <div className="flex items-center justify-between text-sm text-muted-foreground">
                                                    <span>Cuadrado (0)</span>
                                                    <span className="font-mono font-medium text-foreground">
                                                        {field.value.toFixed(1)} rem
                                                    </span>
                                                    <span>Redondeado (2)</span>
                                                </div>
                                            </div>
                                        </FormControl>
                                        <FormDescription>Controla la curvatura de botones, cards e inputs.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/* ─── Páginas de Autenticación ─── */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ImageIcon className="h-5 w-5 text-primary" aria-hidden="true" />
                                Login y Registro
                            </CardTitle>
                            <CardDescription>
                                Personaliza la experiencia de inicio de sesión de tus usuarios.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Auth Bg Url */}
                                <FormField
                                    control={form.control}
                                    name="authBgUrl"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Imagen de Fondo o Producto</FormLabel>
                                            <FormControl>
                                                <SingleImageDropzone
                                                    value={field.value || ""}
                                                    onChange={field.onChange}
                                                    endpoint={`${API_BASE}/storage/upload/image`}
                                                    token={authToken}
                                                    tenantId={TENANT_ID}
                                                    folder="branding"
                                                />
                                            </FormControl>
                                            <FormDescription>Recomendado: 1080x1920px (Proporción 9:16).</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Auth Quote */}
                                <FormField
                                    control={form.control}
                                    name="authQuote"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Frase de Bienvenida</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    value={field.value || ""}
                                                    placeholder='"Bienvenido a tu plataforma."'
                                                />
                                            </FormControl>
                                            <FormDescription>Aparecerá junto a la imagen en componentes amplios.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* ─── Preview ─── */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Circle className="h-5 w-5 text-primary" aria-hidden="true" />
                                Vista Previa
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div
                                className="p-6 border border-border rounded-[var(--radius)] space-y-4"
                                style={{ fontFamily: watchedFont?.split(",")[0] }}
                            >
                                <div className="flex items-center gap-4 flex-wrap">
                                    <button
                                        type="button"
                                        className="px-6 py-2.5 text-sm font-medium transition-colors"
                                        style={{
                                            backgroundColor: watchedPrimary,
                                            color: "#fff",
                                            borderRadius: `${watchedRadius}rem`,
                                        }}
                                    >
                                        Botón Primario
                                    </button>
                                    <button
                                        type="button"
                                        className="px-6 py-2.5 text-sm font-medium border transition-colors"
                                        style={{
                                            backgroundColor: watchedSecondary,
                                            color: watchedPrimary,
                                            borderColor: watchedPrimary,
                                            borderRadius: `${watchedRadius}rem`,
                                        }}
                                    >
                                        Botón Secundario
                                    </button>
                                    <div
                                        className="px-3 py-1 text-xs font-medium"
                                        style={{
                                            backgroundColor: `${watchedPrimary}1A`,
                                            color: watchedPrimary,
                                            borderRadius: `${watchedRadius}rem`,
                                        }}
                                    >
                                        Badge de ejemplo
                                    </div>
                                </div>
                                <div
                                    className="p-4 border"
                                    style={{
                                        borderColor: `${watchedPrimary}30`,
                                        borderRadius: `${watchedRadius}rem`,
                                    }}
                                >
                                    <p className="text-sm text-muted-foreground" style={{ fontFamily: watchedFont?.split(",")[0] }}>
                                        Esta es una vista previa con la fuente <strong>{watchedFont?.split(",")[0]}</strong> y radio <strong>{watchedRadius?.toFixed(1)} rem</strong>.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* ─── Submit ─── */}
                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="min-w-[200px]"
                            size="lg"
                        >
                            {isSubmitting ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                                    Guardando...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Check className="h-4 w-4" aria-hidden="true" />
                                    Guardar Configuración
                                </span>
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
