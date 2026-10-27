import type React from 'react';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Toast, type ToastVariant } from '@/components/ui';

export interface ToastMessage {
  id: string;
  message: string;
  variant?: ToastVariant;
  actionLabel?: string;
  onAction?: () => void;
  durationMs?: number;
}

interface ToastHostContextValue {
  showToast: (message: Omit<ToastMessage, 'id'>) => string;
  dismissToast: (id: string) => void;
  dismissAll: () => void;
}

const ToastHostContext = createContext<ToastHostContextValue | null>(null);

function createId(): string {
  return `toast_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export interface ToastHostProps {
  children: React.ReactNode;
  maxToasts?: number;
}

export function ToastHost({ children, maxToasts = 3 }: ToastHostProps): React.JSX.Element {
  const [toasts, setToasts] = useState<readonly ToastMessage[]>([]);
  const insets = useSafeAreaInsets();

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: Omit<ToastMessage, 'id'>) => {
      const id = createId();
      const toast: ToastMessage = { ...message, id };

      setToasts((current) => {
        const next = [...current, toast];

        return next.slice(-maxToasts);
      });

      return id;
    },
    [maxToasts],
  );

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  const value = useMemo(
    () => ({ showToast, dismissToast, dismissAll }),
    [dismissToast, dismissAll, showToast],
  );

  return (
    <ToastHostContext.Provider value={value}>
      {children}
      <View
        pointerEvents="box-none"
        className="absolute left-0 right-0 items-center gap-s px-l"
        style={{ top: 0, paddingTop: insets.top + 16 }}
        testID="toast-host-container"
      >
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            visible
            message={toast.message}
            variant={toast.variant}
            actionLabel={toast.actionLabel}
            onAction={toast.onAction}
            onDismiss={() => dismissToast(toast.id)}
          />
        ))}
      </View>
    </ToastHostContext.Provider>
  );
}

export function useToast(): ToastHostContextValue {
  const context = useContext(ToastHostContext);

  if (context === null) {
    throw new Error('useToast must be used within a ToastHost');
  }

  return context;
}
