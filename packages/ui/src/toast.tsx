"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

// ============================================================================
// TYPES
// ============================================================================

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
    id: string;
    type: ToastType;
    title?: string;
    message: string;
    duration?: number;
}

interface ToastContextType {
    toasts: Toast[];
    showToast: (toast: Omit<Toast, "id">) => void;
    success: (message: string, title?: string) => void;
    error: (message: string, title?: string) => void;
    warning: (message: string, title?: string) => void;
    info: (message: string, title?: string) => void;
    removeToast: (id: string) => void;
}

// ============================================================================
// CONTEXT
// ============================================================================

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        // Return a dummy context instead of throwing, allowing static rendering
        return {
            toasts: [],
            showToast: () => {},
            success: () => {},
            error: () => {},
            warning: () => {},
            info: () => {},
            removeToast: () => {},
        } as any;
    }
    return context;
}

// ============================================================================
// PROVIDER
// ============================================================================

interface ToastProviderProps {
    children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const showToast = useCallback((toast: Omit<Toast, "id">) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newToast: Toast = { ...toast, id };

        setToasts((prev) => [...prev, newToast]);

        // Auto remove after duration (default 5 seconds)
        const duration = toast.duration ?? 5000;
        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }
    }, [removeToast]);

    const success = useCallback((message: string, title?: string) => {
        showToast({ type: "success", message, title: title ?? "¡Éxito!" });
    }, [showToast]);

    const error = useCallback((message: string, title?: string) => {
        showToast({ type: "error", message, title: title ?? "Error" });
    }, [showToast]);

    const warning = useCallback((message: string, title?: string) => {
        showToast({ type: "warning", message, title: title ?? "Advertencia" });
    }, [showToast]);

    const info = useCallback((message: string, title?: string) => {
        showToast({ type: "info", message, title: title ?? "Información" });
    }, [showToast]);

    return (
        <ToastContext.Provider value={{ toasts, showToast, success, error, warning, info, removeToast }}>
            {children}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </ToastContext.Provider>
    );
}

// ============================================================================
// TOAST CONTAINER
// ============================================================================

interface ToastContainerProps {
    toasts: Toast[];
    onRemove: (id: string) => void;
}

function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 w-full max-w-[350px] pointer-events-none pr-4 md:pr-0">
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
            ))}
        </div>
    );
}

// ============================================================================
// TOAST ITEM
// ============================================================================

interface ToastItemProps {
    toast: Toast;
    onRemove: (id: string) => void;
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
    const iconMap: Record<ToastType, React.ReactElement> = {
        success: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
        ),
        error: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
        ),
        warning: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
        ),
        info: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
        ),
    };

    const iconStyles = {
        success: "text-green-500",
        error: "text-red-500",
        warning: "text-yellow-500",
        info: "text-blue-500"
    };

    return (
        <div className={`
            relative overflow-hidden pointer-events-auto flex w-full items-start gap-3 rounded-2xl p-4 pr-10 
            transition duration-400 ease-out animate-in slide-in-from-top-4 md:slide-in-from-right-full 
            border border-border/30 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)]
            bg-background/70 dark:bg-card/50
        `}>
            {/* Tinte decorativo sutil en el borde izquierdo */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl opacity-80
                ${toast.type === 'success' ? 'bg-green-500' : ''}
                ${toast.type === 'error' ? 'bg-red-500' : ''}
                ${toast.type === 'warning' ? 'bg-yellow-500' : ''}
                ${toast.type === 'info' ? 'bg-blue-500' : ''}
            `} />

            <div className={`h-5 w-5 mt-0.5 shrink-0 ml-1 ${iconStyles[toast.type]}`}>
                {iconMap[toast.type]}
            </div>
            <div className="flex-1 grid gap-1">
                {toast.title && <div className="font-semibold text-sm tracking-tight">{toast.title}</div>}
                <div className="text-sm text-foreground/80 leading-snug">{toast.message}</div>
            </div>
            <button
                className="absolute right-2 top-2 rounded-md p-1 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                onClick={() => onRemove(toast.id)}
                aria-label="Cerrar"
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
            </button>
        </div>
    );
}


