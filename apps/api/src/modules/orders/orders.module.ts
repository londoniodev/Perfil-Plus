import { Module, forwardRef } from '@nestjs/common';
import { OrdersService } from './orders.service';
import {
  OrdersController,
  AdminOrdersController,
  DriverOrdersController,
} from './orders.controller';
import { OrdersGateway, OrdersEventsController } from './orders.gateway';
import { StorageModule } from '../storage/storage.module';
import { InventoryModule } from '../inventory/inventory.module';
import { OrderPricingService } from './services/order-pricing.service';
import { OrderValidationService } from './services/order-validation.service';
import { AuthModule } from '../auth/auth.module';
import { WhatsappModule } from '../whatsapp/whatsapp.module';
import { NotificationsModule } from '../notifications/notifications.module';

import { OrderAnalyticsListener } from './listeners/order-analytics.listener';
import { CustomerLeadListener } from './listeners/customer-lead.listener';
import { OrderSseListener } from './listeners/order-sse.listener';
import { WhatsappNotificationListener } from './listeners/whatsapp-notification.listener';
import { DeliveryAssignmentListener } from './listeners/delivery-assignment.listener';
import { TikTokCapiListener } from './listeners/tiktok-capi.listener';

@Module({
  imports: [
    StorageModule,
    AuthModule,
    InventoryModule,
    NotificationsModule,
    forwardRef(() => WhatsappModule),
  ],
  controllers: [
    OrdersController,
    AdminOrdersController,
    OrdersEventsController,
    DriverOrdersController,
  ],
  providers: [
    OrdersService,
    OrdersGateway,
    OrderPricingService,
    OrderValidationService,
    OrderAnalyticsListener,
    CustomerLeadListener,
    OrderSseListener,
    WhatsappNotificationListener,
    DeliveryAssignmentListener,
    TikTokCapiListener,
  ],
  exports: [OrdersService, OrdersGateway],
})
export class OrdersModule {}
