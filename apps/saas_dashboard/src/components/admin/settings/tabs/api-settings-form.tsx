"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { apiSettingsSchema, ApiSettingsValues } from "@alvarosky/features"
import { Button, Input, Card, Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription, useToast, Switch } from "@alvarosky/ui"
import { Loader2, MessageSquare, CheckCircle2, ExternalLink, BarChart3 } from "lucide-react"
import { updateApiSettings } from "@/actions/admin/update-settings"
import { TENANT_ID, META_HUB_DOMAIN } from "@/lib/config"
import { useRouter } from "next/navigation"

interface ApiSettingsFormProps {
    initialData?: ApiSettingsValues
    waPhoneNumberId?: string | null
    wabaId?: string | null
}

export function ApiSettingsForm({ initialData, waPhoneNumberId, wabaId }: ApiSettingsFormProps) {
    const toast = useToast()
    const router = useRouter()

    const form = useForm<ApiSettingsValues>({
        resolver: zodResolver(apiSettingsSchema),
        defaultValues: {
            apiKeyOpenAI: initialData?.apiKeyOpenAI || "",
            isWaBotActive: initialData?.isWaBotActive ?? true,
            tiktokPixelId: initialData?.tiktokPixelId || "",
            tiktokAccessToken: initialData?.tiktokAccessToken || "",
        },
    })

    const onSubmit = async (data: ApiSettingsValues) => {
        try {
            const result = await updateApiSettings(data)
            if (result.success) {
                toast.success("Configuración de APIs actualizada")
            } else {
                toast.error(result.error || "Error al actualizar")
            }
        } catch (error) {
            toast.error("Error al procesar el formulario")
        }
    }

    const isConnected = Boolean(waPhoneNumberId)

    /**
     * Redirige al Hub Centralizado de Meta Embedded Signup.
     * Usa window.location.href (redirect completo) para evitar
     * bloqueo de popups en navegadores modernos.
     */
    const handleConnectWhatsApp = () => {
        if (!META_HUB_DOMAIN) {
            toast.error("NEXT_PUBLIC_META_HUB_DOMAIN no está configurado. Reconstruye la app con esta variable.")
            return
        }

        const currentUrl = window.location.href
        const hubUrl = `https://${META_HUB_DOMAIN}/meta/conectar?tenantId=${encodeURIComponent(TENANT_ID)}&returnUrl=${encodeURIComponent(currentUrl)}`

        window.location.href = hubUrl
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-6">
                    <Card className="p-6 space-y-4">
                        <h3 className="text-lg font-semibold">API Internas</h3>
                        <FormField
                            control={form.control}
                            name="apiKeyOpenAI"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>OpenAI API Key</FormLabel>
                                    <FormControl>
                                        <Input {...field} type="password" placeholder="sk-..." className="font-mono text-sm" autoComplete="new-password" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex justify-center pt-2">
                            <Button type="submit" disabled={form.formState.isSubmitting} className="min-w-[180px]">
                                {form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : "Guardar OpenAI"}
                            </Button>
                        </div>
                    </Card>

                    {/* ── TikTok CAPI ── */}
                    <Card className="p-6 space-y-4 border-border/40">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center h-9 w-9 rounded-full bg-pink-100 dark:bg-pink-900/30">
                                <BarChart3 className="h-4 w-4 text-pink-600 dark:text-pink-400" aria-hidden="true" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">TikTok Tracking</h3>
                                <p className="text-sm text-muted-foreground">Browser Pixel + Server-Side API (CAPI) con deduplicación</p>
                            </div>
                        </div>
                        <FormField
                            control={form.control}
                            name="tiktokPixelId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Pixel ID</FormLabel>
                                    <FormControl>
                                        <Input {...field} type="text" placeholder="CXXXXXXXXXXXXXXXXX" className="font-mono text-sm" autoComplete="off" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="tiktokAccessToken"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Access Token (CAPI)</FormLabel>
                                    <FormControl>
                                        <Input {...field} type="password" placeholder="Token de acceso para la API de Conversiones" className="font-mono text-sm" autoComplete="new-password" />
                                    </FormControl>
                                    <FormDescription>
                                        Para encontrarlo, primero termina de crear tu píxel. Luego ve a su pestaña <strong>Configuración</strong>, baja hasta <strong>API de Eventos</strong> y haz clic en <strong>Generar token de acceso</strong>.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="bg-muted p-4 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="space-y-1">
                                <h4 className="text-sm font-medium">Verificar la configuración del código base</h4>
                                <p className="text-sm text-muted-foreground mr-4">
                                    Te recomendamos utilizar el plugin de Chrome <strong>Ayuda del píxel de TikTok</strong>. Puedes usarlo para comprobar si se activan los eventos y solucionar problemas de instalación.
                                </p>
                            </div>
                            <Button variant="outline" size="sm" asChild className="shrink-0 bg-background">
                                <a href="https://chromewebstore.google.com/detail/tiktok-pixel-helper/aelgobmabdmlfmiblddjfnjodalhidnn" target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="w-4 h-4 mr-2" aria-hidden="true" />
                                    Instalar Pixel Helper
                                </a>
                            </Button>
                        </div>
                        <div className="flex justify-center pt-2">
                            <Button type="submit" disabled={form.formState.isSubmitting} className="min-w-[180px]">
                                {form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : "Guardar TikTok"}
                            </Button>
                        </div>
                    </Card>

                    <Card className="p-6 space-y-4 border-border/40">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center h-9 w-9 rounded-full bg-green-100 dark:bg-green-900/30">
                                    <MessageSquare className="h-4 w-4 text-green-600 dark:text-green-400" aria-hidden="true" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">Integración de WhatsApp</h3>
                                    <p className="text-sm text-muted-foreground mt-1">Conecta y administra tu botón de ventas virtual</p>
                                </div>
                            </div>
                            {isConnected && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                    <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                                    Conectado
                                </span>
                            )}
                        </div>

                        {isConnected ? (
                            <div className="space-y-6 pt-2">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1 bg-muted/50 p-3 rounded-md">
                                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Phone Number ID</p>
                                        <p className="font-mono text-sm">{waPhoneNumberId}</p>
                                    </div>
                                    {wabaId && (
                                        <div className="space-y-1 bg-muted/50 p-3 rounded-md">
                                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">WABA ID</p>
                                            <p className="font-mono text-sm">{wabaId}</p>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="border-t border-border pt-4">
                                    <FormField
                                        control={form.control}
                                        name="isWaBotActive"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                                                <div className="space-y-1">
                                                    <FormLabel className="text-base">Asistente de IA Activo</FormLabel>
                                                    <FormDescription>
                                                        {field.value 
                                                          ? "El bot está respondiendo automáticamente a los clientes." 
                                                          : "Bot apagado. Leeremos los mensajes que lleguen, pero debes responder tú de forma manual o desde tu App de WhatsApp Business (Coexistencia)."}
                                                    </FormDescription>
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

                                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                    <Button type="submit" disabled={form.formState.isSubmitting} className="flex-1">
                                        {form.formState.isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" /> : "Guardar Ajustes de IA"}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleConnectWhatsApp}
                                        className="flex-1"
                                    >
                                        <ExternalLink className="mr-2 h-4 w-4" aria-hidden="true" />
                                        Reconectar con Meta
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <section className="space-y-5 pt-2" aria-label="Conectar WhatsApp">
                                <div className="bg-muted p-4 rounded-lg space-y-3">
                                    <h4 className="text-sm font-semibold">¡Sigue estos pasos en la ventana emergente que se abrirá!</h4>
                                    <ul className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                                        <li>Haz clic en <strong>"Continuar"</strong> y acepta los permisos.</li>
                                        <li>En el desplegable, asegúrate de elegir <strong>"Crear una cuenta de WhatsApp Business"</strong>. (No uses cuentas/portfolios existentes si quieres aislar tu bot).</li>
                                        <li>Más adelante, selecciona <strong>"Añadir un número nuevo"</strong> e ingresa el número donde vas a instalar el Bot.</li>
                                    </ul>
                                </div>
                                <Button
                                    type="button"
                                    onClick={handleConnectWhatsApp}
                                    className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white focus-visible:ring-green-500 py-6"
                                >
                                    <ExternalLink className="mr-2 h-5 w-5" aria-hidden="true" />
                                    Conectar WhatsApp con Meta
                                </Button>
                                <p className="text-xs text-center text-muted-foreground">Este proceso es seguro y utiliza la autenticación oficial de Meta para registrar tu número para la API.</p>
                            </section>
                        )}
                    </Card>
                </div>
            </form>
        </Form>
    )
}
