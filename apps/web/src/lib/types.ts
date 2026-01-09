// Blog Types
export interface Post {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content?: string;
    coverImage: string | null;
    isPremium: boolean;
    published?: boolean;
    authorName: string;
    createdAt: string;
    updatedAt?: string;
    publishedAt?: string | null;

    // SEO fields
    metaTitle?: string | null;
    metaDescription?: string | null;

    // Calculated fields
    readingTime?: number | null;

    // Relations
    categories: Category[];
    tags: Tag[];
    attachments?: Attachment[];

    // Computed
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

export interface Attachment {
    id: string;
    name: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
    isPublic: boolean;
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
