// ============================================================================
// SHARED TENANT CONFIGURATION (Client & Server)
// ============================================================================

// API Base URL
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001/api";

const envTenantId = process.env.NEXT_PUBLIC_TENANT_ID?.trim();
const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build';

if (!envTenantId && !isBuildTime) {
    throw new Error(
        "❌ [FATAL ERROR] Missing NEXT_PUBLIC_TENANT_ID environment variable.\n" +
        "Set it in .env.local for development or as a build-time argument in Dokploy/Vercel for production.\n" +
        "Example: NEXT_PUBLIC_TENANT_ID=\"my-tenant-slug\""
    );
}

export const TENANT_ID = envTenantId || 'admin_build';

// ── Meta Embedded Signup Hub ──
// Dominio del Tech Provider donde se ejecuta el flujo de Embedded Signup.
// Debe ser la versión punycode si el dominio tiene caracteres especiales (ej: ñ).
// Ejemplo: xn--alvarolondoo-khb.dev
export const META_HUB_DOMAIN = process.env.NEXT_PUBLIC_META_HUB_DOMAIN?.trim() || "";

/**
 * Get API headers with tenant ID
 * Use this for all API calls to ensure tenant context is passed
 * For Server Actions, pass the dynamically resolved CUID as dynamicTenantId.
 */
export function getApiHeaders(additionalHeaders?: HeadersInit): HeadersInit {
    return {
        'Content-Type': 'application/json',
        ...additionalHeaders,
    };
}

