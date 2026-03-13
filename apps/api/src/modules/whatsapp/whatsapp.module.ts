import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { WhatsappController } from './whatsapp.controller';
import { WhatsappProcessor } from './whatsapp.processor';

@Module({
  imports: [
    // Asegurarse de que el EventEmitter global está importado en la aplicación.
    // Lo importamos aquí en caso de que este módulo pueda funcionar standalone,
    // pero idealmente EventEmitterModule.forRoot() se llama en AppModule.
  ],
  controllers: [WhatsappController],
  providers: [WhatsappProcessor],
})
export class WhatsappModule {}
