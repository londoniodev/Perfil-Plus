"use client"

import { useState, useEffect, useMemo } from "react"
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
import { ArrowRight, Loader2, MapPin, Truck, ShoppingBag, UtensilsCrossed, Smartphone, CheckCircle2, Pencil } from "lucide-react"
import { useRouter } from "next/navigation"
import { LocationPicker } from "./location-picker"
import { formatCurrency } from "@/lib/utils"
import { useTenant } from "@/app/providers"
import { quickCommerceSchema, type QuickCommerceFormData } from "@alvarosky/features"

interface QuickCommerceCheckoutProps {
    waData?: {
        customerData?: any;
        items?: any[];
    };
    isLoading?: boolean;
}

export function QuickCommerceCheckout({ waData, isLoading }: QuickCommerceCheckoutProps) {
    const { items: cartItems, totalPrice, tableId, setCart } = useCart()
    const { tenantId, activePaymentProvider, logoUrl } = useTenant()
    const toast = useToast()
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [forceEditMode, setForceEditMode] = useState(false)

    const form = useForm<QuickCommerceFormData>({
        resolver: zodResolver(quickCommerceSchema),
        defaultValues: {
            customerName: "",
            customerPhone: "",
            orderType: tableId ? "DINE_IN" : "DELIVERY",
            paymentMethod: "CASH",
            address: "",
            lat: undefined,
            lng: undefined,
            notes: ""
        }
    })

    const orderType = form.watch("orderType")

    // Hidratación desde WhatsApp
    const [hasHydrated, setHasHydrated] = useState(false)

    useEffect(() => {
        if (waData?.customerData && !hasHydrated) {
            form.reset({
                ...form.getValues(),
                customerName: waData.customerData.name || "",
                customerPhone: waData.customerData.phone || "",
                address: waData.customerData.address || "",
                lat: waData.customerData.lat || undefined,
                lng: waData.customerData.lng || undefined,
                orderType: "DELIVERY"
            })
            setHasHydrated(true)
            toast.success("Datos de entrega cargados desde WhatsApp.")
        }
    }, [waData, form, toast, hasHydrated])

    // Zero-Click: detectar si tenemos datos completos para modo express
    const isExpressMode = useMemo(() => {
        if (forceEditMode || !waData?.customerData) return false
        const cd = waData.customerData
        return !!(cd.name && cd.phone && cd.address)
    }, [waData, forceEditMode])

    const onSubmit = async (data: QuickCommerceFormData) => {
        console.log('[Checkout] onSubmit ejecutado con:', data)
        setIsSubmitting(true)
        try {
            const payload = {
                items: cartItems.map(item => ({
                    variantId: item.variantId,
                    quantity: item.quantity,
                    notes: item.notes,
                    modifiers: item.modifiers?.map(m => ({
                        modifierId: m.id,
                        quantity: m.quantity || 1
                    }))
                })),
                customer: {
                    name: data.customerName,
                    phone: data.customerPhone.replace(/\D/g, ''),
                    address: data.address,
                    lat: data.lat,
                    lng: data.lng,
                },
                orderType: data.orderType,
                paymentMethod: data.paymentMethod,
                frontUrl: window.location.origin
            }

            const _apiUrl = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001/api").replace(/\/+$/, "");
            const API_URL = _apiUrl.endsWith('/api') ? _apiUrl : `${_apiUrl}/api`;
            
            const endpoint = (data.paymentMethod === "MERCADOPAGO" || data.paymentMethod === "BOLD")
                ? `${API_URL}/payments/product/checkout`
                : `${API_URL}/orders`; // Usar el endpoint estándar para pedidos directos

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-tenant-id': tenantId
                },
                body: JSON.stringify(payload)
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const message = errorData.message || "Error al procesar el pedido";
                throw new Error(Array.isArray(message) ? message.join(", ") : message);
            }

            const result = await response.json()

            if (result.init_point) {
                window.location.href = result.init_point
                return
            }

            // Si es pedido en efectivo (Directo)
            toast.success("¡Pedido realizado con éxito!")
            router.push(`/order-success/${result.id || result.orderNumber}`)
        } catch (error: any) {
            console.error("Error al procesar el pedido:", error)
            toast.error(error.message || "Error desconocido al procesar el pedido")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground">Preparando tu pedido...</p>
            </div>
        )
    }

    if (cartItems.length === 0) {
        return (
            <div className="text-center py-12">
                <Smartphone className="mx-auto h-12 w-12 text-muted-foreground mb-4" aria-hidden="true" />
                <p className="text-muted-foreground mb-4">No hay productos seleccionados.</p>
                <Button onClick={() => router.push("/menu")}>Volver al Menú</Button>
            </div>
        )
    }

    // ================================================
    // MODO EXPRESS: Confirmación de 1 click
    // ================================================
    if (isExpressMode) {
        return (
            <form
                onSubmit={form.handleSubmit(onSubmit, (errors) => {
                    console.error('[Checkout Express] Validación fallida:', errors)
                    toast.error('Completa los campos requeridos para continuar.')
                })}
                className="max-w-xl mx-auto space-y-6 pb-24"
            >
                {/* Logo del restaurante centrado */}
                {logoUrl && (
                    <div className="flex justify-center mb-8">
                        <img src={logoUrl} alt="Logo" className="h-28 w-auto object-contain" />
                    </div>
                )}

                {/* Resumen de productos */}
                <Card className="border-primary/20 bg-primary/5">
                    <CardHeader className="py-4">
                        <CardTitle className="text-sm flex justify-between">
                            <span>Resumen del Pedido</span>
                            <span>{formatCurrency(totalPrice())}</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="py-0 pb-4">
                        <div className="space-y-2">
                            {cartItems.map(item => (
                                <div key={item.variantId} className="flex justify-between text-xs text-muted-foreground">
                                    <span>
                                        {item.quantity}x {item.title}
                                        {item.notes && <span className="italic ml-1">({item.notes})</span>}
                                    </span>
                                    <span>{formatCurrency(item.price * item.quantity)}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Datos del cliente (solo lectura) */}
                <Card>
                    <CardHeader className="py-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm">Datos de Entrega</CardTitle>
                            <Button 
                                type="button"
                                variant="ghost" 
                                size="sm" 
                                onClick={() => setForceEditMode(true)}
                                className="text-xs text-muted-foreground h-auto p-1"
                                aria-label="Editar datos de entrega"
                            >
                                <Pencil className="h-3 w-3 mr-1" aria-hidden="true" />
                                Editar
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="py-0 pb-4 space-y-1">
                        <p className="text-sm font-medium">{waData!.customerData.name}</p>
                        <p className="text-xs text-muted-foreground">{waData!.customerData.phone}</p>
                        <p className="text-xs text-muted-foreground flex items-start">
                            <MapPin className="h-3 w-3 mr-1 mt-0.5 shrink-0" aria-hidden="true" />
                            {waData!.customerData.address}
                        </p>
                    </CardContent>
                </Card>

                {/* Método de pago */}
                <div className="space-y-3">
                    <Label className="text-base">Método de Pago</Label>
                    <RadioGroup
                        value={form.watch("paymentMethod")}
                        onValueChange={(val) => form.setValue("paymentMethod", val as any)}
                        className="grid grid-cols-1 gap-2"
                    >
                        <Label className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer">
                            <RadioGroupItem value="CASH" />
                            <div className="flex-1">
                                <p className="font-medium text-sm">Efectivo / Contraentrega</p>
                                <p className="text-xs text-muted-foreground">Pagas al recibir tu pedido</p>
                            </div>
                        </Label>
                        {activePaymentProvider === 'MERCADO_PAGO' && (
                            <Label className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer">
                                <RadioGroupItem value="MERCADOPAGO" />
                                <div className="flex-1">
                                    <p className="font-medium text-sm">Mercado Pago</p>
                                    <p className="text-xs text-muted-foreground">Tarjeta, PSE, Efecty</p>
                                </div>
                            </Label>
                        )}
                        {activePaymentProvider === 'BOLD' && (
                            <Label className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer">
                                <RadioGroupItem value="BOLD" />
                                <div className="flex-1">
                                    <p className="font-medium text-sm">Pago en línea Seguro (Bold)</p>
                                    <p className="text-xs text-muted-foreground">Tarjetas, PSE, Nequi</p>
                                </div>
                            </Label>
                        )}
                    </RadioGroup>
                </div>

                {/* CTA: Confirmación express */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t z-50 md:relative md:bg-transparent md:border-none md:p-0">
                    <Button type="submit" className="w-full h-14 text-lg font-bold shadow-lg" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        ) : (
                            <>Confirmar Pedido - {formatCurrency(totalPrice())} <ArrowRight className="ml-2 h-5 w-5" /></>
                        )}
                    </Button>
                </div>
            </form>
        )
    }

    // ================================================
    // MODO FORMULARIO COMPLETO (normal o datos incompletos)
    // ================================================
    return (
        <div className="max-w-xl mx-auto space-y-6">
            {/* Logo del restaurante centrado */}
            {logoUrl && (
                <div className="flex justify-center mb-4">
                    <img src={logoUrl} alt="Logo" className="h-28 w-auto object-contain" />
                </div>
            )}

            <form onSubmit={form.handleSubmit(onSubmit, (errors) => {
                    console.error('[Checkout Form] Validación fallida:', errors)
                    toast.error('Completa los campos requeridos para continuar.')
                })} className="space-y-6 pb-24">
                {/* 1. Resumen de Pedido (Compacto) */}
                <Card className="border-primary/20 bg-primary/5">
                    <CardHeader className="py-4">
                        <CardTitle className="text-sm flex justify-between">
                            <span>Resumen del Pedido</span>
                            <span>{formatCurrency(totalPrice())}</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="py-0 pb-4">
                        <div className="space-y-2">
                            {cartItems.map(item => (
                                <div key={item.variantId} className="flex justify-between text-xs text-muted-foreground">
                                    <span>{item.quantity}x {item.title}</span>
                                    <span>{formatCurrency(item.price * item.quantity)}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Tipo de Entrega */}
                {!tableId && (
                    <div className="space-y-3">
                        <Label className="text-base">¿Cómo lo prefieres?</Label>
                        <RadioGroup
                            value={orderType}
                            onValueChange={(val) => form.setValue("orderType", val as any)}
                            className="grid grid-cols-2 gap-3"
                        >
                            <Label 
                                htmlFor="q-delivery"
                                className={`flex flex-col items-center justify-center border-2 rounded-xl p-4 cursor-pointer transition-all ${orderType === 'DELIVERY' ? 'border-primary bg-primary/5' : 'border-muted opacity-60'}`}
                            >
                                <RadioGroupItem value="DELIVERY" id="q-delivery" className="sr-only" />
                                <Truck className="mb-2 h-6 w-6 text-primary" aria-hidden="true" />
                                <span className="font-semibold">Domicilio</span>
                            </Label>
                            <Label 
                                htmlFor="q-pickup"
                                className={`flex flex-col items-center justify-center border-2 rounded-xl p-4 cursor-pointer transition-all ${orderType === 'PICKUP' ? 'border-primary bg-primary/5' : 'border-muted opacity-60'}`}
                            >
                                <RadioGroupItem value="PICKUP" id="q-pickup" className="sr-only" />
                                <ShoppingBag className="mb-2 h-6 w-6 text-primary" aria-hidden="true" />
                                <span className="font-semibold">Recoger</span>
                            </Label>
                        </RadioGroup>
                    </div>
                )}

                {/* 3. Datos de Contacto */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center">
                            <Smartphone className="mr-2 h-4 w-4" aria-hidden="true" /> Datos de Contacto
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="q-name">Nombre</Label>
                            <Input id="q-name" {...form.register("customerName")} placeholder="¿A quién buscamos?" className="bg-muted/30" />
                            {form.formState.errors.customerName && <p className="text-xs text-destructive">{form.formState.errors.customerName.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="q-phone">Celular</Label>
                            <Input id="q-phone" {...form.register("customerPhone")} placeholder="300 000 0000" className="bg-muted/30" />
                            {form.formState.errors.customerPhone && <p className="text-xs text-destructive">{form.formState.errors.customerPhone.message}</p>}
                        </div>
                    </CardContent>
                </Card>

                {/* 4. Ubicación (Solo si es domicilio) */}
                {orderType === 'DELIVERY' && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center">
                                <MapPin className="mr-2 h-4 w-4" aria-hidden="true" /> Lugar de Entrega
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="q-address">Dirección Exacta</Label>
                                <Input id="q-address" {...form.register("address")} placeholder="Calle, apto, oficina..." className="bg-muted/30" />
                                {form.formState.errors.address && <p className="text-xs text-destructive">{form.formState.errors.address.message}</p>}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* 4. Ubicación (Sección propia fuera de Card) */}
                {orderType === 'DELIVERY' && (
                    <div className="space-y-3">
                        <Label className="px-1">Ubícanos en el Mapa</Label>
                        {/* 
                            TÉCNICA FULL-BLEED (Ancho total independientemente del container)
                        */}
                        <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen">
                            <div className="h-[300px] w-full border-y md:max-w-xl md:mx-auto md:rounded-xl md:border shadow-sm overflow-hidden z-0">
                                <LocationPicker 
                                    initialLocation={waData?.customerData ? { lat: waData.customerData.lat, lng: waData.customerData.lng } : undefined}
                                    onLocationChange={(loc) => {
                                        form.setValue("lat", loc.lat)
                                        form.setValue("lng", loc.lng)
                                    }} 
                                />
                            </div>
                        </div>
                        {form.formState.errors.lat && <p className="text-xs text-destructive px-1">{form.formState.errors.lat.message as string}</p>}
                    </div>
                )}

                {/* 5. Método de Pago */}
                <div className="space-y-3">
                    <Label className="text-base">Método de Pago</Label>
                    <RadioGroup
                        value={form.watch("paymentMethod")}
                        onValueChange={(val) => form.setValue("paymentMethod", val as any)}
                        className="grid grid-cols-1 gap-2"
                    >
                        <Label className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer">
                            <RadioGroupItem value="CASH" />
                            <div className="flex-1">
                                <p className="font-medium text-sm">Efectivo / Contraentrega</p>
                                <p className="text-xs text-muted-foreground">Pagas al recibir tu pedido</p>
                            </div>
                        </Label>
                        {activePaymentProvider === 'MERCADO_PAGO' && (
                            <Label className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer">
                                <RadioGroupItem value="MERCADOPAGO" />
                                <div className="flex-1">
                                    <p className="font-medium text-sm">Mercado Pago</p>
                                    <p className="text-xs text-muted-foreground">Tarjeta, PSE, Efecty</p>
                                </div>
                            </Label>
                        )}
                        {activePaymentProvider === 'BOLD' && (
                            <Label className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer">
                                <RadioGroupItem value="BOLD" />
                                <div className="flex-1">
                                    <p className="font-medium text-sm">Pago en línea Seguro (Bold)</p>
                                    <p className="text-xs text-muted-foreground">Tarjetas, PSE, Nequi</p>
                                </div>
                            </Label>
                        )}
                    </RadioGroup>
                </div>

                {/* Botón Flotante (Sticky) */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t z-50 md:relative md:bg-transparent md:border-none md:p-0">
                    <Button type="submit" className="w-full h-14 text-lg font-bold shadow-lg" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        ) : (
                            <>Confirmar Pedido - {formatCurrency(totalPrice())} <ArrowRight className="ml-2 h-5 w-5" /></>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}

