"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button, Input, Textarea, Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../ui"
import { Plus, Trash2, Loader2 } from "lucide-react"
import { ImageUploader } from "../../admin/ui/ImageUploader"
import { useToast } from "../../ui/use-toast"

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
}

export function ProductForm({ initialData, onSubmit, apiBase, tenantId, backUrl = "/admin/products" }: ProductFormProps) {
    const router = useRouter()
    const { toast } = useToast()
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
                toast({
                    title: "Éxito",
                    description: initialData ? "Producto actualizado correctamente" : "Producto creado exitosamente",
                })
                router.push(backUrl)
                router.refresh()
            } else {
                toast({
                    title: "Error",
                    description: result.error || "Error al procesar producto",
                    variant: "destructive"
                })
            }
        } catch (error) {
            console.error("Error:", error)
            toast({
                title: "Error",
                description: "Error inesperado al procesar el formulario",
                variant: "destructive"
            })
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
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
                {/* Información Básica */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Información Básica</h3>

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
                                    <Textarea {...field} rows={4} placeholder="Describe tu producto..." />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="productType"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tipo de Producto *</FormLabel>
                                    <div className="relative w-full">
                                        <select
                                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            {...field}
                                            // Disable type change on edit if desired, usually safer
                                            disabled={!!initialData}
                                        >
                                            <option value="DIGITAL">Digital (E-book, Curso)</option>
                                            <option value="PHYSICAL">Físico (Producto tangible)</option>
                                        </select>
                                    </div>
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
                                        <Input {...field} type="number" step="0.01" min="0" placeholder="0.00" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="published"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                <FormControl>
                                    <input
                                        type="checkbox"
                                        checked={field.value}
                                        onChange={field.onChange}
                                        className="h-4 w-4 rounded border-gray-300"
                                    />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel>
                                        Publicar inmediatamente
                                    </FormLabel>
                                </div>
                            </FormItem>
                        )}
                    />
                </div>

                {/* Imágenes */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Imágenes *</h3>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {form.watch("images").map((url, index) => (
                            <div key={index} className="relative group">
                                <img src={url} alt={`Imagen ${index + 1}`} className="w-full aspect-square object-cover rounded-lg border" />
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => handleRemoveImage(index)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}

                        <ImageUploader
                            value={null}
                            onChange={handleAddImage}
                            label=""
                            folder="products"
                            apiBase={apiBase}
                            tenantId={tenantId}
                        />
                    </div>
                    {form.formState.errors.images && (
                        <p className="text-sm font-medium text-destructive">
                            {form.formState.errors.images.message}
                        </p>
                    )}
                </div>

                {/* Campos Condicionales: DIGITAL */}
                {productType === "DIGITAL" && (
                    <div className="space-y-4 border-t pt-6">
                        <h3 className="text-lg font-semibold">Opciones para Producto Digital</h3>

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
                    </div>
                )}

                {/* Campos Condicionales: PHYSICAL */}
                {productType === "PHYSICAL" && (
                    <div className="space-y-6 border-t pt-6">
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Opciones para Producto Físico</h3>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="weight"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Peso (opcional)</FormLabel>
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
                                            <FormLabel>Dimensiones (opcional)</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="20x15x5 cm" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Gestión de Variantes */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="font-semibold">Variantes *</h4>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => append({ name: "", sku: "", price: null, stock: 0, isDefault: false })}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Agregar Variante
                                </Button>
                            </div>

                            <div className="space-y-3">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="grid grid-cols-12 gap-2 items-end p-4 border rounded-lg">
                                        <div className="col-span-3">
                                            <FormField
                                                control={form.control}
                                                name={`variants.${index}.name`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className={index !== 0 ? "sr-only" : ""}>Nombre</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} placeholder="Ej: Rojo M" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <div className="col-span-2">
                                            <FormField
                                                control={form.control}
                                                name={`variants.${index}.sku`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className={index !== 0 ? "sr-only" : ""}>SKU</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} placeholder="AUTO" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <div className="col-span-2">
                                            <FormField
                                                control={form.control}
                                                name={`variants.${index}.price`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className={index !== 0 ? "sr-only" : ""}>Precio</FormLabel>
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

                                        <div className="col-span-2">
                                            <FormField
                                                control={form.control}
                                                name={`variants.${index}.stock`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className={index !== 0 ? "sr-only" : ""}>Stock *</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} type="number" min="0" placeholder="0" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <div className="col-span-2 flex items-center gap-2 h-10">
                                            <FormField
                                                control={form.control}
                                                name={`variants.${index}.isDefault`}
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                                                        <FormControl>
                                                            <input
                                                                type="checkbox"
                                                                checked={field.value}
                                                                onChange={field.onChange}
                                                                className="h-4 w-4 rounded"
                                                            />
                                                        </FormControl>
                                                        <FormLabel className="font-normal text-sm !mt-0">
                                                            Default
                                                        </FormLabel>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <div className="col-span-1 flex justify-end">
                                            {fields.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => remove(index)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {form.formState.errors.variants && (
                                <p className="text-sm font-medium text-destructive mt-2">
                                    {form.formState.errors.variants.message}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Botones de Acción */}
                <div className="flex gap-4 pt-6 border-t">
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="min-w-[120px]"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Guardando...
                            </>
                        ) : (
                            initialData ? "Actualizar Producto" : "Crear Producto"
                        )}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={isSubmitting}
                    >
                        Cancelar
                    </Button>
                </div>
            </form>
        </Form>
    )
}
