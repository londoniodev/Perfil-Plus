"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button, Input, Card, Form, FormControl, FormField, FormItem, FormLabel, FormMessage, Tabs, TabsList, TabsTrigger, TabsContent, Switch, Label } from "@alvarosky/ui"
import { Loader2, ExternalLink, Check, Info, DollarSign, Palette, Puzzle, Mail, Code } from "lucide-react"
import { updateSettings } from "@/actions/admin/update-settings"
import { useToast } from "@alvarosky/ui"

const settingsSchema = z.object({
    // Info
    storeName: z.string().min(1, "El nombre de la tienda es requerido").optional(),
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

    // Features
    enableBlog: z.boolean().optional(),
    enableStore: z.boolean().optional(),
    enableLMS: z.boolean().optional(),
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
    }
}

export function SettingsForm({ initialData }: SettingsFormProps) {
    const toast = useToast()
    const [isSubmitting, setIsSubmitting] = useState(false)

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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Tabs defaultValue="info" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 mb-8">
                        <TabsTrigger value="info">
                            <Info className="w-4 h-4 mr-2" /> <span className="hidden sm:inline">Info</span>
                        </TabsTrigger>
                        <TabsTrigger value="finance">
                            <DollarSign className="w-4 h-4 mr-2" /> <span className="hidden sm:inline">Finanzas</span>
                        </TabsTrigger>
                        <TabsTrigger value="appearance">
                            <Palette className="w-4 h-4 mr-2" /> <span className="hidden sm:inline">Apariencia</span>
                        </TabsTrigger>
                        <TabsTrigger value="features">
                            <Puzzle className="w-4 h-4 mr-2" /> <span className="hidden sm:inline">Features</span>
                        </TabsTrigger>
                        <TabsTrigger value="email">
                            <Mail className="w-4 h-4 mr-2" /> <span className="hidden sm:inline">Email</span>
                        </TabsTrigger>
                        <TabsTrigger value="apis">
                            <Code className="w-4 h-4 mr-2" /> <span className="hidden sm:inline">API's</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Información */}
                    <TabsContent value="info">
                        <Card className="p-6 space-y-4">
                            <div className="flex items-center gap-2 text-blue-600 bg-blue-50 p-3 rounded-md mb-4 text-sm">
                                <Info className="h-4 w-4" />
                                <span>El nombre y correo de la tienda se gestionan desde la plataforma central.</span>
                            </div>
                            <h3 className="text-lg font-semibold">Información General</h3>
                            <div className="grid gap-4 max-w-2xl">
                                <FormField
                                    control={form.control}
                                    name="storeName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nombre de la Tienda</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Mi Tienda" disabled />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="storeEmail"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email de Soporte</FormLabel>
                                            <FormControl>
                                                <Input {...field} type="email" placeholder="soporte@mitienda.com" disabled />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </Card>
                    </TabsContent>

                    {/* Finanzas */}
                    <TabsContent value="finance">
                        <Card className="p-6 space-y-6">
                            <div className="space-y-4 max-w-2xl">
                                <FormField
                                    control={form.control}
                                    name="currency"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Moneda</FormLabel>
                                            <select
                                                {...field}
                                                disabled
                                                className="w-full p-2.5 rounded-lg bg-muted border border-input focus:ring-2 focus:ring-primary opacity-70 cursor-not-allowed"
                                            >
                                                <option value="COP">COP - Peso Colombiano</option>
                                                <option value="USD">USD - Dólar Estadounidense</option>
                                            </select>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                La moneda base se configura globalmente por el administrador del sistema.
                                            </p>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="border-t pt-4 space-y-4">
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

                    {/* Apariencia */}
                    <TabsContent value="appearance">
                        <Card className="p-6 space-y-4 max-w-2xl">
                            <h3 className="text-lg font-semibold">Personalización</h3>
                            <FormField
                                control={form.control}
                                name="theme"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tema</FormLabel>
                                        <select
                                            {...field}
                                            className="w-full p-2.5 rounded-lg bg-background border border-input"
                                        >
                                            <option value="">Automático</option>
                                            <option value="light">Claro</option>
                                            <option value="dark">Oscuro</option>
                                        </select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="primaryColor"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Color Primario</FormLabel>
                                        <div className="flex gap-3">
                                            <Input
                                                type="color"
                                                {...field}
                                                className="w-16 h-10 p-1 cursor-pointer"
                                            />
                                            <Input
                                                {...field}
                                                className="flex-1 font-mono text-sm"
                                            />
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </Card>
                    </TabsContent>

                    {/* Features */}
                    <TabsContent value="features">
                        <Card className="p-6 space-y-4 max-w-2xl">
                            <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-md mb-4 text-sm">
                                <Puzzle className="h-4 w-4" />
                                <span>La activación de módulos (Features) es gestionada por el administrador del sistema.</span>
                            </div>
                            <h3 className="text-lg font-semibold">Módulos Activos</h3>
                            {[
                                { name: "enableBlog" as const, label: "Blog", desc: "Sistema de artículos" },
                                { name: "enableStore" as const, label: "Tienda", desc: "E-commerce" },
                                { name: "enableLMS" as const, label: "LMS", desc: "Cursos y lecciones" },
                            ].map((feature) => (
                                <FormField
                                    key={feature.name}
                                    control={form.control}
                                    name={feature.name}
                                    render={({ field }) => (
                                        <FormItem className="flex items-center justify-between p-3 rounded-lg border">
                                            <div>
                                                <FormLabel className="text-base">{feature.label}</FormLabel>
                                                <p className="text-xs text-muted-foreground">{feature.desc}</p>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                    disabled
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            ))}
                        </Card>
                    </TabsContent>

                    {/* Email */}
                    <TabsContent value="email">
                        <Card className="p-6 space-y-6 max-w-2xl">
                            <h3 className="text-lg font-semibold">Configuración SMTP</h3>
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
                                                <Input {...field} type="number" onChange={e => field.onChange(parseInt(e.target.value))} />
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
                        className="w-full sm:w-auto min-w-[200px] h-12 text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500"
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
        </Form>
    )
}

