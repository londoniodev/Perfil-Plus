"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { financeSettingsSchema, FinanceSettingsValues } from "@alvarosky/features"
import { Button, Input, Card, Form, FormControl, FormField, FormItem, FormLabel, FormMessage, useToast, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@alvarosky/ui"
import { Loader2, CreditCard, Banknote, ShieldCheck } from "lucide-react"
import { updateFinanceSettings } from "@/actions/admin/update-settings"

interface FinanceSettingsFormProps {
    initialData?: FinanceSettingsValues
}

const PROVIDER_OPTIONS = [
    { value: "NONE", label: "Sin pasarela", description: "No se procesan pagos en línea" },
    { value: "MERCADO_PAGO", label: "Mercado Pago", description: "Pagos con tarjeta, PSE y más" },
    { value: "BOLD", label: "Bold", description: "Link de pago Bold (Colombia)" },
    { value: "CASH", label: "Solo Efectivo", description: "Se acepta únicamente efectivo" },
] as const

export function FinanceSettingsForm({ initialData }: FinanceSettingsFormProps) {
    const toast = useToast()

    const form = useForm<FinanceSettingsValues>({
        resolver: zodResolver(financeSettingsSchema),
        defaultValues: {
            activePaymentProvider: initialData?.activePaymentProvider || "NONE",
            currency: initialData?.currency || "COP",
            mpPublicKey: initialData?.mpPublicKey || "",
            mpAccessToken: initialData?.mpAccessToken || "",
            mpWebhookSecret: initialData?.mpWebhookSecret || "",
            mpClientId: initialData?.mpClientId || "",
            mpClientSecret: initialData?.mpClientSecret || "",
            boldApiKey: initialData?.boldApiKey || "",
            boldSecretKey: initialData?.boldSecretKey || "",
            deliveryFee: initialData?.deliveryFee || 0,
        },
    })

    const activeProvider = form.watch("activePaymentProvider")

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
                {/* Selector de Pasarela Activa */}
                <Card className="p-6">
                    <section className="space-y-4">
                        <header className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-primary" aria-hidden="true" />
                            <h4 className="text-base font-semibold">Pasarela de Pagos Activa</h4>
                        </header>
                        <p className="text-sm text-muted-foreground">
                            Selecciona el proveedor de pagos que usarán tus clientes. Solo puede haber <strong>un proveedor activo</strong> a la vez.
                        </p>
                        <FormField
                            control={form.control}
                            name="activePaymentProvider"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Proveedor Activo</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger aria-label="Seleccionar pasarela de pagos">
                                                <SelectValue placeholder="Selecciona un proveedor" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {PROVIDER_OPTIONS.map((opt) => (
                                                <SelectItem key={opt.value} value={opt.value}>
                                                    <span className="flex flex-col">
                                                        <span className="font-medium">{opt.label}</span>
                                                    </span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </section>
                </Card>

                {/* Credenciales Mercado Pago */}
                {activeProvider === "MERCADO_PAGO" && (
                    <Card className="p-6 border-blue-500/30">
                        <section className="space-y-4">
                            <header className="flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5 text-blue-500" aria-hidden="true" />
                                <h4 className="text-sm font-semibold text-blue-600 dark:text-blue-400">Credenciales de Mercado Pago</h4>
                            </header>
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
                                                <Input {...field} type="password" placeholder="APP_USR-xxx" className="font-mono text-sm" autoComplete="off" />
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
                                            <FormLabel>Webhook Secret (Opcional)</FormLabel>
                                            <FormControl>
                                                <Input {...field} type="password" placeholder="whsec_xxx" className="font-mono text-sm" autoComplete="off" />
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
                                                    <Input {...field} placeholder="1234..." className="font-mono text-sm" autoComplete="off" />
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
                        </section>
                    </Card>
                )}

                {/* Credenciales Bold */}
                {activeProvider === "BOLD" && (
                    <Card className="p-6 border-emerald-500/30">
                        <section className="space-y-4">
                            <header className="flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5 text-emerald-500" aria-hidden="true" />
                                <h4 className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Credenciales de Bold</h4>
                            </header>
                            <p className="text-sm text-muted-foreground">
                                Obtén tus credenciales desde el panel de <a href="https://merchants.bold.co" target="_blank" rel="noopener noreferrer" className="underline text-emerald-600 hover:text-emerald-500">Bold Merchants</a>.
                            </p>
                            <div className="grid gap-4">
                                <FormField
                                    control={form.control}
                                    name="boldApiKey"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Bold API Key</FormLabel>
                                            <FormControl>
                                                <Input {...field} type="password" placeholder="bold_api_xxx" className="font-mono text-sm" autoComplete="off" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="boldSecretKey"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Bold Secret Key</FormLabel>
                                            <FormControl>
                                                <Input {...field} type="password" placeholder="bold_secret_xxx" className="font-mono text-sm" autoComplete="off" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </section>
                    </Card>
                )}

                {/* Mensaje informativo para Solo Efectivo */}
                {activeProvider === "CASH" && (
                    <Card className="p-6 border-amber-500/30">
                        <section className="flex items-start gap-3">
                            <Banknote className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" aria-hidden="true" />
                            <div>
                                <h4 className="text-sm font-semibold text-amber-600 dark:text-amber-400">Solo Efectivo</h4>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Los pedidos se procesarán sin pasarela de pago en línea. El pago se gestionará directamente en el establecimiento.
                                </p>
                            </div>
                        </section>
                    </Card>
                )}

                {/* Tarifas y Moneda (siempre visible) */}
                <Card className="p-6">
                    <section className="space-y-4">
                        <h4 className="font-semibold">Tarifas y Moneda</h4>
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
                    </section>
                </Card>

                <div className="flex justify-center pt-4">
                    <Button type="submit" disabled={form.formState.isSubmitting} className="min-w-[200px] h-12 text-lg">
                        {form.formState.isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
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
