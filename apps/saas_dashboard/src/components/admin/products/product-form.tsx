"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Trash2 } from "lucide-react"
import { AlertCircle } from "lucide-react"

import { cn } from "@/lib/utils"
import { createProduct } from "@/actions/admin/create-product"
import { updateProduct } from "@/actions/admin/update-product"
import { API_BASE, TENANT_ID } from "@/lib/config"

// UI Components Library
import {
    Button, Input, Textarea, Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription,
    useToast, Card, CardContent, CardHeader, CardTitle, CardDescription,
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Switch,
    SingleImageDropzone, YouTubeEmbedInput, PrivateDocumentDropzone,
    AdminFormSection, FormSwitchField, IconTrash,
    AdminPageWrapper, IconPlus, IconSave, IconLoader, IconBack,
} from "@alvarosky/ui"

// Shared Schema
import { productSchema, ProductFormValues } from "@alvarosky/features"

import { ModifierGroupsBuilder } from "./modifier-groups-builder"
import { ProductBasicInfoForm } from "./product-basic-info-form"
import { ProductDigitalContentForm } from "./product-digital-content-form"
import { ProductAttachmentsForm } from "./product-attachments-form"
import { ProductVariantsForm } from "./product-variants-form"

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
            price: undefined,
            attributes: v.attributes || undefined
        })) || [
                { name: "Standard", sku: "", price: undefined, stock: 0, isDefault: true, attributes: undefined }
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
        <AdminPageWrapper
            title={initialData ? "Editar Producto" : "Nuevo Producto"}
            description="Gestiona los detalles, variantes y archivos de tu producto"
            maxWidth="md"
        >
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit, (errors: any) => console.error("Validation Errors:", errors))} className="space-y-6 pb-20">

                        <ProductBasicInfoForm 
                            initialData={initialData}
                            authToken={authToken}
                            handleAddImage={handleAddImage}
                            handleRemoveImage={handleRemoveImage}
                        />

                        <ProductDigitalContentForm 
                            courses={courses}
                            authToken={authToken}
                        />

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

                        <ProductAttachmentsForm />

                        <ProductVariantsForm hasModifiers={hasModifiers} />

                        <div className="pb-4">
                            <FormSwitchField
                                control={form.control}
                                name="published"
                                label="Publicado"
                                description="Visible en la tienda/menú"
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
                                        <IconLoader className="mr-2 h-4 w-4 animate-spin" />
                                        Guardando...
                                    </>
                                ) : (
                                    <>
                                        <IconSave className="mr-2 h-4 w-4" />
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
                                <IconBack className="mr-2 h-4 w-4" />
                                Cancelar
                            </Button>
                        </div>
                    </form>
                </Form>
            </AdminPageWrapper>
    )
}
