"use client"

import { useFormContext } from "react-hook-form"
import { type PostFormValues } from "@alvarosky/features"
import {
    FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription,
    Card, CardContent, CardHeader, CardTitle, CardDescription,
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Switch
} from "@alvarosky/ui"

interface Category {
    id: string
    name: string
}

interface PostSettingsFormProps {
    categories: Category[]
}

export function PostSettingsForm({ categories }: PostSettingsFormProps) {
    const { control } = useFormContext<PostFormValues>()

    return (
        <Card>
            <CardHeader>
                <CardTitle>Categoría y Visibilidad</CardTitle>
                <CardDescription>Define la categoría del post y su estado de publicación.</CardDescription>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-6">
                <FormField
                    control={control}
                    name="categoryId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Categoría</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona una categoría" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {Array.isArray(categories) && categories.map((category) => (
                                        <SelectItem key={category.id} value={category.id}>
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex flex-col gap-4 justify-center">
                    <FormField
                        control={control}
                        name="isPremium"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base">Premium</FormLabel>
                                    <FormDescription>Contenido exclusivo para suscriptores</FormDescription>
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

                    <FormField
                        control={control}
                        name="published"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base">Publicado</FormLabel>
                                    <FormDescription>Visible para los usuarios</FormDescription>
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
            </CardContent>
        </Card>
    )
}
