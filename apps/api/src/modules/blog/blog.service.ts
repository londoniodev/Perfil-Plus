import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePostDto, UpdatePostDto, CreateCategoryDto, CreateTagDto } from './dto';

@Injectable()
export class BlogService {
    constructor(private prisma: PrismaService) { }

    // ==================== POSTS ====================

    async createPost(dto: CreatePostDto) {
        const slug = this.generateSlug(dto.title);

        // Crear el post primero
        const post = await this.prisma.post.create({
            data: {
                title: dto.title,
                slug,
                excerpt: dto.excerpt,
                content: dto.content,
                coverImage: dto.coverImage,
                published: dto.published,
                isPremium: dto.isPremium,
                authorName: 'Mauricio Mera', // Autor fijo según el schema
                publishedAt: dto.published ? new Date() : null,
            },
        });

        // Conectar categoría si existe
        if (dto.categoryId) {
            await this.prisma.categoriesOnPosts.create({
                data: {
                    postId: post.id,
                    categoryId: dto.categoryId,
                },
            });
        }

        // Conectar tags si existen
        if (dto.tagIds?.length) {
            await this.prisma.tagsOnPosts.createMany({
                data: dto.tagIds.map((tagId) => ({
                    postId: post.id,
                    tagId,
                })),
            });
        }

        return this.findPostById(post.id);
    }

    async updatePost(id: string, dto: UpdatePostDto) {
        const existingPost = await this.prisma.post.findUnique({ where: { id } });
        if (!existingPost) {
            throw new NotFoundException('Post no encontrado');
        }

        // Preparar datos de actualización
        const updateData: any = {};
        if (dto.title !== undefined) {
            updateData.title = dto.title;
            updateData.slug = this.generateSlug(dto.title);
        }
        if (dto.excerpt !== undefined) updateData.excerpt = dto.excerpt;
        if (dto.content !== undefined) updateData.content = dto.content;
        if (dto.coverImage !== undefined) updateData.coverImage = dto.coverImage;
        if (dto.published !== undefined) {
            updateData.published = dto.published;
            if (dto.published && !existingPost.publishedAt) {
                updateData.publishedAt = new Date();
            }
        }
        if (dto.isPremium !== undefined) updateData.isPremium = dto.isPremium;

        // Actualizar el post
        await this.prisma.post.update({
            where: { id },
            data: updateData,
        });

        // Actualizar categoría si se proporciona
        if (dto.categoryId !== undefined) {
            // Eliminar categorías existentes
            await this.prisma.categoriesOnPosts.deleteMany({ where: { postId: id } });

            // Agregar nueva categoría si existe
            if (dto.categoryId) {
                await this.prisma.categoriesOnPosts.create({
                    data: { postId: id, categoryId: dto.categoryId },
                });
            }
        }

        // Actualizar tags si se proporcionan
        if (dto.tagIds !== undefined) {
            // Eliminar tags existentes
            await this.prisma.tagsOnPosts.deleteMany({ where: { postId: id } });

            // Agregar nuevos tags
            if (dto.tagIds.length) {
                await this.prisma.tagsOnPosts.createMany({
                    data: dto.tagIds.map((tagId) => ({ postId: id, tagId })),
                });
            }
        }

        return this.findPostById(id);
    }

    async deletePost(id: string) {
        const post = await this.prisma.post.findUnique({ where: { id } });
        if (!post) {
            throw new NotFoundException('Post no encontrado');
        }

        await this.prisma.post.delete({ where: { id } });
        return { message: 'Post eliminado correctamente' };
    }

    async findAllPosts(page = 1, limit = 10, published?: boolean) {
        const skip = (page - 1) * limit;

        const where: any = {};
        if (published !== undefined) {
            where.published = published;
        }

        const [posts, total] = await Promise.all([
            this.prisma.post.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    categories: { include: { category: true } },
                    tags: { include: { tag: true } },
                },
            }),
            this.prisma.post.count({ where }),
        ]);

        // Transformar respuesta para aplanar categorías y tags
        const transformedPosts = posts.map((post) => ({
            ...post,
            categories: post.categories.map((c) => c.category),
            tags: post.tags.map((t) => t.tag),
        }));

        return {
            data: transformedPosts,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    // Posts públicos (para visitantes)
    async findPublicPosts(page = 1, limit = 10, categorySlug?: string) {
        const skip = (page - 1) * limit;

        const where: any = { published: true };
        if (categorySlug) {
            where.categories = {
                some: {
                    category: { slug: categorySlug },
                },
            };
        }

        const [posts, total] = await Promise.all([
            this.prisma.post.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    excerpt: true,
                    coverImage: true,
                    isPremium: true,
                    authorName: true,
                    createdAt: true,
                    categories: { include: { category: true } },
                    tags: { include: { tag: true } },
                },
            }),
            this.prisma.post.count({ where }),
        ]);

        // Transformar respuesta
        const transformedPosts = posts.map((post) => ({
            ...post,
            categories: post.categories.map((c) => c.category),
            tags: post.tags.map((t) => t.tag),
        }));

        return {
            data: transformedPosts,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findPostBySlug(slug: string, hasSubscription = false) {
        const post = await this.prisma.post.findUnique({
            where: { slug },
            include: {
                categories: { include: { category: true } },
                tags: { include: { tag: true } },
            },
        });

        if (!post) {
            throw new NotFoundException('Post no encontrado');
        }

        if (!post.published) {
            throw new NotFoundException('Post no encontrado');
        }

        // Transformar respuesta
        const transformedPost = {
            ...post,
            categories: post.categories.map((c) => c.category),
            tags: post.tags.map((t) => t.tag),
        };

        // Si es premium y el usuario no tiene suscripción, limitar contenido
        if (post.isPremium && !hasSubscription) {
            return {
                ...transformedPost,
                content: post.content.substring(0, 500) + '...',
                isContentLimited: true,
            };
        }

        return { ...transformedPost, isContentLimited: false };
    }

    async findPostById(id: string) {
        const post = await this.prisma.post.findUnique({
            where: { id },
            include: {
                categories: { include: { category: true } },
                tags: { include: { tag: true } },
            },
        });

        if (!post) {
            throw new NotFoundException('Post no encontrado');
        }

        return {
            ...post,
            categories: post.categories.map((c) => c.category),
            tags: post.tags.map((t) => t.tag),
        };
    }

    // ==================== CATEGORIES ====================

    async createCategory(dto: CreateCategoryDto) {
        const slug = this.generateSlug(dto.name);

        return this.prisma.category.create({
            data: {
                name: dto.name,
                slug,
            },
        });
    }

    async findAllCategories() {
        return this.prisma.category.findMany({
            orderBy: { name: 'asc' },
            include: {
                _count: { select: { posts: true } },
            },
        });
    }

    async deleteCategory(id: string) {
        const category = await this.prisma.category.findUnique({ where: { id } });
        if (!category) {
            throw new NotFoundException('Categoría no encontrada');
        }

        await this.prisma.category.delete({ where: { id } });
        return { message: 'Categoría eliminada correctamente' };
    }

    // ==================== TAGS ====================

    async createTag(dto: CreateTagDto) {
        return this.prisma.tag.create({
            data: {
                name: dto.name,
            },
        });
    }

    async findAllTags() {
        return this.prisma.tag.findMany({
            orderBy: { name: 'asc' },
            include: {
                _count: { select: { posts: true } },
            },
        });
    }

    async deleteTag(id: string) {
        const tag = await this.prisma.tag.findUnique({ where: { id } });
        if (!tag) {
            throw new NotFoundException('Tag no encontrado');
        }

        await this.prisma.tag.delete({ where: { id } });
        return { message: 'Tag eliminado correctamente' };
    }

    // ==================== HELPERS ====================

    private generateSlug(title: string): string {
        return title
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remover acentos
            .replace(/[^a-z0-9\s-]/g, '') // Solo letras, números, espacios y guiones
            .replace(/\s+/g, '-') // Espacios a guiones
            .replace(/-+/g, '-') // Múltiples guiones a uno
            .replace(/^-|-$/g, '') // Remover guiones al inicio y final
            + '-' + Date.now().toString(36); // Añadir timestamp para unicidad
    }
}
