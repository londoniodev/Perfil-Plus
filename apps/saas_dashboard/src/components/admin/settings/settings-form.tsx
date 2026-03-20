"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button, Input, Card, Form, FormControl, FormField, FormItem, FormLabel, FormMessage, Tabs, TabsList, TabsTrigger, TabsContent, Switch } from "@alvarosky/ui"
import { settingsSchema, SettingsFormValues } from "@alvarosky/features"
import { Loader2, MapPin } from "lucide-react"
import { updateSettings } from "@/actions/admin/update-settings"
import { useToast } from "@alvarosky/ui"
import { SingleImageDropzone } from "@alvarosky/ui"
import { API_BASE, TENANT_ID } from "@/lib/config"
import { BrandingForm } from "@/components/settings/BrandingForm"
import { WhatsAppEmbeddedSignup } from "@/components/admin/whatsapp/embedded-signup"

interface SettingsFormProps {
    initialData?: {
        storeName?: string | null
        storeEmail?: string | null
        currency?: string | null
        MERCADOPAGO_CONFIG?: {
            publicKey?: string | null
            accessToken?: string | null
            webhookSecret?: string | null
            clientId?: string | null
            clientSecret?: string | null
        }
        theme?: string | null
        primary_color?: string | null
        smtp?: {
            host?: string | null
            port?: number | null
            secure?: boolean | null
            auth?: {
                user?: string | null
                pass?: string | null
            }
        }
        api_key_openai?: string | null
        enableBlog?: boolean | null
        enableStore?: boolean | null
        enableLMS?: boolean | null
        whatsapp?: string | null
        instagram?: string | null
        facebook?: string | null
        address?: string | null
        orderTrackingEnabled?: boolean | null
        menu?: {
            slogan?: string | null
            logo?: string | null
        }
        contact?: {
            whatsapp?: string | null
            instagram?: string | null
            facebook?: string | null
            address?: string | null
        }
        waPhoneNumberId?: string | null
        wabaId?: string | null
        deliveryFee?: number | null
    }
    brandingData?: any
}

export function SettingsForm({ initialData, brandingData }: SettingsFormProps) {
    const toast = useToast()
    const [authToken, setAuthToken] = useState("");
    const brandingFormRef = useRef<any>(null);

    // Mapear la respuesta cruda de la API (BrandSettings) a los campos del BrandingForm
    const mappedBrandingData = useMemo(() => {
        const bs = brandingData?.brandSettings;
        if (!bs) return undefined;
        return {
            primary: bs.primaryColor || "",
            radius: bs.borderRadius ?? 0.5,
            density: "default" as const,
            mode: "system" as const,
            logoUrl: bs.logoUrl || "",
            faviconUrl: bs.faviconUrl || "",
            secondaryColor: bs.secondaryColor || "",
            fontFamily: bs.fontFamily?.split(",")[0]?.trim() || "Inter",
        };
    }, [brandingData]);

    // Read auth token on client side
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setAuthToken(localStorage.getItem("token") || "");
        }
    }, []);

    const form = useForm<SettingsFormValues>({
        resolver: zodResolver(settingsSchema) as any,
        defaultValues: {
            storeName: initialData?.storeName || "",
            storeEmail: initialData?.storeEmail || "",
            currency: initialData?.currency || "COP",
            mpPublicKey: initialData?.MERCADOPAGO_CONFIG?.publicKey || "",
            mpAccessToken: initialData?.MERCADOPAGO_CONFIG?.accessToken || "",
            mpWebhookSecret: initialData?.MERCADOPAGO_CONFIG?.webhookSecret || "",
            mpClientId: initialData?.MERCADOPAGO_CONFIG?.clientId || "",
            mpClientSecret: initialData?.MERCADOPAGO_CONFIG?.clientSecret || "",
            theme: initialData?.theme || "",
            primaryColor: initialData?.primary_color || "#6366f1",
            smtpHost: initialData?.smtp?.host || "",
            smtpPort: initialData?.smtp?.port || 587,
            smtpSecure: initialData?.smtp?.secure ?? false,
            smtpUser: initialData?.smtp?.auth?.user || "",
            smtpPass: initialData?.smtp?.auth?.pass || "",
            apiKeyOpenAI: initialData?.api_key_openai || "",
            enableBlog: initialData?.enableBlog ?? true,
            enableStore: initialData?.enableStore ?? true,
            enableLMS: initialData?.enableLMS ?? false,
            whatsapp: initialData?.contact?.whatsapp || initialData?.whatsapp || "",
            instagram: initialData?.contact?.instagram || initialData?.instagram || "",
            facebook: initialData?.contact?.facebook || initialData?.facebook || "",
            address: initialData?.contact?.address || initialData?.address || "",
            orderTrackingEnabled: initialData?.orderTrackingEnabled ?? true,
            menuSlogan: initialData?.menu?.slogan || "",
            menuLogo: initialData?.menu?.logo || "",
            deliveryFee: initialData?.deliveryFee || 0,
        },
    })

    // Hidratar formulario cuando cambian los datos iniciales
    useEffect(() => {
        if (initialData) {
            form.reset({
                storeName: initialData?.storeName || "",
                storeEmail: initialData?.storeEmail || "",
                currency: initialData?.currency || "COP",
                mpPublicKey: initialData?.MERCADOPAGO_CONFIG?.publicKey || "",
                mpAccessToken: initialData?.MERCADOPAGO_CONFIG?.accessToken || "",
                mpWebhookSecret: initialData?.MERCADOPAGO_CONFIG?.webhookSecret || "",
                mpClientId: initialData?.MERCADOPAGO_CONFIG?.clientId || "",
                mpClientSecret: initialData?.MERCADOPAGO_CONFIG?.clientSecret || "",
                theme: initialData?.theme || "",
                primaryColor: initialData?.primary_color || "#6366f1",
                smtpHost: initialData?.smtp?.host || "",
                smtpPort: initialData?.smtp?.port || 587,
                smtpSecure: initialData?.smtp?.secure ?? false,
                smtpUser: initialData?.smtp?.auth?.user || "",
                smtpPass: initialData?.smtp?.auth?.pass || "",
                apiKeyOpenAI: initialData?.api_key_openai || "",
                enableBlog: initialData?.enableBlog ?? true,
                enableStore: initialData?.enableStore ?? true,
                enableLMS: initialData?.enableLMS ?? false,
                whatsapp: initialData?.contact?.whatsapp || initialData?.whatsapp || "",
                instagram: initialData?.contact?.instagram || initialData?.instagram || "",
                facebook: initialData?.contact?.facebook || initialData?.facebook || "",
                address: initialData?.contact?.address || initialData?.address || "",
                orderTrackingEnabled: initialData?.orderTrackingEnabled ?? true,
                menuSlogan: initialData?.menu?.slogan || "",
                menuLogo: initialData?.menu?.logo || "",
                deliveryFee: initialData?.deliveryFee || 0,
            })
        }
    }, [initialData, form])

    const onSubmit = async (data: SettingsFormValues) => {
        try {
            const result = await updateSettings(data)

            if (brandingFormRef.current) {
                await brandingFormRef.current.submit();
            }

            if (result.success) {
                toast.success("Configuración actualizada exitosamente")
            } else {
                toast.error(result.error || "Error al actualizar configuración")
            }
        } catch (error) {
            console.error("Error:", error)
            toast.error("Error al procesar el formulario")
        }
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit, (errors: any) => {
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

                                    <div className="pt-6 border-t font-semibold">Configuración de Funciones</div>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <FormField
                                            control={form.control}
                                            name="orderTrackingEnabled"
                                            render={({ field }) => (
                                                <FormItem className="flex items-center justify-between p-3 rounded-lg border">
                                                    <div className="space-y-0.5">
                                                        <FormLabel className="text-base">Seguimiento de Pedidos</FormLabel>
                                                        <p className="text-xs text-muted-foreground">Muestra el estado del pedido al cliente tras la compra.</p>
                                                    </div>
                                                    <FormControl>
                                                        <Switch
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                        />
                                                    </FormControl>
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
                                                        tenantId={TENANT_ID}
                                                        folder="branding"
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

                            {/* Colores y Diseño (Manejados por BrandingForm) */}
                            <BrandingForm ref={brandingFormRef} defaultValues={mappedBrandingData} />
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
                                                    <Input {...field} autoComplete="off" placeholder="APP_USR-xxx" className="font-mono text-sm" />
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
                                                    <Input {...field} autoComplete="new-password" type="password" placeholder={initialData?.MERCADOPAGO_CONFIG?.accessToken ? "******** (Configurado)" : "APP_USR-xxx"} className="font-mono text-sm" />
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
                                                    <Input {...field} autoComplete="new-password" type="password" placeholder={initialData?.MERCADOPAGO_CONFIG?.webhookSecret ? "******** (Oculto por seguridad)" : "v1-xxx"} className="font-mono text-sm" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="pt-6 border-t">
                                        <h4 className="text-sm font-medium mb-4">Tarifas de Domicilio</h4>
                                        <FormField
                                            control={form.control}
                                            name="deliveryFee"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Costo de Envío</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            type="number"
                                                            onChange={e => {
                                                                const val = e.target.value;
                                                                field.onChange(val === "" ? 0 : parseFloat(val));
                                                            }}
                                                            placeholder="0"
                                                        />
                                                    </FormControl>
                                                    <p className="text-xs text-muted-foreground">Valor fijo para cobros de domicilio vía WhatsApp.</p>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
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
                        <div className="grid gap-6 max-w-2xl">
                            <Card className="p-6 space-y-4">
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

                            <Card className="p-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold">Integración de WhatsApp</h3>
                                    {initialData?.waPhoneNumberId && (
                                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            Conectado
                                        </span>
                                    )}
                                </div>
                                
                                <WhatsAppEmbeddedSignup onSuccess={() => {
                                    // Recargar para ver los nuevos IDs si es necesario
                                    window.location.reload()
                                }} />

                                {initialData?.waPhoneNumberId && (
                                    <div className="pt-4 border-t space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Phone Number ID:</span>
                                            <span className="font-mono">{initialData.waPhoneNumberId}</span>
                                        </div>
                                        {initialData?.wabaId && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">WABA ID:</span>
                                                <span className="font-mono">{initialData.wabaId}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Botón de Guardar */}
                <div className="flex gap-4 pt-4">
                    <Button
                        type="submit"
                        disabled={form.formState.isSubmitting}
                        className="w-full sm:w-auto min-w-[200px] h-12 text-lg font-semibold"
                    >
                        {form.formState.isSubmitting ? (
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

