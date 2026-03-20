import { Module, forwardRef } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController, AdminOrdersController, DriverOrdersController } from './orders.controller';
import { OrdersGateway, OrdersEventsController } from './orders.gateway';
import { StorageModule } from '../storage/storage.module';
import { InventoryModule } from '../inventory/inventory.module';
import { OrderNotificationListener } from './order-notification.listener';
import { WhatsappModule } from '../whatsapp/whatsapp.module';

import { OrderPricingService } from './services/order-pricing.service';
import { OrderValidationService } from './services/order-validation.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [StorageModule, AuthModule, InventoryModule, forwardRef(() => WhatsappModule)],
  controllers: [
    OrdersController,
    AdminOrdersController,
    OrdersEventsController,
    DriverOrdersController,
  ],
  providers: [
    OrdersService, 
    OrdersGateway, 
    OrderNotificationListener,
    OrderPricingService,
    OrderValidationService
  ],
  exports: [OrdersService, OrdersGateway],
})
export class OrdersModule {}
