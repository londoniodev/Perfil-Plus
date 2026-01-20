// Configuración centralizada de la URL de la API
// En producción usa la URL de producción, en desarrollo usa la variable de entorno o localhost

export const API_BASE = process.env.NEXT_PUBLIC_API_URL
    || (process.env.NODE_ENV === 'production'
        ? "https://api.mauromera.com/api"
        : "http://127.0.0.1:3001/api");

// Tenant ID para arquitectura multi-tenant
// Tenant ID para arquitectura multi-tenant
export const TENANT_ID = (process.env.NEXT_PUBLIC_TENANT_ID?.trim()) || 'mauro';

// Headers por defecto para todas las peticiones a la API
export function getApiHeaders(additionalHeaders?: HeadersInit): HeadersInit {
    return {
        'Content-Type': 'application/json',
        'x-tenant-id': TENANT_ID,
        ...additionalHeaders,
    };
}

