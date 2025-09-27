import { createContext, useContext } from 'react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'pending';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  txHash?: string;
  autoClose?: boolean;
  duration?: number;
}

export interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => string;
  removeNotification: (id: string) => void;
  updateNotification: (id: string, updates: Partial<Notification>) => void;
  clearAll: () => void;
}

export const NotificationContext = createContext<NotificationContextType | null>(null);

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}