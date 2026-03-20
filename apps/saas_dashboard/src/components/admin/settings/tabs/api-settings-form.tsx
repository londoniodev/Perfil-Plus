"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { apiSettingsSchema, ApiSettingsValues } from "@alvarosky/features"
import { Button, Input, Card, Form, FormControl, FormField, FormItem, FormLabel, FormMessage, useToast } from "@alvarosky/ui"
import { Loader2 } from "lucide-react"
import { updateApiSettings } from "@/actions/admin/update-settings"
import { WhatsAppEmbeddedSignup } from "@/components/admin/whatsapp/embedded-signup"

interface ApiSettingsFormProps {
    initialData?: ApiSettingsValues
    waPhoneNumberId?: string | null
    wabaId?: string | null
}

export function ApiSettingsForm({ initialData, waPhoneNumberId, wabaId }: ApiSettingsFormProps) {
    const toast = useToast()

    const form = useForm<ApiSettingsValues>({
        resolver: zodResolver(apiSettingsSchema),
        defaultValues: {
            apiKeyOpenAI: initialData?.apiKeyOpenAI || "",
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

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                        <div className="flex justify-end pt-2">
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar OpenAI"}
                            </Button>
                        </div>
                    </Card>

                    <Card className="p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Integración de WhatsApp</h3>
                            {waPhoneNumberId && (
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Conectado
                                </span>
                            )}
                        </div>
                        
                        <WhatsAppEmbeddedSignup onSuccess={() => {
                            window.location.reload()
                        }} />

                        {waPhoneNumberId && (
                            <div className="pt-4 border-t space-y-3">
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
                            </div>
                        )}
                    </Card>
                </div>
            </form>
        </Form>
    )
}
