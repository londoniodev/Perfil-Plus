export type UserRole = "ADMIN" | "USER" | "PSYCHOLOGIST";

export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
}

export type ProductType = "DIGITAL" | "PHYSICAL" | "SERVICE";

export interface Product {
    id: string;
    name: string;
    slug: string;
    description: string;
    basePrice: number | string; // Handle decimal from DB
    images: string[];
    productType: ProductType;
    // Digital fields
    digitalFileUrl?: string;
    previewUrl?: string;
    published: boolean;
    createdAt?: Date;
}

