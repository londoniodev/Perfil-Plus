import { Post, Category, Tag } from '@/types/blog';
import { PaginatedResponse } from '@/types/common';
import { API_BASE as API_BASE_URL } from './config';
import { headers } from 'next/headers';

async function fetchAPI<T>(endpoint: string, options?: RequestInit, explicitTenantId?: string): Promise<T> {
    const isClient = typeof window !== 'undefined';
    let token = isClient ? localStorage.getItem('token') : null;

    // Resolve tenantId: explicit > headers (server) > next_public (fallback)
    let tenantId = explicitTenantId;
    if (!tenantId && !isClient) {
        try {
            const h = await headers();
            tenantId = h.get('x-tenant-id') || undefined;
        } catch (e) {
            // Not in a request context
        }
    }
    
    // If still no tenantId, the backend will resolve via Host header anyway.
    // However, we need it for cache tagging.
    const effectiveTenantId = tenantId || process.env.NEXT_PUBLIC_TENANT_ID || 'default';

    const getHeaders = (authToken: string | null) => ({
        'Content-Type': 'application/json',
        ...(tenantId ? { 'x-tenant-id': tenantId } : {}), // Only send if we have it, otherwise let host resolution work
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
    category?: string
): Promise<PaginatedResponse<Post>> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (category) params.append('category', category);
    return fetchAPI<PaginatedResponse<Post>>(`/blog/posts?${params}`);
}

export async function getPostBySlug(slug: string): Promise<Post> {
    return fetchAPI<Post>(`/blog/posts/${slug}`);
}

// Categories
export async function getCategories(): Promise<Category[]> {
    return fetchAPI<Category[]>('/blog/categories');
}

// Tags
export async function getTags(): Promise<Tag[]> {
    return fetchAPI<Tag[]>('/blog/tags');
}

// ============ LMS ============
import { Theme, Course, Lesson } from '@/types/lms';

export async function getThemes(): Promise<Theme[]> {
    return fetchAPI<Theme[]>('/lms/themes');
}

export async function getThemeBySlug(slug: string): Promise<Theme> {
    return fetchAPI<Theme>(`/lms/themes/${slug}`);
}

export async function getCourseBySlug(slug: string): Promise<Course> {
    return fetchAPI<Course>(`/lms/courses/${slug}`);
}

export async function getLessonBySlug(courseSlug: string, lessonSlug: string, token?: string): Promise<Lesson> {
    const headers: any = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    return fetchAPI<Lesson>(`/lms/courses/${courseSlug}/lessons/${lessonSlug}`, { headers });
}

// ============ SHOP & RESTAURANT ============
import { Order, OrderStatus } from '@/types/restaurant';

export async function createOrder(data: any): Promise<any> {
    return fetchAPI('/orders', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export async function getAdminOrders(status?: OrderStatus, activeOnly: boolean = false): Promise<Order[]> {
    const queryParams = new URLSearchParams();
    if (status) queryParams.append('status', status);
    if (activeOnly) queryParams.append('activeOnly', 'true');
    return fetchAPI<Order[]>(`/admin/orders?${queryParams.toString()}`);
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
    return fetchAPI<Order>(`/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
    });
}

export async function toggleItemPrepared(orderId: string, itemId: string, isPrepared: boolean): Promise<any> {
    return fetchAPI(`/admin/orders/${orderId}/items/${itemId}/prepared`, {
        method: 'PATCH',
        body: JSON.stringify({ isPrepared }),
    });
}

export async function payOrder(orderId: string, data: { amount: number, method: string, itemIds?: string[], closeOrder?: boolean, reference?: string }): Promise<any> {
    return fetchAPI(`/admin/orders/${orderId}/pay`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
}
