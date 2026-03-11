import { Post, Category, Tag } from '@/types/blog';
import { PaginatedResponse } from '@/types/common';
import { API_BASE as API_BASE_URL } from './config';

async function fetchAPI<T>(endpoint: string, tenantId: string, options?: RequestInit): Promise<T> {
    const isClient = typeof window !== 'undefined';
    let token = isClient ? localStorage.getItem('token') : null;

    const getHeaders = (authToken: string | null) => ({
        'Content-Type': 'application/json',
        'x-tenant-id': tenantId,
        ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
        ...options?.headers,
    });

    const urlObj = new URL(`${API_BASE_URL}${endpoint}`);
    const baseTag = urlObj.pathname.split('/').filter(Boolean)[0] || 'general';

    let res = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        credentials: 'include',
        headers: getHeaders(token),
        cache: (!options?.method || options.method === 'GET') ? 'force-cache' : 'no-store',
        next: { tags: [`tenant-${tenantId}`, `tenant-${tenantId}-${baseTag}`] },
    });

    // Client-side 401 handling (Refresh Token Dance)
    if (res.status === 401 && isClient) {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
                const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
                    method: "POST",
                    credentials: 'include',
                    headers: {
                        'x-tenant-id': tenantId,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ refreshToken }),
                });

                if (refreshRes.ok) {
                    const data = await refreshRes.json();
                    if (data.accessToken) {
                        // 1. Update Storage
                        localStorage.setItem('token', data.accessToken);
                        localStorage.setItem('refreshToken', data.refreshToken);

                        // 2. Update Cookie (for Middleware sync)
                        document.cookie = `accessToken=${data.accessToken}; path=/; SameSite=Lax; Secure`;

                        // 3. Retry original request with NEW token
                        res = await fetch(`${API_BASE_URL}${endpoint}`, {
                            ...options,
                            credentials: 'include',
                            headers: getHeaders(data.accessToken),
                            cache: (!options?.method || options.method === 'GET') ? 'force-cache' : 'no-store',
                            next: { tags: [`tenant-${tenantId}`, `tenant-${tenantId}-${baseTag}`] },
                        });
                    }
                } else {
                    // Refresh failed - Logout
                    localStorage.removeItem('token');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('user');
                    document.cookie = "accessToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax; Secure";
                    window.location.href = '/login?reason=session_expired';
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
    tenantId: string,
    page = 1,
    limit = 10,
    category?: string
): Promise<PaginatedResponse<Post>> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (category) params.append('category', category);

    return fetchAPI<PaginatedResponse<Post>>(`/blog/posts?${params}`, tenantId);
}

export async function getPostBySlug(tenantId: string, slug: string): Promise<Post> {
    return fetchAPI<Post>(`/blog/posts/${slug}`, tenantId);
}

// Categories
export async function getCategories(tenantId: string): Promise<Category[]> {
    return fetchAPI<Category[]>('/blog/categories', tenantId);
}

// Tags
export async function getTags(tenantId: string): Promise<Tag[]> {
    return fetchAPI<Tag[]>('/blog/tags', tenantId);
}

// ============ LMS ============
import { Theme, Course, Lesson } from '@/types/lms';

export async function getThemes(tenantId: string): Promise<Theme[]> {
    return fetchAPI<Theme[]>('/lms/themes', tenantId);
}

export async function getThemeBySlug(tenantId: string, slug: string): Promise<Theme> {
    return fetchAPI<Theme>(`/lms/themes/${slug}`, tenantId);
}

export async function getCourseBySlug(tenantId: string, slug: string): Promise<Course> {
    return fetchAPI<Course>(`/lms/courses/${slug}`, tenantId);
}

export async function getLessonBySlug(tenantId: string, courseSlug: string, lessonSlug: string, token?: string): Promise<Lesson> {
    const headers: any = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    return fetchAPI<Lesson>(`/lms/courses/${courseSlug}/lessons/${lessonSlug}`, tenantId, { headers });
}

// ============ SHOP & RESTAURANT ============
import { Order, OrderStatus } from '@/types/restaurant';

export async function createOrder(tenantId: string, data: any): Promise<any> {
    return fetchAPI('/orders', tenantId, {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export async function getAdminOrders(tenantId: string, status?: OrderStatus, activeOnly: boolean = false): Promise<Order[]> {
    const queryParams = new URLSearchParams();
    if (status) queryParams.append('status', status);
    if (activeOnly) queryParams.append('activeOnly', 'true');

    return fetchAPI<Order[]>(`/admin/orders?${queryParams.toString()}`, tenantId);
}

export async function updateOrderStatus(tenantId: string, orderId: string, status: OrderStatus): Promise<Order> {
    return fetchAPI<Order>(`/admin/orders/${orderId}/status`, tenantId, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
    });
}

export async function toggleItemPrepared(tenantId: string, orderId: string, itemId: string, isPrepared: boolean): Promise<any> {
    return fetchAPI(`/admin/orders/${orderId}/items/${itemId}/prepared`, tenantId, {
        method: 'PATCH',
        body: JSON.stringify({ isPrepared }),
    });
}

export async function payOrder(tenantId: string, orderId: string, data: { amount: number, method: string, itemIds?: string[], closeOrder?: boolean, reference?: string }): Promise<any> {
    return fetchAPI(`/admin/orders/${orderId}/pay`, tenantId, {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

