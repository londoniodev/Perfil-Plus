import { getApiConfig } from './config';

/**
 * Generic fetch wrapper with error handling and default configuration
 */
export async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const config = getApiConfig();

    const res = await fetch(`${config.baseUrl}${endpoint}`, {
        ...options,
        credentials: config.credentials,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
        next: { revalidate: config.revalidate },
    });

    if (!res.ok) {
        throw new Error(`API Error: ${res.status}`);
    }

    return res.json();
}

/**
 * Authenticated fetch wrapper that accepts a token
 */
export async function fetchAPIWithAuth<T>(
    endpoint: string,
    token?: string,
    options?: RequestInit
): Promise<T> {
    const headers: Record<string, string> = {};
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    return fetchAPI<T>(endpoint, {
        ...options,
        headers: {
            ...headers,
            ...options?.headers,
        },
    });
}


