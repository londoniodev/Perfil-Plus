"use client"

import { useFormContext } from "react-hook-form"
import {
    FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription,
    Card, CardContent, CardHeader, CardTitle, CardDescription,
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
    YouTubeEmbedInput, PrivateDocumentDropzone
} from "@alvarosky/ui"
import { ProductFormValues } from "@alvarosky/features"
import { API_BASE } from "@/lib/config"

interface ProductDigitalContentFormProps {
    courses?: { id: string; title: string }[]
    authToken?: string
}

export function ProductDigitalContentForm({ courses = [], authToken }: ProductDigitalContentFormProps) {
    const { control, watch } = useFormContext<ProductFormValues>()
    const productType = watch("productType")

    if (productType !== "DIGITAL") return null

    return (
        <Card>
            <CardHeader>
                <CardTitle>Contenido Digital</CardTitle>
                <CardDescription>Video de introducción o demo y archivo a entregar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <FormField
                    control={control}
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
                    control={control}
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
                        control={control}
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
    )
}
