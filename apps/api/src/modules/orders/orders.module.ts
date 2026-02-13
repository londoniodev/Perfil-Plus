import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController, AdminOrdersController } from './orders.controller';
import { StorageModule } from '../storage/storage.module';

import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [StorageModule, AuthModule],
    controllers: [OrdersController, AdminOrdersController],
    providers: [OrdersService],
    exports: [OrdersService],
})
export class OrdersModule { }
