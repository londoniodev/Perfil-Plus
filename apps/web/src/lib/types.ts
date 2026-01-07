// Blog Types
export interface Post {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content?: string;
    coverImage: string | null;
    isPremium: boolean;
    authorName: string;
    createdAt: string;
    categories: Category[];
    tags: Tag[];
    isContentLimited?: boolean;
}

export interface Category {
    id: string;
    name: string;
    slug: string;
    _count?: { posts: number };
}

export interface Tag {
    id: string;
    name: string;
    _count?: { posts: number };
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}
