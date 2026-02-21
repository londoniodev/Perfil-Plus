// Configuración centralizada de la URL de la API
// En producción usa la URL de producción, en desarrollo usa la variable de entorno o localhost

export const API_BASE = process.env.NEXT_PUBLIC_API_URL
    || "http://127.0.0.1:3001/api";

// Tenant ID para arquitectura multi-tenant
// Tenant ID para arquitectura multi-tenant
// Enforce explicit NEXT_PUBLIC_TENANT_ID in production builds
const envTenantId = process.env.NEXT_PUBLIC_TENANT_ID?.trim();

if (!envTenantId && process.env.NODE_ENV === 'production') {
    throw new Error(
        "❌ [FATAL ERROR] Missing NEXT_PUBLIC_TENANT_ID environment variable.\n" +
        "You must provide this variable as a build-time argument in Dokploy/Vercel."
    );
}

export const TENANT_ID = envTenantId || 'mauro';

// Headers por defecto para todas las peticiones a la API
export function getApiHeaders(additionalHeaders?: HeadersInit): HeadersInit {
    return {
        'Content-Type': 'application/json',
        'x-tenant-id': TENANT_ID,
        ...additionalHeaders,
    };
}

