export type UserRole = "USER" | "ADMIN" | "WAITER" | "KITCHEN" | "CASHIER";
export type StaffRole = "WAITER" | "KITCHEN" | "CASHIER";
export const STAFF_ROLES: StaffRole[] = ["WAITER", "KITCHEN", "CASHIER"];

export interface User {
    id: string;
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
