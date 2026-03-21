"use client"

import { useFormContext } from "react-hook-form"
import Image from "next/image"
import { Trash2, AlertCircle } from "lucide-react"

import {
    FormControl, FormField, FormItem, FormLabel, FormMessage,
    Input, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
    Card, CardContent, CardHeader, CardTitle, CardDescription,
    SingleImageDropzone, Button
} from "@alvarosky/ui"
import { ProductFormValues } from "@alvarosky/features"
import { CategorySelector } from "./category-selector"
import { API_BASE, TENANT_ID } from "@/lib/config"

interface ProductBasicInfoFormProps {
    initialData?: any
    authToken?: string
    handleAddImage: (url: string | null) => void
    handleRemoveImage: (index: number) => void
}

export function ProductBasicInfoForm({
    initialData,
    authToken,
    handleAddImage,
    handleRemoveImage
}: ProductBasicInfoFormProps) {
    const { control, watch, formState } = useFormContext<ProductFormValues>()
    const images = watch("images") || []

    return (
        <Card>
            <CardHeader>
                <CardTitle>Información del Producto</CardTitle>
                <CardDescription>Detalles básicos e imágenes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <FormField
                    control={control}
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
                        control={control}
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
                        control={control}
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
                    control={control}
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
                        control={control}
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
                        {images.map((url: string, index: number) => (
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
                    {formState.errors.images && (
                        <p className="text-sm font-medium text-destructive flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            {formState.errors.images.message}
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
