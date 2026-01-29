import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

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
