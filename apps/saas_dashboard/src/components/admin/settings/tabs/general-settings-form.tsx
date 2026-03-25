"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { generalSettingsSchema, GeneralSettingsValues } from "@alvarosky/features"
import { Button, Input, Card, Form, FormControl, FormField, FormItem, FormLabel, FormMessage, Switch, useToast } from "@alvarosky/ui"
import { Loader2, MapPin } from "lucide-react"
import { updateGeneralSettings } from "@/actions/admin/update-settings"
import { SingleImageDropzone } from "@alvarosky/ui"
import { API_BASE, TENANT_ID } from "@/lib/config"
import { useState, useEffect } from "react"

interface GeneralSettingsFormProps {
    initialData?: GeneralSettingsValues
}

export function GeneralSettingsForm({ initialData }: GeneralSettingsFormProps) {
    const toast = useToast()
    const [authToken, setAuthToken] = useState("")

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setAuthToken(localStorage.getItem("token") || "")
        }
    }, [])

    const form = useForm<GeneralSettingsValues>({
        resolver: zodResolver(generalSettingsSchema),
        defaultValues: {
            storeName: initialData?.storeName || "",
            storeEmail: initialData?.storeEmail || "",
            whatsapp: initialData?.whatsapp || "",
            instagram: initialData?.instagram || "",
            facebook: initialData?.facebook || "",
            address: initialData?.address || "",
            menuSlogan: initialData?.menuSlogan || "",
            enableBlog: initialData?.enableBlog ?? true,
            enableStore: initialData?.enableStore ?? true,
            enableLMS: initialData?.enableLMS ?? false,
            orderTrackingEnabled: initialData?.orderTrackingEnabled ?? true,
        },
    })

    const onSubmit = async (data: GeneralSettingsValues) => {
        try {
            const result = await updateGeneralSettings(data)
            if (result.success) {
                toast.success("Configuración general actualizada")
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
                <Card className="p-6">
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold">Información del Negocio</h3>
                        <div className="grid gap-6">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="storeName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nombre de la Tienda</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Mi Negocio" />
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
                                            <FormLabel>Email de Contacto</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="contacto@ejemplo.com" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="whatsapp"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>WhatsApp (con código de país)</FormLabel>
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
                                            <FormLabel>Dirección Física</FormLabel>
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
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="instagram"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Instagram (usuario)</FormLabel>
                                            <FormControl>
                                                <div className="flex items-center">
                                                    <span className="bg-muted px-3 h-10 flex items-center border border-border/40 border-r-0 rounded-l-md text-muted-foreground text-sm">@</span>
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

                            <div className="pt-6 border-t border-border/40 font-semibold">Configuración de Funciones</div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="orderTrackingEnabled"
                                    render={({ field }) => (
                                        <FormItem className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-muted/40">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-base">Seguimiento de Pedidos</FormLabel>
                                                <p className="text-xs text-muted-foreground">Estado del pedido tras la compra.</p>
                                            </div>
                                            <FormControl>
                                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="enableStore"
                                    render={({ field }) => (
                                        <FormItem className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-muted/40">
                                            <FormLabel className="text-base">Tienda Online</FormLabel>
                                            <FormControl>
                                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="enableBlog"
                                    render={({ field }) => (
                                        <FormItem className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-muted/40">
                                            <FormLabel className="text-base">Blog de Noticias</FormLabel>
                                            <FormControl>
                                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="enableLMS"
                                    render={({ field }) => (
                                        <FormItem className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-muted/40">
                                            <FormLabel className="text-base">Plataforma Educativa (LMS)</FormLabel>
                                            <FormControl>
                                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Mensaje de Bienvenida</h3>
                        <FormField
                            control={form.control}
                            name="menuSlogan"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Slogan del Menú Digital</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Bienvenido a nuestro menú digital" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
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
    )
}
