import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreatePostDto,
  UpdatePostDto,
  CreateCategoryDto,
  CreateTagDto,
  CreateAttachmentDto,
} from './dto';

@Injectable()
export class BlogService {
  constructor(private prisma: PrismaService) {}

  // ==================== POSTS ====================

  async createPost(dto: CreatePostDto, tenantId: string) {
    const slug = this.generateSlug(dto.title);
    const readingTime =
      dto.readingTime || this.calculateReadingTime(dto.content);

    // Crear el post primero
    const post = await this.prisma.secure.post.create({
      data: {
        tenantId,
        title: dto.title,
        slug,
        excerpt: dto.excerpt,
        content: dto.content,
        coverImage: dto.coverImage,
        published: dto.published,
        isPremium: dto.isPremium,
        authorName: 'Mauricio Mera',
        publishedAt: dto.published ? new Date() : null,
        metaTitle: dto.metaTitle,
        metaDescription: dto.metaDescription,
        readingTime,
      },
    });

    // Conectar categoría si existe
    if (dto.categoryId) {
      await this.prisma.secure.categoriesOnPosts.create({
        data: {
          postId: post.id,
          categoryId: dto.categoryId,
        },
      });
    }

    // Conectar tags si existen
    if (dto.tagIds?.length) {
      await this.prisma.secure.tagsOnPosts.createMany({
        data: dto.tagIds.map((tagId) => ({
          postId: post.id,
          tagId,
        })),
      });
    }

    return this.findPostById(post.id);
  }

  async updatePost(id: string, dto: UpdatePostDto) {
    const existingPost = await this.prisma.secure.post.findUnique({
      where: { id },
    });
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
    if (dto.content !== undefined) {
      updateData.content = dto.content;
      updateData.readingTime = this.calculateReadingTime(dto.content);
    }
    if (dto.coverImage !== undefined) updateData.coverImage = dto.coverImage;
    if (dto.published !== undefined) {
      updateData.published = dto.published;
      if (dto.published && !existingPost.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }
    if (dto.isPremium !== undefined) updateData.isPremium = dto.isPremium;
    if (dto.metaTitle !== undefined) updateData.metaTitle = dto.metaTitle;
    if (dto.metaDescription !== undefined)
      updateData.metaDescription = dto.metaDescription;

    // Actualizar el post
    await this.prisma.secure.post.update({
      where: { id },
      data: updateData,
    });

    // Actualizar categoría si se proporciona
    if (dto.categoryId !== undefined) {
      await this.prisma.secure.categoriesOnPosts.deleteMany({
        where: { postId: id },
      });
      if (dto.categoryId) {
        await this.prisma.secure.categoriesOnPosts.create({
          data: { postId: id, categoryId: dto.categoryId },
        });
      }
    }

    // Actualizar tags si se proporcionan
    if (dto.tagIds !== undefined) {
      await this.prisma.secure.tagsOnPosts.deleteMany({
        where: { postId: id },
      });
      if (dto.tagIds.length) {
        await this.prisma.secure.tagsOnPosts.createMany({
          data: dto.tagIds.map((tagId) => ({ postId: id, tagId })),
        });
      }
    }

    return this.findPostById(id);
  }

  async deletePost(id: string) {
    const post = await this.prisma.secure.post.findUnique({ where: { id } });
    if (!post) {
      throw new NotFoundException('Post no encontrado');
    }

    await this.prisma.secure.post.delete({ where: { id } });
    return { message: 'Post eliminado correctamente' };
  }

  async findAllPosts(page = 1, limit = 10, published?: boolean) {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (published !== undefined) {
      where.published = published;
    }

    const [posts, total] = await Promise.all([
      this.prisma.secure.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          categories: { include: { category: true } },
          tags: { include: { tag: true } },
          attachments: true,
        },
      }),
      this.prisma.secure.post.count({ where }),
    ]);

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
      this.prisma.secure.post.findMany({
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
          readingTime: true,
          categories: { include: { category: true } },
          tags: { include: { tag: true } },
        },
      }),
      this.prisma.secure.post.count({ where }),
    ]);

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

  async findPostBySlug(
    slug: string,
    hasSubscription = false,
    tenantId?: string,
  ) {
    const post = await this.prisma.secure.post.findFirst({
      where: { slug, ...(tenantId ? { tenantId } : {}) },
      include: {
        categories: { include: { category: true } },
        tags: { include: { tag: true } },
        attachments: true,
      },
    });

    if (!post) {
      throw new NotFoundException('Post no encontrado');
    }

    if (!post.published) {
      throw new NotFoundException('Post no encontrado');
    }

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
        attachments: [], // No mostrar adjuntos premium
      };
    }

    return { ...transformedPost, isContentLimited: false };
  }

  async findPostById(id: string) {
    const post = await this.prisma.secure.post.findUnique({
      where: { id },
      include: {
        categories: { include: { category: true } },
        tags: { include: { tag: true } },
        attachments: true,
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

  // ==================== ATTACHMENTS ====================

  async addAttachment(postId: string, dto: CreateAttachmentDto) {
    const post = await this.prisma.secure.post.findUnique({
      where: { id: postId },
    });
    if (!post) {
      throw new NotFoundException('Post no encontrado');
    }

    return this.prisma.secure.postAttachment.create({
      data: {
        postId,
        name: dto.name,
        fileUrl: dto.fileUrl,
        fileType: dto.fileType,
        fileSize: dto.fileSize,
        isPublic: dto.isPublic ?? !post.isPremium,
      },
    });
  }

  async removeAttachment(attachmentId: string) {
    const attachment = await this.prisma.secure.postAttachment.findUnique({
      where: { id: attachmentId },
    });

    if (!attachment) {
      throw new NotFoundException('Adjunto no encontrado');
    }

    await this.prisma.secure.postAttachment.delete({
      where: { id: attachmentId },
    });
    return {
      message: 'Adjunto eliminado correctamente',
      fileUrl: attachment.fileUrl,
    };
  }

  async findAttachmentsByPostId(postId: string) {
    return this.prisma.secure.postAttachment.findMany({
      where: { postId },
      orderBy: { createdAt: 'asc' },
    });
  }

  // ==================== CATEGORIES ====================

  async createCategory(dto: CreateCategoryDto, tenantId: string) {
    const slug = this.generateSlug(dto.name);

    return this.prisma.secure.category.create({
      data: {
        tenantId,
        name: dto.name,
        slug,
      },
    });
  }

  async findAllCategories() {
    return this.prisma.secure.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { posts: true } },
      },
    });
  }

  async deleteCategory(id: string) {
    const category = await this.prisma.secure.category.findUnique({
      where: { id },
    });
    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }

    await this.prisma.secure.category.delete({ where: { id } });
    return { message: 'Categoría eliminada correctamente' };
  }

  // ==================== TAGS ====================

  async createTag(dto: CreateTagDto, tenantId: string) {
    return this.prisma.secure.tag.create({
      data: {
        tenantId,
        name: dto.name,
      },
    });
  }

  async findAllTags() {
    return this.prisma.secure.tag.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { posts: true } },
      },
    });
  }

  async deleteTag(id: string) {
    const tag = await this.prisma.secure.tag.findUnique({ where: { id } });
    if (!tag) {
      throw new NotFoundException('Tag no encontrado');
    }

    await this.prisma.secure.tag.delete({ where: { id } });
    return { message: 'Tag eliminado correctamente' };
  }

  // ==================== HELPERS ====================

  private generateSlug(title: string): string {
    return (
      title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '') +
      '-' +
      Date.now().toString(36)
    );
  }

  private calculateReadingTime(content: string): number {
    // Promedio de palabras por minuto de lectura
    const wordsPerMinute = 200;

    // Eliminar HTML tags y contar palabras
    const text = content.replace(/<[^>]*>/g, '');
    const wordCount = text
      .split(/\s+/)
      .filter((word) => word.length > 0).length;

    // Calcular minutos (mínimo 1 minuto)
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  }
}
