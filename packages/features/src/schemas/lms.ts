import { z } from "zod";

// ============================================================================
// THEME (TEMA) SCHEMA
// ============================================================================
export const ThemeSchema = z.object({
    title: z.string().min(3, { message: "El título debe tener al menos 3 caracteres" }),
    description: z.string().optional(),
    coverImage: z.string().url().optional().or(z.literal("")),
    order: z.coerce.number().min(0).default(0),
    published: z.boolean().default(false),
});

export type ThemeValues = z.infer<typeof ThemeSchema>;

// ============================================================================
// COURSE (CURSO) SCHEMA
// ============================================================================
export const CourseSchema = z.object({
    title: z.string().min(5, { message: "El título debe tener al menos 5 caracteres" }),
    slug: z.string()
        .min(3, { message: "El slug debe tener al menos 3 caracteres" })
        .regex(/^[a-z0-9-]+$/, { message: "Solo letras minúsculas, números y guiones" }),
    description: z.string().optional(),
    coverImage: z.string().optional(),
    isFree: z.boolean(),
    order: z.number().min(0),
    published: z.boolean(),
});

export type CourseValues = z.infer<typeof CourseSchema>;

// ============================================================================
// LESSON (LECCIÓN) SCHEMA
// ============================================================================
export const LessonSchema = z.object({
    title: z.string().min(3, { message: "El título debe tener al menos 3 caracteres" }),
    slug: z.string()
        .min(3, { message: "El slug debe tener al menos 3 caracteres" })
        .regex(/^[a-z0-9-]+$/, { message: "Solo letras minúsculas, números y guiones" }),
    content: z.string().optional(),
    videoUrl: z.string().url().optional().or(z.literal("")),
    duration: z.coerce.number().min(0).optional(),
    order: z.coerce.number().min(0).default(0),
    isFree: z.boolean().default(false),
});

export type LessonValues = z.infer<typeof LessonSchema>;

// ============================================================================
// EVALUATION (EVALUACIÓN) SCHEMA
// ============================================================================
export const EvaluationSchema = z.object({
    title: z.string().min(3, { message: "El título debe tener al menos 3 caracteres" }),
    description: z.string().optional(),
    passingScore: z.coerce.number().min(0).max(100).default(70),
});

export type EvaluationValues = z.infer<typeof EvaluationSchema>;

// ============================================================================
// QUESTION (PREGUNTA) SCHEMA
// ============================================================================
export const QuestionSchema = z.object({
    text: z.string().min(5, { message: "La pregunta debe tener al menos 5 caracteres" }),
    options: z.array(z.string().min(1)).min(2, { message: "Debe haber al menos 2 opciones" }),
    correctAnswer: z.number().min(0),
    order: z.coerce.number().min(0).default(0),
});

export type QuestionValues = z.infer<typeof QuestionSchema>;
