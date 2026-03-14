import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { WhatsappController } from './whatsapp.controller';
import { WaCartController } from './wa-cart.controller';
import { WhatsappProcessor } from './whatsapp.processor';
import { OpenAiProvider } from './providers/openai.provider';
import { RestaurantContextService } from './services/restaurant-context.service';
import { MetaApiService } from './services/meta-api.service';
import { UsageGuardService } from './services/usage-guard.service';
import { WhatsappOnboardingService } from './services/whatsapp-onboarding.service';
import { WhatsappOnboardingController } from './whatsapp-onboarding.controller';

@Module({
  imports: [
    // Asegurarse de que el EventEmitter global está importado en la aplicación.
    // Lo importamos aquí en caso de que este módulo pueda funcionar standalone,
    // pero idealmente EventEmitterModule.forRoot() se llama en AppModule.
  ],
  controllers: [WhatsappController, WaCartController, WhatsappOnboardingController],
  providers: [
    WhatsappProcessor,
    OpenAiProvider,
    RestaurantContextService,
    MetaApiService,
    UsageGuardService,
    WhatsappOnboardingService,
  ],
})
export class WhatsappModule {}

