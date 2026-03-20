import { z } from "zod";

// 1. Esquema General (Información del negocio + Funciones)
export const generalSettingsSchema = z.object({
    storeName: z.string().optional().or(z.literal("")),
    storeEmail: z.string().email("Email inválido").optional().or(z.literal("")),
    whatsapp: z.string().optional().or(z.literal("")),
    instagram: z.string().optional().or(z.literal("")),
    facebook: z.string().optional().or(z.literal("")),
    address: z.string().optional().or(z.literal("")),
    menuSlogan: z.string().optional().or(z.literal("")),
    enableBlog: z.boolean().optional(),
    enableStore: z.boolean().optional(),
    enableLMS: z.boolean().optional(),
    orderTrackingEnabled: z.boolean().optional(),
});

export type GeneralSettingsValues = z.infer<typeof generalSettingsSchema>;

// 2. Esquema de Finanzas (Mercado Pago + Tarifas)
export const financeSettingsSchema = z.object({
    currency: z.string().optional().or(z.literal("")),
    mpPublicKey: z.string().optional().or(z.literal("")),
    mpAccessToken: z.string().optional().or(z.literal("")),
    mpWebhookSecret: z.string().optional().or(z.literal("")),
    mpClientId: z.string().optional().or(z.literal("")),
    mpClientSecret: z.string().optional().or(z.literal("")),
    deliveryFee: z.number().min(0, "El valor debe ser positivo o cero").optional(),
});

export type FinanceSettingsValues = z.infer<typeof financeSettingsSchema>;

// 3. Esquema de Email (SMTP)
export const emailSettingsSchema = z.object({
    smtpHost: z.string().optional().or(z.literal("")),
    smtpPort: z.number().optional(),
    smtpSecure: z.boolean().optional(),
    smtpUser: z.string().optional().or(z.literal("")),
    smtpPass: z.string().optional().or(z.literal("")),
});

export type EmailSettingsValues = z.infer<typeof emailSettingsSchema>;

// 4. Esquema de APIs (IA + Integraciones Externas)
export const apiSettingsSchema = z.object({
    apiKeyOpenAI: z.string().optional().or(z.literal("")),
});

export type ApiSettingsValues = z.infer<typeof apiSettingsSchema>;

// Mantenemos el global por compatibilidad inmediata durante la transición
export const settingsSchema = generalSettingsSchema
    .merge(financeSettingsSchema)
    .merge(emailSettingsSchema)
    .merge(apiSettingsSchema);

export type SettingsFormValues = z.infer<typeof settingsSchema>;
