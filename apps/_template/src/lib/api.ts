import { Post, Category, Tag } from '@/types/blog';
import { PaginatedResponse } from '@/types/common';
import { API_BASE as API_BASE_URL } from './config';

async function fetchAPI<T>(endpoint: string, options?: RequestInit, explicitTenantId?: string): Promise<T> {
    const isClient = typeof window !== 'undefined';
    let token = isClient ? localStorage.getItem('token') : null;
    let localBranchId: string | null = null;
    
    if (isClient) {
        try {
            const cartStorage = localStorage.getItem('cart-storage');
            if (cartStorage) {
                const parsed = JSON.parse(cartStorage);
                localBranchId = parsed?.state?.branchId || null;
            }
        } catch(e) {}
    }

    // Resolve tenantId: explicit > next_public (fallback)
    // NOTE: On server (SSR/ISR), explicitTenantId must be provided by the caller.
    // On client, backend resolves via Host header.
    const tenantId = explicitTenantId;
    const effectiveTenantId = tenantId || process.env.NEXT_PUBLIC_TENANT_ID || 'default';

    const getHeaders = (authToken: string | null) => ({
        'Content-Type': 'application/json',
        'x-tenant-id': effectiveTenantId,
        ...(localBranchId ? { 'x-branch-id': localBranchId } : {}),
        ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
        ...options?.headers,
    });

    const urlObj = new URL(`${API_BASE_URL}${endpoint}`);
    const baseTag = urlObj.pathname.split('/').filter(Boolean)[0] || 'general';

    let currentEndpoint = endpoint;
    if (!options?.method || options.method === 'GET') {
        const separator = currentEndpoint.includes('?') ? '&' : '?';
        currentEndpoint = `${currentEndpoint}${separator}_tenantCacheId=${effectiveTenantId}`;
    }

    // Determinar estrategia de caché: respetar options.cache si fue explícito,
    // de lo contrario usar 'force-cache' para GET y 'no-store' para mutaciones.
    const resolvedCache = options?.cache 
        ? options.cache 
        : ((!options?.method || options.method === 'GET') ? 'force-cache' : 'no-store');

    let res = await fetch(`${API_BASE_URL}${currentEndpoint}`, {
        ...options,
        credentials: 'include',
        headers: getHeaders(token),
        cache: resolvedCache,
        next: { tags: [`tenant-${effectiveTenantId}`, `tenant-${effectiveTenantId}-${baseTag}`] },
    });

    // Client-side 401 handling
    if (res.status === 401 && isClient) {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
                const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
                    method: "POST",
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(tenantId ? { 'x-tenant-id': tenantId } : {}),
                    },
                    body: JSON.stringify({ refreshToken }),
                });

                if (refreshRes.ok) {
                    const data = await refreshRes.json();
                    if (data.accessToken) {
                        localStorage.setItem('token', data.accessToken);
                        localStorage.setItem('refreshToken', data.refreshToken);
                        document.cookie = `accessToken=${data.accessToken}; path=/; SameSite=Lax; Secure`;

                        res = await fetch(`${API_BASE_URL}${currentEndpoint}`, {
                            ...options,
                            credentials: 'include',
                            headers: getHeaders(data.accessToken),
                            cache: resolvedCache,
                            next: { tags: [`tenant-${effectiveTenantId}`, `tenant-${effectiveTenantId}-${baseTag}`] },
                        });
                    }
                }
            }
        } catch (error) {
            console.error("Token refresh failed:", error);
        }
    }

    if (!res.ok) {
        throw new Error(`API Error: ${res.status}`);
    }

    return res.json();
}

// Blog Posts
export async function getPosts(
    page = 1,
    limit = 10,
    category?: string,
    tenantId?: string
): Promise<PaginatedResponse<Post>> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (category) params.append('category', category);
    return fetchAPI<PaginatedResponse<Post>>(`/blog/posts?${params}`, undefined, tenantId);
}

export async function getPostBySlug(slug: string, tenantId?: string): Promise<Post> {
    return fetchAPI<Post>(`/blog/posts/${slug}`, undefined, tenantId);
}

// Categories
export async function getCategories(tenantId?: string): Promise<Category[]> {
    return fetchAPI<Category[]>('/blog/categories', undefined, tenantId);
}

// Tags
export async function getTags(tenantId?: string): Promise<Tag[]> {
    return fetchAPI<Tag[]>('/blog/tags', undefined, tenantId);
}

export async function trackOrder(orderId: string, tenantId?: string): Promise<any> {
    return fetchAPI(`/orders/track/${orderId}`, undefined, tenantId);
}

export async function getBranches(tenantId?: string): Promise<{id: string, name: string}[]> {
    return fetchAPI(`/store/branches`, { cache: 'no-store' }, tenantId);
}

export async function resolveTableInfo(id: string, tenantId?: string): Promise<{tableNumber: string, tenantSlug: string, branchId: string}> {
    return fetchAPI(`/tables/resolve/${id}`, undefined, tenantId);
}

export async function verifyOrderPayment(orderId: string, tenantId?: string): Promise<{ status: string; verified: boolean; paidVia?: string; reason?: string }> {
    return fetchAPI(`/payments/verify/${orderId}`, { cache: 'no-store' }, tenantId);
}

export async function verifyBoldPayment(orderId: string, tenantId?: string): Promise<{ status: string; verified: boolean; paidVia?: string; boldStatus?: string; reason?: string }> {
    return fetchAPI(`/payments/verify-bold/${orderId}`, { cache: 'no-store' }, tenantId);
}
