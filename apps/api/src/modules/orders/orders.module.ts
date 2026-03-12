import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController, AdminOrdersController, DriverOrdersController } from './orders.controller';
import { OrdersGateway, OrdersEventsController } from './orders.gateway';
import { StorageModule } from '../storage/storage.module';
import { InventoryModule } from '../inventory/inventory.module';

import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [StorageModule, AuthModule, InventoryModule],
  controllers: [
    OrdersController,
    AdminOrdersController,
    OrdersEventsController,
    DriverOrdersController,
  ],
  providers: [OrdersService, OrdersGateway],
  exports: [OrdersService, OrdersGateway],
})
export class OrdersModule {}
