import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('categories')
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) { }

    @Get()
    findAll(@CurrentTenant() tenantId: string) {
        return this.categoriesService.findAll(tenantId);
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    create(
        @CurrentTenant() tenantId: string,
        @Body() createDto: CreateCategoryDto
    ) {
        return this.categoriesService.create(tenantId, createDto);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    update(
        @CurrentTenant() tenantId: string,
        @Param('id') id: string,
        @Body() updateDto: UpdateCategoryDto,
    ) {
        return this.categoriesService.update(tenantId, id, updateDto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    remove(
        @CurrentTenant() tenantId: string,
        @Param('id') id: string,
    ) {
        return this.categoriesService.remove(tenantId, id);
    }
}

