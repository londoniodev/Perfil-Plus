import { z } from "zod";

// ============================================================================
// LOGIN SCHEMA
// ============================================================================
export const LoginSchema = z.object({
    email: z.string().email({ message: "Email inválido" }),
    password: z.string().min(1, { message: "La contraseña es requerida" }),
});

export type LoginValues = z.infer<typeof LoginSchema>;

// ============================================================================
// REGISTER SCHEMA
// ============================================================================
export const RegisterSchema = z.object({
    name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
    email: z.string().email({ message: "Email inválido" }),
    password: z.string()
        .min(8, { message: "La contraseña debe tener al menos 8 caracteres" })
        .regex(/[A-Z]/, { message: "Debe contener al menos una mayúscula" })
        .regex(/[a-z]/, { message: "Debe contener al menos una minúscula" })
        .regex(/[0-9]/, { message: "Debe contener al menos un número" }),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
});

export type RegisterValues = z.infer<typeof RegisterSchema>;

// ============================================================================
// FORGOT PASSWORD SCHEMA
// ============================================================================
export const ForgotPasswordSchema = z.object({
    email: z.string().email({ message: "Email inválido" }),
});

export type ForgotPasswordValues = z.infer<typeof ForgotPasswordSchema>;

// ============================================================================
// RESET PASSWORD SCHEMA
// ============================================================================
export const ResetPasswordSchema = z.object({
    password: z.string()
        .min(8, { message: "La contraseña debe tener al menos 8 caracteres" })
        .regex(/[A-Z]/, { message: "Debe contener al menos una mayúscula" })
        .regex(/[a-z]/, { message: "Debe contener al menos una minúscula" })
        .regex(/[0-9]/, { message: "Debe contener al menos un número" }),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
});

export type ResetPasswordValues = z.infer<typeof ResetPasswordSchema>;


