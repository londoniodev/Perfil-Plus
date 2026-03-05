import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRecipeDto, UpdateRecipeDto } from './dto/recipe.dto';

@Injectable()
export class RecipesService {
  private readonly logger = new Logger(RecipesService.name);

  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateRecipeDto) {
    // Verify product exists and belongs to tenant
    const product = await this.prisma.secure.product.findFirst({
      where: { id: dto.productId, tenantId },
    });
    if (!product) throw new NotFoundException('Producto no encontrado');

    // Verify no existing recipe for this product
    const existing = await this.prisma.secure.recipe.findUnique({
      where: { productId: dto.productId },
    });
    if (existing) {
      throw new BadRequestException(
        'Este producto ya tiene una receta asociada',
      );
    }

    // Verify all ingredients exist
    const ingredientIds = dto.ingredients.map((i) => i.inventoryItemId);
    const items = await this.prisma.secure.inventoryItem.findMany({
      where: { id: { in: ingredientIds }, tenantId },
    });
    if (items.length !== ingredientIds.length) {
      throw new BadRequestException(
        'Uno o más ingredientes no fueron encontrados',
      );
    }

    return this.prisma.secure.recipe.create({
      data: {
        tenantId,
        productId: dto.productId,
        yield: dto.yield ?? 1,
        notes: dto.notes,
        ingredients: {
          create: dto.ingredients.map((ing) => ({
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

  async findAll(tenantId: string) {
    return this.prisma.secure.recipe.findMany({
      where: { tenantId },
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

  async findOne(id: string, tenantId: string) {
    const recipe = await this.prisma.secure.recipe.findFirst({
      where: { id, tenantId },
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

  async findByProduct(productId: string, tenantId: string) {
    return this.prisma.secure.recipe.findFirst({
      where: { productId, tenantId },
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

  async update(id: string, tenantId: string, dto: UpdateRecipeDto) {
    const recipe = await this.prisma.secure.recipe.findFirst({
      where: { id, tenantId },
    });
    if (!recipe) throw new NotFoundException('Receta no encontrada');

    return this.prisma.$transaction(async (tx) => {
      // Update basic fields
      await tx.recipe.update({
        where: { id },
        data: {
          yield: dto.yield,
          notes: dto.notes,
        },
      });

      // Replace ingredients if provided
      if (dto.ingredients) {
        // Verify all ingredients exist
        const ingredientIds = dto.ingredients.map((i) => i.inventoryItemId);
        const items = await tx.inventoryItem.findMany({
          where: { id: { in: ingredientIds }, tenantId },
        });
        if (items.length !== ingredientIds.length) {
          throw new BadRequestException(
            'Uno o más ingredientes no fueron encontrados',
          );
        }

        // Delete existing and recreate (replace strategy)
        await tx.recipeIngredient.deleteMany({ where: { recipeId: id } });
        await tx.recipeIngredient.createMany({
          data: dto.ingredients.map((ing) => ({
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

  async delete(id: string, tenantId: string) {
    const recipe = await this.prisma.secure.recipe.findFirst({
      where: { id, tenantId },
    });
    if (!recipe) throw new NotFoundException('Receta no encontrada');

    return this.prisma.secure.recipe.delete({ where: { id } });
  }

  // Products without a recipe (for UI selection)
  async getProductsWithoutRecipe(tenantId: string) {
    return this.prisma.secure.product.findMany({
      where: {
        tenantId,
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
