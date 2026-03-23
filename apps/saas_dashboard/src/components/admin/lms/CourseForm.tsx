"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { API_BASE, TENANT_ID } from "@/lib/config";
import { 
    useToast,
    Button,
    Input,
    Textarea,
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormSwitchField,
    AdminPageWrapper,
    IconSave,
    IconLoader,
} from "@alvarosky/ui";
import { CourseSchema, type CourseValues } from "@alvarosky/features";

// ============================================================================
// TYPES
// ============================================================================
interface CourseFormProps {
    /** Modo del formulario */
    mode: "create" | "edit";
    /** ID del tema padre */
    themeId: string;
    /** ID del curso (solo para edición) */
    courseId?: string;
    /** Datos iniciales para modo edición */
    initialData?: Partial<CourseValues>;
    /** Callback al guardar exitosamente */
    onSuccess?: () => void;
}

// ============================================================================
// UTILS
// ============================================================================
function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove accents
        .replace(/[^a-z0-9\s-]/g, "") // Remove special chars
        .replace(/\s+/g, "-") // Spaces to hyphens
        .replace(/-+/g, "-") // Multiple hyphens to single
        .trim();
}

// ============================================================================
// COMPONENT
// ============================================================================
export default function CourseForm({
    mode,
    themeId,
    courseId,
    initialData,
    onSuccess,
}: CourseFormProps) {
    const router = useRouter();
    const toast = useToast();

    const form = useForm<CourseValues>({
        resolver: standardSchemaResolver(CourseSchema),
        defaultValues: {
            title: initialData?.title || "",
            slug: initialData?.slug || "",
            description: initialData?.description || "",
            coverImage: initialData?.coverImage || "",
            isFree: initialData?.isFree || false,
            order: initialData?.order || 0,
            published: initialData?.published || false,
        },
    });

    const { isSubmitting, isDirty } = form.formState;
    const watchTitle = form.watch("title");

    // Auto-generate slug from title (only in create mode and if slug is empty)
    useEffect(() => {
        if (mode === "create" && watchTitle && !form.getValues("slug")) {
            const slug = generateSlug(watchTitle);
            form.setValue("slug", slug, { shouldValidate: true });
        }
    }, [watchTitle, mode, form]);

    const onSubmit = async (values: CourseValues) => {
        try {
            const url = mode === "create"
                ? `${API_BASE}/admin/lms/courses`
                : `${API_BASE}/admin/lms/courses/${courseId}`;

            const method = mode === "create" ? "POST" : "PATCH";

            // For create, include themeId in the body
            const body = mode === "create"
                ? { ...values, themeId }
                : values;

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json"},
                credentials: "include",
                body: JSON.stringify(body),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Error al guardar el curso");
            }

            toast.success(mode === "create" ? "Curso creado exitosamente" : "Curso actualizado exitosamente");

            if (onSuccess) {
                onSuccess();
            } else {
                router.push(`/admin/cursos/temas/${themeId}`);
            }
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    return (
        <AdminPageWrapper
            title={mode === "create" ? "Nuevo Curso" : "Editar Curso"}
            description="Configura los detalles del curso y su estado de publicación"
            maxWidth="sm"
        >
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-10">
                    {/* Title */}
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Título del Curso *</FormLabel>
                                <FormControl>
                                    <Input placeholder="Introducción al Liderazgo" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Slug */}
                    <FormField
                        control={form.control}
                        name="slug"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Slug (URL) *</FormLabel>
                                <FormControl>
                                    <Input placeholder="introduccion-al-liderazgo" {...field} />
                                </FormControl>
                                <FormDescription>
                                    Identificador único para la URL. Solo letras minúsculas, números y guiones.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Description */}
                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Descripción</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Describe el contenido del curso..."
                                        className="min-h-[100px]"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Cover Image URL */}
                    <FormField
                        control={form.control}
                        name="coverImage"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>URL de Imagen de Portada</FormLabel>
                                <FormControl>
                                    <Input placeholder="https://ejemplo.com/imagen.jpg" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Order */}
                    <FormField
                        control={form.control}
                        name="order"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Orden</FormLabel>
                                <FormControl>
                                    <Input type="number" min={0} {...field} />
                                </FormControl>
                                <FormDescription>
                                    Posición del curso en la lista (menor número = primero)
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Switches Row */}
                    <div className="flex flex-col sm:flex-row gap-6">
                        <FormSwitchField
                            control={form.control}
                            name="isFree"
                            label="Gratuito"
                            description="El curso estará disponible sin suscripción"
                            className="flex-1"
                        />

                        <FormSwitchField
                            control={form.control}
                            name="published"
                            label="Publicado"
                            description="Visible para los usuarios"
                            className="flex-1"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                            disabled={isSubmitting}
                            className="w-full sm:w-auto"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            className="w-full sm:w-auto"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <IconLoader className="mr-2 h-4 w-4 animate-spin" />
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <IconSave className="mr-2 h-4 w-4" />
                                    {mode === "create" ? "Crear Curso" : "Guardar Cambios"}
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </AdminPageWrapper>
    );
}
