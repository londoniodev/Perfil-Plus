"use client"

import { useFormContext } from "react-hook-form"
import { type PostFormValues } from "@alvarosky/features"
import {
    FormControl, FormField, FormItem, FormLabel, FormMessage,
    Card, CardContent, CardHeader, CardTitle, CardDescription,
    Input, Textarea
} from "@alvarosky/ui"

export function PostSEOForm() {
    const { control } = useFormContext<PostFormValues>()

    return (
        <Card>
            <CardHeader>
                <CardTitle>SEO</CardTitle>
                <CardDescription>Optimiza el post para motores de búsqueda.</CardDescription>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-6">
                <FormField
                    control={control}
                    name="metaTitle"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="flex justify-between">
                                <span>Meta Título</span>
                                <span className={`text-[10px] ${
                                    (field.value?.length || 0) > 60 ? "text-destructive" : "text-muted-foreground"
                                }`}>
                                    {field.value?.length || 0}/60
                                </span>
                            </FormLabel>
                            <FormControl>
                                <Input placeholder="Título para buscadores..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name="metaDescription"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="flex justify-between">
                                <span>Meta Descripción</span>
                                <span className={`text-[10px] ${
                                    (field.value?.length || 0) > 160 ? "text-destructive" : "text-muted-foreground"
                                }`}>
                                    {field.value?.length || 0}/160
                                </span>
                            </FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Resumen para buscadores..."
                                    className="resize-none h-[80px]"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </CardContent>
        </Card>
    )
}
