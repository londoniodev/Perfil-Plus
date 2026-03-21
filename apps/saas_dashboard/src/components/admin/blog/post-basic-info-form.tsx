"use client"

import { useFormContext } from "react-hook-form"
import { type PostFormValues } from "@alvarosky/features"
import {
    FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription,
    Input, Textarea, SingleImageDropzone
} from "@alvarosky/ui"
import { API_BASE, TENANT_ID } from "@/lib/config"

interface PostBasicInfoFormProps {
    authToken: string
}

export function PostBasicInfoForm({ authToken }: PostBasicInfoFormProps) {
    const { control } = useFormContext<PostFormValues>()

    return (
        <div className="grid gap-6">
            <FormField
                control={control}
                name="title"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Título *</FormLabel>
                        <FormControl>
                            <Input placeholder="Título del artículo" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={control}
                name="excerpt"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Resumen (Excerpt) *</FormLabel>
                        <FormControl>
                            <Textarea
                                placeholder="Breve descripción del artículo..."
                                className="resize-none"
                                {...field}
                            />
                        </FormControl>
                        <FormDescription>
                            Se mostrará en la lista de artículos.
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={control}
                name="coverImage"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Imagen de portada</FormLabel>
                        <FormControl>
                            <SingleImageDropzone
                                value={field.value || ""}
                                onChange={field.onChange}
                                endpoint={`${API_BASE}/storage/upload/image`}
                                token={authToken}
                                tenantId={TENANT_ID}
                                folder="blog"
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={control}
                name="content"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Contenido *</FormLabel>
                        <FormControl>
                            <Textarea
                                placeholder="Escribe el contenido del artículo..."
                                className="min-h-[400px]"
                                {...field}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    )
}
