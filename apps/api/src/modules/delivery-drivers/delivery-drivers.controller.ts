import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { DeliveryDriversService } from './delivery-drivers.service';
import { CreateDriverDto, UpdateDriverDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@alvarosky/database';
import { CurrentTenant, CurrentUser } from '../../common/decorators';

// ============ ADMIN: CRUD Domiciliarios ============

@Controller('admin/delivery-drivers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminDeliveryDriversController {
  constructor(
    private readonly driversService: DeliveryDriversService,
  ) {}

  @Post()
  async create(
    @Body() dto: CreateDriverDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.driversService.create(dto, tenantId);
  }

  @Get()
  async findAll(@CurrentTenant() tenantId: string) {
    return this.driversService.findAll(tenantId);
  }

  @Get('available')
  async findAvailable(@CurrentTenant() tenantId: string) {
    return this.driversService.findAvailable(tenantId);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.driversService.findOne(id, tenantId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateDriverDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.driversService.update(id, dto, tenantId);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.driversService.remove(id, tenantId);
  }
}

// ============ DRIVER: Endpoints del domiciliario ============

@Controller('driver')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.DRIVER, Role.ADMIN)
export class DriverController {
  constructor(
    private readonly driversService: DeliveryDriversService,
  ) {}

  @Get('profile')
  async getProfile(@CurrentUser('id') userId: string) {
    return this.driversService.findByUserId(userId);
  }

  @Patch('status')
  async updateStatus(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateDriverDto,
  ) {
    const driver = await this.driversService.findByUserId(userId);
    return this.driversService.update(driver.id, {
      status: dto.status,
    }, driver.tenantId);
  }
}
