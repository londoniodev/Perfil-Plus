"use client"

import { cn } from "../../../lib/utils"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "../../../button"
import { Input } from "../../../input"
import { Textarea } from "../../../textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "../../../form"
import { Plus, Trash2, Loader2, Save, ArrowLeft, MoreHorizontal, AlertCircle } from "lucide-react"
import { ImageUploader } from "../../upload/image-uploader"
import { useToast } from "../../../toast"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../select"
import { Switch } from "../../../switch"
import { Separator } from "../../../separator"

// Schema de validación
export const productSchema = z.object({
    name: z.string().min(1, "El nombre es requerido"),
    description: z.string().min(1, "La descripción es requerida"),
    productType: z.enum(["DIGITAL", "PHYSICAL"]),
    basePrice: z.coerce.number().min(0, "El precio debe ser mayor o igual a 0"),
    images: z.array(z.string()).min(1, "Debe subir al menos una imagen"),
    published: z.boolean().default(false),
    // Specs condicionales
    downloadUrl: z.string().optional(),
    pages: z.coerce.number().optional(),
    format: z.string().optional(),
    weight: z.string().optional(),
    dimensions: z.string().optional(),
    // Variantes
    variants: z.array(z.object({
        id: z.string().optional(),
        name: z.string().optional(),
        sku: z.string().optional(),
        price: z.coerce.number().optional().nullable(),
        stock: z.coerce.number().min(0, "El stock no puede ser negativo"),
        isDefault: z.boolean().default(false)
    }))
}).superRefine((data, ctx) => {
    if (data.productType === "DIGITAL") {
        if (!data.downloadUrl) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "La URL de descarga es requerida para productos digitales",
                path: ["downloadUrl"]
            })
        }
    }

    if (data.productType === "PHYSICAL") {
        if (!data.variants || data.variants.length === 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Debe agregar al menos una variante para productos físicos",
                path: ["variants"]
            })
        } else {
            data.variants.forEach((variant, index) => {
                if (!variant.stock && variant.stock !== 0) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "El stock es requerido",
                        path: [`variants`, index, "stock"]
                    })
                }
            })
        }
    }
})

export type ProductFormValues = z.infer<typeof productSchema>

interface ProductFormProps {
    initialData?: any
    onSubmit: (data: any) => Promise<{ success: boolean; error?: string }>
    apiBase: string
    tenantId: string
    backUrl?: string
    className?: string
}

export function ProductForm({ initialData, onSubmit, apiBase, tenantId, backUrl = "/admin/products", className }: ProductFormProps) {
    const router = useRouter()
    const toast = useToast()
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Valores por defecto
    const defaultValues: Partial<ProductFormValues> = {
        name: initialData?.name || "",
        description: initialData?.description || "",
        productType: initialData?.productType || "DIGITAL",
        basePrice: initialData?.basePrice || 0,
        images: initialData?.images || [],
        published: initialData?.published || false,
        downloadUrl: initialData?.specs?.downloadUrl || "",
        pages: initialData?.specs?.pages,
        format: initialData?.specs?.format || "",
        weight: initialData?.specs?.weight || "",
        dimensions: initialData?.specs?.dimensions || "",
        variants: initialData?.variants?.map((v: any) => ({
            ...v,
            price: v.price ? Number(v.price) : null
        })) || [
                { name: "", sku: "", price: null, stock: 0, isDefault: true }
            ]
    }

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema) as any,
        defaultValues,
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "variants",
    })

    const productType = form.watch("productType")

    const handleSubmit = async (data: ProductFormValues) => {
        setIsSubmitting(true)

        try {
            // Construir specs
            const specs: Record<string, any> = {}
            if (data.productType === "DIGITAL") {
                if (data.downloadUrl) specs.downloadUrl = data.downloadUrl
                if (data.pages) specs.pages = data.pages
                if (data.format) specs.format = data.format
            } else {
                if (data.weight) specs.weight = data.weight
                if (data.dimensions) specs.dimensions = data.dimensions
            }

            const productData = {
                id: initialData?.id, // Important for updates
                name: data.name,
                description: data.description,
                productType: data.productType,
                basePrice: data.basePrice,
                images: data.images,
                specs,
                published: data.published,
                variants: data.productType === "PHYSICAL" ? data.variants.map(v => ({
                    id: v.id, // Keep ID if existing
                    name: v.name,
                    sku: v.sku,
                    price: v.price ?? undefined,
                    stock: v.stock,
                    isDefault: v.isDefault
                })) : undefined
            }

            const result = await onSubmit(productData)

            if (result.success) {
                toast.success(initialData ? "Producto actualizado correctamente" : "Producto creado exitosamente");
                router.push(backUrl)
                router.refresh()
            } else {
                toast.error(result.error || "Error al procesar producto");
            }
        } catch (error) {
            console.error("Error:", error)
            toast.error("Error inesperado al procesar el formulario");
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleAddImage = (url: string | null) => {
        if (!url) return
        const currentImages = form.getValues("images")
        form.setValue("images", [...currentImages, url])
    }

    const handleRemoveImage = (index: number) => {
        const currentImages = form.getValues("images")
        form.setValue("images", currentImages.filter((_, i) => i !== index))
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className={cn("grid grid-cols-1 lg:grid-cols-3 gap-8 w-full", className)}>
                {/* LEFT COLUMN: Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Info Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Información del Producto</CardTitle>
                            <CardDescription>Detalles básicos de tu producto</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nombre del Producto *</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Ej: E-book Liderazgo o Gafas Urban Style" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Descripción *</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} rows={6} placeholder="Describe tu producto..." className="resize-none" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/* Images Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Imágenes</CardTitle>
                            <CardDescription>Sube imágenes atractivas de tu producto (min. 1)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {form.watch("images").map((url, index) => (
                                    <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border bg-muted">
                                        <img src={url} alt={`Imagen ${index + 1}`} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                onClick={() => handleRemoveImage(index)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}

                                <div className="aspect-square">
                                    <ImageUploader
                                        value={null}
                                        onChange={handleAddImage}
                                        label=""
                                        folder="products"
                                        apiBase={apiBase}
                                        tenantId={tenantId}
                                    />
                                </div>
                            </div>
                            {form.formState.errors.images && (
                                <p className="text-sm font-medium text-destructive mt-3 flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4" />
                                    {form.formState.errors.images.message}
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* PHYSICAL: Variants Card */}
                    {productType === "PHYSICAL" && (
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Variantes</CardTitle>
                                    <CardDescription>Gestiona tallas, colores o tipos</CardDescription>
                                </div>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => append({ name: "", sku: "", price: null, stock: 0, isDefault: false })}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Agregar Variante
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {fields.length === 0 && (
                                    <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                                        No hay variantes. Agrega una para comenzar.
                                    </div>
                                )}
                                {fields.map((field, index) => (
                                    <div key={field.id} className="grid grid-cols-12 gap-3 items-end p-4 border rounded-lg bg-card/50">
                                        <div className="col-span-12 sm:col-span-3">
                                            <FormField
                                                control={form.control}
                                                name={`variants.${index}.name`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs">Nombre</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} placeholder="Ej: Rojo M" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <div className="col-span-6 sm:col-span-2">
                                            <FormField
                                                control={form.control}
                                                name={`variants.${index}.sku`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs">SKU</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} placeholder="AUTO" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <div className="col-span-6 sm:col-span-2">
                                            <FormField
                                                control={form.control}
                                                name={`variants.${index}.price`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs">Precio</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                type="number"
                                                                value={field.value ?? ""}
                                                                onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                                                                placeholder={form.watch("basePrice")?.toString() || "0.00"}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <div className="col-span-6 sm:col-span-2">
                                            <FormField
                                                control={form.control}
                                                name={`variants.${index}.stock`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs">Stock *</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} type="number" min="0" placeholder="0" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <div className="col-span-6 sm:col-span-2 flex items-center h-10">
                                            <FormField
                                                control={form.control}
                                                name={`variants.${index}.isDefault`}
                                                render={({ field }) => (
                                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                                        <FormControl>
                                                            <Switch
                                                                checked={field.value}
                                                                onCheckedChange={field.onChange}
                                                            />
                                                        </FormControl>
                                                        <FormLabel className="text-xs font-normal">
                                                            Default
                                                        </FormLabel>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <div className="col-span-12 sm:col-span-1 flex justify-end">
                                            {fields.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                    onClick={() => remove(index)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {form.formState.errors.variants && (
                                    <p className="text-sm font-medium text-destructive mt-2">
                                        {form.formState.errors.variants.message}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* PHYSICAL: Specs Card */}
                    {productType === "PHYSICAL" && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Especificaciones de Envío</CardTitle>
                                <CardDescription>Opcional para cálculo de envío</CardDescription>
                            </CardHeader>
                            <CardContent className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="weight"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Peso</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="1.5kg" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="dimensions"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Dimensiones</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="20x15x5 cm" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    )}

                    {/* DIGITAL: Specs Card */}
                    {productType === "DIGITAL" && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Entregable Digital</CardTitle>
                                <CardDescription>Configura el archivo que recibirán los clientes</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="downloadUrl"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>URL de Descarga *</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="https://cdn.example.com/file.pdf" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="pages"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Páginas (opcional)</FormLabel>
                                                <FormControl>
                                                    <Input {...field} type="number" placeholder="120" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="format"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Formato (opcional)</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="PDF, ePub" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* RIGHT COLUMN: Sidebar */}
                <div className="space-y-6">
                    {/* Status Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Estado</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <FormField
                                control={form.control}
                                name="published"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 bg-muted/20">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-sm font-medium">Publicado</FormLabel>
                                            <FormDescription className="text-xs">
                                                Visible en la tienda
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/* Organization Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Organización</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField
                                control={form.control}
                                name="productType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tipo de Producto *</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            disabled={!!initialData}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecciona un tipo" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="DIGITAL">Digital (E-book, Curso)</SelectItem>
                                                <SelectItem value="PHYSICAL">Físico (Producto tangible)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="basePrice"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Precio Base *</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                                                <Input {...field} type="number" step="0.01" min="0" className="pl-7" placeholder="0.00" />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex flex-col gap-3 sticky top-4">
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full"
                            size="lg"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    {initialData ? "Guardar Cambios" : "Crear Producto"}
                                </>
                            )}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={() => router.push(backUrl)}
                            disabled={isSubmitting}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Cancelar y Volver
                        </Button>
                    </div>
                </div>
            </form>
        </Form>
    )
}
