"use client"

import { useFormContext, useFieldArray } from "react-hook-form"
import {
    FormControl, FormField, FormItem, FormLabel, FormMessage,
    Card, CardContent, CardHeader, CardTitle, CardDescription,
    Button, Input, AdminFormSection, IconPlus, IconTrash
} from "@alvarosky/ui"
import { ProductFormValues } from "@alvarosky/features"

interface ProductVariantsFormProps {
    hasModifiers: boolean
}

export function ProductVariantsForm({ hasModifiers }: ProductVariantsFormProps) {
    const { control, watch, setValue } = useFormContext<ProductFormValues>()
    const productType = watch("productType")

    const { fields, append, remove } = useFieldArray({
        control,
        name: "variants",
    })

    if (productType !== "PHYSICAL" && productType !== "RESTAURANT") return null

    return (
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
                    onClick={() => append({ name: "", sku: "", price: 0, stock: 0, isDefault: false })}
                >
                    <IconPlus className="h-4 w-4 mr-2" />
                    Agregar
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
                {fields.map((field, index) => (
                    <AdminFormSection key={field.id} grid className="gap-3">
                        <div className="col-span-12 sm:col-span-3">
                            <FormField
                                control={control}
                                name={`variants.${index}.name`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nombre</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ej: Standard" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="col-span-6 sm:col-span-3">
                            <FormField
                                control={control}
                                name={`variants.${index}.stock`}
                                render={({ field }) => {
                                    const isInfinite = field.value === -1
                                    return (
                                        <FormItem>
                                            <FormLabel>Stock</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        {...field}
                                                        type="number"
                                                        min="-1"
                                                        placeholder={!isInfinite ? "0" : "∞"}
                                                        disabled={isInfinite}
                                                        className={isInfinite ? "text-transparent" : ""}
                                                        value={isInfinite ? "" : (field.value ?? 0)}
                                                        onChange={e => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                                                    />
                                                    {isInfinite && (
                                                        <div className="absolute inset-0 flex items-center pl-3 pointer-events-none text-muted-foreground font-bold text-lg">
                                                            ∞
                                                        </div>
                                                    )}
                                                </div>
                                            </FormControl>
                                        </FormItem>
                                    )
                                }}
                            />
                        </div>
                        <div className="col-span-6 sm:col-span-3">
                            <FormItem className="flex flex-col justify-end pb-2">
                                <FormLabel className="text-xs mb-2">Control stock</FormLabel>
                                <FormControl>
                                    <div className="flex items-center h-10">
                                        <Input 
                                            type="checkbox" 
                                            className="w-4 h-4 cursor-pointer" 
                                            checked={watch(`variants.${index}.stock` as any) !== -1} 
                                            onChange={(e) => {
                                                const current = watch(`variants.${index}.stock` as any)
                                                if (!e.target.checked) {
                                                    setValue(`variants.${index}.stock` as any, -1)
                                                } else {
                                                    setValue(`variants.${index}.stock` as any, current === -1 ? 0 : current)
                                                }
                                            }} 
                                        />
                                    </div>
                                </FormControl>
                            </FormItem>
                        </div>
                        <div className="col-span-12 sm:col-span-1 flex items-end justify-end">
                            {fields.length > 1 && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive h-10 w-10"
                                    onClick={() => remove(index)}
                                >
                                    <IconTrash className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </AdminFormSection>
                ))}
            </CardContent>
        </Card>
    )
}
