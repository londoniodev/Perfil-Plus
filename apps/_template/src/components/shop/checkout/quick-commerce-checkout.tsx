"use client"

import { useState, useEffect } from "react"
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
import { ArrowRight, Loader2, MapPin, Truck, ShoppingBag, UtensilsCrossed, Smartphone } from "lucide-react"
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
    const { tenantId } = useTenant()
    const toast = useToast()
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)

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

    const onSubmit = async (data: QuickCommerceFormData) => {
        setIsSubmitting(true)
        try {
            const payload = {
                items: cartItems.map(item => ({
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
            
            const endpoint = data.paymentMethod === "MERCADOPAGO" 
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

            if (!response.ok) throw new Error("Error al procesar el pedido")

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
            const errorMsg = error.response?.data?.message || error.message || "Error desconocido al procesar el pedido";
            toast.error(errorMsg)
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
                <Smartphone className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No hay productos seleccionados.</p>
                <Button onClick={() => router.push("/menu")}>Volver al Menú</Button>
            </div>
        )
    }

    return (
        <div className="max-w-xl mx-auto space-y-6">
            <header className="text-center space-y-2">
                <h1 className="text-2xl font-bold tracking-tight">Confirmar Pedido</h1>
                <p className="text-muted-foreground text-sm">Estas a un paso de disfrutar tu comida</p>
            </header>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-24">
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
                                <Truck className="mb-2 h-6 w-6 text-primary" />
                                <span className="font-semibold">Domicilio</span>
                            </Label>
                            <Label 
                                htmlFor="q-pickup"
                                className={`flex flex-col items-center justify-center border-2 rounded-xl p-4 cursor-pointer transition-all ${orderType === 'PICKUP' ? 'border-primary bg-primary/5' : 'border-muted opacity-60'}`}
                            >
                                <RadioGroupItem value="PICKUP" id="q-pickup" className="sr-only" />
                                <ShoppingBag className="mb-2 h-6 w-6 text-primary" />
                                <span className="font-semibold">Recoger</span>
                            </Label>
                        </RadioGroup>
                    </div>
                )}

                {/* 3. Datos de Contacto */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center">
                            <Smartphone className="mr-2 h-4 w-4" /> Datos de Contacto
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
                                <MapPin className="mr-2 h-4 w-4" /> Lugar de Entrega
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="q-address">Dirección Exacta</Label>
                                <Input id="q-address" {...form.register("address")} placeholder="Calle, apto, oficina..." className="bg-muted/30" />
                                {form.formState.errors.address && <p className="text-xs text-destructive">{form.formState.errors.address.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>Ubícanos en el Mapa</Label>
                                <div className="h-[200px] rounded-xl overflow-hidden border">
                                    <LocationPicker 
                                        initialLocation={waData?.customerData ? { lat: waData.customerData.lat, lng: waData.customerData.lng } : undefined}
                                        onLocationChange={(loc) => {
                                            form.setValue("lat", loc.lat)
                                            form.setValue("lng", loc.lng)
                                        }} 
                                    />
                                </div>
                                {form.formState.errors.lat && <p className="text-xs text-destructive">{form.formState.errors.lat.message as string}</p>}
                            </div>
                        </CardContent>
                    </Card>
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
                        <Label className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer">
                            <RadioGroupItem value="MERCADOPAGO" />
                            <div className="flex-1">
                                <p className="font-medium text-sm">Mercado Pago</p>
                                <p className="text-xs text-muted-foreground">Tarjeta, PSE, Efecty</p>
                            </div>
                        </Label>
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
