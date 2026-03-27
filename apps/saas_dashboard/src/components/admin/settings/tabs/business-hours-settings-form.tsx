"use client"

import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
    businessHoursSettingsSchema,
    BusinessHoursSettingsValues,
    DEFAULT_BUSINESS_HOURS,
    DAY_NAMES,
    LATIN_AMERICA_TIMEZONES,
    type TimeRange,
} from "@alvarosky/features"
import {
    Button, Input, Card, Form, FormControl, FormDescription,
    FormField, FormItem, FormLabel, FormMessage, Switch, useToast,
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
    Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
    Badge,
} from "@alvarosky/ui"
import { Loader2, Clock, Plus, Trash2, Copy, ShieldCheck, Globe } from "lucide-react"
import { updateBusinessHoursSettings } from "@/actions/admin/update-settings"
import { useState, useCallback } from "react"

interface BusinessHoursSettingsFormProps {
    initialData?: BusinessHoursSettingsValues
}

export function BusinessHoursSettingsForm({ initialData }: BusinessHoursSettingsFormProps) {
    const toast = useToast()
    const [copyFromDay, setCopyFromDay] = useState<number | null>(null)

    const form = useForm<BusinessHoursSettingsValues>({
        resolver: zodResolver(businessHoursSettingsSchema),
        defaultValues: initialData ?? DEFAULT_BUSINESS_HOURS,
    })

    const { fields: scheduleFields } = useFieldArray({
        control: form.control,
        name: "schedule",
    })

    const onSubmit = async (data: BusinessHoursSettingsValues) => {
        try {
            const result = await updateBusinessHoursSettings(data)
            if (result.success) {
                toast.success("Horarios de atención actualizados")
            } else {
                toast.error(result.error || "Error al actualizar")
            }
        } catch (error) {
            toast.error("Error al procesar el formulario")
        }
    }

    const addTimeRange = useCallback((dayIndex: number) => {
        const current = form.getValues(`schedule.${dayIndex}.timeRanges`)
        const lastRange = current[current.length - 1]
        const newOpen = lastRange?.closeTime || "14:00"
        form.setValue(`schedule.${dayIndex}.timeRanges`, [
            ...current,
            { openTime: newOpen, closeTime: "22:00" },
        ], { shouldValidate: true })
    }, [form])

    const removeTimeRange = useCallback((dayIndex: number, rangeIndex: number) => {
        const current = form.getValues(`schedule.${dayIndex}.timeRanges`)
        if (current.length <= 1) return
        form.setValue(
            `schedule.${dayIndex}.timeRanges`,
            current.filter((_, i) => i !== rangeIndex),
            { shouldValidate: true }
        )
    }, [form])

    const copyScheduleToAll = useCallback((sourceDayIndex: number) => {
        const source = form.getValues(`schedule.${sourceDayIndex}`)
        const schedule = form.getValues("schedule")
        const updated = schedule.map((day, i) => {
            if (i === sourceDayIndex) return day
            return {
                ...day,
                isOpen: source.isOpen,
                timeRanges: [...source.timeRanges],
            }
        })
        form.setValue("schedule", updated, { shouldValidate: true })
        toast.success(`Horario del ${DAY_NAMES[sourceDayIndex]} copiado a todos los días`)
        setCopyFromDay(null)
    }, [form, toast])

    const enabled = form.watch("enabled")
    const enforceRestriction = form.watch("enforceRestriction")

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Sección de Configuración Global */}
                <Card className="p-6">
                    <section className="space-y-6">
                        <header className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                <Clock className="h-5 w-5 text-primary" aria-hidden="true" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">Horarios de Atención</h3>
                                <p className="text-sm text-muted-foreground">
                                    Configura los días y horas de atención de tu negocio.
                                </p>
                            </div>
                        </header>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="enabled"
                                render={({ field }) => (
                                    <FormItem className="flex items-center justify-between p-4 rounded-lg border border-border/40 bg-muted/40">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">Activar horarios</FormLabel>
                                            <FormDescription>
                                                Muestra los horarios en tu tienda pública.
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="enforceRestriction"
                                render={({ field }) => (
                                    <FormItem className="flex items-center justify-between p-4 rounded-lg border border-border/40 bg-muted/40">
                                        <div className="space-y-0.5">
                                            <div className="flex items-center gap-2">
                                                <FormLabel className="text-base">Bloquear pedidos</FormLabel>
                                                <ShieldCheck className="h-4 w-4 text-amber-500" aria-hidden="true" />
                                            </div>
                                            <FormDescription>
                                                Impide crear pedidos fuera de horario.
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="timezone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        <span className="flex items-center gap-2">
                                            <Globe className="h-4 w-4" aria-hidden="true" />
                                            Zona Horaria
                                        </span>
                                    </FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona tu zona horaria" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {LATIN_AMERICA_TIMEZONES.map((tz) => (
                                                <SelectItem key={tz.value} value={tz.value}>
                                                    {tz.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        Los horarios se evalúan respecto a esta zona horaria.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </section>
                </Card>

                {/* Grilla de Horarios por Día */}
                {enabled && (
                    <Card className="p-6">
                        <section className="space-y-4">
                            <header className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold">Horario Semanal</h3>
                                {enforceRestriction && (
                                    <Badge variant="outline" className="border-amber-500/50 text-amber-500">
                                        <ShieldCheck className="h-3 w-3 mr-1" aria-hidden="true" />
                                        Restricción activa
                                    </Badge>
                                )}
                            </header>

                            <div className="space-y-3">
                                {scheduleFields.map((scheduleField, dayIndex) => {
                                    const dayIsOpen = form.watch(`schedule.${dayIndex}.isOpen`)
                                    const timeRanges = form.watch(`schedule.${dayIndex}.timeRanges`)

                                    return (
                                        <article
                                            key={scheduleField.id}
                                            className={`rounded-lg border p-4 transition-colors ${
                                                dayIsOpen
                                                    ? "border-border/40 bg-card"
                                                    : "border-border/20 bg-muted/30"
                                            }`}
                                        >
                                            <div className="flex items-center justify-between gap-4">
                                                {/* Nombre del día + Toggle */}
                                                <div className="flex items-center gap-3 min-w-[160px]">
                                                    <FormField
                                                        control={form.control}
                                                        name={`schedule.${dayIndex}.isOpen`}
                                                        render={({ field }) => (
                                                            <FormItem className="flex items-center gap-3 space-y-0">
                                                                <FormControl>
                                                                    <Switch
                                                                        checked={field.value}
                                                                        onCheckedChange={field.onChange}
                                                                        aria-label={`${DAY_NAMES[dayIndex]} abierto`}
                                                                    />
                                                                </FormControl>
                                                                <FormLabel className={`text-sm font-medium cursor-pointer ${!dayIsOpen ? "text-muted-foreground" : ""}`}>
                                                                    {DAY_NAMES[dayIndex]}
                                                                </FormLabel>
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>

                                                {/* Rangos horarios */}
                                                <div className="flex-1">
                                                    {dayIsOpen ? (
                                                        <div className="space-y-2">
                                                            {timeRanges.map((_, rangeIndex) => (
                                                                <div key={rangeIndex} className="flex items-center gap-2">
                                                                    <FormField
                                                                        control={form.control}
                                                                        name={`schedule.${dayIndex}.timeRanges.${rangeIndex}.openTime`}
                                                                        render={({ field }) => (
                                                                            <FormItem className="space-y-0">
                                                                                <FormControl>
                                                                                    <Input
                                                                                        {...field}
                                                                                        type="time"
                                                                                        className="w-[120px] h-9 text-sm"
                                                                                        aria-label={`${DAY_NAMES[dayIndex]} hora de apertura rango ${rangeIndex + 1}`}
                                                                                    />
                                                                                </FormControl>
                                                                            </FormItem>
                                                                        )}
                                                                    />
                                                                    <span className="text-muted-foreground text-sm">a</span>
                                                                    <FormField
                                                                        control={form.control}
                                                                        name={`schedule.${dayIndex}.timeRanges.${rangeIndex}.closeTime`}
                                                                        render={({ field }) => (
                                                                            <FormItem className="space-y-0">
                                                                                <FormControl>
                                                                                    <Input
                                                                                        {...field}
                                                                                        type="time"
                                                                                        className="w-[120px] h-9 text-sm"
                                                                                        aria-label={`${DAY_NAMES[dayIndex]} hora de cierre rango ${rangeIndex + 1}`}
                                                                                    />
                                                                                </FormControl>
                                                                            </FormItem>
                                                                        )}
                                                                    />
                                                                    {timeRanges.length > 1 && (
                                                                        <TooltipProvider>
                                                                            <Tooltip>
                                                                                <TooltipTrigger asChild>
                                                                                    <Button
                                                                                        type="button"
                                                                                        variant="ghost"
                                                                                        size="icon"
                                                                                        className="h-9 w-9 text-destructive hover:text-destructive"
                                                                                        onClick={() => removeTimeRange(dayIndex, rangeIndex)}
                                                                                        aria-label={`Eliminar rango ${rangeIndex + 1} del ${DAY_NAMES[dayIndex]}`}
                                                                                    >
                                                                                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                                                                                    </Button>
                                                                                </TooltipTrigger>
                                                                                <TooltipContent>Eliminar rango</TooltipContent>
                                                                            </Tooltip>
                                                                        </TooltipProvider>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-muted-foreground italic">
                                                            Cerrado
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Acciones del día */}
                                                {dayIsOpen && (
                                                    <div className="flex items-center gap-1">
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-9 w-9"
                                                                        onClick={() => addTimeRange(dayIndex)}
                                                                        aria-label={`Agregar rango horario al ${DAY_NAMES[dayIndex]}`}
                                                                    >
                                                                        <Plus className="h-4 w-4" aria-hidden="true" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>Agregar turno (horario partido)</TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-9 w-9"
                                                                        onClick={() => copyScheduleToAll(dayIndex)}
                                                                        aria-label={`Copiar horario del ${DAY_NAMES[dayIndex]} a todos los días`}
                                                                    >
                                                                        <Copy className="h-4 w-4" aria-hidden="true" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>Copiar a todos los días</TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    </div>
                                                )}
                                            </div>
                                        </article>
                                    )
                                })}
                            </div>
                        </section>
                    </Card>
                )}

                <div className="flex justify-center pt-4">
                    <Button type="submit" disabled={form.formState.isSubmitting} className="min-w-[200px] h-12 text-lg">
                        {form.formState.isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
                                Guardando...
                            </>
                        ) : (
                            "Guardar Horarios"
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
