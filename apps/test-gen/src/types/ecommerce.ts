export interface Ebook {
    id: string;
    title: string;
    slug: string;
    description: string;
    coverImage: string;
    price: number;
    published?: boolean;
    previewUrl?: string;
    _count?: { purchases: number };
    createdAt: string;
}

export interface Purchase {
    id: string;
    purchasedAt: string;
    ebook: {
        id: string;
        title: string;
        slug: string;
        coverImage: string;
    };
}

