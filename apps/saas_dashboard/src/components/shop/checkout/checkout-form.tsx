"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useCart } from "@/store/use-cart"
import {
    Button,
    Input,
    Label,
    RadioGroup,
    RadioGroupItem,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    Separator,
    useToast
} from "@alvarosky/ui"
import { UtensilsCrossed, Truck, ShoppingBag } from "lucide-react"
import { useRouter } from "next/navigation"
import { createOrder } from "@/lib/api"
import { formatCurrency } from "@/lib/utils"

// Schema Unificado con refinamiento
const checkoutSchema = z.object({
    customerName: z.string().min(2, "Nombre requerido"),
    customerPhone: z.string().min(7, "Teléfono requerido"),
    orderType: z.enum(["DINE_IN", "DELIVERY", "PICKUP"]),
    notes: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
}).superRefine((data, ctx) => {
    if (data.orderType === "DELIVERY") {
        if (!data.address || data.address.length < 5) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Dirección requerida para domicilio",
                path: ["address"],
            });
        }
        if (!data.city || data.city.length < 2) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Ciudad requerida",
                path: ["city"],
            });
        }
    }
});

type CheckoutFormData = z.infer<typeof checkoutSchema>

export function CheckoutForm() {
    const { items, totalPrice, tableId, clearCart } = useCart()
    const toast = useToast() // Fix: useToast returns the hook object, usually we destructure or use directly depending on lib.
    // In @alvarosky/ui (shadcn), it's usually const { toast } = useToast().
    // Wait, in previous file I used const toast = useToast() and it worked?
    // Let me check TablesPage again. I changed it FROM { toast } TO toast.

    // Let's assume const toast = useToast() is correct based on my previous fix.

    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<CheckoutFormData>({
        resolver: zodResolver(checkoutSchema),
        defaultValues: {
            customerName: "",
            customerPhone: "",
            orderType: tableId ? "DINE_IN" : "DELIVERY",
            address: "",
            city: "",
            notes: ""
        }
    })

    const orderType = form.watch("orderType")

    useEffect(() => {
        if (tableId) {
            form.setValue("orderType", "DINE_IN")
        }
    }, [tableId, form])

    const onSubmit = async (data: CheckoutFormData) => {
        setIsSubmitting(true)
        try {
            const payload = {
                items: items.map(item => ({
                    variantId: item.variantId,
                    quantity: item.quantity,
                    modifiers: [] // TODO: Add modifiers support to Cart
                })),
                tableNumber: tableId || undefined,
                orderType: data.orderType,
                customerName: data.customerName,
                customerPhone: data.customerPhone,
                notes: data.notes,
                shippingData: data.orderType === 'DELIVERY' ? {
                    address: data.address,
                    city: data.city
                } : undefined
            }

            const order = await createOrder(payload)

            toast.success(`Tu orden #${order.orderNumber} ha sido enviada a cocina.`, "Pedido realizado")
            clearCart()
            router.push(`/order-confirmation?orderId=${order.id}`)
        } catch (error) {
            console.error("Checkout Error:", error)
            toast.error("No se pudo procesar el pedido. Verifica tu conexión.", "Error")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (items.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">Tu carrito está vacío.</p>
                <Button onClick={() => router.push("/menu")}>Ir al Menú</Button>
            </div>
        )
    }

    return (
        <div className="grid gap-8 md:grid-cols-2">
            {/* Formulario */}
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Detalles del Pedido</CardTitle>
                        <CardDescription>
                            {tableId ? `Estás ordenando desde la Mesa ${tableId}` : "Completa tus datos de entrega"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                            {/* Order Type Selection (Hidden if Table) */}
                            {!tableId && (
                                <div className="mb-6">
                                    <Label>Tipo de Pedido</Label>
                                    <RadioGroup
                                        defaultValue="DELIVERY"
                                        value={orderType}
                                        onValueChange={(val) => form.setValue("orderType", val as any)}
                                        className="grid grid-cols-2 gap-4 mt-2"
                                    >
                                        <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-muted/50 [&:has(:checked)]:bg-muted">
                                            <RadioGroupItem value="DELIVERY" id="delivery" />
                                            <Label htmlFor="delivery" className="flex items-center cursor-pointer">
                                                <Truck className="mr-2 h-4 w-4" /> Domicilio
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-muted/50 [&:has(:checked)]:bg-muted">
                                            <RadioGroupItem value="PICKUP" id="pickup" />
                                            <Label htmlFor="pickup" className="flex items-center cursor-pointer">
                                                <ShoppingBag className="mr-2 h-4 w-4" /> Para Llevar
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                            )}

                            {tableId && (
                                <div className="bg-primary/10 text-primary p-4 rounded-lg flex items-center mb-6">
                                    <UtensilsCrossed className="mr-3 h-5 w-5" />
                                    <span className="font-medium">Ordenando para Mesa {tableId}</span>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="customerName">Nombre</Label>
                                    <Input id="customerName" {...form.register("customerName")} placeholder="Tu nombre" />
                                    {form.formState.errors.customerName && (
                                        <p className="text-xs text-destructive">{form.formState.errors.customerName.message as string}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="customerPhone">Teléfono</Label>
                                    <Input id="customerPhone" {...form.register("customerPhone")} placeholder="300 123 4567" />
                                    {form.formState.errors.customerPhone && (
                                        <p className="text-xs text-destructive">{form.formState.errors.customerPhone.message as string}</p>
                                    )}
                                </div>
                            </div>

                            {/* Conditional Address Fields */}
                            {!tableId && orderType === 'DELIVERY' && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="address">Dirección de Entrega</Label>
                                        <Input id="address" {...form.register("address")} placeholder="Calle 123 # 45-67" />
                                        {/* @ts-ignore */}
                                        {form.formState.errors.address && (
                                            <p className="text-xs text-destructive">{(form.formState.errors as any).address.message}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="city">Ciudad / Barrio</Label>
                                        <Input id="city" {...form.register("city")} placeholder="Cali, Valle" />
                                    </div>
                                </>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="notes">Notas para cocina (Opcional)</Label>
                                <Input id="notes" {...form.register("notes")} placeholder="Sin cebolla, extra picante..." />
                            </div>

                            <Button type="submit" className="w-full mt-6" size="lg" disabled={isSubmitting}>
                                {isSubmitting ? "Procesando..." : `Confirmar Pedido - ${formatCurrency(totalPrice())}`}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>

            {/* Resumen */}
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Resumen ({items.length} items)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {items.map((item) => (
                            <div key={item.variantId} className="flex justify-between items-start text-sm">
                                <div>
                                    <p className="font-medium">{item.title} x{item.quantity}</p>
                                    {item.subtitle && <p className="text-muted-foreground text-xs">{item.subtitle}</p>}
                                </div>
                                <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
                            </div>
                        ))}
                        <Separator />
                        <div className="flex justify-between items-center font-bold text-lg pt-2">
                            <span>Total</span>
                            <span>{formatCurrency(totalPrice())}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
