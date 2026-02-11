"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button, Input, Textarea } from "@alvarosky/ui";
import { motion } from "framer-motion";
import { toast } from "sonner";

const formSchema = z.object({
    name: z.string().min(2, "El nombre es muy corto"),
    email: z.string().email("Email inválido"),
    goal: z.string().min(5, "Cuéntanos un poco más sobre tu meta"),
    experience: z.string().min(2, "Selecciona una opción"),
    message: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function CoachingInquiryForm() {
    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
    });

    const onSubmit = async (data: FormValues) => {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 2000));
        console.log(data);
        toast.success("¡Solicitud enviada con éxito! Deborah se pondrá en contacto contigo pronto.");
        reset();
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="max-w-xl mx-auto p-8 bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl"
        >
            <h3 className="text-2xl font-bold text-white mb-2">Aplica al Programa</h3>
            <p className="text-zinc-400 mb-8">Cuéntanos sobre ti y Deborah evaluará tu perfil para el coaching.</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">Nombre Completo</label>
                    <Input
                        {...register("name")}
                        placeholder="Tu nombre"
                        className="bg-zinc-950 border-zinc-800 focus:border-emerald-500"
                    />
                    {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">Correo Electrónico</label>
                    <Input
                        {...register("email")}
                        type="email"
                        placeholder="tu@email.com"
                        className="bg-zinc-950 border-zinc-800 focus:border-emerald-500"
                    />
                    {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">¿Cuál es tu principal objetivo fitness?</label>
                    <Input
                        {...register("goal")}
                        placeholder="Ej: Perder 5kg, Ganar masa muscular..."
                        className="bg-zinc-950 border-zinc-800 focus:border-emerald-500"
                    />
                    {errors.goal && <p className="text-red-500 text-xs">{errors.goal.message}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">Experiencia previa</label>
                    <select
                        {...register("experience")}
                        className="w-full h-10 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-md text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                        <option value="">Selecciona una opción</option>
                        <option value="beginner">Principiante (0-6 meses)</option>
                        <option value="intermediate">Intermedio (1-3 años)</option>
                        <option value="advanced">Avanzado (3+ años)</option>
                    </select>
                    {errors.experience && <p className="text-red-500 text-xs">{errors.experience.message}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">Mensaje Adicional (Opcional)</label>
                    <Textarea
                        {...register("message")}
                        placeholder="Cuéntanos cualquier detalle importante..."
                        className="bg-zinc-950 border-zinc-800 focus:border-emerald-500 h-32"
                    />
                </div>

                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-12 rounded-xl"
                >
                    {isSubmitting ? "Enviando..." : "Enviar Solicitud"}
                </Button>
            </form>
        </motion.div>
    );
}
