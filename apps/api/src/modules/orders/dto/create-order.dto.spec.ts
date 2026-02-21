import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateOrderDto, CreateOrderItemDto, OrderItemModifierDto } from './create-order.dto';
import { OrderType, OrderStatus } from '@prisma/client';

// ============ HELPERS ============

async function validateDto(data: any): Promise<string[]> {
    const dto = plainToInstance(CreateOrderDto, data);
    const errors = await validate(dto);
    return errors.flatMap(e => Object.values(e.constraints || {}));
}

// ============ TESTS ============

describe('CreateOrderDto Validation', () => {
    // ============ ORDEN VÁLIDA ============

    it('debería validar correctamente una orden DINE_IN mínima', async () => {
        const data = {
            orderType: 'DINE_IN',
            tableNumber: '5',
            items: [{ variantId: 'var-1', quantity: 1 }],
        };

        const dto = plainToInstance(CreateOrderDto, data);
        const errors = await validate(dto);
        expect(errors.length).toBe(0);
    });

    it('debería validar orden con todos los campos opcionales', async () => {
        const data = {
            orderType: 'DELIVERY',
            status: 'PREPARING',
            tableNumber: null,
            customerName: 'Juan Pérez',
            customerPhone: '555-1234',
            notes: 'Orden urgente',
            shippingData: { address: 'Calle 123', city: 'Bogotá' },
            items: [
                {
                    variantId: 'var-1',
                    quantity: 2,
                    notes: 'Sin sal',
                    modifiers: [
                        { modifierId: 'mod-1', quantity: 1 },
                    ],
                },
            ],
        };

        const dto = plainToInstance(CreateOrderDto, data);
        const errors = await validate(dto);
        expect(errors.length).toBe(0);
    });

    // ============ STATUS FIELD ============

    it('debería aceptar status PREPARING (flujo POS → Cocina)', async () => {
        const data = {
            orderType: 'DINE_IN',
            status: 'PREPARING',
            items: [{ variantId: 'var-1', quantity: 1 }],
        };

        const dto = plainToInstance(CreateOrderDto, data);
        const errors = await validate(dto);
        const statusErrors = errors.filter(e => e.property === 'status');
        expect(statusErrors.length).toBe(0);
    });

    it('debería aceptar status PENDING', async () => {
        const data = {
            orderType: 'DINE_IN',
            status: 'PENDING',
            items: [{ variantId: 'var-1', quantity: 1 }],
        };

        const dto = plainToInstance(CreateOrderDto, data);
        const errors = await validate(dto);
        const statusErrors = errors.filter(e => e.property === 'status');
        expect(statusErrors.length).toBe(0);
    });

    it('debería rechazar un status inválido', async () => {
        const data = {
            orderType: 'DINE_IN',
            status: 'INVALID_STATUS',
            items: [{ variantId: 'var-1', quantity: 1 }],
        };

        const dto = plainToInstance(CreateOrderDto, data);
        const errors = await validate(dto);
        const statusErrors = errors.filter(e => e.property === 'status');
        expect(statusErrors.length).toBeGreaterThan(0);
    });

    it('debería ser válida sin campo status (es opcional)', async () => {
        const data = {
            orderType: 'DINE_IN',
            items: [{ variantId: 'var-1', quantity: 1 }],
        };

        const dto = plainToInstance(CreateOrderDto, data);
        const errors = await validate(dto);
        const statusErrors = errors.filter(e => e.property === 'status');
        expect(statusErrors.length).toBe(0);
    });

    // ============ ORDERTYPE FIELD ============

    it('debería rechazar un orderType inválido', async () => {
        const data = {
            orderType: 'INVALID_TYPE',
            items: [{ variantId: 'var-1', quantity: 1 }],
        };

        const dto = plainToInstance(CreateOrderDto, data);
        const errors = await validate(dto);
        const typeErrors = errors.filter(e => e.property === 'orderType');
        expect(typeErrors.length).toBeGreaterThan(0);
    });

    // ============ ITEMS FIELD ============

    it('debería rechazar orden sin items', async () => {
        const data = {
            orderType: 'DINE_IN',
            items: [],
        };

        const dto = plainToInstance(CreateOrderDto, data);
        const errors = await validate(dto);
        const itemsErrors = errors.filter(e => e.property === 'items');
        expect(itemsErrors.length).toBeGreaterThan(0);
    });

    it('debería rechazar orden sin campo items', async () => {
        const data = {
            orderType: 'DINE_IN',
        };

        const dto = plainToInstance(CreateOrderDto, data);
        const errors = await validate(dto);
        const itemsErrors = errors.filter(e => e.property === 'items');
        expect(itemsErrors.length).toBeGreaterThan(0);
    });

    // ============ TODOS LOS STATUS VÁLIDOS DEL ENUM ============

    const validStatuses: string[] = [
        'PENDING', 'APPROVED', 'PROCESSING', 'PREPARING', 'READY',
        'SERVED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED',
    ];

    validStatuses.forEach(status => {
        it(`debería aceptar status "${status}"`, async () => {
            const data = {
                orderType: 'DINE_IN',
                status,
                items: [{ variantId: 'var-1', quantity: 1 }],
            };

            const dto = plainToInstance(CreateOrderDto, data);
            const errors = await validate(dto);
            const statusErrors = errors.filter(e => e.property === 'status');
            expect(statusErrors.length).toBe(0);
        });
    });
});
