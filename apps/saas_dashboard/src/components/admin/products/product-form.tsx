"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, Trash2, Loader2, Save, ArrowLeft, AlertCircle } from "lucide-react"

import { cn } from "@/lib/utils"
import { createProduct } from "@/actions/admin/create-product"
import { updateProduct } from "@/actions/admin/update-product"
import { API_BASE, TENANT_ID } from "@/lib/config"

// UI Components Library
import {
    Button, Input, Textarea, Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription,
    useToast, Card, CardContent, CardHeader, CardTitle, CardDescription,
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Switch,
    SingleImageDropzone, YouTubeEmbedInput, PrivateDocumentDropzone
} from "@alvarosky/ui"

// Shared Schema
import { productSchema, ProductFormValues } from "@alvarosky/features"

import { ModifierGroupsBuilder } from "./modifier-groups-builder"
import { CategorySelector } from "./category-selector"

interface ProductFormProps {
    initialData?: any
    courses?: { id: string; title: string }[]
}

const EMPTY_COURSES: { id: string; title: string }[] = []

export function ProductForm({ initialData, courses = EMPTY_COURSES }: ProductFormProps) {
    const router = useRouter()
    const toast = useToast()
    const [hasModifiers, setHasModifiers] = useState(!!(initialData?.modifierGroups && initialData?.modifierGroups.length > 0))
    const [authToken, setAuthToken] = useState<string | undefined>(undefined)

    // Setup Auth Token safe payload for Edge uploads directly to NestJS
    useEffect(() => {
        if (typeof window !== "undefined") {
            const token = localStorage.getItem("token");
            if (token) setAuthToken(token);
        }
    }, [])

    // Valores por defecto
    const defaultValues: Partial<ProductFormValues> = {
        name: initialData?.name || "",
        description: initialData?.description || "",
        productType: initialData?.productType || "DIGITAL",
        basePrice: initialData?.basePrice || 0,
        images: initialData?.images || [],
        published: initialData?.published || false,
        downloadUrl: initialData?.specs?.downloadUrl || initialData?.digitalFileUrl || "",
        videoUrl: initialData?.specs?.videoUrl || initialData?.previewUrl || "",
        courseId: initialData?.specs?.courseId || "",
        pages: initialData?.specs?.pages,
        format: initialData?.specs?.format || "",
        weight: initialData?.specs?.weight || "",
        dimensions: initialData?.specs?.dimensions || "",
        attachments: initialData?.specs?.attachments || [],
        variants: initialData?.variants?.map((v: any) => ({
            ...v,
            price: v.price ? Number(v.price) : null,
            attributes: v.attributes || undefined
        })) || [
                { name: "Standard", sku: "", price: null, stock: 0, isDefault: true, attributes: undefined }
            ],
        modifierGroups: initialData?.modifierGroups || [],
        categories: initialData?.categories?.map((c: any) => c.category.id) || []
    }

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema) as any,
        defaultValues,
    }) as any

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "variants",
    })

    const { fields: attachmentFields, append: appendAttachment, remove: removeAttachment } = useFieldArray({
        control: form.control,
        name: "attachments",
    })

    const productType = form.watch("productType")

    const onSubmit = async (data: ProductFormValues) => {
        try {
            // Construir specs
            const specs: Record<string, any> = {}
            if (data.attachments && data.attachments.length > 0) {
                specs.attachments = data.attachments.filter(a => a.name && a.url);
            }

            if (data.productType === "DIGITAL") {
                if (data.downloadUrl) specs.downloadUrl = data.downloadUrl;
                if (data.videoUrl) specs.videoUrl = data.videoUrl;
                if (data.courseId) specs.courseId = data.courseId;
                if (data.pages) specs.pages = data.pages;
                if (data.format) specs.format = data.format;
            } else {
                if (data.weight) specs.weight = data.weight;
                if (data.dimensions) specs.dimensions = data.dimensions;
            }

            const productData: ProductFormValues = {
                ...data,
                id: initialData?.id,
                specs,
            }

            let result;
            if (initialData?.id) {
                result = await updateProduct(productData)
            } else {
                result = await createProduct(productData)
            }

            if (result.success) {
                toast.success(initialData ? "Producto actualizado correctamente" : "Producto creado exitosamente", "Éxito")
                if (data.productType === "RESTAURANT") {
                    router.push("/restaurante/menu")
                } else {
                    router.push("/tienda/productos")
                }
                router.refresh()
            } else {
                toast.error(result.error || "Error al procesar producto", "Error")
            }
        } catch (error) {
            console.error("Error:", error)
            toast.error("Ocurrió un error al guardar los datos.", "Error Inesperado")
        }
    }

    const handleAddImage = (url: string | null) => {
        if (!url) return
        const currentImages = form.getValues("images")
        form.setValue("images", [...currentImages, url], { shouldValidate: true })
    }

    const handleRemoveImage = (index: number) => {
        const currentImages = form.getValues("images")
        form.setValue("images", currentImages.filter((_: string, i: number) => i !== index), { shouldValidate: true })
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, (errors: any) => console.error("Validation Errors:", errors))} className="space-y-6 w-full max-w-[1000px] mx-auto pb-20">

                <Card>
                    <CardHeader>
                        <CardTitle>Información del Producto</CardTitle>
                        <CardDescription>Detalles básicos e imágenes</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre del Producto *</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Ej: Hamburguesa Doble" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="basePrice"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Precio *</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                                                <Input
                                                    {...field}
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    className="pl-7"
                                                    placeholder="0.00"
                                                    onChange={e => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="categories"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Categorías</FormLabel>
                                        <FormControl>
                                            <CategorySelector
                                                value={field.value || []}
                                                onChange={field.onChange}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descripción *</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} rows={4} placeholder="Descripción detallada..." className="resize-none" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {initialData?.productType !== "RESTAURANT" && (
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
                                                <SelectItem value="PHYSICAL">Físico (Tienda)</SelectItem>
                                                <SelectItem value="DIGITAL">Digital</SelectItem>
                                                <SelectItem value="RESTAURANT">Restaurante (Plato/Bebida)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <div className="space-y-2">
                            <FormLabel>Imágenes *</FormLabel>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {form.watch("images").map((url: string, index: number) => (
                                    <div key={url} className="relative group aspect-square rounded-lg overflow-hidden border bg-muted">
                                        <Image src={url} alt={`Imagen ${index + 1}`} fill sizes="200px" className="object-cover transition-transform group-hover:scale-105" />
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

                                <div className="col-span-2 sm:col-span-4 mt-2">
                                    <SingleImageDropzone
                                        endpoint={`${API_BASE}/storage/upload/image`}
                                        token={authToken}
                                        tenantId={TENANT_ID}
                                        folder="products"
                                        onUploadSuccess={handleAddImage}
                                        maxSizeMB={5}
                                    />
                                    <p className="text-xs text-muted-foreground mt-2">Si adjuntas varias, la primera será la portada</p>
                                </div>
                            </div>
                            {form.formState.errors.images && (
                                <p className="text-sm font-medium text-destructive flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4" />
                                    {form.formState.errors.images.message}
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {productType === "DIGITAL" && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Contenido Digital</CardTitle>
                            <CardDescription>Video de introducción o demo y archivo a entregar</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <FormField
                                control={form.control}
                                name="videoUrl"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <YouTubeEmbedInput
                                                value={field.value}
                                                onChange={field.onChange}
                                                label="Enlace del Video de Demostración (YouTube)"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="downloadUrl"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Archivo Digital Protegido (Ebook, ZIP, etc.)</FormLabel>
                                        <FormControl>
                                            <PrivateDocumentDropzone
                                                endpoint={`${API_BASE}/storage/upload/attachment`}
                                                fileIntent="PRIVATE_ASSET"
                                                token={authToken}
                                                value={field.value}
                                                onChange={field.onChange}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {courses && courses.length > 0 && (
                                <FormField
                                    control={form.control}
                                    name="courseId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Vincular a un Curso (LMS)</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecciona un curso (opcional)" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="">Ninguno</SelectItem>
                                                    {courses.map(course => (
                                                        <SelectItem key={course.id} value={course.id}>
                                                            {course.title}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormDescription>
                                                Si el cliente compra este producto, se le dará acceso al curso seleccionado.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                        </CardContent>
                    </Card>
                )}

                {(productType === "PHYSICAL" || productType === "RESTAURANT") && (
                    <Card className="border-primary/20 bg-primary/5">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <CardTitle>Modificadores</CardTitle>
                                    <CardDescription>Opcionales, acompañamientos, términos de cocción</CardDescription>
                                </div>
                                <Switch
                                    checked={hasModifiers}
                                    onCheckedChange={setHasModifiers}
                                />
                            </div>
                        </CardHeader>
                        {hasModifiers && (
                            <CardContent>
                                <ModifierGroupsBuilder />
                            </CardContent>
                        )}
                    </Card>
                )}

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Documentos Adjuntos</CardTitle>
                            <CardDescription>Cualquier archivo PDF, ficha técnica o manual descargable</CardDescription>
                        </div>
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => appendAttachment({ name: "", url: "" })}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Agregar Documento
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {attachmentFields.map((field, index) => (
                            <div key={field.id} className="grid grid-cols-12 gap-4 items-start p-4 border rounded-lg bg-card/50">
                                <div className="col-span-12 sm:col-span-5">
                                    <FormField
                                        control={form.control}
                                        name={`attachments.${index}.name`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs">Nombre del documento (Ej: Ficha Técnica)</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="Nombre descriptivo" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="col-span-12 sm:col-span-6">
                                    <FormField
                                        control={form.control}
                                        name={`attachments.${index}.url`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs">Archivo PDF</FormLabel>
                                                <FormControl>
                                                    <PrivateDocumentDropzone
                                                        endpoint={`${API_BASE}/storage/upload/attachment`}
                                                        fileIntent="PUBLIC_ATTACHMENT"
                                                        token={authToken}
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="col-span-12 sm:col-span-1 flex justify-end mt-6">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeAttachment(index)}
                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                        {attachmentFields.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">No hay documentos adjuntos. Haz clic en "Agregar Documento".</p>
                        )}
                    </CardContent>
                </Card>

                {productType === "PHYSICAL" && !hasModifiers && (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Variantes Físicas</CardTitle>
                                <CardDescription>SKUs específicos para inventario (Tallas, Colores)</CardDescription>
                            </div>
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => append({ name: "", sku: "", price: null, stock: 0, isDefault: false })}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Agregar
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
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
                                                        <Input {...field} placeholder="Ej: Standard" />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="col-span-6 sm:col-span-3">
                                        <FormField
                                            control={form.control}
                                            name={`variants.${index}.stock`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs">Stock</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            type="number"
                                                            min="0"
                                                            placeholder="0"
                                                            onChange={e => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                                                        />
                                                    </FormControl>
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
                                                onClick={() => remove(index)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}

                <div className="pb-4">
                    <FormField
                        control={form.control}
                        name="published"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border/40 p-4 bg-card shadow-sm">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base font-medium">Publicado</FormLabel>
                                    <FormDescription className="text-sm">
                                        Visible en la tienda/menú
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
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button
                        type="submit"
                        disabled={form.formState.isSubmitting}
                        className="w-full sm:flex-1"
                        size="lg"
                    >
                        {form.formState.isSubmitting ? (
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
                        className="w-full sm:flex-none sm:w-auto"
                        onClick={() => {
                            const type = form.getValues("productType")
                            router.push(type === "RESTAURANT" ? "/restaurante/menu" : "/tienda/productos")
                        }}
                        disabled={form.formState.isSubmitting}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Cancelar
                    </Button>
                </div>
            </form>
        </Form>
    )
}
