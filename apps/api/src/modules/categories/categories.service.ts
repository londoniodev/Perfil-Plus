import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\\s+/g, '-') // Replace spaces with -
    .replace(/[^\\w\\-]+/g, '') // Remove all non-word chars
    .replace(/\\-\\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.secure.category.findMany({
      where: { tenantId },
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

  async create(tenantId: string, createDto: CreateCategoryDto) {
    const slug = slugify(createDto.name);

    // Verificar unicidad de nombre / slug por tenant
    const existing = await this.prisma.secure.category.findFirst({
      where: {
        tenantId,
        OR: [{ name: createDto.name }, { slug }],
      },
    });

    if (existing) {
      throw new BadRequestException('Ya existe una categoría con este nombre.');
    }

    return this.prisma.secure.category.create({
      data: {
        tenantId,
        name: createDto.name,
        slug,
      },
    });
  }

  async update(tenantId: string, id: string, updateDto: UpdateCategoryDto) {
    // Verificar que exista y pertenezca al tenant (Prevencion IDOR)
    const existing = await this.prisma.secure.category.findFirst({
      where: { id, tenantId },
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
        where: { tenantId, slug, NOT: { id } },
      });
      if (slugConflict)
        throw new BadRequestException('El nombre genera un slug ya en uso.');
    }

    return this.prisma.secure.category.update({
      where: { id }, // Ya confirmamos que le pertenece al tenantId arriba. Opcional podria ser un UpdateMany pero Update arroja el error de Unique más rapido y devuelve registro
      data: {
        name: updateDto.name,
        slug,
      },
    });
  }

  async remove(tenantId: string, id: string) {
    // Prevenir IDOR
    const existing = await this.prisma.secure.category.findFirst({
      where: { id, tenantId },
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

    this.logger.log(`Categoria eliminada ID: ${id} x Tenant ID: ${tenantId}`);
    return { success: true };
  }
}
