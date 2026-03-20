"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { emailSettingsSchema, EmailSettingsValues } from "@alvarosky/features"
import { Button, Input, Card, Form, FormControl, FormField, FormItem, FormLabel, FormMessage, Switch, useToast } from "@alvarosky/ui"
import { Loader2 } from "lucide-react"
import { updateEmailSettings } from "@/actions/admin/update-settings"

interface EmailSettingsFormProps {
    initialData?: EmailSettingsValues
}

export function EmailSettingsForm({ initialData }: EmailSettingsFormProps) {
    const toast = useToast()

    const form = useForm<EmailSettingsValues>({
        resolver: zodResolver(emailSettingsSchema),
        defaultValues: {
            smtpHost: initialData?.smtpHost || "",
            smtpPort: initialData?.smtpPort || 587,
            smtpSecure: initialData?.smtpSecure ?? false,
            smtpUser: initialData?.smtpUser || "",
            smtpPass: initialData?.smtpPass || "",
        },
    })

    const onSubmit = async (data: EmailSettingsValues) => {
        try {
            const result = await updateEmailSettings(data)
            if (result.success) {
                toast.success("Configuración de email actualizada")
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
                                        <Input
                                            {...field}
                                            type="number"
                                            onChange={e => field.onChange(parseInt(e.target.value) || 587)}
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
                                    <FormLabel>Contraseña</FormLabel>
                                    <FormControl>
                                        <Input {...field} type="password" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
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
    )
}
