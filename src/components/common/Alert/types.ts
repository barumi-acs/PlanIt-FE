/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AlertType = 'success' | 'error' | 'warning' | 'info';

export interface AlertOptions {
  id: string;
  type: AlertType;
  message: string;
  duration?: number;
}

export interface AlertContextType {
  alerts: AlertOptions[];
  showAlert: (options: Omit<AlertOptions, 'id'>) => void;
  hideAlert: (id: string) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}
