"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
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
import { Download, ArrowRight, Loader2, Truck, ShoppingBag, UtensilsCrossed } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { LocationPicker } from "./location-picker"
import { formatCurrency } from "@/lib/utils"
import { useTenant } from "@/app/providers"
import { checkoutSchema, type CheckoutFormData } from "@alvarosky/features"

export function EcommerceCheckout() {
    const { items, totalPrice, tableId, clearCart, setCart } = useCart()
    const { tenantId } = useTenant()
    const toast = useToast()
    const router = useRouter()
    const { user } = useAuth()
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Variables Derivadas
    const isDigitalOnly = items.length > 0 && items.every(item => item.productType === "DIGITAL")
    const hasDigital = items.some(item => item.productType === "DIGITAL")
    const defaultOrderType = tableId ? "DINE_IN" : (isDigitalOnly ? "DIGITAL" : "DELIVERY")

    const form = useForm<CheckoutFormData>({
        resolver: zodResolver(checkoutSchema),
        defaultValues: {
            customerName: "",
            customerPhone: "",
            customerEmail: "",
            orderType: defaultOrderType,
            address: "",
            city: "",
            identification: "",
            lat: undefined,
            lng: undefined,
            notes: ""
        }
    })

    const orderType = form.watch("orderType")

    const onSubmit = async (data: CheckoutFormData) => {
        setIsSubmitting(true)
        try {
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

            const payload = {
                items: items.map(item => ({
                    variantId: item.variantId,
                    quantity: item.quantity,
                    notes: item.notes,
                    modifiers: item.modifiers?.map(m => ({
                        modifierId: m.id,
                        quantity: 1
                    }))
                })),
                customer: {
                    name: data.customerName,
                    email: data.customerEmail,
                    phone: data.customerPhone.replace(/\D/g, ''),
                    userId: user?.id,
                    address: data.address,
                    city: data.city,
                    lat: data.lat,
                    lng: data.lng,
                    identification: data.identification,
                },
                frontUrl: window.location.origin
            }

            const _apiUrl = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001/api").replace(/\/+$/, "");
            const API_URL = _apiUrl.endsWith('/api') ? _apiUrl : `${_apiUrl}/api`;
            const response = await fetch(`${API_URL}/payments/product/checkout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-tenant-id': tenantId,
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify(payload)
            })

            if (!response.ok) {
                let errorMsg = 'Error al generar intención de pago';
                try {
                    const errorData = await response.json();
                    if (errorData.message) errorMsg = typeof errorData.message === 'string' ? errorData.message : errorData.message[0];
                } catch(e) {}
                throw new Error(errorMsg);
            }

            const result = await response.json();
            if (result.init_point) {
                window.location.href = result.init_point;
                return;
            }
            throw new Error("Respuesta inválida de la pasarela")

        } catch (error: any) {
            console.error("Checkout Error:", error)
            toast.error(error.message || "No se pudo procesar el pago. Por favor intenta nuevamente.", "Error de Transacción")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (items.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">Tu carrito está vacío.</p>
                <Button onClick={() => router.push("/menu")}>Ir a la Tienda</Button>
            </div>
        )
    }

    return (
        <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Detalles de la Compra</CardTitle>
                        <CardDescription>
                            {tableId ? `Estás ordenando desde la Mesa ${tableId}` :
                                isDigitalOnly ? "Completa tus datos para recibir tu acceso digital" :
                                    "Completa tus datos de entrega y contacto"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            {!tableId && !isDigitalOnly && (
                                <div className="mb-6">
                                    <Label>Método de Entrega</Label>
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

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="customerName">Nombre Completo</Label>
                                    <Input id="customerName" {...form.register("customerName")} placeholder="Tu nombre" />
                                    {form.formState.errors.customerName && (
                                        <p className="text-xs text-destructive">{form.formState.errors.customerName.message as string}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="customerPhone">Teléfono (WhatsApp)</Label>
                                    <Input id="customerPhone" {...form.register("customerPhone")} placeholder="300 123 4567" />
                                    {form.formState.errors.customerPhone && (
                                        <p className="text-xs text-destructive">{form.formState.errors.customerPhone.message as string}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="customerEmail">Correo Electrónico</Label>
                                <Input id="customerEmail" type="email" {...form.register("customerEmail")} placeholder="tu@email.com" />
                                {form.formState.errors.customerEmail && (
                                    <p className="text-xs text-destructive">{form.formState.errors.customerEmail.message as string}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="identification">Número de Documento (DNI/Cédula)</Label>
                                <Input id="identification" {...form.register("identification")} placeholder="12345678" />
                                <p className="text-[10px] text-muted-foreground">Opcional: Ayuda a agilizar tu pago en Mercado Pago.</p>
                            </div>

                            {!tableId && !isDigitalOnly && orderType === 'DELIVERY' && (
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
                                        {/* @ts-ignore */}
                                        {form.formState.errors.city && (
                                            <p className="text-xs text-destructive">{(form.formState.errors as any).city.message}</p>
                                        )}
                                    </div>
                                    <div className="col-span-1 sm:col-span-2 space-y-2 mt-4 z-0">
                                        <Label>Ubicación GPS Exacta (Requerida)</Label>
                                        <LocationPicker onLocationChange={(loc) => {
                                            form.setValue("lat", loc.lat)
                                            form.setValue("lng", loc.lng)
                                        }} />
                                        {/* @ts-ignore */}
                                        {form.formState.errors.lat && (
                                            <p className="text-xs text-destructive">{(form.formState.errors as any).lat.message}</p>
                                        )}
                                    </div>
                                </>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="notes">Notas adicionales (Opcional)</Label>
                                <Input id="notes" {...form.register("notes")} placeholder="Instrucciones de entrega..." />
                            </div>

                            <Button type="submit" className="w-full mt-6" size="lg" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Procesando Pago...</>
                                ) : (
                                    <>Ir a Pagar - {formatCurrency(totalPrice())} <ArrowRight className="ml-2 h-4 w-4" /></>
                                )}
                            </Button>

                            <p className="text-xs text-center text-muted-foreground mt-2">
                                Pago 100% seguro a través de MercadoPago.
                            </p>
                        </form>
                    </CardContent>
                </Card>
            </div>

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
