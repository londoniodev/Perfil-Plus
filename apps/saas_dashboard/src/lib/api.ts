import { Post, Category, Tag } from '@/types/blog';
import { PaginatedResponse } from '@/types/common';
import { API_BASE as API_BASE_URL, TENANT_ID } from './config';

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const isClient = typeof window !== 'undefined';
    let token = isClient ? localStorage.getItem('token') : null;

    const getHeaders = (authToken: string | null) => ({
        'Content-Type': 'application/json',
        ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
        ...options?.headers,
    });

    const separator = endpoint.includes('?') ? '&' : '?';
    const currentEndpoint = (!options?.method || options.method === 'GET') 
        ? `${endpoint}${separator}_tenantCacheId=${TENANT_ID}`
        : endpoint;

    let res = await fetch(`${API_BASE_URL}${currentEndpoint}`, {
        ...options,
        credentials: 'include',
        headers: getHeaders(token),
        next: { 
            revalidate: 60,
            tags: [`tenant-${TENANT_ID}`, `tenant-${TENANT_ID}-api`]
        },
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
                        document.cookie = `accessToken=${data.accessToken}; path=/; SameSite=Lax`;

                        // 3. Retry original request with NEW token
                        res = await fetch(`${API_BASE_URL}${endpoint}`, {
                            ...options,
                            credentials: 'include',
                            headers: getHeaders(data.accessToken),
                            next: { 
                                revalidate: 60,
                                tags: [`tenant-${TENANT_ID}`, `tenant-${TENANT_ID}-api`]
                            },
                        });
                    }
                } else {
                    // Refresh failed - Logout
                    localStorage.removeItem('token');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('user');
                    document.cookie = "accessToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
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

