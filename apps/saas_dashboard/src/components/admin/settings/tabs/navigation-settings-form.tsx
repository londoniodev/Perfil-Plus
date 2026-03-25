"use client"

import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { navigationSettingsSchema, NavigationSettingsValues } from "@alvarosky/features"
import { Button, Input, Card, Form, FormControl, FormField, FormItem, FormLabel, FormMessage, useToast } from "@alvarosky/ui"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { updateNavigationSettings } from "@/actions/admin/update-settings"

interface NavigationSettingsFormProps {
    initialData?: NavigationSettingsValues
}

export function NavigationSettingsForm({ initialData }: NavigationSettingsFormProps) {
    const toast = useToast()

    const form = useForm<NavigationSettingsValues>({
        resolver: zodResolver(navigationSettingsSchema),
        defaultValues: {
            headerLinks: initialData?.headerLinks || [],
            footerLinks: initialData?.footerLinks || [],
        },
    })

    const { fields: headerFields, append: appendHeader, remove: removeHeader } = useFieldArray({
        control: form.control,
        name: "headerLinks"
    })

    const { fields: footerFields, append: appendFooter, remove: removeFooter } = useFieldArray({
        control: form.control,
        name: "footerLinks"
    })

    const onSubmit = async (data: NavigationSettingsValues) => {
        try {
            const result = await updateNavigationSettings(data)
            if (result.success) {
                toast.success("Navegación actualizada")
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
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Header Links */}
                    <Card className="p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Enlaces del Encabezado</h3>
                            <Button 
                                type="button" 
                                variant="outline" 
                                size="sm" 
                                onClick={() => appendHeader({ label: "", href: "" })}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Agregar
                            </Button>
                        </div>
                        
                        <div className="space-y-3">
                            {headerFields.map((field, index) => (
                                <div key={field.id} className="flex gap-2 items-start bg-muted/30 p-3 rounded-lg border border-border/40">
                                    <div className="grid flex-1 gap-2">
                                        <FormField
                                            control={form.control}
                                            name={`headerLinks.${index}.label`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input {...field} placeholder="Inicio, Tienda, etc." />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`headerLinks.${index}.href`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input {...field} placeholder="/shop, /about, etc." />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <Button 
                                        type="button" 
                                        variant="ghost" 
                                        size="icon" 
                                        className="text-destructive h-8 w-8"
                                        onClick={() => removeHeader(index)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            {headerFields.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-4">No hay enlaces configurados.</p>
                            )}
                        </div>
                    </Card>

                    {/* Footer Links */}
                    <Card className="p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Enlaces del Pie de Página</h3>
                            <Button 
                                type="button" 
                                variant="outline" 
                                size="sm" 
                                onClick={() => appendFooter({ label: "", href: "" })}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Agregar
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {footerFields.map((field, index) => (
                                <div key={field.id} className="flex gap-2 items-start bg-muted/30 p-3 rounded-lg border border-border/40">
                                    <div className="grid flex-1 gap-2">
                                        <FormField
                                            control={form.control}
                                            name={`footerLinks.${index}.label`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input {...field} placeholder="Términos, Privacidad, etc." />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`footerLinks.${index}.href`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input {...field} placeholder="/terms, etc." />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <Button 
                                        type="button" 
                                        variant="ghost" 
                                        size="icon" 
                                        className="text-destructive h-8 w-8"
                                        onClick={() => removeFooter(index)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            {footerFields.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-4">No hay enlaces configurados.</p>
                            )}
                        </div>
                    </Card>
                </div>

                <div className="flex justify-center pt-4">
                    <Button type="submit" disabled={form.formState.isSubmitting} className="min-w-[200px] h-12 text-lg">
                        {form.formState.isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Guardando...
                            </>
                        ) : (
                            "Guardar Navegación"
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
