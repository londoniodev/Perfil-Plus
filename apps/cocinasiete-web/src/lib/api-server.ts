import { getTenantId } from './config-server';
import { cookies } from 'next/headers';

// Fallback a localhost si no está definida en el entorno
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001/api';

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

    // Inyectar headers obligatorios si no existen
    if (!headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }
    headers.set('x-tenant-id', tenantId);

    if (token && !headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    try {
        const fetchOptions: RequestInit = {
            ...options,
            headers,
        };

        // Las Server Actions suelen requerir no cachear las mutaciones
        if (!options?.cache && !options?.next) {
            fetchOptions.cache = 'no-store';
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, fetchOptions);

        if (!response.ok) {
            let errorMessage = `API Error: ${response.status} ${response.statusText}`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || JSON.stringify(errorData) || errorMessage;
            } catch (e) {
                // Ignore JSON parse error on non-JSON response
            }
            throw new Error(errorMessage);
        }

        // Si la respuesta es un 204 No Content
        if (response.status === 204) {
            return undefined as any;
        }

        return await response.json() as T;
    } catch (error) {
        console.error(`[Server API Error] ${endpoint}:`, error);
        throw error;
    }
}
