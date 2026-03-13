import { Controller, Get, Post, Req, Res, HttpStatus } from '@nestjs/common';
import type { Request, Response } from 'express';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Public } from '../../common/decorators/public.decorator';

@Controller('webhook/whatsapp')
export class WhatsappController {
  // Token de verificación configurado en el panel de Meta.
  // En producción, esto DEBE venir de variables de entorno.
  private readonly VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'alvaro_token_seguro_123';

  constructor(private eventEmitter: EventEmitter2) {}

  @Public()
  @Get()
  verifyWebhook(@Req() req: Request, @Res() res: Response) {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === this.VERIFY_TOKEN) {
      console.log('¡Webhook verificado por Meta exitosamente!');
      return res.status(HttpStatus.OK).send(challenge);
    }
    
    return res.sendStatus(HttpStatus.FORBIDDEN);
  }

  @Public()
  @Post()
  receiveMessage(@Req() req: Request, @Res() res: Response) {
    const body = req.body;

    // Verificar que el evento viene de WhatsApp originado por Meta
    if (body.object === 'whatsapp_business_account') {
      // REGLA CRÍTICA DE META:
      // Devolver un Status 200 OK inmediatamente
      res.status(HttpStatus.OK).send('EVENT_RECEIVED');

      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;

      if (value?.messages) {
        const phone_number_id = value.metadata.phone_number_id;

        // Emitir un evento asíncrono para procesar el mensaje en el background
        this.eventEmitter.emit('whatsapp.message.received', {
          phone_number_id,
          payload: value,
        });
      }
    } else {
      res.sendStatus(HttpStatus.NOT_FOUND);
    }
  }
}
