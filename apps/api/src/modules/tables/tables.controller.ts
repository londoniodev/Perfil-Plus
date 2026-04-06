import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { TablesService } from './tables.service';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Role } from '@alvarosky/database';

@Controller('tables')
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  @Public()
  @Get('resolve/:id')
  resolve(@Param('id') id: string) {
    return this.tablesService.resolve(id);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  // Quité el restricción de ADMIN porque un EMPOYEE/WAITER o un PUBLIC puede necesitar ver las mesas
  findAll(@CurrentTenant() tenantId: string) {
    return this.tablesService.findAll(tenantId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.tablesService.findOne(tenantId, id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  create(@CurrentTenant() tenantId: string, @Body() createDto: CreateTableDto) {
    return this.tablesService.create(tenantId, createDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  update(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() updateDto: UpdateTableDto,
  ) {
    return this.tablesService.update(tenantId, id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  remove(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.tablesService.remove(tenantId, id);
  }
}
