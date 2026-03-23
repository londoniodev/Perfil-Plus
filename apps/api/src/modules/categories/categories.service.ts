import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryType } from '@alvarosky/database';

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  private async invalidateMenuCache(tenantId: string) {
    const keys = [
      `tenant:${tenantId}:menu_context`,
      `tenant:${tenantId}:product_catalog`,
    ];
    await Promise.all(keys.map((k) => this.cacheManager.del(k)));
    this.logger.log(
      `[Tenant: ${tenantId}] Caché de menú y catálogo de WhatsApp invalidado.`,
    );
  }

  async findAll(tenantId: string, type: CategoryType = 'PRODUCT') {
    return this.prisma.secure.category.findMany({
      where: { tenantId, type },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const category = await this.prisma.secure.category.findUnique({
      where: { id },
    });

    // Verificación IDOR doble, aunque no haga falta si el endpoint inyecta el param
    if (!category || category.tenantId !== tenantId) {
      throw new NotFoundException(`Categoria con ID ${id} no encontrada`);
    }
    return category;
  }

  async create(
    tenantId: string,
    createDto: CreateCategoryDto,
    type: CategoryType = 'PRODUCT',
  ) {
    const slug = slugify(createDto.name);
    const ORConditions: any[] = [{ name: createDto.name }];

    if (slug) {
      ORConditions.push({ slug });
    }

    // Verificar unicidad de nombre / slug por tenant Y tipo
    const existing = await this.prisma.secure.category.findFirst({
      where: {
        tenantId,
        type,
        OR: ORConditions,
      },
    });

    console.log('[DEBUG_CATEGORY] Payload:', {
      name: createDto.name,
      slug,
      tenantId,
      type,
    });
    console.log('[DEBUG_CATEGORY] Match found:', existing);

    if (existing) {
      throw new BadRequestException(
        `Ya existe una categoría de tipo ${type} con este nombre.`,
      );
    }

    const category = await this.prisma.secure.category.create({
      data: {
        tenantId,
        name: createDto.name,
        slug,
        type,
      },
    });

    await this.invalidateMenuCache(tenantId);
    return category;
  }

  async update(
    tenantId: string,
    id: string,
    updateDto: UpdateCategoryDto,
    type: CategoryType = 'PRODUCT',
  ) {
    // Verificar que exista y pertenezca al tenant (Prevencion IDOR)
    const existing = await this.prisma.secure.category.findFirst({
      where: { id, tenantId, type },
    });

    if (!existing) {
      throw new NotFoundException(
        `Categoria con ID ${id} no encontrada en este Tenant`,
      );
    }

    let slug = existing.slug;
    if (updateDto.name && updateDto.name !== existing.name) {
      slug = slugify(updateDto.name);

      const slugConflict = await this.prisma.secure.category.findFirst({
        where: { tenantId, slug, type, NOT: { id } },
      });
      if (slugConflict)
        throw new BadRequestException('El nombre genera un slug ya en uso.');
    }

    const category = await this.prisma.secure.category.update({
      where: { id }, // Ya confirmamos que le pertenece al tenantId arriba. Opcional podria ser un UpdateMany pero Update arroja el error de Unique más rapido y devuelve registro
      data: {
        name: updateDto.name,
        slug,
      },
    });

    await this.invalidateMenuCache(tenantId);
    return category;
  }

  async remove(tenantId: string, id: string, type: CategoryType = 'PRODUCT') {
    // Prevenir IDOR
    const existing = await this.prisma.secure.category.findFirst({
      where: { id, tenantId, type },
    });

    if (!existing) {
      throw new NotFoundException(
        `Categoria con ID ${id} no encontrada en este Tenant`,
      );
    }

    // Comprobar Productos Asociados en la tabla Pivot CategoriesOnProducts
    const productCount = await this.prisma.secure.categoriesOnProducts.count({
      where: { categoryId: id },
    });

    if (productCount > 0) {
      throw new BadRequestException(
        `No se puede eliminar la categoría porque tiene ${productCount} productos asociados.`,
      );
    }

    // Permitido borrar
    await this.prisma.secure.category.delete({
      where: { id },
    });

    await this.invalidateMenuCache(tenantId);

    this.logger.log(`Categoria eliminada ID: ${id} x Tenant ID: ${tenantId}`);
    return { success: true };
  }
}
