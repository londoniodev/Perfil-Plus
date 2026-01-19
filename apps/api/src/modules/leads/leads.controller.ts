import { Controller, Post, Get, Delete, Body, Query, Param } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { CreateLeadDto, LeadQueryDto } from './dto';
import { Public, Roles } from '../../common/decorators';

@Controller('leads')
export class LeadsController {
    constructor(private readonly leadsService: LeadsService) { }

    // Public endpoint para captura de leads
    @Post()
    @Public()
    async create(@Body() dto: CreateLeadDto) {
        const lead = await this.leadsService.create(dto);
        return {
            success: true,
            message: 'Gracias por tu interés. Te contactaremos pronto.',
        };
    }

    // Admin endpoints
    @Get()
    @Roles('ADMIN')
    async findAll(@Query() query: LeadQueryDto) {
        return this.leadsService.findAll(query);
    }

    @Get('stats')
    @Roles('ADMIN')
    async getStats() {
        return this.leadsService.getStats();
    }

    @Delete(':id')
    @Roles('ADMIN')
    async delete(@Param('id') id: string) {
        return this.leadsService.delete(id);
    }
}

