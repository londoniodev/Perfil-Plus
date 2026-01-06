import { z } from "zod";

export const UserSchema = z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    name: z.string().min(2),
    role: z.enum(["ADMIN", "USER", "PSYCHOLOGIST"]),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

export const RegisterSchema = LoginSchema.extend({
    name: z.string().min(2),
});
