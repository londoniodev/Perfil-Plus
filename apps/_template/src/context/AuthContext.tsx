"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { API_BASE, TENANT_ID } from "@/lib/config";

import { User, AuthContextType } from "@/types/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to manipulate cookies
function setCookie(name: string, value: string, days: number) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Lax";
}

function deleteCookie(name: string) {
    document.cookie = name + "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
}

// Helper function to clear ALL auth data from localStorage
function clearAllAuthData() {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    deleteCookie("accessToken"); // Clear middleware cookie
    // Dispatch event to notify other components
    window.dispatchEvent(new Event("user-login"));
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshUser = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            const headers: HeadersInit = { 'x-tenant-id': TENANT_ID };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            let res = await fetch(`${API_BASE}/auth/me`, {
                credentials: 'include',
                headers,
            });

            // Si el token de acceso expiró (401), intentar refrescar
            if (res.status === 401) {
                try {
                    const refreshToken = localStorage.getItem("refreshToken");

                    if (!refreshToken) {
                        throw new Error("No refresh token available");
                    }

                    // Refresh with Cookie (primary) OR body token (fallback)
                    const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
                        method: "POST",
                        credentials: 'include',
                        headers: {
                            'x-tenant-id': TENANT_ID,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ refreshToken }),
                    });

                    if (refreshRes.ok) {
                        // Update tokens in localStorage if returned
                        const refreshData = await refreshRes.json();
                        if (refreshData.accessToken) {
                            localStorage.setItem("token", refreshData.accessToken);
                            localStorage.setItem("refreshToken", refreshData.refreshToken);
                            // Update cookie for middleware
                            setCookie("accessToken", refreshData.accessToken, 7);
                        }

                        // Retry original request with NEW token
                        const newToken = localStorage.getItem("token");
                        const newHeaders: HeadersInit = { 'x-tenant-id': TENANT_ID };
                        if (newToken) {
                            newHeaders['Authorization'] = `Bearer ${newToken}`;
                        }

                        res = await fetch(`${API_BASE}/auth/me`, {
                            credentials: 'include',
                            headers: newHeaders,
                        });
                    }
                } catch (refreshError) {
                    console.error("Error refreshing token:", refreshError);
                    // Si falla el refresco, procederá al logout abajo
                }
            }

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
                headers: { 'x-tenant-id': TENANT_ID },
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

// Default values for SSR/static generation when AuthProvider is not available
const defaultAuthContext: AuthContextType = {
    user: null,
    loading: true,
    isAdmin: false,
    isAuthenticated: false,
    refreshUser: async () => { },
    logout: async () => { },
};

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    // Return default values during SSR/static generation instead of throwing
    if (context === undefined) {
        return defaultAuthContext;
    }
    return context;
}

