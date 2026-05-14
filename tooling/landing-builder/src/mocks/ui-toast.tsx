import React from 'react';

export function useToast() {
  const toast = (() => {}) as any;
  toast.success = () => {};
  toast.error = () => {};
  toast.warning = () => {};
  toast.info = () => {};

  return {
    toasts: [],
    showToast: () => {},
    success: () => {},
    error: () => {},
    warning: () => {},
    info: () => {},
    removeToast: () => {},
    toast: toast,
  };
}

export function ToastProvider({ children }: any) {
  return <>{children}</>;
}
