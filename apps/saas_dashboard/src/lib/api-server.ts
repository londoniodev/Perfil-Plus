import { getTenantId } from './config-server';
import { cookies } from 'next/headers';

// Lógica de base URL estricta para SSR (Dokploy)
function getApiBaseUrl() {
    const internalUrl = process.env.INTERNAL_API_URL;
    const publicUrl = process.env.NEXT_PUBLIC_API_URL;

    // Validación Fail-fast: En el servidor (SSR), INTERNAL_API_URL debe existir en producción
    if (!internalUrl && process.env.NODE_ENV === 'production') {
        throw new Error("INTERNAL_API_URL is not defined for SSR fetch. Ensure it is set in Dokploy environment variables.");
    }

    const base = (internalUrl || publicUrl || 'http://localhost:3001/api').replace(/\/+$/, "");
    return base.endsWith('/api') ? base : `${base}/api`;
}

const API_BASE_URL = getApiBaseUrl();

/**
 * Universal Server API Client
 * 
 * Este fetch wrapper SOLO debe ser usado en Server Components y Server Actions.
 * Inyecta dinámicamente el header `x-tenant-id` leyendo del request actual,
 * garantizando que ninguna llamada al backend rompa el aislamiento Multi-Tenant.
 * Además inyecta automáticamente el token de la sesión si existe.
 */
export async function serverFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const tenantId = await getTenantId();
    const cookieStore = await cookies();
    const token = cookieStore.get("Authentication")?.value || cookieStore.get("accessToken")?.value;

    const headers = new Headers(options?.headers);

    // Inyectar tenantId para rutas públicas y auditoría
    if (tenantId) {
        headers.set('x-tenant-id', tenantId);
    }

    headers.set('x-internal-token', process.env.INTERNAL_API_KEY || 'default_dev_secret_key');

    if (token && !headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    // Auto-set Content-Type for JSON bodies if not specified
    if (options?.body && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout

        const fetchOptions: RequestInit = {
            ...options,
            headers,
            signal: controller.signal,
        };

        // Las Server Actions suelen requerir no cachear las mutaciones
        if (!options?.cache && !options?.next) {
            fetchOptions.cache = 'no-store';
        } else if (options?.next) {
            // Aseguramos que cualquier cacheo tenga el tag del tenant
            fetchOptions.next = {
                ...options.next,
                tags: [...(options.next.tags || []), `tenant-${tenantId}`, `tenant-${tenantId}-server-api`]
            };
        } else if (options?.cache !== 'no-store') {
            // Si hay cacheo implícito (force-cache), inyectamos tags
            fetchOptions.next = {
                tags: [`tenant-${tenantId}`, `tenant-${tenantId}-server-api`]
            };
        }

        let currentEndpoint = endpoint;
        if (!options?.method || options.method === 'GET') {
            const separator = currentEndpoint.includes('?') ? '&' : '?';
            currentEndpoint = `${currentEndpoint}${separator}_tenantCacheId=${tenantId}`;
        }

        const response = await fetch(`${API_BASE_URL}${currentEndpoint}`, fetchOptions);
        clearTimeout(timeoutId);

        if (!response.ok) {
            let errorMessage = `API Error: ${response.status} ${response.statusText}`;
            try {
                const text = await response.clone().text();
                if (text) {
                    const errorData = JSON.parse(text);
                    errorMessage = errorData.message || JSON.stringify(errorData) || errorMessage;
                }
            } catch (e) {
                // Ignore parsing errors on error bodies
            }
            throw new Error(errorMessage);
        }

        // Si la respuesta es un 204 No Content
        if (response.status === 204) {
            return undefined as any;
        }

        const text = await response.text();
        if (!text) {
            return { success: true } as any;
        }

        try {
            return JSON.parse(text) as T;
        } catch (e: any) {
            console.warn(`[Server API] Error parsing JSON response from ${endpoint}:`, e.message);
            // Fallback for non-JSON or malformed but successful responses
            return { success: true } as any;
        }
    } catch (error) {
        console.error(`[Server API Error] ${endpoint}:`, error);
        throw error;
    }
}
