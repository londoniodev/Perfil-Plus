export type UserRole = "USER" | "ADMIN" | "SUPERADMIN" | "WAITER" | "KITCHEN" | "CASHIER" | "DRIVER";
export type StaffRole = "WAITER" | "KITCHEN" | "CASHIER" | "DRIVER";
export const STAFF_ROLES: StaffRole[] = ["WAITER", "KITCHEN", "CASHIER", "DRIVER"];

export interface User {
    id: string;
    tenantId: string;
    name: string;
    email: string;
    role: UserRole;
    emailVerified: boolean;
    hasActiveSubscription: boolean;
    avatar?: string | null;
}

export interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAdmin: boolean;
    isStaff: boolean;
    isAuthenticated: boolean;
    refreshUser: () => Promise<void>;
    logout: () => Promise<void>;
}
