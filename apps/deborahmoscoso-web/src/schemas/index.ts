/**
 * Schemas de validación centralizados con Zod.
 * Estos schemas definen las reglas de negocio para formularios.
 */

// Auth Schemas
export {
    LoginSchema,
    RegisterSchema,
    ForgotPasswordSchema,
    ResetPasswordSchema,
    type LoginValues,
    type RegisterValues,
    type ForgotPasswordValues,
    type ResetPasswordValues,
} from "./auth";

// LMS Schemas
export {
    ThemeSchema,
    CourseSchema,
    LessonSchema,
    EvaluationSchema,
    QuestionSchema,
    type ThemeValues,
    type CourseValues,
    type LessonValues,
    type EvaluationValues,
    type QuestionValues,
} from "./lms";

