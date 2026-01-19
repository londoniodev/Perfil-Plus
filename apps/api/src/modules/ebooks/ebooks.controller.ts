import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
} from '@nestjs/common';
import { EbooksService } from './ebooks.service';
import { CreateEbookDto, UpdateEbookDto } from './dto';
import { Public, CurrentUser, Roles } from '../../common/decorators';

// ==================== PUBLIC CONTROLLER ====================
@Controller('ebooks')
export class EbooksController {
    constructor(private readonly ebooksService: EbooksService) { }

    @Get()
    @Public()
    async findAll() {
        return this.ebooksService.findAllPublished();
    }

    @Get('my-purchases')
    async getMyPurchases(@CurrentUser('id') userId: string) {
        return this.ebooksService.getUserPurchases(userId);
    }

    @Get(':slug')
    @Public()
    async findBySlug(@Param('slug') slug: string) {
        return this.ebooksService.findBySlug(slug);
    }

    @Get(':id/download')
    async getDownloadUrl(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
    ) {
        return this.ebooksService.getDownloadUrl(id, userId);
    }

    @Get(':id/check-purchase')
    async checkPurchase(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
    ) {
        const hasPurchased = await this.ebooksService.hasPurchased(id, userId);
        return { hasPurchased };
    }
}

// ==================== ADMIN CONTROLLER ====================
@Controller('admin/ebooks')
@Roles('ADMIN')
export class AdminEbooksController {
    constructor(private readonly ebooksService: EbooksService) { }

    @Get()
    async findAll() {
        return this.ebooksService.findAll();
    }

    @Get(':id')
    async findById(@Param('id') id: string) {
        return this.ebooksService.findById(id);
    }

    @Post()
    async create(@Body() dto: CreateEbookDto) {
        return this.ebooksService.create(dto);
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() dto: UpdateEbookDto) {
        return this.ebooksService.update(id, dto);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        return this.ebooksService.delete(id);
    }
}

