import { OrdersGateway, OrderEvent } from './orders.gateway';
import { firstValueFrom, take, toArray } from 'rxjs';

describe('OrdersGateway', () => {
    let gateway: OrdersGateway;

    beforeEach(() => {
        gateway = new OrdersGateway();
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    describe('emit', () => {
        it('debería emitir evento new_order a los suscriptores', (done) => {
            const tenantId = 'test-tenant';
            const event: OrderEvent = {
                type: 'new_order',
                orderId: 'order-1',
                data: { orderNumber: 'ORD-2026-0001', status: 'PENDING', totalAmount: 25.50, items: 2 },
            };

            gateway.getEvents(tenantId).pipe(take(1)).subscribe((message) => {
                expect(message.data).toEqual(event);
                done();
            });

            gateway.emit(tenantId, event);
        });

        it('debería emitir evento status_changed', (done) => {
            const tenantId = 'test-tenant';
            const event: OrderEvent = {
                type: 'status_changed',
                orderId: 'order-1',
                data: { status: 'PREPARING' },
            };

            gateway.getEvents(tenantId).pipe(take(1)).subscribe((message) => {
                expect(message.data.type).toBe('status_changed');
                expect(message.data.data.status).toBe('PREPARING');
                done();
            });

            gateway.emit(tenantId, event);
        });

        it('debería emitir evento payment_received', (done) => {
            const tenantId = 'test-tenant';
            const event: OrderEvent = {
                type: 'payment_received',
                orderId: 'order-1',
                data: { amount: 21.49, method: 'CASH', closed: true },
            };

            gateway.getEvents(tenantId).pipe(take(1)).subscribe((message) => {
                expect(message.data.type).toBe('payment_received');
                expect(message.data.data.amount).toBe(21.49);
                done();
            });

            gateway.emit(tenantId, event);
        });
    });

    describe('getEvents', () => {
        it('debería envolver eventos en formato SseMessage { data: OrderEvent }', (done) => {
            const tenantId = 'test-tenant';
            const event: OrderEvent = {
                type: 'new_order',
                orderId: 'order-1',
                data: { test: true },
            };

            gateway.getEvents(tenantId).pipe(take(1)).subscribe((message) => {
                expect(message).toHaveProperty('data');
                expect(message.data).toEqual(event);
                done();
            });

            gateway.emit(tenantId, event);
        });

        it('debería emitir múltiples eventos en secuencia', (done) => {
            const tenantId = 'test-tenant';
            const events: OrderEvent[] = [
                { type: 'new_order', orderId: 'order-1', data: { seq: 1 } },
                { type: 'status_changed', orderId: 'order-1', data: { seq: 2 } },
                { type: 'payment_received', orderId: 'order-1', data: { seq: 3 } },
            ];

            gateway.getEvents(tenantId).pipe(take(3), toArray()).subscribe((messages) => {
                expect(messages).toHaveLength(3);
                expect(messages[0].data.type).toBe('new_order');
                expect(messages[1].data.type).toBe('status_changed');
                expect(messages[2].data.type).toBe('payment_received');
                done();
            });

            events.forEach(e => gateway.emit(tenantId, e));
        });
    });
});
