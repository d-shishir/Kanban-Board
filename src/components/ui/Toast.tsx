import * as React from 'react';
import { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { cn } from '../../utils/cn';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (options: Omit<Toast, 'id'>) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback(({ title, description, type }: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, description, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000); // auto dismiss
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px] gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-4 pr-8 shadow-lg transition-all",
              "animate-in slide-in-from-right-full fade-in-0 duration-300",
              {
                "bg-background border-border text-foreground": t.type === 'info',
                "bg-destructive border-destructive text-destructive-foreground": t.type === 'error',
                "bg-green-600 border-green-600 text-white": t.type === 'success',
              }
            )}
          >
            <div className="flex gap-3 items-start">
              {t.type === 'success' && <CheckCircle2 className="h-5 w-5 mt-0.5" />}
              {t.type === 'error' && <AlertCircle className="h-5 w-5 mt-0.5" />}
              {t.type === 'info' && <Info className="h-5 w-5 mt-0.5" />}
              
              <div className="grid gap-1">
                {t.title && <div className="text-sm font-semibold">{t.title}</div>}
                {t.description && <div className="text-sm opacity-90">{t.description}</div>}
              </div>
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className={cn(
                "absolute right-2 top-2 rounded-md p-1 opacity-0 transition-opacity focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100",
                {
                   "text-foreground hover:text-foreground": t.type === 'info',
                   "text-red-300 hover:text-red-50 focus:ring-red-400 focus:ring-offset-red-600": t.type === 'error',
                   "text-green-300 hover:text-green-50 focus:ring-green-400 focus:ring-offset-green-600": t.type === 'success',
                }
              )}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
