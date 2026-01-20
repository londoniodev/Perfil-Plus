"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button, Input, Card, Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@alvarosky/ui"
import { Loader2, ExternalLink, Check } from "lucide-react"
import { updateSettings } from "@/actions/admin/update-settings"
import { useToast } from "@alvarosky/ui"

const settingsSchema = z.object({
    mpAccessToken: z.string().optional(),
    mpPublicKey: z.string().optional(),
    storeName: z.string().min(1, "El nombre de la tienda es requerido").optional(),
    storeEmail: z.string().email("Email inválido").optional().or(z.literal("")),
})

type SettingsFormValues = z.infer<typeof settingsSchema>

interface SettingsFormProps {
    initialData?: {
        mpAccessToken?: string | null
        mpPublicKey?: string | null
        storeName?: string | null
        storeEmail?: string | null
    }
}

export function SettingsForm({ initialData }: SettingsFormProps) {
    const toast = useToast()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<SettingsFormValues>({
        resolver: zodResolver(settingsSchema),
        defaultValues: {
            mpAccessToken: initialData?.mpAccessToken || "",
            mpPublicKey: initialData?.mpPublicKey || "",
            storeName: initialData?.storeName || "",
            storeEmail: initialData?.storeEmail || "",
        },
    })

    const onSubmit = async (data: SettingsFormValues) => {
        setIsSubmitting(true)

        try {
            const result = await updateSettings({
                mpAccessToken: data.mpAccessToken || undefined,
                mpPublicKey: data.mpPublicKey || undefined,
                storeName: data.storeName || undefined,
                storeEmail: data.storeEmail || undefined
            })

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
                {/* Card: Mercado Pago */}
                <Card className="p-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Mercado Pago</h3>
                            <a
                                href="https://www.mercadopago.com.mx/developers/panel/app"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary hover:underline flex items-center gap-1"
                            >
                                ¿Dónde encuentro mis credenciales?
                                <ExternalLink className="h-3 w-3" />
                            </a>
                        </div>

                        <p className="text-sm text-muted-foreground">
                            Configura tus credenciales de Mercado Pago para procesar pagos en tu tienda.
                        </p>

                        <div className="space-y-4 pt-2">
                            <FormField
                                control={form.control}
                                name="mpPublicKey"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Public Key</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                                                className="font-mono text-sm"
                                            />
                                        </FormControl>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Se usa en el frontend para inicializar el checkout.
                                        </p>
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
                                            <Input
                                                {...field}
                                                type="password"
                                                placeholder="APP_USR-xxxxxxxxxxxx-xxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-xxxxxxxx"
                                                className="font-mono text-sm"
                                            />
                                        </FormControl>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Credencial secreta para procesar pagos en el backend.
                                        </p>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {form.watch("mpAccessToken") && form.watch("mpPublicKey") && (
                            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
                                <Check className="h-4 w-4" />
                                <span>Credenciales configuradas</span>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Card: Información de la Tienda */}
                <Card className="p-6">
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Información de la Tienda</h3>

                        <p className="text-sm text-muted-foreground">
                            Configura la información general de tu tienda.
                        </p>

                        <div className="space-y-4 pt-2">
                            <FormField
                                control={form.control}
                                name="storeName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nombre de la Tienda</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Mi Tienda" />
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
                                            <Input {...field} type="email" placeholder="soporte@mitienda.com" />
                                        </FormControl>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Este email se usará para notificaciones y soporte.
                                        </p>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                </Card>

                {/* Botón de Guardar */}
                <div className="flex gap-4">
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="min-w-[120px]"
                    >
                        {isSubmitting ? (
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
    )
}

