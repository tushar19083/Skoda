import { Bell, Clock, CheckCheck, X, AlertTriangle, Info, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useEffect, useState } from 'react';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  userId: string;
  read: boolean;
  timestamp: Date;
  actionUrl?: string;
}

export function NotificationDropdown() {
  const { getUserNotifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Load notifications and refresh on storage changes
  useEffect(() => {
    const loadNotifications = () => {
      try {
        const userNotifications = getUserNotifications();
        setNotifications(userNotifications);
      } catch (error) {
        console.error('Error loading notifications:', error);
        setNotifications([]);
      }
    };
    
    loadNotifications();
    
    // Listen for storage changes (cross-tab updates)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'app_notifications') {
        loadNotifications();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Periodic refresh (every 2 seconds)
    const interval = setInterval(loadNotifications, 2000);
    
    // Reload when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadNotifications();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking_rejected':
      case 'error':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'maintenance_required':
      case 'damage_reported':
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'booking_approved':
      case 'key_issued':
      case 'vehicle_returned':
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'booking_created':
      case 'parts_requested':
      case 'service_record_added':
      case 'booking_active':
      case 'booking_completed':
      case 'info':
      default:
        return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 h-5 w-5 bg-primary rounded-full flex items-center justify-center">
              <span className="text-xs text-primary-foreground font-bold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-semibold">Notifications</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="h-auto p-1 text-xs"
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No notifications</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`relative p-4 border-b hover:bg-muted/50 cursor-pointer transition-colors ${
                  !notification.read ? 'bg-muted/20' : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {notification.title}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mt-1">
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                      </div>
                      
                      {!notification.read && (
                        <div className="h-2 w-2 bg-primary rounded-full"></div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {notifications.length > 5 && (
          <div className="p-2 border-t">
            <Button variant="ghost" className="w-full text-sm">
              View all notifications
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}