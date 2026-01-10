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
    isAuthenticated: boolean;
    refreshUser: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to clear ALL auth data from localStorage
function clearAllAuthData() {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    // Dispatch event to notify other components
    window.dispatchEvent(new Event("user-login"));
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshUser = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE}/auth/me`, {
                credentials: 'include',
            });

            if (!res.ok) {
                // API returned error (401, etc) - clear everything
                setUser(null);
                clearAllAuthData();
                return;
            }

            const userData = await res.json();
            setUser(userData);
            localStorage.setItem("user", JSON.stringify(userData));
        } catch (error) {
            console.error("Error fetching user:", error);
            setUser(null);
            clearAllAuthData();
        }
    }, []);

    const logout = useCallback(async () => {
        // Clear state immediately
        setUser(null);

        // Clear ALL localStorage auth data
        clearAllAuthData();

        try {
            // Call backend to clear cookies and invalidate tokens
            await fetch(`${API_BASE}/auth/logout`, {
                method: "POST",
                credentials: 'include',
            });
        } catch (error) {
            console.error("Logout API error:", error);
            // Continue with redirect even if API fails
        }

        // Force full page reload to clear any cached state
        window.location.href = "/";
    }, []);

    useEffect(() => {
        // Try to load from localStorage first for faster initial render
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch {
                clearAllAuthData();
            }
        }

        // Then verify with backend
        refreshUser().finally(() => setLoading(false));
    }, [refreshUser]);

    const isAdmin = user?.role === "ADMIN";
    const isAuthenticated = !!user;

    return (
        <AuthContext.Provider value={{ user, loading, isAdmin, isAuthenticated, refreshUser, logout }}>
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
