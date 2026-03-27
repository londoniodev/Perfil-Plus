import { z } from "zod";

// 1. Esquema General (Información del negocio + Funciones)
export const generalSettingsSchema = z.object({
    storeName: z.string().optional().or(z.literal("")),
    storeEmail: z.string().refine(val => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), "Email inválido").optional().or(z.literal("")),
    whatsapp: z.string().optional().or(z.literal("")),
    instagram: z.string().optional().or(z.literal("")),
    facebook: z.string().optional().or(z.literal("")),
    address: z.string().optional().or(z.literal("")),
    menuSlogan: z.string().optional().or(z.literal("")),
    enableBlog: z.boolean().optional(),
    enableStore: z.boolean().optional(),
    enableLMS: z.boolean().optional(),
    orderTrackingEnabled: z.boolean().optional(),
    heroImage: z.string().optional().or(z.literal("")),
});

export type GeneralSettingsValues = z.infer<typeof generalSettingsSchema>;

// 2. Esquema de Finanzas (Pasarelas de Pago + Tarifas)
export const paymentProviderEnum = z.enum(["MERCADO_PAGO", "BOLD", "CASH", "NONE"]);
export type PaymentProviderType = z.infer<typeof paymentProviderEnum>;

export const financeSettingsSchema = z.object({
    activePaymentProvider: paymentProviderEnum.optional(),
    currency: z.string().optional().or(z.literal("")),
    mpPublicKey: z.string().optional().or(z.literal("")),
    mpAccessToken: z.string().optional().or(z.literal("")),
    mpWebhookSecret: z.string().optional().or(z.literal("")),
    mpClientId: z.string().optional().or(z.literal("")),
    mpClientSecret: z.string().optional().or(z.literal("")),
    boldApiKey: z.string().optional().or(z.literal("")),
    boldSecretKey: z.string().optional().or(z.literal("")),
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

// 5. Esquema de Navegación (Header / Footer Links)
export const navigationSettingsSchema = z.object({
    headerLinks: z.array(z.object({
        label: z.string().min(1, "Etiqueta requerida"),
        href: z.string().min(1, "URL requerida"),
    })),
    footerLinks: z.array(z.object({
        label: z.string().min(1, "Etiqueta requerida"),
        href: z.string().min(1, "URL requerida"),
    })),
});

export type NavigationSettingsValues = z.infer<typeof navigationSettingsSchema>;

// 6. Esquema de Horarios de Atención
// Zonas horarias para América Latina y España
export const LATIN_AMERICA_TIMEZONES = [
    { value: "America/Bogota", label: "Colombia (GMT-5)" },
    { value: "America/Mexico_City", label: "México Centro (GMT-6)" },
    { value: "America/Cancun", label: "México Sureste (GMT-5)" },
    { value: "America/Tijuana", label: "México Pacífico (GMT-8)" },
    { value: "America/Lima", label: "Perú (GMT-5)" },
    { value: "America/Santiago", label: "Chile (GMT-4/-3)" },
    { value: "America/Argentina/Buenos_Aires", label: "Argentina (GMT-3)" },
    { value: "America/Guayaquil", label: "Ecuador (GMT-5)" },
    { value: "America/Caracas", label: "Venezuela (GMT-4)" },
    { value: "America/La_Paz", label: "Bolivia (GMT-4)" },
    { value: "America/Asuncion", label: "Paraguay (GMT-4/-3)" },
    { value: "America/Montevideo", label: "Uruguay (GMT-3)" },
    { value: "America/Panama", label: "Panamá (GMT-5)" },
    { value: "America/Costa_Rica", label: "Costa Rica (GMT-6)" },
    { value: "America/Guatemala", label: "Guatemala (GMT-6)" },
    { value: "America/El_Salvador", label: "El Salvador (GMT-6)" },
    { value: "America/Tegucigalpa", label: "Honduras (GMT-6)" },
    { value: "America/Managua", label: "Nicaragua (GMT-6)" },
    { value: "America/Santo_Domingo", label: "Rep. Dominicana (GMT-4)" },
    { value: "America/Havana", label: "Cuba (GMT-5/-4)" },
    { value: "America/Puerto_Rico", label: "Puerto Rico (GMT-4)" },
    { value: "Europe/Madrid", label: "España (GMT+1/+2)" },
    { value: "Atlantic/Canary", label: "España - Canarias (GMT+0/+1)" },
] as const;

export const timeRangeSchema = z.object({
    openTime: z.string().regex(/^\d{2}:\d{2}$/, "Formato HH:mm requerido"),
    closeTime: z.string().regex(/^\d{2}:\d{2}$/, "Formato HH:mm requerido"),
});

export const dayScheduleSchema = z.object({
    day: z.number().min(0).max(6), // 0=Domingo, 6=Sábado
    isOpen: z.boolean(),
    timeRanges: z.array(timeRangeSchema).min(1, "Al menos un rango horario requerido"),
});

export const businessHoursSettingsSchema = z.object({
    enabled: z.boolean(),
    enforceRestriction: z.boolean(),
    timezone: z.string().min(1, "Zona horaria requerida"),
    schedule: z.array(dayScheduleSchema).length(7, "Se requieren los 7 días de la semana"),
});

export type TimeRange = z.infer<typeof timeRangeSchema>;
export type DaySchedule = z.infer<typeof dayScheduleSchema>;
export type BusinessHoursSettingsValues = z.infer<typeof businessHoursSettingsSchema>;

export const DAY_NAMES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"] as const;

export const DEFAULT_BUSINESS_HOURS: BusinessHoursSettingsValues = {
    enabled: false,
    enforceRestriction: false,
    timezone: "America/Bogota",
    schedule: Array.from({ length: 7 }, (_, i) => ({
        day: i,
        isOpen: i >= 1 && i <= 6, // Lunes-Sábado abierto, Domingo cerrado
        timeRanges: [{ openTime: "08:00", closeTime: "22:00" }],
    })),
};

// Mantenemos el global por compatibilidad inmediata durante la transición
export const settingsSchema = generalSettingsSchema
    .merge(financeSettingsSchema)
    .merge(emailSettingsSchema)
    .merge(apiSettingsSchema);

export type SettingsFormValues = z.infer<typeof settingsSchema>;
