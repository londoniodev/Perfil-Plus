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
        ...(tenantId ? { 'x-tenant-id': tenantId } : {}), // Only send if we have it, otherwise let host resolution work
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

    let res = await fetch(`${API_BASE_URL}${currentEndpoint}`, {
        ...options,
        credentials: 'include',
        headers: getHeaders(token),
        cache: (!options?.method || options.method === 'GET') ? 'force-cache' : 'no-store',
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
                            cache: (!options?.method || options.method === 'GET') ? 'force-cache' : 'no-store',
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

// ============ LMS ============
import { Theme, Course, Lesson } from '@/types/lms';

export async function getThemes(tenantId?: string): Promise<Theme[]> {
    return fetchAPI<Theme[]>('/lms/themes', undefined, tenantId);
}

export async function getThemeBySlug(slug: string, tenantId?: string): Promise<Theme> {
    return fetchAPI<Theme>(`/lms/themes/${slug}`, undefined, tenantId);
}

export async function getCourseBySlug(slug: string, tenantId?: string): Promise<Course> {
    return fetchAPI<Course>(`/lms/courses/${slug}`, undefined, tenantId);
}

export async function getLessonBySlug(courseSlug: string, lessonSlug: string, token?: string, tenantId?: string): Promise<Lesson> {
    const headers: any = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    return fetchAPI<Lesson>(`/lms/courses/${courseSlug}/lessons/${lessonSlug}`, { headers }, tenantId);
}

// ============ SHOP & RESTAURANT ============
import { Order, OrderStatus } from '@/types/restaurant';

export async function createOrder(data: any, tenantId?: string): Promise<any> {
    return fetchAPI('/orders', {
        method: 'POST',
        body: JSON.stringify(data),
    }, tenantId);
}

export async function getAdminOrders(status?: OrderStatus, activeOnly: boolean = false, tenantId?: string): Promise<Order[]> {
    const queryParams = new URLSearchParams();
    if (status) queryParams.append('status', status);
    if (activeOnly) queryParams.append('activeOnly', 'true');
    return fetchAPI<Order[]>(`/admin/orders?${queryParams.toString()}`, undefined, tenantId);
}

export async function updateOrderStatus(orderId: string, status: OrderStatus, tenantId?: string): Promise<Order> {
    return fetchAPI<Order>(`/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
    }, tenantId);
}

export async function toggleItemPrepared(orderId: string, itemId: string, isPrepared: boolean, tenantId?: string): Promise<any> {
    return fetchAPI(`/admin/orders/${orderId}/items/${itemId}/prepared`, {
        method: 'PATCH',
        body: JSON.stringify({ isPrepared }),
    }, tenantId);
}

export async function payOrder(orderId: string, data: { amount: number, method: string, itemIds?: string[], closeOrder?: boolean, reference?: string }, tenantId?: string): Promise<any> {
    return fetchAPI(`/admin/orders/${orderId}/pay`, {
        method: 'POST',
        body: JSON.stringify(data),
    }, tenantId);
}

export async function trackOrder(orderId: string, tenantId?: string): Promise<any> {
    return fetchAPI(`/orders/track/${orderId}`, undefined, tenantId);
}

export async function getBranches(tenantId?: string): Promise<{id: string, name: string}[]> {
    return fetchAPI(`/store/branches`, undefined, tenantId);
}

export async function resolveTableInfo(id: string, tenantId?: string): Promise<{tableNumber: string, tenantSlug: string, branchId: string}> {
    return fetchAPI(`/tables/resolve/${id}`, undefined, tenantId);
}

