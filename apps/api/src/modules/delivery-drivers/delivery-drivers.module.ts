import { Module } from '@nestjs/common';
import { DeliveryDriversService } from './delivery-drivers.service';
import {
  AdminDeliveryDriversController,
  DriverController,
} from './delivery-drivers.controller';

@Module({
  controllers: [AdminDeliveryDriversController, DriverController],
  providers: [DeliveryDriversService],
  exports: [DeliveryDriversService],
})
export class DeliveryDriversModule {}
