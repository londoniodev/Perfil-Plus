"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { apiSettingsSchema, ApiSettingsValues } from "@alvarosky/features"
import { Button, Input, Card, Form, FormControl, FormField, FormItem, FormLabel, FormMessage, useToast } from "@alvarosky/ui"
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
                                <h3 className="text-lg font-semibold">Integración de WhatsApp</h3>
                            </div>
                            {isConnected && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                    <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                                    Conectado
                                </span>
                            )}
                        </div>

                        {isConnected ? (
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Phone Number ID:</span>
                                    <span className="font-mono">{waPhoneNumberId}</span>
                                </div>
                                {wabaId && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">WABA ID:</span>
                                        <span className="font-mono">{wabaId}</span>
                                    </div>
                                )}
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleConnectWhatsApp}
                                    className="w-full mt-2"
                                >
                                    <ExternalLink className="mr-2 h-4 w-4" aria-hidden="true" />
                                    Reconectar con Meta
                                </Button>
                            </div>
                        ) : (
                            <section className="space-y-3" aria-label="Conectar WhatsApp">
                                <p className="text-sm text-muted-foreground">
                                    Conecta tu cuenta de Meta para empezar a usar el asistente inteligente de WhatsApp.
                                </p>
                                <Button
                                    type="button"
                                    onClick={handleConnectWhatsApp}
                                    className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white focus-visible:ring-green-500"
                                >
                                    <ExternalLink className="mr-2 h-4 w-4" aria-hidden="true" />
                                    Conectar con Meta
                                </Button>
                            </section>
                        )}
                    </Card>
                </div>
            </form>
        </Form>
    )
}
