"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle, AlertCircle, X } from "lucide-react";

interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

interface ToastContextType {
  showToast: (type: ToastMessage["type"], message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((type: ToastMessage["type"], message: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    setToasts((prev) => [...prev.slice(-4), { id, type, message }]);

    // Auto-dismiss after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast Container */}
      <div
        className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none"
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl border backdrop-blur-md max-w-sm animate-slide-in-toast font-sans text-xs font-semibold ${
              toast.type === "success"
                ? "bg-brand-forest/95 border-brand-forest/30 text-brand-cream-light"
                : toast.type === "error"
                ? "bg-brand-terracotta/95 border-brand-terracotta/30 text-brand-cream-light"
                : "bg-brand-espresso/95 border-brand-espresso/30 text-brand-cream-light"
            }`}
            role="alert"
          >
            {toast.type === "success" ? (
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
            ) : toast.type === "error" ? (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            <span className="flex-1">{toast.message}</span>
            <button
              onClick={() => dismiss(toast.id)}
              className="p-1 hover:opacity-70 transition-opacity flex-shrink-0"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
