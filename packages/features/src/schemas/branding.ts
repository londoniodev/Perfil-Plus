import { z } from "zod";

export const brandingSchema = z.object({
    primary: z.string().min(1, "El color primario es requerido"),
    radius: z.number().min(0).max(2),
    density: z.enum(["default", "compact", "spacious"]),
    mode: z.enum(["light", "dark", "system"]).default("system"),
    logoUrl: z.string().optional().or(z.literal("")),
    faviconUrl: z.string().optional().or(z.literal("")),
    secondaryColor: z.string().optional().or(z.literal("")),
    fontFamily: z.string().optional().or(z.literal("")),
});

export type BrandingFormValues = z.infer<typeof brandingSchema>;
