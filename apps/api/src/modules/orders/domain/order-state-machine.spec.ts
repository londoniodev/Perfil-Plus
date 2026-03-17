import { BadRequestException } from '@nestjs/common';
import { OrderStatus, Role } from '@alvarosky/database';
import {
  validateOrderTransition,
  ORDER_TRANSITIONS,
} from './order-state-machine';

// ============================================================
//  TAREA 1: Tests de la Máquina de Estados (Lógica Pura)
//  Función bajo prueba: validateOrderTransition()
//  NO necesita NestJS TestingModule ni Prisma mocks.
// ============================================================

describe('Order State Machine — validateOrderTransition()', () => {
  // ─────────── HELPERS ───────────

  /** Shortcut para esperar que NO lance excepción */
  const expectValid = (from: OrderStatus, to: OrderStatus, role: Role) => {
    expect(() => validateOrderTransition(from, to, role)).not.toThrow();
  };

  /** Shortcut para esperar BadRequestException */
  const expectInvalid = (from: OrderStatus, to: OrderStatus, role: Role) => {
    expect(() => validateOrderTransition(from, to, role)).toThrow(
      BadRequestException,
    );
  };

  // ============ 1. Flujo Dine-In completo ============

  describe('Flujo Dine-In (PENDING → PREPARING → READY → SERVED)', () => {
    it('ADMIN puede transicionar todo el flujo Dine-In completo', () => {
      expectValid('PENDING', 'PREPARING', 'ADMIN');
      expectValid('PREPARING', 'READY', 'ADMIN');
      expectValid('READY', 'SERVED', 'ADMIN');
    });

    it('KITCHEN puede llevar de PENDING a PREPARING', () => {
      expectValid('PENDING', 'PREPARING', 'KITCHEN');
    });

    it('KITCHEN puede llevar de PREPARING a READY', () => {
      expectValid('PREPARING', 'READY', 'KITCHEN');
    });

    it('WAITER puede llevar de READY a SERVED', () => {
      expectValid('READY', 'SERVED', 'WAITER');
    });
  });

  // ============ 2. Flujo Delivery completo ============

  describe('Flujo Delivery (PENDING → PREPARING → READY → ASSIGNED → IN_TRANSIT → DELIVERED)', () => {
    it('puede recorrer todo el flujo de delivery con roles apropiados', () => {
      // Cocina prepara
      expectValid('PENDING', 'PREPARING', 'KITCHEN');
      expectValid('PREPARING', 'READY', 'KITCHEN');

      // Admin asigna driver
      expectValid('READY', 'ASSIGNED', 'ADMIN');

      // Driver recoge y entrega
      expectValid('ASSIGNED', 'IN_TRANSIT', 'DRIVER');
      expectValid('IN_TRANSIT', 'DELIVERED', 'DRIVER');
    });

    it('CASHIER puede asignar driver (READY → ASSIGNED)', () => {
      expectValid('READY', 'ASSIGNED', 'CASHIER');
    });
  });

  // ============ 3. Atajo ASSIGNED → DELIVERED (Entrega directa) ============

  describe('Atajo: ASSIGNED → DELIVERED (sin pasar por IN_TRANSIT)', () => {
    it('DRIVER puede marcar ASSIGNED como DELIVERED directamente', () => {
      expectValid('ASSIGNED', 'DELIVERED', 'DRIVER');
    });

    it('ADMIN puede marcar ASSIGNED como DELIVERED directamente', () => {
      expectValid('ASSIGNED', 'DELIVERED', 'ADMIN');
    });
  });

  // ============ 4. Atajo PENDING → PREPARING ============

  describe('Atajo: PENDING → PREPARING (Kitchen toma orden sin aprobación)', () => {
    it('KITCHEN puede tomar pedido pendiente directo a preparación', () => {
      expectValid('PENDING', 'PREPARING', 'KITCHEN');
    });

    it('ADMIN puede tomar pedido pendiente directo a preparación', () => {
      expectValid('PENDING', 'PREPARING', 'ADMIN');
    });
  });

  // ============ 5. Cancelación multi-estado ============

  describe('Cancelación desde múltiples estados', () => {
    const cancellableStates: OrderStatus[] = [
      'PENDING',
      'APPROVED',
      'PREPARING',
      'READY',
      'ASSIGNED',
    ];

    cancellableStates.forEach((state) => {
      it(`ADMIN puede cancelar desde ${state}`, () => {
        expectValid(state, 'CANCELLED', 'ADMIN');
      });
    });

    it('CASHIER puede cancelar desde PENDING', () => {
      expectValid('PENDING', 'CANCELLED', 'CASHIER');
    });

    it('WAITER puede cancelar desde PREPARING', () => {
      expectValid('PREPARING', 'CANCELLED', 'WAITER');
    });
  });

  // ============ 6. ❌ Transición ilegal ============

  describe('Transiciones ilegales', () => {
    it('no permite PENDING → DELIVERED (salto de estados)', () => {
      expectInvalid('PENDING', 'DELIVERED', 'ADMIN');
    });

    it('no permite PENDING → SERVED', () => {
      expectInvalid('PENDING', 'SERVED', 'ADMIN');
    });

    it('no permite DELIVERED → PENDING (retroceso)', () => {
      expectInvalid('DELIVERED', 'PENDING', 'ADMIN');
    });

    it('no permite CANCELLED → PREPARING (orden muerta)', () => {
      expectInvalid('CANCELLED', 'PREPARING', 'ADMIN');
    });

    it('no permite IN_TRANSIT → ASSIGNED (retroceso)', () => {
      expectInvalid('IN_TRANSIT', 'ASSIGNED', 'ADMIN');
    });
  });

  // ============ 7. ❌ Rol incorrecto ============

  describe('Rol incorrecto para transición válida', () => {
    it('WAITER no puede asignar driver (READY → ASSIGNED)', () => {
      expectInvalid('READY', 'ASSIGNED', 'WAITER');
    });

    it('KITCHEN no puede asignar driver (READY → ASSIGNED)', () => {
      expectInvalid('READY', 'ASSIGNED', 'KITCHEN');
    });

    it('DRIVER no puede preparar (PENDING → PREPARING)', () => {
      expectInvalid('PENDING', 'PREPARING', 'DRIVER');
    });

    it('CASHIER no puede marcar como READY', () => {
      expectInvalid('PREPARING', 'READY', 'CASHIER');
    });
  });

  // ============ 8. ❌ DRIVER no puede cancelar ============

  describe('DRIVER no puede cancelar pedidos', () => {
    it('DRIVER no puede cancelar desde ASSIGNED', () => {
      expectInvalid('ASSIGNED', 'CANCELLED', 'DRIVER');
    });

    it('DRIVER no puede cancelar desde IN_TRANSIT', () => {
      expectInvalid('IN_TRANSIT', 'CANCELLED', 'DRIVER');
    });
  });

  // ============ 9. Idempotencia ============

  describe('Idempotencia (mismo estado → mismo estado)', () => {
    const allStatuses: OrderStatus[] = [
      'PENDING',
      'APPROVED',
      'PREPARING',
      'READY',
      'ASSIGNED',
      'IN_TRANSIT',
      'DELIVERED',
      'SERVED',
      'CANCELLED',
    ];

    allStatuses.forEach((status) => {
      it(`${status} → ${status} no lanza error (idempotente)`, () => {
        // Cualquier rol debería funcionar en idempotencia
        expectValid(status, status, 'ADMIN');
      });
    });
  });

  // ============ 10. ❌ KITCHEN no puede servir ============

  describe('KITCHEN no puede servir (READY → SERVED)', () => {
    it('KITCHEN no puede marcar como SERVED', () => {
      expectInvalid('READY', 'SERVED', 'KITCHEN');
    });

    it('DRIVER no puede marcar como SERVED', () => {
      expectInvalid('READY', 'SERVED', 'DRIVER');
    });
  });

  // ============ BONUS: Validación del array de transiciones ============

  describe('Integridad del array ORDER_TRANSITIONS', () => {
    it('debe tener al menos 7 reglas de transición definidas', () => {
      expect(ORDER_TRANSITIONS.length).toBeGreaterThanOrEqual(7);
    });

    it('cada transición debe tener from, to, y roles definidos', () => {
      ORDER_TRANSITIONS.forEach((t) => {
        expect(t.from.length).toBeGreaterThan(0);
        expect(t.to).toBeDefined();
        expect(t.roles.length).toBeGreaterThan(0);
      });
    });
  });
});
