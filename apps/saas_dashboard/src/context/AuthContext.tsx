"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from "react";
import { API_BASE, TENANT_ID } from "@/lib/config";

import { User, AuthContextType, STAFF_ROLES } from "@/types/auth";

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
    // Borrar con múltiples combinaciones de SameSite para cubrir
    // cookies creadas con distintos atributos (Lax por JS, None por API)
    document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax`;
    document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=None; Secure`;
}

// Helper function to clear ALL auth data from localStorage
function clearAllAuthData() {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    deleteCookie("accessToken");
    deleteCookie("Authentication"); // Fallback por compatibilidad
    // Dispatch event to notify other components
    window.dispatchEvent(new Event("user-login"));
}

// Helper to safely parse JWT tokens
function parseJwt(token: string) {
    try {
        const payloadBase64 = token.split('.')[1];
        const base64 = payloadBase64?.replace(/-/g, '+').replace(/_/g, '/');
        if (base64) {
            return JSON.parse(atob(base64));
        }
    } catch (e) {
        console.error("[Auth] Error parsing token:", e);
    }
    return null;
}

// Helper to handle the API call and storage of refreshed tokens
async function executeTokenRefresh(refreshToken: string) {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken }),
    });

    if (res.ok) {
        const refreshData = await res.json();
        if (refreshData.accessToken) {
            localStorage.setItem("token", refreshData.accessToken);
            localStorage.setItem("refreshToken", refreshData.refreshToken);
            setCookie("accessToken", refreshData.accessToken, 7);
            return { success: true, ...refreshData };
        }
    }

    return { success: false, status: res.status };
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const isRefreshingRef = useRef(false); // Concurrency lock

    const refreshUser = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");

            // Local expiration check to avoid sending expired tokens to backend
            if (token) {
                try {
                    const payload = parseJwt(token);
                    if (payload && payload.exp) {
                        const isExpired = Date.now() >= (payload.exp * 1000) - 5000; // 5s buffer
                        if (isExpired) {
                            if (isRefreshingRef.current) return;
                            isRefreshingRef.current = true;
                            try {
                                const refreshToken = localStorage.getItem("refreshToken");
                                if (!refreshToken) throw new Error("No refresh token");

                                const refreshRes = await executeTokenRefresh(refreshToken);

                                if (refreshRes.success) {
                                    // Retry getting user with NEW token
                                    return refreshUser();
                                }
                                throw new Error("Refresh failed");
                            } finally {
                                isRefreshingRef.current = false;
                            }
                        }
                    }
                } catch (e) {
                    // Ignore parsing error
                }
            }

            const headers: HeadersInit = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            let res = await fetch(`${API_BASE}/auth/me`, {
                credentials: 'include',
                headers,
            });

            // Si el token de acceso expiró (401), intentar refrescar
            if (res.status === 401) {
                if (isRefreshingRef.current) return;
                isRefreshingRef.current = true;
                try {
                    const refreshToken = localStorage.getItem("refreshToken");

                    if (!refreshToken) {
                        throw new Error("No refresh token available");
                    }

                    // Refresh with Cookie (primary) OR body token (fallback)
                    const refreshRes = await executeTokenRefresh(refreshToken);

                    if (refreshRes.success) {
                        // Retry original request with NEW token
                        const newToken = localStorage.getItem("token");
                        const newHeaders: HeadersInit = {};
                        if (newToken) {
                            newHeaders['Authorization'] = `Bearer ${newToken}`;
                        }

                        res = await fetch(`${API_BASE}/auth/me`, {
                            credentials: 'include',
                            headers: newHeaders,
                        });
                    }
                } catch (refreshError) {
                    // Ignore error silently
                } finally {
                    isRefreshingRef.current = false;
                }
            }

            if (!res.ok) {
                // API returned error (401, etc) - clear everything
                setUser(null);
                clearAllAuthData();

                // Si es 401, redirigir con full page reload (cross-app navigation)
                // router.replace no funciona entre apps Next.js separadas
                if (res.status === 401) {
                    window.location.href = "/login?reason=session_expired";
                }
                return;
            }

            const userData = await res.json();
            setUser(userData);
            localStorage.setItem("user", JSON.stringify(userData));
        } catch (error) {
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
                headers: {},
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

    // ============================================================
    // PROACTIVE TOKEN REFRESH (Adaptive & Robust)
    // ============================================================
    const performTokenRefresh = useCallback(async () => {
        if (isRefreshingRef.current) return false;
        isRefreshingRef.current = true;
        try {
            const refreshToken = localStorage.getItem("refreshToken");
            if (!refreshToken) return false;

            const refreshRes = await executeTokenRefresh(refreshToken);

            if (refreshRes.success) {
                return true;
            } else {
                if (refreshRes.status === 401 || refreshRes.status === 403) {
                    setUser(null);
                    clearAllAuthData();
                    window.location.href = "/login?reason=session_expired";
                }
            }
        } catch (error) {
            // Silently caught
        } finally {
            isRefreshingRef.current = false;
        }
        return false;
    }, []);

    // ============================================================
    // PROACTIVE TOKEN REFRESH (Adaptive & Robust)
    // ============================================================
    useEffect(() => {
        let refreshTimeout: NodeJS.Timeout;

        const scheduleRefresh = () => {
            const token = localStorage.getItem("token");
            if (!token) return;

            try {
                // Decode payload to get expiration time
                const payload = parseJwt(token);
                if (!payload || !payload.exp) return;

                const expirationDate = new Date(payload.exp * 1000);
                const now = new Date();

                // Refresh 5 minutes before actual expiration
                const delay = expirationDate.getTime() - now.getTime() - (5 * 60 * 1000);

                refreshTimeout = setTimeout(async () => {
                    const success = await performTokenRefresh();
                    if (success) {
                        scheduleRefresh();
                    }
                }, Math.max(delay, 0));
            } catch (error) {
                // Ignore error
            }
        };

        if (user) {
            scheduleRefresh();
        }

        return () => {
            if (refreshTimeout) clearTimeout(refreshTimeout);
        };
    }, [user, performTokenRefresh]);

    const isAdmin = user?.role === "ADMIN" || user?.role === "SUPERADMIN";
    const isStaff = !!user?.role && STAFF_ROLES.includes(user.role as any);
    const isAuthenticated = !!user;

    return (
        <AuthContext.Provider value={{ user, loading, isAdmin, isStaff, isAuthenticated, refreshUser, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

// Default values for SSR/static generation when AuthProvider is not available
const defaultAuthContext: AuthContextType = {
    user: null,
    loading: true,
    isAdmin: false,
    isStaff: false,
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

