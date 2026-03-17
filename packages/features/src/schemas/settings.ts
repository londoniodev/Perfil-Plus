import { z } from "zod";

export const settingsSchema = z.object({
    // Info
    storeName: z.string().optional().or(z.literal("")),
    storeEmail: z.string().email("Email inválido").optional().or(z.literal("")),

    // Finance
    currency: z.string().optional().or(z.literal("")),
    mpPublicKey: z.string().optional().or(z.literal("")),
    mpAccessToken: z.string().optional().or(z.literal("")),
    mpWebhookSecret: z.string().optional().or(z.literal("")),
    mpClientId: z.string().optional().or(z.literal("")),
    mpClientSecret: z.string().optional().or(z.literal("")),

    // Appearance
    theme: z.string().optional().or(z.literal("")),
    primaryColor: z.string().optional().or(z.literal("")),

    // Email (SMTP)
    smtpHost: z.string().optional().or(z.literal("")),
    smtpPort: z.number().optional(),
    smtpSecure: z.boolean().optional(),
    smtpUser: z.string().optional().or(z.literal("")),
    smtpPass: z.string().optional().or(z.literal("")),

    // APIs
    apiKeyOpenAI: z.string().optional().or(z.literal("")),

    // Features
    enableBlog: z.boolean().optional(),
    enableStore: z.boolean().optional(),
    enableLMS: z.boolean().optional(),
    orderTrackingEnabled: z.boolean().optional(),

    // Social & Contact
    whatsapp: z.string().optional().or(z.literal("")),
    instagram: z.string().optional().or(z.literal("")),
    facebook: z.string().optional().or(z.literal("")),
    address: z.string().optional().or(z.literal("")),

    // Menu
    menuSlogan: z.string().optional().or(z.literal("")),
    menuLogo: z.string().optional().or(z.literal("")),

    // Delivery
    deliveryFee: z.number().min(0, "El valor debe ser positivo o cero").optional(),
});

export type SettingsFormValues = z.infer<typeof settingsSchema>;
