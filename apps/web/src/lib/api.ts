import { Post, Category, Tag, PaginatedResponse } from './types';
import { API_BASE as API_BASE_URL } from './config';

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        credentials: 'include', // Importante para enviar cookies
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
        next: { revalidate: 60 }, // Revalidar cada 60 segundos
    });

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
import { Theme, Course, Lesson } from './lms-types';

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
