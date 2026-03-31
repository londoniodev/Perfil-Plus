export type OrderStatus = 'PENDING' | 'APPROVED' | 'PROCESSING' | 'PREPARING' | 'READY' | 'SERVED' | 'ASSIGNED' | 'IN_TRANSIT' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
export type OrderType = 'DINE_IN' | 'TAKE_AWAY' | 'DELIVERY';

export interface Modifier {
    id: string;
    name: string;
    priceAdjustment: number; // Decimal in DB, number in JSON
    quantity: number;
}

export interface OrderItem {
    id: string;
    quantity: number;
    price: number;
    isPaid: boolean;
    productName: string;
    variantName?: string;
    notes?: string;
    modifiers: {
        modifierName: string;
        quantity: number;
        priceAdjustment: number;
    }[];
    isPrepared?: boolean;
}

export interface Order {
    id: string;
    orderNumber: string;
    totalAmount: number;
    status: OrderStatus;
    orderType: OrderType;
    tableNumber?: string;
    customerName?: string;
    customerPhone?: string;
    notes?: string;
    paymentProvider?: string;
    shippingData?: {
        address: string;
        city: string;
    };
    createdAt: string;
    items: OrderItem[];
    user?: {
        id: string;
        name: string;
        email: string;
    };
    driverId?: string;
    driver?: any;
}
