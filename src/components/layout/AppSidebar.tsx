import { useLocation } from 'react-router-dom';
import image from '@/assets/image.png'; // Ensure this path is correct

import {
  BarChart3,
  Car,
  Calendar,
  Users,
  Settings,
  FileText,
  Key,
  ArrowLeftRight,
  BookOpen,
  Shield,
  Home,
  MessageSquare
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar';

import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/auth';

// Navigation items based on user role
const navigationItems: Record<UserRole, Array<{
  title: string;
  url: string;
  icon: any;
  group: string;
}>> = {
  super_admin: [
    { title: 'Dashboard', url: '/super_admin', icon: Home, group: 'Overview' },
    { title: 'Messages', url: '/super-admin/messages', icon: MessageSquare, group: 'Communication' },
    { title: 'Admins', url: '/super_admin/admins', icon: Shield, group: 'System Management' },
    { title: 'All Users', url: '/super_admin/users', icon: Users, group: 'System Management' },
    { title: 'All Vehicles', url: '/super_admin/vehicles', icon: Car, group: 'System Management' },
    { title: 'System Reports', url: '/super_admin/reports', icon: FileText, group: 'Reports' },
    { title: 'Analytics', url: '/super_admin/analytics', icon: BarChart3, group: 'Reports' },
  ],
  admin: [
    { title: 'Dashboard', url: '/admin', icon: Home, group: 'Overview' },
    { title: 'Analytics', url: '/admin/analytics', icon: BarChart3, group: 'Overview' },
    { title: 'Messages', url: '/admin/messages', icon: MessageSquare, group: 'Communication' },
    { title: 'Vehicles', url: '/admin/vehicles', icon: Car, group: 'Management' },
    { title: 'Users', url: '/admin/users', icon: Users, group: 'Management' },
    { title: 'Bookings', url: '/admin/bookings', icon: Calendar, group: 'Management' },
    { title: 'Service Records', url: '/admin/service-records', icon: Settings, group: 'Maintenance' },
    { title: 'Reports', url: '/admin/reports', icon: FileText, group: 'Reports' },
  ],
  trainer: [
    { title: 'Dashboard', url: '/trainer', icon: Home, group: 'Overview' },
    { title: 'Messages', url: '/trainer/messages', icon: MessageSquare, group: 'Communication' },
    { title: 'Book Vehicle', url: '/trainer/book', icon: Car, group: 'Booking' },
    { title: 'My Bookings', url: '/trainer/bookings', icon: Calendar, group: 'Booking' },
  ],
  security: [
    { title: 'Dashboard', url: '/security', icon: Home, group: 'Overview' },
    { title: 'Messages', url: '/security/messages', icon: MessageSquare, group: 'Communication' },
    { title: 'Issue Keys', url: '/security/keys', icon: Key, group: 'Operations' },
    { title: 'Vehicle Returns', url: '/security/returns', icon: ArrowLeftRight, group: 'Operations' },
    { title: 'Security Logs', url: '/security/logs', icon: Shield, group: 'Monitoring' },
  ],
};

export function AppSidebar() {
  const { user } = useAuth();
  const { state } = useSidebar();
  const location = useLocation();

  if (!user) return null;

  const items = navigationItems[user.role];
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.group]) {
      acc[item.group] = [];
    }
    acc[item.group].push(item);
    return acc;
  }, {} as Record<string, typeof items>);

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar className="border-r border-border">
      <SidebarHeader className="p-4 border-b border-border">
        <div className="flex items-center space-x-3">
          {state === 'expanded' && (
            <div className="flex flex-col">
              <img
                src={image}
                alt="Skoda Auto Volkswagen India Private Limited"
                className="h-10 object-contain"
              />
              <p className="text-sm text-muted-foreground capitalize mt-1">
                {user.role} Portal
              </p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {Object.entries(groupedItems).map(([groupName, groupItems]) => (
          <SidebarGroup key={groupName}>
            {state === 'expanded' && (
              <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {groupName}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {groupItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.url)}
                      className="nav-item"
                    >
                      <a
                        href={item.url}
                        className="flex items-center space-x-3 p-3"
                        onClick={(e) => {
                          e.preventDefault();
                          window.location.href = item.url;
                        }}
                      >
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        {state === 'expanded' && (
                          <span className="font-medium">{item.title}</span>
                        )}
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}