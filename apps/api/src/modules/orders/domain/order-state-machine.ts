import { BadRequestException } from '@nestjs/common';
import { OrderStatus, Role } from '@prisma/client';

export type AllowedTransition = {
  from: OrderStatus[];
  to: OrderStatus;
  roles: Role[];
};

export const ORDER_TRANSITIONS: AllowedTransition[] = [
  // 1. Initial Flow
  { from: ['PENDING'], to: 'APPROVED', roles: ['ADMIN', 'CASHIER', 'WAITER'] },
  {
    from: ['PENDING', 'APPROVED'],
    to: 'PREPARING',
    roles: ['ADMIN', 'KITCHEN'],
  }, // Kitchen starts cooking

  // 2. Kitchen Flow
  { from: ['PREPARING'], to: 'READY', roles: ['ADMIN', 'KITCHEN'] }, // Food is ready

  // 3. Service Flow (Dine-in)
  { from: ['READY'], to: 'SERVED', roles: ['ADMIN', 'WAITER'] }, // Waiter serves table

  // 4. Delivery Flow
  { from: ['READY'], to: 'ASSIGNED', roles: ['ADMIN', 'CASHIER'] }, // Admin assigns driver
  { from: ['ASSIGNED'], to: 'IN_TRANSIT', roles: ['ADMIN', 'DRIVER'] }, // Driver picks up
  { from: ['IN_TRANSIT'], to: 'DELIVERED', roles: ['ADMIN', 'DRIVER'] }, // Driver delivers

  // 5. Payment/Completion (Cashier)
  { from: ['SERVED', 'READY'], to: 'DELIVERED', roles: ['ADMIN', 'CASHIER'] },

  // 6. Cancellation (before delivery in transit)
  {
    from: ['PENDING', 'APPROVED', 'PREPARING', 'READY', 'ASSIGNED'],
    to: 'CANCELLED',
    roles: ['ADMIN', 'CASHIER', 'WAITER'],
  },
];


export function validateOrderTransition(
  currentStatus: OrderStatus,
  newStatus: OrderStatus,
  userRole: Role,
) {
  // Admin override (optional, but safer to restrict even admin to logical flows)
  // if (userRole === 'ADMIN') return;

  // Allow same status (idempotency)
  if (currentStatus === newStatus) return;

  const transition = ORDER_TRANSITIONS.find(
    (t) =>
      t.to === newStatus &&
      t.from.includes(currentStatus) &&
      t.roles.includes(userRole),
  );

  if (!transition) {
    throw new BadRequestException(
      `Invalid status transition from ${currentStatus} to ${newStatus} for role ${userRole}`,
    );
  }
}
