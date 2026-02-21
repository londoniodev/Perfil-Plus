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
    { from: ['PENDING', 'APPROVED'], to: 'PREPARING', roles: ['ADMIN', 'KITCHEN'] }, // Kitchen starts cooking

    // 2. Kitchen Flow
    { from: ['PREPARING'], to: 'READY', roles: ['ADMIN', 'KITCHEN'] }, // Food is ready

    // 3. Service Flow
    { from: ['READY'], to: 'SERVED', roles: ['ADMIN', 'WAITER'] }, // Waiter serves table

    // 4. Payment/Completion (Cashier)
    // Note: DELIVERED usually means "Complete/Paid" in some flows, or just "Delivered" in delivery.
    // For restaurant, SERVED might be the end of "active" service, but payment makes it COMPLETED/DELIVERED.
    { from: ['SERVED', 'READY'], to: 'DELIVERED', roles: ['ADMIN', 'CASHIER'] },

    // 5. Cancellation (Anytime before delivered?)
    { from: ['PENDING', 'APPROVED', 'PREPARING', 'READY'], to: 'CANCELLED', roles: ['ADMIN', 'CASHIER', 'WAITER'] },
];

export function validateOrderTransition(currentStatus: OrderStatus, newStatus: OrderStatus, userRole: Role) {
    // Admin override (optional, but safer to restrict even admin to logical flows)
    // if (userRole === 'ADMIN') return; 

    // Allow same status (idempotency)
    if (currentStatus === newStatus) return;

    const transition = ORDER_TRANSITIONS.find(t =>
        t.to === newStatus &&
        t.from.includes(currentStatus) &&
        t.roles.includes(userRole)
    );

    if (!transition) {
        throw new BadRequestException(
            `Invalid status transition from ${currentStatus} to ${newStatus} for role ${userRole}`
        );
    }
}
