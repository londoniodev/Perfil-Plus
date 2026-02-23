import { Controller, Get, Param, Query, NotFoundException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { ProductType } from '@prisma/client';

@Controller('store/products')
export class StoreController {
    constructor(private readonly productsService: ProductsService) { }

    @Public()
    @Get()
    async findAll(
        @Query('type') type?: ProductType,
        @Query('allVariants') allVariants?: string,
    ) {
        return this.productsService.findAllPublished(type, allVariants === 'true');
    }

    @Public()
    @Get(':slug')
    async findOne(@Param('slug') slug: string, @CurrentTenant() tenantId: string) {
        return this.productsService.findOnePublished(slug, tenantId);
    }
}
