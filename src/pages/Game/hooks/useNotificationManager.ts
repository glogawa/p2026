import { useState, useCallback } from 'react';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type?: 'info' | 'warning' | 'success' | 'error';
}

export const useNotificationManager = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeNotification, setActiveNotification] = useState<Notification | null>(null);

  const showNotification = useCallback((title: string, message: string, type?: 'info' | 'warning' | 'success' | 'error') => {
    const id = `notification-${Date.now()}-${Math.random()}`;
    const notification: Notification = { id, title, message, type };
    
    setNotifications((prev) => [...prev, notification]);
    setActiveNotification(notification);
    
    return id;
  }, []);

  const closeNotification = useCallback(() => {
    setActiveNotification(null);
  }, []);

  const closeNotificationById = useCallback((id: string) => {
    if (activeNotification?.id === id) {
      setActiveNotification(null);
    }
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, [activeNotification]);

  return {
    notifications,
    activeNotification,
    showNotification,
    closeNotification,
    closeNotificationById,
  };
};

export default useNotificationManager;
