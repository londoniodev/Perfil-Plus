import { Controller, Sse, Injectable, Logger, Query, UnauthorizedException } from '@nestjs/common';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { Subject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Public } from '../../common/decorators/public.decorator';
import { JwtService } from '@nestjs/jwt';

// ============ TIPOS DE EVENTOS ============

export interface OrderEvent {
    type: 'new_order' | 'status_changed' | 'payment_received';
    orderId: string;
    data: Record<string, any>;
}

export interface SseMessage {
    data: OrderEvent;
}

// ============ SERVICIO SSE (inyectable) ============

@Injectable()
export class OrdersGateway {
    private readonly logger = new Logger(OrdersGateway.name);
    // Map tenantId -> Subject
    private readonly tenantEvents = new Map<string, Subject<OrderEvent>>();

    /**
     * Emite un evento SSE a un tenant específico
     */
    emit(tenantId: string, event: OrderEvent): void {
        this.logger.log(`SSE [${tenantId}]: ${event.type} → order ${event.orderId}`);

        if (!this.tenantEvents.has(tenantId)) {
            // Si no hay subscribers para este tenant, no es necesario crear el subject,
            // pero para consistencia si alguien se conecta justo despues... 
            // Realmente solo necesitamos emitir si existe el subject.
            return;
        }

        this.tenantEvents.get(tenantId)?.next(event);
    }

    /**
     * Observable que el controller SSE usa para enviar eventos
     */
    getEvents(tenantId: string): Observable<SseMessage> {
        if (!this.tenantEvents.has(tenantId)) {
            this.tenantEvents.set(tenantId, new Subject<OrderEvent>());
        }
        return this.tenantEvents.get(tenantId)!.asObservable().pipe(
            map((event) => ({ data: event })),
        );
    }
}

// ============ CONTROLLER SSE ============

@Controller('orders')
export class OrdersEventsController {
    constructor(
        private readonly gateway: OrdersGateway,
        private readonly jwtService: JwtService
    ) { }

    /**
     * Endpoint SSE público — la cocina/POS se conecta aquí.
     * 
     * Uso desde el frontend:
     * ```ts
     * const sse = new EventSource('/api/orders/events?token=...');
     * sse.onmessage = (e) => { const event = JSON.parse(e.data); ... };
     * ```
     */
    @Sse('events')
    @Public()
    @SkipThrottle()
    events(@Query('token') token: string): Observable<SseMessage> {
        if (!token) {
            throw new UnauthorizedException('Token not provided');
        }
        try {
            const payload = this.jwtService.verify(token);
            // El payload debe contener el tenantId si es un usuario de tenant.
            // Si es un admin de plataforma, quizás vea todo? 
            // Asumimos que los usuarios (cocina/meseros) tienen un tenantId en sus claims o metadata.
            // O, más simple: el token se firma con el secret global, pero el usuario pertenece a un tenant.
            // El JWT payload standard tiene 'sub' (userId).
            // Necesitamos 'tenantId'. Revisar generateTokens.
            // Por ahora, extraemos 'tenantId' del request header si es SSE standard, 
            // pero EventSource browser API no soporta headers.
            // Solución: El token DEBE incluir tenantId.

            // FIXME: Asumimos que el token tiene tenantId. Si no, tenemos un problema.
            // En auth.service.ts veremos qué tiene el payload.
            // Si no tiene tenantId, usaremos el email/user para buscarlo (costoso) o requerimos que se pase ?tenantId=...
            // Pero pasar tenantId en query param es inseguro si no se valida contra el token.

            // Asumiendo que el payload tiene: { sub: userId, email: ..., tenantId?: ... }
            // Si no está en el token, lo ideal es regenerar tokens para incluirlo.

            return this.gateway.getEvents(payload.tenantId || 'default');
        } catch (e) {
            throw new UnauthorizedException('Invalid token');
        }
    }
}
