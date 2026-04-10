import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Role, OrderStatus } from '@alvarosky/database';
import { Request } from 'express';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // ============ USUARIO ============

  @Post()
  @Public()
  async createOrder(
    @CurrentUser('id') userId: string | undefined,
    @Body() createOrderDto: CreateOrderDto,
    @Req() req: Request,
  ) {
    // Capturar IP/UA del comprador para atribución TikTok CAPI
    const clientIp =
      (req.headers['x-client-ip'] as string) ||
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.ip ||
      '0.0.0.0';
    const clientUserAgent =
      (req.headers['x-client-user-agent'] as string) ||
      req.headers['user-agent'] ||
      'unknown';

    return this.ordersService.createOrder(
      userId,
      createOrderDto,
      clientIp,
      clientUserAgent,
    );
  }

  @Get('my-orders')
  async findMyOrders(@CurrentUser('id') userId: string) {
    return this.ordersService.findMyOrders(userId);
  }

  @Get('track/:id')
  @Public()
  async trackOrder(@Param('id') id: string) {
    return this.ordersService.getOrderForTracking(id);
  }

  @Get(':id')
  @Public()
  async findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Get('product/:productId/download')
  async downloadByProduct(
    @CurrentUser('id') userId: string,
    @Param('productId') productId: string,
  ) {
    return this.ordersService.getDownloadUrl(userId, null, productId);
  }

  @Get(':id/download/:productId')
  async downloadItem(
    @CurrentUser('id') userId: string,
    @Param('id') orderId: string,
    @Param('productId') productId: string,
  ) {
    return this.ordersService.getDownloadUrl(userId, orderId, productId);
  }
}

// ============ ADMIN / KITCHEN DISPLAY ============

@Controller('admin/orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.WAITER, Role.KITCHEN, Role.CASHIER)
export class AdminOrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @Roles(Role.ADMIN, Role.WAITER, Role.KITCHEN, Role.CASHIER)
  async findAll(
    @Query('status') status?: OrderStatus,
    @Query('activeOnly') activeOnly?: string,
  ) {
    return this.ordersService.findAllAdmin(status, activeOnly === 'true');
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN, Role.WAITER, Role.KITCHEN, Role.CASHIER)
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
    @CurrentUser('role') role: Role,
    @CurrentUser('id') userId: string,
  ) {
    return this.ordersService.updateStatus(id, dto, role, userId);
  }

  @Post(':id/pay')
  @Roles(Role.ADMIN, Role.CASHIER)
  async payOrder(@Param('id') id: string, @Body() dto: CreatePaymentDto) {
    return this.ordersService.createPayment(id, dto);
  }
  @Patch(':id/items/:itemId/prepared')
  @Roles(Role.ADMIN, Role.KITCHEN)
  async toggleItemPrepared(
    @Param('id') orderId: string,
    @Param('itemId') itemId: string,
    @Body('isPrepared') isPrepared: boolean,
  ) {
    return this.ordersService.toggleItemPrepared(orderId, itemId, isPrepared);
  }

  @Patch(':id/assign-driver')
  @Roles(Role.ADMIN, Role.CASHIER)
  async assignDriver(
    @Param('id') id: string,
    @Body('driverId') driverId: string,
    @CurrentUser('role') role: Role,
  ) {
    return this.ordersService.assignDriver(id, driverId, role);
  }
}

// ============ DRIVER: Mis pedidos asignados ============

@Controller('driver/orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.DRIVER, Role.ADMIN)
export class DriverOrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  async getMyOrders(@CurrentUser('id') userId: string) {
    // Buscar el driver por userId, luego obtener sus órdenes
    return this.ordersService.getDriverOrdersByUserId(userId);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
    @CurrentUser('role') role: Role,
    @CurrentUser('id') userId: string,
  ) {
    return this.ordersService.updateStatus(id, dto, role, userId);
  }
}
