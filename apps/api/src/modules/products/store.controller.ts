import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Public } from '../../common/decorators/public.decorator';
import { ProductType } from '@alvarosky/database';

// ✅ tenantId es inyectado automáticamente por la extensión Prisma vía nestjs-cls.
@Controller('store/products')
export class StoreController {
  constructor(private readonly productsService: ProductsService) {}

  @Public()
  @Get('live-status')
  async getLiveStatus() {
    return this.productsService.getLiveStatus();
  }

  @Public()
  @Get()
  async findAll(
    @Query('type') type?: ProductType,
    @Query('allVariants') allVariants?: string,
    @Query('search') search?: string,
    @Query('limit') limit?: string,
  ) {
    return this.productsService.findAllPublished(
      type, 
      allVariants === 'true',
      search,
      limit ? parseInt(limit, 10) : undefined,
    );
  }

  @Public()
  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    return this.productsService.findOnePublished(slug);
  }
}
