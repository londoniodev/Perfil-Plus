import { z } from "zod";

export const postSchema = z.object({
  title: z.string().min(1, "El título es obligatorio"),
  excerpt: z.string().min(1, "El extracto es obligatorio"),
  content: z.string().min(1, "El contenido es obligatorio").min(100, "El contenido debe tener al menos 100 caracteres"),
  coverImage: z.string().nullable().optional(),
  isPremium: z.boolean().default(false),
  published: z.boolean().default(false),
  categoryId: z.string().min(1, "La categoría es obligatoria"),
  tagIds: z.array(z.string()).optional(),
  metaTitle: z.string().max(70, "Máximo 70 caracteres").optional(),
  metaDescription: z.string().max(160, "Máximo 160 caracteres").optional(),
});

export type PostFormValues = z.infer<typeof postSchema>;
