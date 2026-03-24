import React from 'react';

export function useToast() {
  return {
    toasts: [],
    showToast: () => {},
    success: () => {},
    error: () => {},
    warning: () => {},
    info: () => {},
    removeToast: () => {},
  };
}

export function ToastProvider({ children }: any) {
  return <>{children}</>;
}
