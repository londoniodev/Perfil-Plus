"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { financeSettingsSchema, FinanceSettingsValues } from "@alvarosky/features"
import { Button, Input, Card, Form, FormControl, FormField, FormItem, FormLabel, FormMessage, useToast, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@alvarosky/ui"
import { Loader2 } from "lucide-react"
import { updateFinanceSettings } from "@/actions/admin/update-settings"

interface FinanceSettingsFormProps {
    initialData?: FinanceSettingsValues
}

export function FinanceSettingsForm({ initialData }: FinanceSettingsFormProps) {
    const toast = useToast()

    const form = useForm<FinanceSettingsValues>({
        resolver: zodResolver(financeSettingsSchema),
        defaultValues: {
            currency: initialData?.currency || "COP",
            mpPublicKey: initialData?.mpPublicKey || "",
            mpAccessToken: initialData?.mpAccessToken || "",
            mpWebhookSecret: initialData?.mpWebhookSecret || "",
            mpClientId: initialData?.mpClientId || "",
            mpClientSecret: initialData?.mpClientSecret || "",
            deliveryFee: initialData?.deliveryFee || 0,
        },
    })

    const onSubmit = async (data: FinanceSettingsValues) => {
        try {
            const result = await updateFinanceSettings(data)
            if (result.success) {
                toast.success("Configuración financiera actualizada")
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
                        <div className="space-y-4">
                            <h4 className="text-sm font-medium">Mercado Pago</h4>
                            <div className="grid gap-4">
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
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <FormField
                                        control={form.control}
                                        name="mpClientId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Client ID (Opcional)</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="1234..." className="font-mono text-sm" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="mpClientSecret"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Client Secret (Opcional)</FormLabel>
                                                <FormControl>
                                                    <Input {...field} type="password" placeholder="xxx..." className="font-mono text-sm" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            <div className="pt-6 border-t border-border/40 font-semibold">Tarifas y Moneda</div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="currency"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Moneda</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger aria-label="Seleccionar moneda">
                                                        <SelectValue placeholder="Selecciona" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="COP">Peso Colombiano (COP)</SelectItem>
                                                    <SelectItem value="USD">Dólar Estadounidense (USD)</SelectItem>
                                                    <SelectItem value="MXN">Peso Mexicano (MXN)</SelectItem>
                                                    <SelectItem value="EUR">Euro (EUR)</SelectItem>
                                                    <SelectItem value="CLP">Peso Chileno (CLP)</SelectItem>
                                                    <SelectItem value="PEN">Sol Peruano (PEN)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
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
                                                    onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
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
