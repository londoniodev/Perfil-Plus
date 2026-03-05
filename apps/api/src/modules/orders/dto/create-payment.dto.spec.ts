import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreatePaymentDto } from './create-payment.dto';

// ============ HELPERS ============

async function validateDto(data: any): Promise<string[]> {
  const dto = plainToInstance(CreatePaymentDto, data);
  const errors = await validate(dto);
  return errors.flatMap((e) => Object.values(e.constraints || {}));
}

// ============ TESTS ============

describe('CreatePaymentDto Validation', () => {
  // ============ PAGO VÁLIDO ============

  it('debería validar pago mínimo (amount + method)', async () => {
    const data = { amount: 25.5, method: 'CASH' };
    const dto = plainToInstance(CreatePaymentDto, data);
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('debería validar pago completo con todos los campos opcionales', async () => {
    const data = {
      amount: 100,
      method: 'CARD',
      reference: 'TXN-12345',
      itemIds: ['item-1', 'item-2'],
      closeOrder: true,
    };
    const dto = plainToInstance(CreatePaymentDto, data);
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  // ============ CAMPOS REQUERIDOS ============

  it('debería rechazar sin amount', async () => {
    const data = { method: 'CASH' };
    const dto = plainToInstance(CreatePaymentDto, data);
    const errors = await validate(dto);
    const amountErrors = errors.filter((e) => e.property === 'amount');
    expect(amountErrors.length).toBeGreaterThan(0);
  });

  it('debería rechazar sin method', async () => {
    const data = { amount: 25.5 };
    const dto = plainToInstance(CreatePaymentDto, data);
    const errors = await validate(dto);
    const methodErrors = errors.filter((e) => e.property === 'method');
    expect(methodErrors.length).toBeGreaterThan(0);
  });

  // ============ CAMPOS OPCIONALES ============

  it('debería ser válido sin reference', async () => {
    const data = { amount: 50, method: 'CASH' };
    const dto = plainToInstance(CreatePaymentDto, data);
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('debería ser válido sin itemIds', async () => {
    const data = { amount: 50, method: 'CARD', reference: 'REF-001' };
    const dto = plainToInstance(CreatePaymentDto, data);
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('debería ser válido sin closeOrder', async () => {
    const data = { amount: 50, method: 'CASH' };
    const dto = plainToInstance(CreatePaymentDto, data);
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  // ============ MÉTODOS DE PAGO ============

  it('debería aceptar method "CASH" (efectivo)', async () => {
    const data = { amount: 25, method: 'CASH' };
    const dto = plainToInstance(CreatePaymentDto, data);
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('debería aceptar method "CARD" (tarjeta)', async () => {
    const data = { amount: 25, method: 'CARD' };
    const dto = plainToInstance(CreatePaymentDto, data);
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('debería aceptar method "MERCADOPAGO"', async () => {
    const data = { amount: 25, method: 'MERCADOPAGO' };
    const dto = plainToInstance(CreatePaymentDto, data);
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('debería aceptar method "TRANSFER" (transferencia)', async () => {
    const data = { amount: 25, method: 'TRANSFER' };
    const dto = plainToInstance(CreatePaymentDto, data);
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});
