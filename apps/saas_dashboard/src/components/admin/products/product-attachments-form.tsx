"use client"

import { useFormContext, useFieldArray } from "react-hook-form"
import {
    FormControl, FormField, FormItem, FormLabel, FormMessage,
    Card, CardContent, CardHeader, CardTitle, CardDescription,
    Button, Input, AdminFormSection, IconPlus, IconTrash
} from "@alvarosky/ui"
import { ProductFormValues } from "@alvarosky/features"

export function ProductAttachmentsForm() {
    const { control } = useFormContext<ProductFormValues>()
    const { fields: attachmentFields, append: appendAttachment, remove: removeAttachment } = useFieldArray({
        control,
        name: "attachments",
    })

    return (
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
                    <IconPlus className="h-4 w-4 mr-2" />
                    Agregar Documento
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
                {attachmentFields.map((field, index) => (
                    <AdminFormSection key={field.id} grid className="gap-4">
                        <div className="col-span-12 sm:col-span-5">
                            <FormField
                                control={control}
                                name={`attachments.${index}.name`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nombre del adjunto</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ej: PDF de la guía" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="col-span-12 sm:col-span-6">
                            <FormField
                                control={control}
                                name={`attachments.${index}.url`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>URL del archivo</FormLabel>
                                        <FormControl>
                                            <Input placeholder="https://..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="col-span-12 sm:col-span-1 flex items-end justify-end">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="text-destructive h-10 w-10"
                                onClick={() => removeAttachment(index)}
                            >
                                <IconTrash className="h-4 w-4" />
                            </Button>
                        </div>
                    </AdminFormSection>
                ))}
                {attachmentFields.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">No hay documentos adjuntos. Haz clic en "Agregar Documento".</p>
                )}
            </CardContent>
        </Card>
    )
}
