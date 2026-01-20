export type UserRole = "USER" | "ADMIN";

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
    isAuthenticated: boolean;
    refreshUser: () => Promise<void>;
    logout: () => Promise<void>;
}

