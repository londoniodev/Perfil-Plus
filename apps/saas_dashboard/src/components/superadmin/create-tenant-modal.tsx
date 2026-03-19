"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    Button,
    Input,
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@alvarosky/ui"
import { PlusCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { API_BASE } from "@/lib/config"

// ============================================================================
// SCHEMA
// ============================================================================

const createTenantSchema = z.object({
    name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
    domain: z.string().min(4, "Ingresa un dominio válido (ej: comercio.com)"),
    slug: z.string().min(3, "El slug debe tener al menos 3 caracteres")
        .regex(/^[a-z0-str0-9-]+$/, "Solo letras minúsculas, números y guiones"),
    ownerEmail: z.string().email("Ingresa un correo electrónico válido"),
    adminPassword: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
})

type CreateTenantFormValues = z.infer<typeof createTenantSchema>

// ============================================================================
// COMPONENT
// ============================================================================

export function CreateTenantModal() {
    const router = useRouter()
    const [open, setOpen] = React.useState(false)
    const [isSubmitting, setIsSubmitting] = React.useState(false)

    const form = useForm<CreateTenantFormValues>({
        resolver: zodResolver(createTenantSchema),
        defaultValues: {
            name: "",
            domain: "",
            slug: "",
            ownerEmail: "",
            adminPassword: "",
        },
    })

    const onSubmit = async (data: CreateTenantFormValues) => {
        setIsSubmitting(true)
        try {
            const response = await fetch(`${API_BASE}/tenant`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                // Si la cookie está en el dominio padre, credentials 'include' ayuda
                credentials: "include", 
                body: JSON.stringify(data),
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.message || "Error al crear el tenant")
            }

            toast.success("Tenant creado exitosamente")
            setOpen(false)
            form.reset()
            router.refresh() // Recargar datos de la tabla
        } catch (error: any) {
            console.error("Error creating tenant:", error)
            toast.error(error.message || "No se pudo crear el tenant. Verifica tu conexión.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                    <PlusCircle className="h-4 w-4" />
                    Nuevo Cliente
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Crear Nuevo Tenant</DialogTitle>
                    <DialogDescription>
                        Completa los datos para dar de alta un nuevo cliente en la plataforma.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre del Comercio</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej: El Buen Sabor" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="slug"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Slug Interno</FormLabel>
                                        <FormControl>
                                            <Input placeholder="elbuensabor" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="domain"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Dominio Custom</FormLabel>
                                        <FormControl>
                                            <Input placeholder="elbuensabor.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="ownerEmail"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email del Propietario</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="admin@elbuensabor.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="adminPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Contraseña Inicial</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="••••••••" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isSubmitting} className="min-w-[100px]">
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creando...
                                    </>
                                ) : (
                                    "Crear Tenant"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
