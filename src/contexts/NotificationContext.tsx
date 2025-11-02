import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useBookings } from '@/hooks/useBookings';
import { useVehicles } from '@/hooks/useVehicles';

export type NotificationType = 
  | 'booking_created' 
  | 'booking_approved' 
  | 'booking_rejected' 
  | 'booking_cancelled'
  | 'key_issued'
  | 'vehicle_returned'
  | 'damage_reported'
  | 'parts_requested'
  | 'maintenance_required'
  | 'service_record_added'
  | 'booking_active'
  | 'booking_completed';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  userId: string; // User who should receive this notification
  relatedEntityType?: 'booking' | 'vehicle' | 'service_record' | 'damage_report' | 'parts_request';
  relatedEntityId?: string;
  actionUrl?: string;
  read: boolean;
  timestamp: Date;
  metadata?: Record<string, any>;
  // For email (future backend integration)
  emailSent?: boolean;
  emailSentAt?: Date;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  getUserNotifications: () => Notification[];
  // Workflow notification helpers
  notifyBookingCreated: (bookingId: string, trainerName: string, vehicleName: string, location: string) => void;
  notifyBookingApproved: (bookingId: string, trainerId: string, vehicleName: string) => void;
  notifyBookingRejected: (bookingId: string, trainerId: string, vehicleName: string, reason?: string) => void;
  notifyKeyIssued: (bookingId: string, trainerId: string, vehicleName: string, securityName: string) => void;
  notifyVehicleReturned: (bookingId: string, trainerId: string, vehicleName: string, securityName: string, condition: string) => void;
  notifyDamageReported: (bookingId: string, vehicleId: string, trainerId: string, vehicleName: string, location: string) => void;
  notifyPartsRequested: (bookingId: string, vehicleId: string, trainerId: string, vehicleName: string, location: string) => void;
  notifyMaintenanceRequired: (vehicleId: string, vehicleName: string, location: string, reason: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const STORAGE_KEY = 'app_notifications';

// Helper to get admin user ID for a location
const getAdminIdForLocation = (location: string): string | null => {
  try {
    const users = JSON.parse(localStorage.getItem('app_users') || '[]');
    const admin = users.find((u: any) => 
      u.role === 'admin' && 
      (u.location === location || 
       u.location === 'PTC' && location === 'Pune' ||
       u.location === 'BLR' && location === 'Bangalore' ||
       (u.location || '').toLowerCase() === location.toLowerCase())
    );
    return admin?.id || null;
  } catch {
    return null;
  }
};

// Helper to get security user ID for a location
const getSecurityIdForLocation = (location: string): string | null => {
  try {
    const users = JSON.parse(localStorage.getItem('app_users') || '[]');
    const security = users.find((u: any) => 
      u.role === 'security' && 
      (u.location === location || 
       u.location === 'PTC' && location === 'Pune' ||
       u.location === 'BLR' && location === 'Bangalore' ||
       (u.location || '').toLowerCase() === location.toLowerCase())
    );
    return security?.id || null;
  } catch {
    return null;
  }
};

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { bookings } = useBookings();
  const { vehicles } = useVehicles();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Load notifications from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setNotifications(parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp),
          emailSentAt: n.emailSentAt ? new Date(n.emailSentAt) : undefined,
        })));
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  }, []);

  // Save notifications to localStorage
  useEffect(() => {
    try {
      if (notifications.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
      }
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  }, [notifications]);

  // Monitor bookings for status changes and create notifications
  // Note: This is disabled as notifications are now triggered directly from components
  // useEffect(() => {
  //   if (!bookings.length || !vehicles.length) return;
  //   // Check for newly created bookings (status: pending)
  //   bookings.forEach(booking => {
  //     if (booking.status === 'pending') {
  //       const existingNotification = notifications.find(n => 
  //         n.type === 'booking_created' && 
  //         n.relatedEntityId === booking.id
  //       );
  //       
  //       if (!existingNotification && booking.createdAt) {
  //         const createdTime = new Date(booking.createdAt);
  //         const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  //         
  //         // Only create notification for recent bookings (within last 5 minutes)
  //         if (createdTime > fiveMinutesAgo) {
  //           const vehicle = vehicles.find(v => v.id === booking.vehicleId);
  //           const vehicleName = vehicle 
  //             ? `${vehicle.brand} ${vehicle.model} (${vehicle.regNo || (vehicle as any).vehicleRegNo || 'N/A'})` 
  //             : 'Unknown Vehicle';
  //           notifyBookingCreated(booking.id, booking.trainerName, vehicleName, booking.requestedLocation);
  //         }
  //       }
  //     }
  //   });
  // }, [bookings.length, vehicles.length, notifications]);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      read: false,
    };
    
    setNotifications(prev => {
      // Check for duplicate notifications (same type, entity, and user)
      const duplicate = prev.find(n => 
        n.type === newNotification.type &&
        n.userId === newNotification.userId &&
        n.relatedEntityId === newNotification.relatedEntityId
      );
      
      if (duplicate) {
        // Update existing notification instead of creating duplicate
        return prev.map(n => 
          n.id === duplicate.id 
            ? { ...newNotification, id: duplicate.id, timestamp: n.timestamp }
            : n
        );
      }
      
      return [newNotification, ...prev];
    });
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
    // Save immediately
    try {
      const updated = notifications.map(n => (n.id === id ? { ...n, read: true } : n));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  };

  const markAllAsRead = () => {
    if (!user) return;
    const userNotifications = notifications.filter(n => n.userId === user.id);
    const updatedIds = new Set(userNotifications.map(n => n.id));
    
    setNotifications(prev =>
      prev.map(n => updatedIds.has(n.id) ? { ...n, read: true } : n)
    );
    
    // Save immediately
    try {
      const updated = notifications.map(n => updatedIds.has(n.id) ? { ...n, read: true } : n);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getUserNotifications = (): Notification[] => {
    if (!user) return [];
    return notifications
      .filter(n => n.userId === user.id)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  };

  // Workflow notification helpers
  const notifyBookingCreated = (bookingId: string, trainerName: string, vehicleName: string, location: string) => {
    // Notify admin for the location
    const adminId = getAdminIdForLocation(location);
    if (adminId) {
      addNotification({
        type: 'booking_created',
        title: 'New Booking Request',
        message: `${trainerName} has requested to book ${vehicleName} at ${location}`,
        userId: adminId,
        relatedEntityType: 'booking',
        relatedEntityId: bookingId,
        actionUrl: `/admin/bookings`,
      });
    }

    // Trainer notification is sent directly from BookVehicle component after booking creation
  };

  const notifyBookingApproved = (bookingId: string, trainerId: string, vehicleName: string) => {
    // Notify trainer
    addNotification({
      type: 'booking_approved',
      title: 'Booking Approved',
      message: `Your booking for ${vehicleName} has been approved. Please contact security to collect the key.`,
      userId: trainerId,
      relatedEntityType: 'booking',
      relatedEntityId: bookingId,
      actionUrl: `/trainer/bookings`,
    });

    // Notify security
    const booking = bookings.find(b => b.id === bookingId);
    if (booking?.requestedLocation) {
      const securityId = getSecurityIdForLocation(booking.requestedLocation);
      if (securityId) {
        addNotification({
          type: 'booking_approved',
          title: 'New Key Issue Required',
          message: `Approved booking for ${vehicleName} is ready for key issue`,
          userId: securityId,
          relatedEntityType: 'booking',
          relatedEntityId: bookingId,
          actionUrl: `/security/keys`,
        });
      }
    }
  };

  const notifyBookingRejected = (bookingId: string, trainerId: string, vehicleName: string, reason?: string) => {
    addNotification({
      type: 'booking_rejected',
      title: 'Booking Rejected',
      message: `Your booking for ${vehicleName} has been rejected.${reason ? ` Reason: ${reason}` : ''}`,
      userId: trainerId,
      relatedEntityType: 'booking',
      relatedEntityId: bookingId,
      actionUrl: `/trainer/bookings`,
    });
  };

  const notifyKeyIssued = (bookingId: string, trainerId: string, vehicleName: string, securityName: string) => {
    // Notify trainer
    addNotification({
      type: 'key_issued',
      title: 'Key Issued',
      message: `Key for ${vehicleName} has been issued by ${securityName}. Your booking is now active.`,
      userId: trainerId,
      relatedEntityType: 'booking',
      relatedEntityId: bookingId,
      actionUrl: `/trainer/bookings`,
    });
  };

  const notifyVehicleReturned = (bookingId: string, trainerId: string, vehicleName: string, securityName: string, condition: string) => {
    // Notify trainer
    addNotification({
      type: 'vehicle_returned',
      title: 'Vehicle Returned',
      message: `Vehicle ${vehicleName} has been returned and verified by ${securityName}. Condition: ${condition}`,
      userId: trainerId,
      relatedEntityType: 'booking',
      relatedEntityId: bookingId,
      actionUrl: `/trainer/bookings`,
    });

    // Notify admin
    const booking = bookings.find(b => b.id === bookingId);
    if (booking?.requestedLocation) {
      const adminId = getAdminIdForLocation(booking.requestedLocation);
      if (adminId) {
        addNotification({
          type: 'vehicle_returned',
          title: 'Vehicle Returned',
          message: `${vehicleName} has been returned from booking. Condition: ${condition}`,
          userId: adminId,
          relatedEntityType: 'booking',
          relatedEntityId: bookingId,
          actionUrl: `/admin/bookings`,
        });
      }
    }
  };

  const notifyDamageReported = (bookingId: string, vehicleId: string, trainerId: string, vehicleName: string, location: string) => {
    const adminId = getAdminIdForLocation(location);
    if (adminId) {
      addNotification({
        type: 'damage_reported',
        title: 'Vehicle Damage Reported',
        message: `Damage has been reported for ${vehicleName}. Please review and take appropriate action.`,
        userId: adminId,
        relatedEntityType: 'damage_report',
        relatedEntityId: bookingId,
        actionUrl: `/admin/bookings`,
        metadata: { vehicleId, bookingId },
      });
    }
  };

  const notifyPartsRequested = (bookingId: string, vehicleId: string, trainerId: string, vehicleName: string, location: string) => {
    const adminId = getAdminIdForLocation(location);
    if (adminId) {
      addNotification({
        type: 'parts_requested',
        title: 'Parts Request',
        message: `Parts have been requested for ${vehicleName}. Please review and fulfill the request.`,
        userId: adminId,
        relatedEntityType: 'parts_request',
        relatedEntityId: bookingId,
        actionUrl: `/admin/bookings`,
        metadata: { vehicleId, bookingId },
      });
    }
  };

  const notifyMaintenanceRequired = (vehicleId: string, vehicleName: string, location: string, reason: string) => {
    const adminId = getAdminIdForLocation(location);
    if (adminId) {
      addNotification({
        type: 'maintenance_required',
        title: 'Maintenance Required',
        message: `${vehicleName} requires maintenance: ${reason}`,
        userId: adminId,
        relatedEntityType: 'vehicle',
        relatedEntityId: vehicleId,
        actionUrl: `/admin/vehicles`,
        metadata: { location, reason },
      });
    }
  };

  const unreadCount = user ? notifications.filter(n => n.userId === user.id && !n.read).length : 0;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        getUserNotifications,
        notifyBookingCreated,
        notifyBookingApproved,
        notifyBookingRejected,
        notifyKeyIssued,
        notifyVehicleReturned,
        notifyDamageReported,
        notifyPartsRequested,
        notifyMaintenanceRequired,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

