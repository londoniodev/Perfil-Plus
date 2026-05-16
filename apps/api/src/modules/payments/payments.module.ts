import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { BoldService } from './bold.service';
import { PaymentWebhookListener } from './payment-webhook.listener';
import { StorageModule } from '../storage/storage.module';

import { PaymentsReconciliationJob } from './jobs/reconciliation.job';

@Module({
  imports: [StorageModule],
  controllers: [PaymentsController],
  providers: [
    PaymentsService, 
    BoldService, 
    PaymentWebhookListener,
    PaymentsReconciliationJob
  ],
  exports: [PaymentsService, BoldService],
})
export class PaymentsModule {}
