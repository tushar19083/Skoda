import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/dashboard/StatCard';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useBookings } from '@/hooks/useBookings';
import { useVehicles } from '@/hooks/useVehicles';
import { LOCATIONS } from '@/constants/locations';
import { format, subMonths, startOfMonth, endOfMonth, parseISO, isWithinInterval, differenceInHours, getMonth, getYear } from 'date-fns';
import { 
  BarChart3, 
  Calendar, 
  Users, 
  Car,
  Download,
  Activity,
  MapPin
} from 'lucide-react';
import { toast } from 'sonner';

const STORAGE_KEY_USERS = 'app_users';

interface User {
  id: string;
  name: string;
  role: string;
  status: string;
  location?: string;
}

const getUsers = (): User[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_USERS);
    return stored ? JSON.parse(stored) : [];
  } catch (err) {
    console.error('Error loading users from localStorage:', err);
    return [];
  }
};

// Export analytics to CSV
const exportAnalyticsToCSV = (analytics: any, filename: string) => {
  const BOM = '\uFEFF';
  const csvRows: string[] = [];
  
  csvRows.push('System Analytics Report');
  csvRows.push(`Generated: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}`);
  csvRows.push('');
  
  csvRows.push('Overview');
  csvRows.push(`Total Bookings,${analytics.overview.totalBookings}`);
  csvRows.push(`Active Trainers,${analytics.overview.activeTrainers}`);
  csvRows.push(`Average Duration,${analytics.overview.avgBookingDuration}h`);
  csvRows.push(`Fleet Utilization,${analytics.overview.fleetUtilization}%`);
  csvRows.push('');
  
  csvRows.push('Monthly Trends');
  csvRows.push('Month,Bookings,Utilization %,Active Trainers');
  analytics.monthlyTrends.forEach((trend: any) => {
    csvRows.push(`${trend.month},${trend.bookings},${trend.utilization},${trend.trainers}`);
  });
  csvRows.push('');
  
  csvRows.push('Top Vehicles');
  csvRows.push('Model,Bookings,Utilization %');
  analytics.topVehicles.forEach((vehicle: any) => {
    csvRows.push(`${vehicle.model},${vehicle.bookings},${vehicle.utilization}`);
  });
  csvRows.push('');
  
  csvRows.push('Trainer Metrics');
  csvRows.push(`Active Trainers,${analytics.trainerMetrics.activeTrainers}`);
  csvRows.push(`Avg Bookings per Trainer,${analytics.trainerMetrics.avgBookingsPerTrainer}`);
  csvRows.push(`Avg Utilization Rate,${analytics.trainerMetrics.avgUtilizationRate}%`);
  
  const csvContent = csvRows.join('\n');
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export function AllAnalytics() {
  const { bookings, loading: bookingsLoading } = useBookings();
  const { vehicles, isLoading: vehiclesLoading } = useVehicles();
  const [timeRange, setTimeRange] = useState('6months');
  const [users, setUsers] = useState<User[]>([]);
  
  useEffect(() => {
    const allUsers = getUsers();
    setUsers(allUsers);
  }, []);
  
  // Calculate date range based on timeRange
  const dateRange = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    
    switch (timeRange) {
      case '1month':
        startDate = subMonths(now, 1);
        break;
      case '3months':
        startDate = subMonths(now, 3);
        break;
      case '6months':
        startDate = subMonths(now, 6);
        break;
      case '1year':
        startDate = subMonths(now, 12);
        break;
      default:
        startDate = subMonths(now, 6);
    }
    
    return { startDate, endDate: now };
  }, [timeRange]);
  
  // Filter bookings by date range (all locations for super admin)
  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => {
      const bookingDate = parseISO(booking.createdAt);
      return isWithinInterval(bookingDate, {
        start: dateRange.startDate,
        end: dateRange.endDate
      });
    });
  }, [bookings, dateRange]);
  
  // Calculate monthly trends
  const monthlyTrends = useMemo(() => {
    const months: { [key: string]: { bookings: number; utilization: number; trainers: number } } = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Initialize months in range
    const startMonth = startOfMonth(dateRange.startDate);
    const endMonth = endOfMonth(dateRange.endDate);
    let current = startMonth;
    
    while (current <= endMonth) {
      const monthKey = `${getYear(current)}-${getMonth(current)}`;
      months[monthKey] = { bookings: 0, utilization: 0, trainers: 0 };
      current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
    }
    
    // Count bookings for each month
    filteredBookings.forEach(booking => {
      const bookingDate = parseISO(booking.createdAt);
      const monthKey = `${getYear(bookingDate)}-${getMonth(bookingDate)}`;
      if (months[monthKey]) {
        months[monthKey].bookings++;
      }
    });
    
    // Calculate utilization (percentage of vehicles booked)
    Object.keys(months).forEach(monthKey => {
      const [year, month] = monthKey.split('-').map(Number);
      const monthStart = new Date(year, month, 1);
      const monthEnd = endOfMonth(monthStart);
      
      const monthBookings = filteredBookings.filter(b => {
        const bookingDate = parseISO(b.createdAt);
        return isWithinInterval(bookingDate, { start: monthStart, end: monthEnd });
      });
      
      const uniqueVehicles = new Set(monthBookings.map(b => b.vehicleId));
      months[monthKey].utilization = vehicles.length > 0
        ? Math.round((uniqueVehicles.size / vehicles.length) * 100)
        : 0;
      
      // Count active trainers for the month
      const monthTrainerIds = new Set(monthBookings.map(b => b.trainerId));
      months[monthKey].trainers = monthTrainerIds.size;
    });
    
    // Convert to array format
    return Object.keys(months)
      .sort()
      .slice(-6) // Last 6 months
      .map(monthKey => {
        const [year, month] = monthKey.split('-').map(Number);
        return {
          month: monthNames[month],
          bookings: months[monthKey].bookings,
          utilization: months[monthKey].utilization,
          trainers: months[monthKey].trainers
        };
      });
  }, [filteredBookings, dateRange, vehicles]);
  
  // Calculate overview stats
  const overview = useMemo(() => {
    const completedBookings = filteredBookings.filter(b => b.status === 'completed');
    const totalBookings = filteredBookings.length;
    
    // Calculate average booking duration
    const totalDuration = completedBookings.reduce((sum, booking) => {
      const start = parseISO(booking.startDate);
      const end = parseISO(booking.endDate);
      return sum + differenceInHours(end, start);
    }, 0);
    const avgBookingDuration = completedBookings.length > 0
      ? Math.round((totalDuration / completedBookings.length) * 10) / 10
      : 0;
    
    // Calculate fleet utilization
    const uniqueBookedVehicles = new Set(filteredBookings.map(b => b.vehicleId));
    const fleetUtilization = vehicles.length > 0
      ? Math.round((uniqueBookedVehicles.size / vehicles.length) * 100 * 10) / 10
      : 0;
    
    // Count active trainers
    const activeTrainerIds = new Set(filteredBookings.map(b => b.trainerId));
    const activeTrainers = activeTrainerIds.size;
    
    return {
      totalBookings,
      avgBookingDuration,
      fleetUtilization,
      activeTrainers
    };
  }, [filteredBookings, vehicles]);
  
  // Calculate top vehicles
  const topVehicles = useMemo(() => {
    const vehicleBookings: { [key: string]: { bookings: number; vehicle: any } } = {};
    
    filteredBookings.forEach(booking => {
      const vehicle = vehicles.find(v => v.id === booking.vehicleId);
      if (vehicle) {
        const vehicleKey = `${vehicle.brand} ${vehicle.model}`;
        if (!vehicleBookings[vehicleKey]) {
          vehicleBookings[vehicleKey] = { bookings: 0, vehicle };
        }
        vehicleBookings[vehicleKey].bookings++;
      }
    });
    
    return Object.keys(vehicleBookings)
      .map(key => ({
        model: key,
        bookings: vehicleBookings[key].bookings,
        utilization: vehicles.length > 0
          ? Math.round((vehicleBookings[key].bookings / vehicles.length) * 100)
          : 0
      }))
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 5);
  }, [filteredBookings, vehicles]);
  
  // Calculate trainer metrics
  const trainerMetrics = useMemo(() => {
    const trainerUsers = users.filter(u => u.role === 'trainer' && u.status === 'active');
    const activeTrainers = trainerUsers.length;
    
    const trainerBookingCounts: { [key: string]: number } = {};
    filteredBookings.forEach(booking => {
      trainerBookingCounts[booking.trainerId] = (trainerBookingCounts[booking.trainerId] || 0) + 1;
    });
    
    const totalBookings = Object.values(trainerBookingCounts).reduce((sum, count) => sum + count, 0);
    const avgBookingsPerTrainer = activeTrainers > 0
      ? Math.round((totalBookings / activeTrainers) * 10) / 10
      : 0;
    
    const avgUtilizationRate = overview.fleetUtilization;
    
    return {
      activeTrainers,
      avgBookingsPerTrainer,
      avgUtilizationRate
    };
  }, [users, filteredBookings, overview]);

  // Normalize location for comparison
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

  // Calculate location distribution across all locations
  const locationDistribution = useMemo(() => {
    const locationStats: { [key: string]: { location: string; vehicles: number; bookings: number; trainers: number } } = {};
    
    // Initialize all locations
    LOCATIONS.forEach(loc => {
      const locationKey = normalizeLocation(loc.code);
      locationStats[locationKey] = {
        location: loc.fullName || loc.name,
        vehicles: 0,
        bookings: 0,
        trainers: 0
      };
    });
    
    // Count vehicles per location
    vehicles.forEach((v: any) => {
      const vehicleLocation = normalizeLocation(v.academyLocation || v.location || '');
      if (locationStats[vehicleLocation]) {
        locationStats[vehicleLocation].vehicles++;
      }
    });
    
    // Count bookings per location
    filteredBookings.forEach(booking => {
      const bookingLocation = normalizeLocation(booking.requestedLocation || '');
      if (locationStats[bookingLocation]) {
        locationStats[bookingLocation].bookings++;
      }
    });
    
    // Count trainers per location
    users.filter(u => u.role === 'trainer' && u.status === 'active').forEach(trainer => {
      const trainerLocation = normalizeLocation(trainer.location || '');
      if (locationStats[trainerLocation]) {
        locationStats[trainerLocation].trainers++;
      }
    });
    
    // Calculate utilization and return as array
    return Object.keys(locationStats)
      .map(key => {
        const stats = locationStats[key];
        const utilization = stats.vehicles > 0
          ? Math.round((stats.bookings / stats.vehicles) * 100 * 10) / 10
          : 0;
        return {
          ...stats,
          utilization
        };
      })
      .filter(loc => loc.vehicles > 0 || loc.bookings > 0 || loc.trainers > 0)
      .sort((a, b) => b.vehicles - a.vehicles);
  }, [vehicles, filteredBookings, users]);
  
  const handleExport = () => {
    const analytics = {
      overview,
      monthlyTrends,
      topVehicles,
      trainerMetrics,
      locationDistribution
    };
    
    // Update CSV export to include location distribution
    const BOM = '\uFEFF';
    const csvRows: string[] = [];
    
    csvRows.push('System Analytics Report');
    csvRows.push(`Generated: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}`);
    csvRows.push('');
    
    csvRows.push('Overview');
    csvRows.push(`Total Bookings,${analytics.overview.totalBookings}`);
    csvRows.push(`Active Trainers,${analytics.overview.activeTrainers}`);
    csvRows.push(`Average Duration,${analytics.overview.avgBookingDuration}h`);
    csvRows.push(`Fleet Utilization,${analytics.overview.fleetUtilization}%`);
    csvRows.push('');
    
    csvRows.push('Location Distribution');
    csvRows.push('Location,Vehicles,Bookings,Trainers,Utilization %');
    analytics.locationDistribution.forEach((loc: any) => {
      csvRows.push(`${loc.location},${loc.vehicles},${loc.bookings},${loc.trainers},${loc.utilization}`);
    });
    csvRows.push('');
    
    csvRows.push('Monthly Trends');
    csvRows.push('Month,Bookings,Utilization %,Active Trainers');
    analytics.monthlyTrends.forEach((trend: any) => {
      csvRows.push(`${trend.month},${trend.bookings},${trend.utilization},${trend.trainers}`);
    });
    csvRows.push('');
    
    csvRows.push('Top Vehicles');
    csvRows.push('Model,Bookings,Utilization %');
    analytics.topVehicles.forEach((vehicle: any) => {
      csvRows.push(`${vehicle.model},${vehicle.bookings},${vehicle.utilization}`);
    });
    csvRows.push('');
    
    csvRows.push('Trainer Metrics');
    csvRows.push(`Active Trainers,${analytics.trainerMetrics.activeTrainers}`);
    csvRows.push(`Avg Bookings per Trainer,${analytics.trainerMetrics.avgBookingsPerTrainer}`);
    csvRows.push(`Avg Utilization Rate,${analytics.trainerMetrics.avgUtilizationRate}%`);
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `System_Analytics_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Analytics exported successfully');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Analytics</h1>
          <p className="text-muted-foreground">
            Training fleet performance and usage insights
          </p>
        </div>
        <div className="flex space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">Last Month</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Bookings"
          value={overview.totalBookings}
          description="Completed bookings"
          icon={Calendar}
        />
        <StatCard
          title="Active Trainers"
          value={overview.activeTrainers}
          description="Currently assigned"
          icon={Users}
        />
        <StatCard
          title="Avg Duration"
          value={`${overview.avgBookingDuration}h`}
          description="Per booking session"
          icon={Activity}
        />
        <StatCard
          title="Fleet Utilization"
          value={`${overview.fleetUtilization}%`}
          description="Overall efficiency"
          icon={Car}
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Trends */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Monthly Usage Trends</span>
            </CardTitle>
            <CardDescription>Booking activity and fleet utilization over time</CardDescription>
          </CardHeader>
          <CardContent>
            {bookingsLoading || vehiclesLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading analytics...</p>
                </div>
              </div>
            ) : monthlyTrends.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No data available for the selected time range.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {monthlyTrends.map((trend) => (
                  <div key={trend.month} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="text-sm font-medium">{trend.month}</div>
                      <Badge variant="outline">{trend.bookings} bookings</Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{trend.trainers} trainers</div>
                      <div className="text-xs text-muted-foreground">{trend.utilization}% utilization</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Location Analysis */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Location Analysis</span>
            </CardTitle>
            <CardDescription>Vehicle distribution by academy location</CardDescription>
          </CardHeader>
          <CardContent>
            {bookingsLoading || vehiclesLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading analytics...</p>
                </div>
              </div>
            ) : locationDistribution.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No location data available.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {locationDistribution.map((location) => (
                  <div key={location.location} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{location.location}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{location.vehicles} vehicles</span>
                        <Badge variant="outline" className="text-xs">{location.trainers} trainers</Badge>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{location.bookings} bookings</span>
                        <span>{location.utilization}% utilization</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(location.utilization, 100)}%` }}
                          />
                        </div>
                        <div className="text-xs font-medium w-12 text-right">{location.utilization}%</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Vehicles */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Car className="h-5 w-5" />
            <span>Most Used Vehicles</span>
          </CardTitle>
          <CardDescription>Top vehicles by booking frequency</CardDescription>
        </CardHeader>
        <CardContent>
          {bookingsLoading || vehiclesLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading analytics...</p>
              </div>
            </div>
          ) : topVehicles.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No vehicle booking data available.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {topVehicles.map((vehicle, index) => (
                <div key={vehicle.model} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs text-primary-foreground">
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{vehicle.model}</div>
                      <div className="text-xs text-muted-foreground">{vehicle.bookings} bookings</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{vehicle.utilization}%</div>
                    <div className="text-xs text-muted-foreground">utilization</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trainer Usage Analytics */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Trainer Activity Metrics</span>
          </CardTitle>
          <CardDescription>Performance and engagement statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2 p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-primary">{trainerMetrics.activeTrainers}</div>
              <div className="text-sm text-muted-foreground">Active Trainers</div>
              <div className="text-xs text-success">All locations combined</div>
            </div>
            <div className="space-y-2 p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-primary">{trainerMetrics.avgBookingsPerTrainer}</div>
              <div className="text-sm text-muted-foreground">Avg Bookings per Trainer</div>
              <div className="text-xs text-success">Per month</div>
            </div>
            <div className="space-y-2 p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-primary">{trainerMetrics.avgUtilizationRate}%</div>
              <div className="text-sm text-muted-foreground">Avg Utilization Rate</div>
              <div className="text-xs text-muted-foreground">Fleet-wide average</div>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}