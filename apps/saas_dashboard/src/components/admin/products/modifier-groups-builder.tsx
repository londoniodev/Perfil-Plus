"use client"

import { useFieldArray, useFormContext } from "react-hook-form"
import { Plus, Trash2, GripVertical } from "lucide-react"

import { Button, Input, Accordion, AccordionContent, AccordionItem, AccordionTrigger, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, FormControl, FormField, FormItem, FormLabel, FormMessage, Badge } from "@alvarosky/ui"

import { ProductFormValues } from "@alvarosky/features"

export function ModifierGroupsBuilder() {
    const { control } = useFormContext<ProductFormValues>()

    const { fields: groupFields, append: appendGroup, remove: removeGroup } = useFieldArray({
        control,
        name: "modifierGroups"
    })

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Grupos de Modificadores</h3>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendGroup({
                        name: "Nuevo Grupo",
                        minSelect: 0,
                        maxSelect: 1,
                        modifiers: []
                    })}
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Agregar Grupo
                </Button>
            </div>

            {groupFields.length === 0 && (
                <div className="text-center p-8 border border-dashed rounded-lg text-muted-foreground text-sm">
                    No hay grupos de modificadores. Agrega uno para personalizar tu producto (ej. Salsas, Tamaño).
                </div>
            )}

            <Accordion type="multiple" className="w-full space-y-2">
                {groupFields.map((group, groupIndex) => (
                    <AccordionItem key={group.id} value={group.id} className="border rounded-lg bg-card px-2">
                        <AccordionTrigger className="hover:no-underline py-2">
                            <div className="flex items-center gap-4 flex-1 text-left">
                                <span className="font-semibold text-sm">
                                    {/* Mostrar nombre dinámico usando watch field array o fallback seguro */}
                                    {group.name || "Nuevo Grupo"}
                                </span>
                                <Badge variant="secondary" className="text-xs font-normal">
                                    {group.modifiers?.length || 0} opciones
                                </Badge>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-2 pb-4 px-2">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6 p-4 bg-muted/30 rounded-md">
                                {/* Configuración del Grupo */}
                                <div className="col-span-12 md:col-span-5">
                                    <FormField
                                        control={control}
                                        name={`modifierGroups.${groupIndex}.name`}
                                        render={({ field }: { field: any }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs">Nombre del Grupo</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="Ej: Elige tu salsa" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="col-span-6 md:col-span-3">
                                    <FormField
                                        control={control}
                                        name={`modifierGroups.${groupIndex}.minSelect`}
                                        render={({ field }: { field: any }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs">Mínimo</FormLabel>
                                                <FormControl>
                                                    <Input {...field} type="number" min="0" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="col-span-6 md:col-span-3">
                                    <FormField
                                        control={control}
                                        name={`modifierGroups.${groupIndex}.maxSelect`}
                                        render={({ field }: { field: any }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs">Máximo</FormLabel>
                                                <FormControl>
                                                    <Input {...field} type="number" min="1" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="col-span-12 md:col-span-1 flex items-end justify-end">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                                        onClick={() => removeGroup(groupIndex)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Renderizador de Opciones (Modifiers) */}
                            <ModifiersTable nestIndex={groupIndex} control={control} />
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    )
}

function ModifiersTable({ nestIndex, control }: { nestIndex: number, control: any }) {
    const { fields, append, remove } = useFieldArray({
        control,
        name: `modifierGroups.${nestIndex}.modifiers`
    })

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center mb-2">
                <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Opciones Disponibles</h4>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => append({ name: "", priceAdjustment: 0, stock: null, isAvailable: true })}
                >
                    <Plus className="mr-1 h-3 w-3" />
                    Agregar Opción
                </Button>
            </div>

            <div className="border rounded-md overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50 hover:bg-muted/50">
                            <TableHead className="w-[40%]">Nombre</TableHead>
                            <TableHead className="w-[20%]">Precio</TableHead>
                            <TableHead className="w-[20%]">Stock</TableHead>
                            <TableHead className="w-[10%] text-right"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {fields.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-xs text-muted-foreground">
                                    Sin opciones configuradas.
                                </TableCell>
                            </TableRow>
                        )}
                        {fields.map((field, k) => (
                            <TableRow key={field.id} className="group">
                                <TableCell className="p-2">
                                    <FormField
                                        control={control}
                                        name={`modifierGroups.${nestIndex}.modifiers.${k}.name`}
                                        render={({ field }: { field: any }) => (
                                            <FormItem className="mb-0 space-y-0">
                                                <FormControl>
                                                    <Input {...field} placeholder="Ej: Salsa BBQ" className="h-8 text-sm" />
                                                </FormControl>
                                                <FormMessage className="text-[10px]" />
                                            </FormItem>
                                        )}
                                    />
                                </TableCell>
                                <TableCell className="p-2">
                                    <FormField
                                        control={control}
                                        name={`modifierGroups.${nestIndex}.modifiers.${k}.priceAdjustment`}
                                        render={({ field }: { field: any }) => (
                                            <FormItem className="mb-0 space-y-0">
                                                <FormControl>
                                                    <Input {...field} type="number" step="0.5" className="h-8 text-sm" />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </TableCell>
                                <TableCell className="p-2">
                                    <FormField
                                        control={control}
                                        name={`modifierGroups.${nestIndex}.modifiers.${k}.stock`}
                                        render={({ field }) => (
                                            <FormItem className="mb-0 space-y-0">
                                                <FormControl>
                                                    <Input {...field} type="number" placeholder="∞" className="h-8 text-sm" value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </TableCell>
                                <TableCell className="p-2 text-right">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => remove(k)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
