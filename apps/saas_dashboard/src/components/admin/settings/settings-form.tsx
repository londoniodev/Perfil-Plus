"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button, Input, Card, Form, FormControl, FormField, FormItem, FormLabel, FormMessage, Tabs, TabsList, TabsTrigger, TabsContent, Switch, Label } from "@alvarosky/ui"
import { Loader2, MapPin } from "lucide-react"
import { updateSettings } from "@/actions/admin/update-settings"
import { useToast } from "@alvarosky/ui"
import { SingleImageDropzone } from "@alvarosky/ui"
import { API_BASE } from "@/lib/config"
import { BrandingForm } from "@/components/settings/BrandingForm"

const settingsSchema = z.object({
    storeName: z.string().optional().or(z.literal("")),
    storeEmail: z.string().email("Email inválido").optional().or(z.literal("")),

    // Finance
    currency: z.string().optional(),
    mpPublicKey: z.string().optional(),
    mpAccessToken: z.string().optional(),
    mpWebhookSecret: z.string().optional(),
    mpClientId: z.string().optional(),
    mpClientSecret: z.string().optional(),

    // Appearance
    theme: z.string().optional(),
    primaryColor: z.string().optional(),

    // Email (SMTP)
    smtpHost: z.string().optional(),
    smtpPort: z.number().optional(),
    smtpSecure: z.boolean().optional(),
    smtpUser: z.string().optional(),
    smtpPass: z.string().optional(),

    // APIs
    apiKeyOpenAI: z.string().optional(),

    enableBlog: z.boolean().optional(),
    enableStore: z.boolean().optional(),
    enableLMS: z.boolean().optional(),

    // Contact
    whatsapp: z.string().optional(),
    instagram: z.string().optional(),
    facebook: z.string().optional(),
    address: z.string().optional(),

    // Menu
    menuSlogan: z.string().optional(),
    menuLogo: z.string().optional(),
})

type SettingsFormValues = z.infer<typeof settingsSchema>

interface SettingsFormProps {
    initialData?: {
        storeName?: string | null
        storeEmail?: string | null
        currency?: string | null
        mpPublicKey?: string | null
        mpAccessToken?: string | null
        mpWebhookSecret?: string | null
        mpClientId?: string | null
        mpClientSecret?: string | null
        theme?: string | null
        primaryColor?: string | null
        smtpHost?: string | null
        smtpPort?: number | null
        smtpSecure?: boolean | null
        smtpUser?: string | null
        smtpPass?: string | null
        apiKeyOpenAI?: string | null
        enableBlog?: boolean | null
        enableStore?: boolean | null
        enableLMS?: boolean | null
        whatsapp?: string | null
        instagram?: string | null
        facebook?: string | null
        address?: string | null
        menuSlogan?: string | null
        menuLogo?: string | null
    }
    brandingData?: any
}

export function SettingsForm({ initialData, brandingData }: SettingsFormProps) {
    const toast = useToast()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const authToken = typeof window !== 'undefined' ? localStorage.getItem("accessToken") || "" : "";

    const form = useForm<SettingsFormValues>({
        resolver: zodResolver(settingsSchema),
        defaultValues: {
            storeName: initialData?.storeName || "",
            storeEmail: initialData?.storeEmail || "",
            currency: initialData?.currency || "COP",
            mpPublicKey: initialData?.mpPublicKey || "",
            mpAccessToken: initialData?.mpAccessToken || "",
            mpWebhookSecret: initialData?.mpWebhookSecret || "",
            mpClientId: initialData?.mpClientId || "",
            mpClientSecret: initialData?.mpClientSecret || "",
            theme: initialData?.theme || "",
            primaryColor: initialData?.primaryColor || "#6366f1",
            smtpHost: initialData?.smtpHost || "",
            smtpPort: initialData?.smtpPort || 587,
            smtpSecure: initialData?.smtpSecure ?? false,
            smtpUser: initialData?.smtpUser || "",
            smtpPass: initialData?.smtpPass || "",
            apiKeyOpenAI: initialData?.apiKeyOpenAI || "",
            enableBlog: initialData?.enableBlog ?? true,
            enableStore: initialData?.enableStore ?? true,
            enableLMS: initialData?.enableLMS ?? false,
            whatsapp: initialData?.whatsapp || "",
            instagram: initialData?.instagram || "",
            facebook: initialData?.facebook || "",
            address: initialData?.address || "",
            menuSlogan: initialData?.menuSlogan || "",
            menuLogo: initialData?.menuLogo || "",
        },
    })

    const onSubmit = async (data: SettingsFormValues) => {
        setIsSubmitting(true)

        try {
            const result = await updateSettings(data)

            if (result.success) {
                toast.success("Configuración actualizada exitosamente")
            } else {
                toast.error(result.error || "Error al actualizar configuración")
            }
        } catch (error) {
            console.error("Error:", error)
            toast.error("Error al procesar el formulario")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit, (errors) => {
                    console.error("Form Validation Errors:", errors);
                    toast.error("Error de validación en el formulario");
                })}
                className="space-y-6"
            >
                <Tabs defaultValue="general" className="w-full">
                    <TabsList>
                        <TabsTrigger value="general">General</TabsTrigger>
                        <TabsTrigger value="branding">Branding</TabsTrigger>
                        <TabsTrigger value="finance">Finanzas</TabsTrigger>
                        <TabsTrigger value="email">Email</TabsTrigger>
                        <TabsTrigger value="apis">API's</TabsTrigger>
                    </TabsList>

                    {/* General/Contacto */}
                    <TabsContent value="general">
                        <Card className="p-6 space-y-6">
                            <div className="space-y-4 max-w-2xl">
                                <h3 className="text-lg font-semibold">Informacion del Negocio</h3>
                                <div className="grid gap-6">
                                    <FormField
                                        control={form.control}
                                        name="whatsapp"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>WhatsApp (incluir codigo de pais)</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="+57310..." />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="address"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Direccion Fisica</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                        <Input {...field} placeholder="Calle 123, Ciudad" className="pl-10" />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <FormField
                                            control={form.control}
                                            name="instagram"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Instagram (usuario)</FormLabel>
                                                    <FormControl>
                                                        <div className="flex items-center">
                                                            <span className="bg-muted px-3 h-10 flex items-center border border-r-0 rounded-l-md text-muted-foreground text-sm">@</span>
                                                            <Input {...field} placeholder="mi_negocio" className="rounded-l-none" />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="facebook"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Facebook (URL/ID)</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="mi.negocio" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                </div>
                            </div>
                        </Card>
                    </TabsContent>

                    {/* Branding */}
                    <TabsContent value="branding">
                        <div className="space-y-6">
                            {/* Logo y Menu Digital (Manejados como parte global Settings) */}
                            <Card className="p-6 space-y-4">
                                <h3 className="text-lg font-semibold">Logotipo y Mensaje</h3>
                                <div className="space-y-4 max-w-2xl">
                                    <FormField
                                        control={form.control}
                                        name="menuLogo"
                                        render={({ field }) => (
                                            <div className="space-y-3">
                                                <FormLabel>Logo Principal</FormLabel>
                                                <FormControl>
                                                    <SingleImageDropzone
                                                        value={field.value}
                                                        onChange={(url) => field.onChange(url)}
                                                        endpoint={`${API_BASE}/storage/upload/image`}
                                                        token={authToken}
                                                        className="max-w-[300px]"
                                                    />
                                                </FormControl>
                                                <p className="text-xs text-muted-foreground mt-2">
                                                    Haz clic o arrastra para subir el logo (JPG, PNG, WEBP).
                                                </p>
                                                <FormMessage />
                                            </div>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="menuSlogan"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Mensaje de bienvenida (Slogan)</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="Bienvenido a nuestro menu digital" />
                                                </FormControl>
                                                <p className="text-xs text-muted-foreground">Este texto aparece debajo del nombre del negocio en publico.</p>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </Card>

                            {/* Colores y Diseño (Manejados por BrandingForm, no es submit del gran <form>) */}
                            <BrandingForm defaultValues={brandingData} />
                        </div>
                    </TabsContent>

                    {/* Finanzas */}
                    <TabsContent value="finance">
                        <Card className="p-6 space-y-6">
                            <div className="space-y-4 max-w-2xl">
                                <div className="space-y-4">
                                    <h4 className="text-sm font-medium">Mercado Pago</h4>
                                    <FormField
                                        control={form.control}
                                        name="mpPublicKey"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Public Key</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="APP_USR-xxx" className="font-mono text-sm" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="mpAccessToken"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Access Token</FormLabel>
                                                <FormControl>
                                                    <Input {...field} type="password" placeholder="APP_USR-xxx" className="font-mono text-sm" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="mpWebhookSecret"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Webhook Secret</FormLabel>
                                                <FormControl>
                                                    <Input {...field} type="password" placeholder="xxx" className="font-mono text-sm" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        </Card>
                    </TabsContent>

                    {/* Email */}
                    <TabsContent value="email">
                        <Card className="p-6 space-y-6 max-w-2xl">
                            <h3 className="text-lg font-semibold">Configuracion SMTP</h3>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="smtpHost"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Host</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="smtp.ejemplo.com" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="smtpPort"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Puerto</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type="number"
                                                    onChange={e => {
                                                        const val = e.target.value;
                                                        field.onChange(val === "" ? undefined : parseInt(val));
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name="smtpSecure"
                                render={({ field }) => (
                                    <FormItem className="flex items-center justify-between p-3 rounded-lg border">
                                        <FormLabel className="text-base">SSL/TLS</FormLabel>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <div className="grid gap-4 sm:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="smtpUser"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Usuario</FormLabel>
                                            <FormControl>
                                                <Input {...field} autoComplete="off" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="smtpPass"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Password</FormLabel>
                                            <FormControl>
                                                <Input {...field} type="password" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </Card>
                    </TabsContent>

                    {/* APIs */}
                    <TabsContent value="apis">
                        <Card className="p-6 space-y-4 max-w-2xl">
                            <h3 className="text-lg font-semibold">API Internas</h3>
                            <FormField
                                control={form.control}
                                name="apiKeyOpenAI"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>OpenAI API Key</FormLabel>
                                        <FormControl>
                                            <Input {...field} type="password" placeholder="sk-..." className="font-mono text-sm" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Botón de Guardar */}
                <div className="flex gap-4 pt-4">
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full sm:w-auto min-w-[200px] h-12 text-lg font-semibold"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Guardando...
                            </>
                        ) : (
                            "Guardar Todo"
                        )}
                    </Button>
                </div>
            </form>
        </Form >
    )
}

