import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/dashboard/StatCard';
import { Users, Car, MapPin, Shield, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { LOCATIONS, getLocationName } from '@/constants/locations';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const STORAGE_KEY_USERS = 'app_users';
const STORAGE_KEY_VEHICLES = 'app_fleet_vehicles';
const STORAGE_KEY_BOOKINGS = 'app_bookings';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  location?: string;
  status?: string;
  joinDate?: string;
}

interface Vehicle {
  id: string;
  academyLocation?: string;
  location?: string;
  status?: string;
}

interface Booking {
  id: string;
  requestedLocation: string;
  status: string;
}

interface AdminStats {
  id: string;
  name: string;
  email: string;
  location: string;
  status: string;
  joinDate: string;
  vehicles: number;
  trainers: number;
  bookings: number;
}

// Helper to normalize location
const normalizeLocation = (location: string): string => {
  if (!location) return '';
  const locationMap: Record<string, string> = {
    'Pune': 'PTC',
    'PTC': 'PTC',
    'VGTAP': 'VGTAP',
    'NCR': 'NCR',
    'BLR': 'BLR',
    'Bangalore': 'BLR',
  };
  return locationMap[location] || location;
};

// Get all users from localStorage
const getAllUsers = (): User[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_USERS);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (err) {
    console.error('Error loading users from localStorage:', err);
  }
  return [];
};

// Get all vehicles from localStorage
const getAllVehicles = (): Vehicle[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_VEHICLES);
    if (stored) {
      const vehicles = JSON.parse(stored);
      return vehicles.map((v: any) => ({
        ...v,
        academyLocation: v.academyLocation || v.location || 'Pune',
        location: v.academyLocation || v.location || 'Pune'
      }));
    }
  } catch (err) {
    console.error('Error loading vehicles from localStorage:', err);
  }
  return [];
};

// Get all bookings from localStorage
const getAllBookings = (): Booking[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_BOOKINGS);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (err) {
    console.error('Error loading bookings from localStorage:', err);
  }
  return [];
};

export function SuperAdminDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data from localStorage
  const loadData = () => {
    try {
      setLoading(true);
      const allUsers = getAllUsers();
      const allVehicles = getAllVehicles();
      const allBookings = getAllBookings();
      
      setUsers(allUsers);
      setVehicles(allVehicles);
      setBookings(allBookings);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  // Listen for storage changes (cross-tab updates)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY_USERS || e.key === STORAGE_KEY_VEHICLES || e.key === STORAGE_KEY_BOOKINGS) {
        loadData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Reload when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Reload when window gains focus
  useEffect(() => {
    const handleFocus = () => {
      loadData();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // Periodic check for updates (every 5 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      loadData();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Calculate dynamic statistics
  const stats = useMemo(() => {
    const admins = users.filter(u => u.role === 'admin');
    const uniqueLocations = new Set(
      admins.map(a => normalizeLocation(a.location || '')).filter(Boolean)
    );

    return {
      totalLocations: uniqueLocations.size || LOCATIONS.length,
      totalAdmins: admins.length,
      totalUsers: users.length,
      totalVehicles: vehicles.length,
    };
  }, [users, vehicles]);

  // Calculate admin statistics with location-based data
  const adminStats = useMemo((): AdminStats[] => {
    const admins = users.filter(u => u.role === 'admin');
    
    return admins.map(admin => {
      const adminLocation = normalizeLocation(admin.location || '');
      
      // Count vehicles for this admin's location
      const locationVehicles = vehicles.filter(v => {
        const vehicleLocation = normalizeLocation(v.academyLocation || v.location || '');
        return vehicleLocation === adminLocation;
      });
      
      // Count trainers for this admin's location
      const locationTrainers = users.filter(u => 
        u.role === 'trainer' && normalizeLocation(u.location || '') === adminLocation
      );
      
      // Count active bookings for this admin's location
      const locationBookings = bookings.filter(b => {
        const bookingLocation = normalizeLocation(b.requestedLocation || '');
        return bookingLocation === adminLocation && 
               (b.status === 'active' || b.status === 'approved');
      });
      
      return {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        location: admin.location || 'N/A',
        status: admin.status || 'active',
        joinDate: admin.joinDate || '',
        vehicles: locationVehicles.length,
        trainers: locationTrainers.length,
        bookings: locationBookings.length,
      };
    });
  }, [users, vehicles, bookings]);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Location Management</h1>
          <p className="text-muted-foreground">
            Manage training centers and administrators
          </p>
        </div>
        <Button onClick={() => navigate('/super_admin/admins')} className="bg-gradient-primary hover:bg-primary-hover">
          <Shield className="h-4 w-4 mr-2" />
          Manage Admins
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Training Centers"
          value={stats.totalLocations}
          description="Active locations"
          icon={MapPin}
        />
        <StatCard
          title="Location Admins"
          value={stats.totalAdmins}
          description="Managing centers"
          icon={Shield}
        />
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          description="All system users"
          icon={Users}
        />
        <StatCard
          title="Total Vehicles"
          value={stats.totalVehicles}
          description="Fleet-wide"
          icon={Car}
        />
      </div>

      {/* Training Centers with Admins */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle>Training Centers & Administrators</CardTitle>
          <CardDescription>
            Location-wise admin assignments and statistics
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading dashboard data...</p>
              </div>
            </div>
          ) : adminStats.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No administrators found. Add admins to manage locations.</p>
              <Button 
                onClick={() => navigate('/super_admin/admins')} 
                className="mt-4"
              >
                <Shield className="h-4 w-4 mr-2" />
                Manage Admins
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Administrator</TableHead>
                  <TableHead>Training Center</TableHead>
                  <TableHead>Vehicles</TableHead>
                  <TableHead>Trainers</TableHead>
                  <TableHead>Active Bookings</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adminStats.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{getInitials(admin.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{admin.name}</div>
                          <div className="text-sm text-muted-foreground">{admin.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{getLocationName(admin.location as any)}</span>
                      </div>
                    </TableCell>
                    <TableCell>{admin.vehicles}</TableCell>
                    <TableCell>{admin.trainers}</TableCell>
                    <TableCell>{admin.bookings}</TableCell>
                    <TableCell>
                      <Badge className={admin.status === 'active' ? 'bg-success text-success-foreground' : 'bg-gray-500 text-white'}>
                        {admin.status === 'active' ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/super_admin/admins')}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

    
    </div>
  );
}