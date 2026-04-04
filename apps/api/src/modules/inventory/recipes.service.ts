import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRecipeDto, UpdateRecipeDto } from './dto/recipe.dto';

import { ClsService } from 'nestjs-cls';

@Injectable()
export class RecipesService {
  private readonly logger = new Logger(RecipesService.name);

  constructor(
    private prisma: PrismaService,
    private cls: ClsService,
  ) {}

  private getTenantId(): string {
    return this.cls.get<string>('tenantId') ?? '';
  }

  async create(dto: CreateRecipeDto) {
    const tenantId = this.getTenantId();
    // Verify product exists and belongs to tenant
    const product = await this.prisma.product.findFirst({
      where: { id: dto.productId, tenantId },
    });
    if (!product) throw new NotFoundException('Producto no encontrado');

    // Verify no existing recipe for this product
    const existing = await this.prisma.recipe.findUnique({
      where: { productId: dto.productId },
    });
    if (existing) {
      throw new BadRequestException(
        'Este producto ya tiene una receta asociada',
      );
    }

    // Verify all ingredients exist
    const ingredientIds = dto.ingredients.map((i) => i.inventoryItemId);
    const items = await this.prisma.inventoryItem.findMany({
      where: { id: { in: ingredientIds }, tenantId },
    });
    if (items.length !== ingredientIds.length) {
      throw new BadRequestException(
        'Uno o más ingredientes no fueron encontrados',
      );
    }

    return this.prisma.recipe.create({
      data: {
        tenantId,
        productId: dto.productId,
        yield: dto.yield ?? 1,
        notes: dto.notes,
        ingredients: {
          create: dto.ingredients.map((ing) => ({
            tenantId,
            inventoryItemId: ing.inventoryItemId,
            quantity: ing.quantity,
            wasteFactor: ing.wasteFactor ?? 1,
          })),
        },
      },
      include: {
        product: { select: { id: true, name: true, basePrice: true } },
        ingredients: {
          include: {
            inventoryItem: {
              select: { id: true, name: true, unit: true, avgCost: true },
            },
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.recipe.findMany({
      include: {
        product: {
          select: { id: true, name: true, basePrice: true, images: true },
        },
        ingredients: {
          include: {
            inventoryItem: {
              select: { id: true, name: true, unit: true, avgCost: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const recipe = await this.prisma.recipe.findFirst({
      where: { id },
      include: {
        product: {
          select: { id: true, name: true, basePrice: true, images: true },
        },
        ingredients: {
          include: {
            inventoryItem: {
              select: { id: true, name: true, unit: true, avgCost: true },
            },
          },
        },
      },
    });
    if (!recipe) throw new NotFoundException('Receta no encontrada');
    return recipe;
  }

  async findByProduct(productId: string) {
    return this.prisma.recipe.findFirst({
      where: { productId },
      include: {
        product: { select: { id: true, name: true, basePrice: true } },
        ingredients: {
          include: {
            inventoryItem: {
              select: { id: true, name: true, unit: true, avgCost: true },
            },
          },
        },
      },
    });
  }

  async update(id: string, dto: UpdateRecipeDto) {
    const recipe = await this.prisma.recipe.findFirst({
      where: { id },
    });
    if (!recipe) throw new NotFoundException('Receta no encontrada');

    // ✅ secure.$transaction — el tx interno propaga el contexto de tenant automáticamente
    return this.prisma.$transaction(async (tx) => {
      await tx.recipe.update({
        where: { id },
        data: { yield: dto.yield, notes: dto.notes },
      });

      if (dto.ingredients) {
        const ingredientIds = dto.ingredients.map((i) => i.inventoryItemId);
        // ✅ Sin tenantId manual — el tx seguro filtra automáticamente por tenant
        const items = await tx.inventoryItem.findMany({
          where: { id: { in: ingredientIds } },
        });
        if (items.length !== ingredientIds.length) {
          throw new BadRequestException(
            'Uno o más ingredientes no fueron encontrados',
          );
        }

        await tx.recipeIngredient.deleteMany({ where: { recipeId: id } });
        const tenantId = this.getTenantId();
        await tx.recipeIngredient.createMany({
          data: dto.ingredients.map((ing) => ({
            tenantId,
            recipeId: id,
            inventoryItemId: ing.inventoryItemId,
            quantity: ing.quantity,
            wasteFactor: ing.wasteFactor ?? 1,
          })),
        });
      }

      return tx.recipe.findUnique({
        where: { id },
        include: {
          product: { select: { id: true, name: true, basePrice: true } },
          ingredients: {
            include: {
              inventoryItem: {
                select: { id: true, name: true, unit: true, avgCost: true },
              },
            },
          },
        },
      });
    });
  }

  async delete(id: string) {
    const recipe = await this.prisma.recipe.findFirst({
      where: { id },
    });
    if (!recipe) throw new NotFoundException('Receta no encontrada');

    return this.prisma.recipe.delete({ where: { id } });
  }

  // Products without a recipe (for UI selection)
  async getProductsWithoutRecipe() {
    return this.prisma.product.findMany({
      where: {
        productType: 'RESTAURANT',
        recipe: null,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        basePrice: true,
        images: true,
      },
      orderBy: { name: 'asc' },
    });
  }
}
