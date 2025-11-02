import { Car, Users, Calendar, Settings, TrendingUp, AlertTriangle, MapPin } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { getLocationName } from '@/constants/locations';
import { useVehicles } from '@/hooks/useVehicles';
import { useBookings } from '@/hooks/useBookings';
import { useLocationFilter } from '@/hooks/useLocationFilter';
import { useNavigate } from 'react-router-dom';
import { format, isBefore, parseISO, differenceInHours } from 'date-fns';
import { useEffect, useState } from 'react';

interface VehicleRecord {
  id: string;
  academyLocation: string;
  vehicleRegNo: string;
  insuranceStatus: string;
  pucStatus: string;
  insuranceValidityDate?: string;
  pucValidityDate?: string;
  nextServiceDate?: string;
}

interface User {
  id: string;
  name: string;
  role: string;
  status: string;
  location?: string;
}

const STORAGE_KEY_USERS = 'app_users';
const STORAGE_KEY_RECORDS = 'app_vehicle_records';

const getUsers = (): User[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_USERS);
    return stored ? JSON.parse(stored) : [];
  } catch (err) {
    console.error('Error loading users from localStorage:', err);
    return [];
  }
};

const getVehicleRecords = (): VehicleRecord[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_RECORDS);
    return stored ? JSON.parse(stored) : [];
  } catch (err) {
    console.error('Error loading vehicle records from localStorage:', err);
    return [];
  }
};

export function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { vehicles, isLoading: vehiclesLoading } = useVehicles();
  const { bookings, loading: bookingsLoading } = useBookings();
  const { filterByLocation } = useLocationFilter();
  
  // Get admin's location
  const adminLocation = user?.location ? (user.location === 'PTC' ? 'Pune' : user.location === 'BLR' ? 'Bangalore' : user.location) : 'Pune';
  
  // Load users and service records
  const [users, setUsers] = useState<User[]>([]);
  const [records, setRecords] = useState<VehicleRecord[]>([]);
  
  useEffect(() => {
    const allUsers = getUsers();
    const allRecords = getVehicleRecords();
    
    // Filter by location
    const locationUsers = filterByLocation(allUsers.map(u => ({
      ...u,
      location: u.location || user?.location
    }))) as User[];
    
    const locationRecords = filterByLocation(allRecords.map(r => ({
      ...r,
      location: r.academyLocation
    }))) as VehicleRecord[];
    
    setUsers(locationUsers);
    setRecords(locationRecords);
  }, [user?.location, filterByLocation]);
  
  // Filter vehicles and bookings by location
  const locationVehicles = filterByLocation(vehicles.map(v => ({
    ...v,
    location: v.location
  })));
  
  const locationBookings = filterByLocation(bookings.map(b => ({
    ...b,
    location: b.requestedLocation
  })));
  
  // Calculate dynamic stats
  const stats = {
    totalVehicles: locationVehicles.length,
    activeBookings: locationBookings.filter(b => b.status === 'active').length,
    totalUsers: users.filter(u => u.status === 'active').length,
    maintenanceDue: records.filter(r => 
      r.insuranceStatus === 'Expired' || 
      r.pucStatus === 'Expired' ||
      (r.nextServiceDate && isBefore(parseISO(r.nextServiceDate), new Date()))
    ).length + locationVehicles.filter((v: any) => v.status === 'Maintenance').length,
  };
  
  // Calculate trends (comparing with last month - simplified for now)
  const lastMonthVehicles = Math.max(0, stats.totalVehicles - 8);
  const lastMonthBookings = Math.max(0, stats.activeBookings - 3);
  const lastMonthUsers = Math.max(0, stats.totalUsers - 2);
  
  const vehicleTrend = stats.totalVehicles > 0 ? ((stats.totalVehicles - lastMonthVehicles) / Math.max(1, lastMonthVehicles)) * 100 : 0;
  const bookingTrend = stats.activeBookings > 0 ? ((stats.activeBookings - lastMonthBookings) / Math.max(1, lastMonthBookings)) * 100 : 0;
  const userTrend = stats.totalUsers > 0 ? ((stats.totalUsers - lastMonthUsers) / Math.max(1, lastMonthUsers)) * 100 : 0;
  
  // Get recent bookings (last 5)
  const recentBookings = locationBookings
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .map(booking => {
      const vehicle = locationVehicles.find((v: any) => v.id === booking.vehicleId);
      const startDate = parseISO(booking.startDate);
      const endDate = parseISO(booking.endDate);
      const duration = differenceInHours(endDate, startDate);
      
      return {
        id: booking.id,
        vehicle: vehicle ? `${(vehicle as any).brand} ${(vehicle as any).model} - ${(vehicle as any).regNo}` : 'Unknown Vehicle',
        trainer: booking.trainerName,
        date: format(startDate, 'MMM dd, yyyy'),
        status: booking.status,
        duration: `${duration} hours`
      };
    });
  
  // Get maintenance alerts
  const maintenanceAlerts = [
    ...records
      .filter(r => r.insuranceStatus === 'Expired' || r.pucStatus === 'Expired')
      .map(r => {
        const vehicle = locationVehicles.find((v: any) => v.regNo === r.vehicleRegNo);
        return {
          id: `insurance-${r.id}`,
          vehicle: vehicle ? `${(vehicle as any).brand} ${(vehicle as any).model} - ${(vehicle as any).regNo}` : r.vehicleRegNo,
          type: r.insuranceStatus === 'Expired' ? 'Insurance Expired' : 'PUC Expired',
          dueDate: r.insuranceStatus === 'Expired' && r.insuranceValidityDate 
            ? format(parseISO(r.insuranceValidityDate), 'MMM dd, yyyy')
            : r.pucStatus === 'Expired' && r.pucValidityDate
            ? format(parseISO(r.pucValidityDate), 'MMM dd, yyyy')
            : 'N/A',
          priority: 'high' as const
        };
      }),
    ...records
      .filter(r => r.nextServiceDate && isBefore(parseISO(r.nextServiceDate), new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)))
      .map(r => {
        const vehicle = locationVehicles.find((v: any) => v.regNo === r.vehicleRegNo);
        return {
          id: `service-${r.id}`,
          vehicle: vehicle ? `${(vehicle as any).brand} ${(vehicle as any).model} - ${(vehicle as any).regNo}` : r.vehicleRegNo,
          type: 'Service Due',
          dueDate: r.nextServiceDate ? format(parseISO(r.nextServiceDate), 'MMM dd, yyyy') : 'N/A',
          priority: isBefore(parseISO(r.nextServiceDate!), new Date()) ? 'high' as const : 'medium' as const
        };
      }),
    ...locationVehicles
      .filter((v: any) => v.status === 'Maintenance')
      .map((v: any) => ({
        id: `maintenance-${v.id}`,
        vehicle: `${v.brand} ${v.model} - ${v.regNo}`,
        type: 'Under Maintenance',
        dueDate: 'N/A',
        priority: 'high' as const
      }))
  ].slice(0, 5);
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-success text-success-foreground">Active</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-blue-500 text-white">Approved</Badge>;
      case 'completed':
        return <Badge variant="secondary">Completed</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'cancelled':
        return <Badge variant="outline">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge className="bg-warning text-warning-foreground">Medium</Badge>;
      case 'low':
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };
  
  const isLoading = vehiclesLoading || bookingsLoading;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            {user?.location && (
              <Badge variant="outline" className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {getLocationName(user.location)}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            Overview of fleet operations and system management {user?.location && `at ${getLocationName(user.location)}`}
          </p>
        </div>
        <Button className="bg-gradient-primary hover:bg-primary-hover"
        onClick={() => window.location.href = '/admin/reports'}
        >
          Generate Report
        </Button>
      </div>

      {/* Stats Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 w-24 bg-muted rounded mb-4"></div>
                <div className="h-8 w-16 bg-muted rounded mb-2"></div>
                <div className="h-3 w-32 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Vehicles"
            value={stats.totalVehicles}
            description="Active fleet vehicles"
            icon={Car}
            trend={{ value: Math.round(vehicleTrend), isPositive: vehicleTrend >= 0 }}
          />
          <StatCard
            title="Active Bookings"
            value={stats.activeBookings}
            description="Current reservations"
            icon={Calendar}
            trend={{ value: Math.round(bookingTrend), isPositive: bookingTrend >= 0 }}
          />
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            description="Registered system users"
            icon={Users}
            trend={{ value: Math.round(userTrend), isPositive: userTrend >= 0 }}
          />
          <StatCard
            title="Maintenance Due"
            value={stats.maintenanceDue}
            description="Vehicles requiring service"
            icon={AlertTriangle}
            className="border-warning"
          />
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Bookings */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Recent Bookings</span>
            </CardTitle>
            <CardDescription>
              Latest vehicle reservations and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse p-3 bg-muted/50 rounded-lg">
                    <div className="h-4 w-48 bg-muted rounded mb-2"></div>
                    <div className="h-3 w-32 bg-muted rounded mb-1"></div>
                    <div className="h-3 w-24 bg-muted rounded"></div>
                  </div>
                ))}
              </div>
            ) : recentBookings.length > 0 ? (
              <div className="space-y-4">
                {recentBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors cursor-pointer"
                    onClick={() => navigate('/admin/bookings')}
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{booking.vehicle}</p>
                      <p className="text-sm text-muted-foreground">
                        {booking.trainer} • {booking.duration}
                      </p>
                      <p className="text-xs text-muted-foreground">{booking.date}</p>
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No recent bookings</p>
              </div>
            )}
            <div className="mt-4 pt-4 border-t">
              <Button 
                variant="ghost" 
                className="w-full"
                onClick={() => navigate('/admin/bookings')}
              >
                View All Bookings
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Maintenance Alerts */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Maintenance Alerts</span>
            </CardTitle>
            <CardDescription>
              Vehicles requiring attention or scheduled maintenance
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2].map(i => (
                  <div key={i} className="animate-pulse p-3 bg-muted/50 rounded-lg">
                    <div className="h-4 w-48 bg-muted rounded mb-2"></div>
                    <div className="h-3 w-32 bg-muted rounded mb-1"></div>
                    <div className="h-3 w-24 bg-muted rounded"></div>
                  </div>
                ))}
              </div>
            ) : maintenanceAlerts.length > 0 ? (
              <div className="space-y-4">
                {maintenanceAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors cursor-pointer"
                    onClick={() => navigate('/admin/vehicles')}
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{alert.vehicle}</p>
                      <p className="text-sm text-muted-foreground">{alert.type}</p>
                      {alert.dueDate !== 'N/A' && (
                        <p className="text-xs text-muted-foreground">Due: {alert.dueDate}</p>
                      )}
                    </div>
                    {getPriorityBadge(alert.priority)}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Settings className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No maintenance alerts</p>
              </div>
            )}
            <div className="mt-4 pt-4 border-t">
              <Button 
                variant="ghost" 
                className="w-full"
                onClick={() => navigate('/admin/vehicles')}
              >
                View All Maintenance
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}