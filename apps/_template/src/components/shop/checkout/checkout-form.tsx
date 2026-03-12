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
import { Download, ArrowRight, Loader2, Truck, ShoppingBag, UtensilsCrossed } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { LocationPicker } from "./location-picker"

// Schema Unificado con refinamiento
const checkoutSchema = z.object({
    customerName: z.string().min(2, "Nombre requerido"),
    customerPhone: z.string().min(7, "Teléfono requerido"),
    customerEmail: z.string().email("Email inválido"), // Requerido para productos digitales
    orderType: z.enum(["DINE_IN", "DELIVERY", "PICKUP", "DIGITAL"]),
    notes: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    lat: z.number().optional(),
    lng: z.number().optional()
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
        if (!data.lat || !data.lng) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Selecciona tu ubicación en el mapa",
                path: ["lat"],
            });
        }
    }
});

type CheckoutFormData = z.infer<typeof checkoutSchema>

export function CheckoutForm() {
    const { items, totalPrice, tableId, clearCart } = useCart()
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
            lat: undefined,
            lng: undefined,
            notes: ""
        }
    })

    const orderType = form.watch("orderType")

    useEffect(() => {
        if (tableId) {
            form.setValue("orderType", "DINE_IN")
        } else if (isDigitalOnly) {
            form.setValue("orderType", "DIGITAL")
        } else if (orderType === "DIGITAL" && !isDigitalOnly) {
            // Si estaba en DIGITAL pero se añadió algo físico
            form.setValue("orderType", "DELIVERY")
        }
    }, [tableId, isDigitalOnly, form, orderType])

    const onSubmit = async (data: CheckoutFormData) => {
        setIsSubmitting(true)
        try {
            // Configurar JWT Token temporal si existe una sesión/cliente local (solo si aplicable)
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

            // Si el carrito es completamente digital o requiere un pago online estricto
            // Lanzamos la integración con la Intención de Pago de MercadoPago (vía NestJS)
            if (isDigitalOnly || hasDigital) {
                const payload = {
                    items: items.map(item => ({
                        variantId: item.variantId,
                        quantity: item.quantity
                    })),
                    customer: {
                        name: data.customerName,
                        email: data.customerEmail,
                        phone: data.customerPhone,
                        userId: user?.id
                    },
                    frontUrl: window.location.origin
                }

                // POST al endpoint de Checkout de MercadoPago en NestJS
                const _apiUrl = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001/api").replace(/\/+$/, "");
                const API_URL = _apiUrl.endsWith('/api') ? _apiUrl : `${_apiUrl}/api`;
                const response = await fetch(`${API_URL}/payments/product/checkout`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                    },
                    body: JSON.stringify(payload)
                })

                if (!response.ok) {
                    throw new Error('Error al generar intención de pago');
                }

                const result = await response.json();

                // Redirección a la Pasarela de MercadoPago
                if (result.init_point) {
                    window.location.href = result.init_point;
                    return; // Detenemos la ejecución local
                }
                throw new Error("Respuesta inválida de la pasarela")
            }

            // Flujo Legacy para DINE_IN o Pedidos 100% físicos sin pago online obligado
            // ... Aquí mantendríamos la lógica clásica a createOrder importado de "@/lib/api"
            toast.error("Para este tipo de pedido (Delivery manual/Efectivo) la función no está 100% migrada al nuevo backend de pagos aún.", "En Construcción")

        } catch (error) {
            console.error("Checkout Error:", error)
            toast.error("No se pudo procesar el pago. Por favor intenta nuevamente.", "Error de Transacción")
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
            {/* Formulario */}
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

                            {/* Order Type Selection (Hidden if Table or purely Digital) */}
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

                            {tableId && (
                                <div className="bg-primary/10 text-primary p-4 rounded-lg flex items-center mb-6">
                                    <UtensilsCrossed className="mr-3 h-5 w-5" />
                                    <span className="font-medium">Ordenando para Mesa {tableId}</span>
                                </div>
                            )}

                            {isDigitalOnly && (
                                <div className="bg-blue-500/10 border border-blue-500/20 text-blue-600 p-4 rounded-lg flex items-center mb-6">
                                    <Download className="mr-3 h-5 w-5 flex-shrink-0" />
                                    <span className="text-sm font-medium">Estás adquiriendo contenido digital. El acceso será enviado directamente a tu correo electrónico.</span>
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

                            {/* Conditional Address Fields */}
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
                                        <div className="text-xs text-muted-foreground mb-2">Mueve el mapa y el marcador hasta la puerta de tu dirección.</div>
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

                            {!isDigitalOnly && (
                                <div className="space-y-2">
                                    <Label htmlFor="notes">Notas adicionales (Opcional)</Label>
                                    <Input id="notes" {...form.register("notes")} placeholder="Instrucciones de entrega..." />
                                </div>
                            )}

                            <Button type="submit" className="w-full mt-6" size="lg" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Procesando Pago...</>
                                ) : (
                                    <>Ir a Pagar - formatCurrency(totalPrice()) <ArrowRight className="ml-2 h-4 w-4" /></>
                                )}
                            </Button>

                            {/* Security Badge */}
                            {(isDigitalOnly || hasDigital) && (
                                <p className="text-xs text-center text-muted-foreground mt-2">
                                    Pago 100% seguro a través de MercadoPago.
                                </p>
                            )}
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
                                    {item.productType === "DIGITAL" && (
                                        <span className="inline-flex items-center text-[10px] font-medium bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded mt-1 uppercase">
                                            <Download className="w-3 h-3 mr-1" /> Acceso Digital
                                        </span>
                                    )}
                                </div>
                                <p className="font-medium">formatCurrency(item.price * item.quantity)</p>
                            </div>
                        ))}
                        <Separator />
                        <div className="flex justify-between items-center font-bold text-lg pt-2">
                            <span>Total</span>
                            <span>formatCurrency(totalPrice())</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

