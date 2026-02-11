import { prisma, ProductType } from "@alvarosky/database";

export async function getAcademyCourses() {
    return await prisma.course.findMany({
        where: {
            published: true,
        },
        orderBy: {
            order: 'asc',
        },
        include: {
            theme: true,
        },
    });
}

export async function getStoreProducts() {
    return await prisma.product.findMany({
        where: {
            published: true,
            deletedAt: null,
        },
        orderBy: {
            createdAt: 'desc',
        },
        include: {
            variants: {
                where: {
                    isDefault: true,
                },
            },
        },
    });
}

export async function getBlogPosts() {
    return await prisma.post.findMany({
        where: {
            published: true,
        },
        orderBy: {
            publishedAt: 'desc',
        },
        include: {
            categories: {
                include: {
                    category: true,
                },
            },
        },
    });
}

export async function getThemes() {
    return await prisma.theme.findMany({
        where: {
            published: true,
        },
        orderBy: {
            order: 'asc',
        },
    });
}

export async function getProductBySlug(slug: string) {
    return await prisma.product.findUnique({
        where: {
            slug,
        },
        include: {
            variants: true,
        },
    });
}
export async function getRelatedProducts(id: string, productType: ProductType, limit: number = 4): Promise<any[]> {
    return await prisma.product.findMany({
        where: {
            id: { not: id },
            productType,
            published: true,
            deletedAt: null,
        },
        take: limit,
        include: {
            variants: {
                where: {
                    isDefault: true,
                },
            },
        },
    });
}
