import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController, AdminOrdersController } from './orders.controller';
import { OrdersGateway, OrdersEventsController } from './orders.gateway';
import { StorageModule } from '../storage/storage.module';

import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [StorageModule, AuthModule],
    controllers: [OrdersController, AdminOrdersController, OrdersEventsController],
    providers: [OrdersService, OrdersGateway],
    exports: [OrdersService, OrdersGateway],
})
export class OrdersModule { }

