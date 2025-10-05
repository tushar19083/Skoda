import { useState, useEffect } from 'react';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

// Mock notifications data
const mockNotifications: Notification[] = [
  {
    id: 'notif_001',
    title: 'Vehicle Maintenance Required',
    message: 'VW Tiguan AllSpace (MH14JH4308) requires battery replacement',
    type: 'warning',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    read: false,
    actionUrl: '/admin/service-records'
  },
  {
    id: 'notif_002',
    title: 'PUC Expired',
    message: 'VW T Roc (MH14JH4307) PUC certificate has expired',
    type: 'error',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    read: false,
    actionUrl: '/admin/vehicle-management'
  },
  {
    id: 'notif_003',
    title: 'Training Completed',
    message: 'Diagnostics training completed for Mahesh Deshmukh',
    type: 'success',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
    read: false,
    actionUrl: '/admin/bookings'
  },
  {
    id: 'notif_004',
    title: 'Insurance Renewal Due',
    message: 'VW Taigun (MH14JU1691) insurance expires in 2 months',
    type: 'info',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    read: true,
    actionUrl: '/admin/vehicle-management'
  },
  {
    id: 'notif_005',
    title: 'Vehicle Breakdown',
    message: 'VW Virtus (MH14KN0378) reported not moving - under repair',
    type: 'error',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    read: true,
    actionUrl: '/admin/service-records'
  }
];

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification
  };
}