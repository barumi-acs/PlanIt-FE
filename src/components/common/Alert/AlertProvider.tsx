/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createContext, useState, useCallback, type ReactNode } from 'react';
import { Alert } from './Alert';
import type { AlertOptions, AlertContextType } from './types';

export const AlertContext = createContext<AlertContextType | undefined>(undefined);

interface AlertProviderProps {
  children: ReactNode;
}

export const AlertProvider = ({ children }: AlertProviderProps) => {
  const [alerts, setAlerts] = useState<AlertOptions[]>([]);

  const showAlert = useCallback((options: Omit<AlertOptions, 'id'>) => {
    const id = `alert-${Date.now()}-${Math.random()}`;
    const newAlert: AlertOptions = {
      id,
      duration: 3000,
      ...options,
    };

    setAlerts((prev) => {
      // 최대 3개까지만 표시
      const updated = [...prev, newAlert];
      return updated.slice(-3);
    });
  }, []);

  const hideAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  }, []);

  const success = useCallback((message: string, duration?: number) => {
    showAlert({ type: 'success', message, duration });
  }, [showAlert]);

  const error = useCallback((message: string, duration?: number) => {
    showAlert({ type: 'error', message, duration });
  }, [showAlert]);

  const warning = useCallback((message: string, duration?: number) => {
    showAlert({ type: 'warning', message, duration });
  }, [showAlert]);

  const info = useCallback((message: string, duration?: number) => {
    showAlert({ type: 'info', message, duration });
  }, [showAlert]);

  return (
    <AlertContext.Provider
      value={{
        alerts,
        showAlert,
        hideAlert,
        success,
        error,
        warning,
        info,
      }}
    >
      {children}

      {/* Alert Container - 화면 중앙에 고정 */}
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] flex flex-col gap-2 pointer-events-none"
        aria-live="polite"
        aria-atomic="true"
      >
        {alerts.map((alert) => (
          <div key={alert.id} className="pointer-events-auto">
            <Alert
              {...alert}
              onClose={() => hideAlert(alert.id)}
            />
          </div>
        ))}
      </div>
    </AlertContext.Provider>
  );
};
