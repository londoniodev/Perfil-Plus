"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { API_BASE } from "@/lib/config";

export type UserRole = "USER" | "ADMIN";

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    emailVerified: boolean;
    hasActiveSubscription: boolean;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAdmin: boolean;
    refreshUser: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshUser = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE}/auth/me`, {
                credentials: 'include',
            });

            if (!res.ok) {
                setUser(null);
                localStorage.removeItem("user");
                return;
            }

            const userData = await res.json();
            setUser(userData);
            localStorage.setItem("user", JSON.stringify(userData));
        } catch (error) {
            console.error("Error fetching user:", error);
            setUser(null);
            localStorage.removeItem("user");
        }
    }, []);

    const logout = useCallback(async () => {
        // Always clear local state first
        setUser(null);
        localStorage.removeItem("user");

        try {
            await fetch(`${API_BASE}/auth/logout`, {
                method: "POST",
                credentials: 'include',
            });
        } catch (error) {
            console.error("Logout error:", error);
        }

        // Dispatch event for other components
        window.dispatchEvent(new Event("user-login"));

        // Force redirect to login page
        window.location.href = "/login";
    }, []);

    useEffect(() => {
        // Try to load from localStorage first for faster initial render
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch {
                localStorage.removeItem("user");
            }
        }

        // Then verify with backend
        refreshUser().finally(() => setLoading(false));
    }, [refreshUser]);

    const isAdmin = user?.role === "ADMIN";

    return (
        <AuthContext.Provider value={{ user, loading, isAdmin, refreshUser, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
