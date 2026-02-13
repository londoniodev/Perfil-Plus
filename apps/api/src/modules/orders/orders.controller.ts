import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { Role, OrderStatus } from '@prisma/client';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    // ============ USUARIO ============

    @Post()
    @Public()
    async createOrder(
        @CurrentUser('id') userId: string | undefined,
        @Body() createOrderDto: CreateOrderDto,
    ) {
        return this.ordersService.createOrder(userId, createOrderDto);
    }

    @Get('my-orders')
    async findMyOrders(@CurrentUser('id') userId: string) {
        return this.ordersService.findMyOrders(userId);
    }

    @Get('product/:productId/download')
    async downloadByProduct(
        @CurrentUser('id') userId: string,
        @Param('productId') productId: string
    ) {
        return this.ordersService.getDownloadUrl(userId, null, productId);
    }

    @Get(':id/download/:productId')
    async downloadItem(
        @CurrentUser('id') userId: string,
        @Param('id') orderId: string,
        @Param('productId') productId: string
    ) {
        return this.ordersService.getDownloadUrl(userId, orderId, productId);
    }
}

// ============ ADMIN / KITCHEN DISPLAY ============

@Controller('admin/orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminOrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    @Get()
    async findAll(@Query('status') status?: OrderStatus) {
        return this.ordersService.findAllAdmin(status);
    }

    @Patch(':id/status')
    async updateStatus(
        @Param('id') id: string,
        @Body() dto: UpdateOrderStatusDto,
    ) {
        return this.ordersService.updateStatus(id, dto);
    }
}
