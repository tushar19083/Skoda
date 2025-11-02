import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/dashboard/StatCard';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useVehicles } from '@/hooks/useVehicles';
import { useBookings } from '@/hooks/useBookings';
import { useLocationFilter } from '@/hooks/useLocationFilter';
import { useToast } from '@/hooks/use-toast';
import { format, subMonths, startOfMonth, endOfMonth, parseISO, isWithinInterval, differenceInMonths, getMonth, getYear } from 'date-fns';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  Calendar, 
  Users, 
  Car, 
  Shield,
  Download,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

const STORAGE_KEY_USERS = 'app_users';
const STORAGE_KEY_RECORDS = 'app_vehicle_records';

interface User {
  id: string;
  name: string;
  role: string;
  status: string;
  location?: string;
}

interface VehicleRecord {
  id: string;
  academyLocation: string;
  vehicleRegNo: string;
  insuranceStatus: string;
  pucStatus: string;
  insuranceValidityDate?: string;
  pucValidityDate?: string;
  nextServiceDate?: string;
  allocatedTrainer: string;
  brand: string;
  model: string;
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

const getVehicleRecords = (): VehicleRecord[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_RECORDS);
    return stored ? JSON.parse(stored) : [];
  } catch (err) {
    console.error('Error loading vehicle records from localStorage:', err);
    return [];
  }
};

export function Analytics() {
  const { user } = useAuth();
  const { vehicles, isLoading: vehiclesLoading } = useVehicles();
  const { bookings, loading: bookingsLoading } = useBookings();
  const { filterByLocation } = useLocationFilter();
  const { toast } = useToast();
  
  const [timeRange, setTimeRange] = useState('6months');
  const [users, setUsers] = useState<User[]>([]);
  const [records, setRecords] = useState<VehicleRecord[]>([]);
  
  // Get admin's location
  const adminLocation = user?.location ? (user.location === 'PTC' ? 'Pune' : user.location === 'BLR' ? 'Bangalore' : user.location) : 'Pune';
  
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
  
  // Filter bookings by date range
  const filteredBookings = useMemo(() => {
    return locationBookings.filter(booking => {
      const bookingDate = parseISO(booking.createdAt);
      return isWithinInterval(bookingDate, {
        start: dateRange.startDate,
        end: dateRange.endDate
      });
    });
  }, [locationBookings, dateRange]);
  
  // Calculate monthly trends
  const monthlyTrends = useMemo(() => {
    const months: { [key: string]: { bookings: number; utilization: number; maintenance: number } } = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Initialize months in range
    const startMonth = startOfMonth(dateRange.startDate);
    const endMonth = endOfMonth(dateRange.endDate);
    let current = startMonth;
    
    while (current <= endMonth) {
      const monthKey = `${getYear(current)}-${getMonth(current)}`;
      months[monthKey] = { bookings: 0, utilization: 0, maintenance: 0 };
      current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
    }
    
    // Count bookings and maintenance for each month
    filteredBookings.forEach(booking => {
      const bookingDate = parseISO(booking.createdAt);
      const monthKey = `${getYear(bookingDate)}-${getMonth(bookingDate)}`;
      if (months[monthKey]) {
        months[monthKey].bookings++;
      }
    });
    
    records.forEach(record => {
      if (record.nextServiceDate) {
        const serviceDate = parseISO(record.nextServiceDate);
        const monthKey = `${getYear(serviceDate)}-${getMonth(serviceDate)}`;
        if (months[monthKey]) {
          months[monthKey].maintenance++;
        }
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
      months[monthKey].utilization = locationVehicles.length > 0
        ? Math.round((uniqueVehicles.size / locationVehicles.length) * 100)
        : 0;
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
          maintenance: months[monthKey].maintenance
        };
      });
  }, [filteredBookings, records, dateRange, locationVehicles]);
  
  // Calculate overview stats
  const overview = useMemo(() => {
    const totalVehicles = locationVehicles.length;
    const activeVehicles = locationVehicles.filter((v: any) => v.status === 'Available' || v.status === 'In Use').length;
    
    // Calculate average vehicle age
    const currentYear = new Date().getFullYear();
    const totalAge = locationVehicles.reduce((sum: number, v: any) => {
      return sum + (currentYear - (v.year || currentYear));
    }, 0);
    const avgVehicleAge = totalVehicles > 0 ? Math.round((totalAge / totalVehicles) * 10) / 10 : 0;
    
    // Calculate fleet utilization (percentage of vehicles that have been booked)
    const uniqueBookedVehicles = new Set(filteredBookings.map(b => b.vehicleId));
    const fleetUtilization = totalVehicles > 0
      ? Math.round((uniqueBookedVehicles.size / totalVehicles) * 100 * 10) / 10
      : 0;
    
    return {
      totalVehicles,
      activeVehicles,
      avgVehicleAge,
      fleetUtilization
    };
  }, [locationVehicles, filteredBookings]);
  
  // Calculate brand distribution
  const brandDistribution = useMemo(() => {
    const brandMap: { [key: string]: { count: number; activeVehicles: number; bookings: number } } = {};
    
    locationVehicles.forEach((v: any) => {
      const brand = v.brand === 'Skoda' ? 'Skoda (SA)' : v.brand === 'Volkswagen' ? 'Volkswagen (VW)' : v.brand === 'Audi' ? 'Audi (AU)' : v.brand;
      if (!brandMap[brand]) {
        brandMap[brand] = { count: 0, activeVehicles: 0, bookings: 0 };
      }
      brandMap[brand].count++;
      if (v.status === 'Available' || v.status === 'In Use') {
        brandMap[brand].activeVehicles++;
      }
    });
    
    filteredBookings.forEach(booking => {
      const vehicle = locationVehicles.find((v: any) => v.id === booking.vehicleId);
      if (vehicle) {
        const brand = (vehicle as any).brand === 'Skoda' ? 'Skoda (SA)' : (vehicle as any).brand === 'Volkswagen' ? 'Volkswagen (VW)' : (vehicle as any).brand === 'Audi' ? 'Audi (AU)' : (vehicle as any).brand;
        if (brandMap[brand]) {
          brandMap[brand].bookings++;
        }
      }
    });
    
    return Object.keys(brandMap).map(brand => {
      const totalBookings = brandMap[brand].bookings;
      const utilization = brandMap[brand].count > 0
        ? Math.round((totalBookings / brandMap[brand].count) * 10)
        : 0;
      
      return {
        brand,
        count: brandMap[brand].count,
        utilization,
        activeVehicles: brandMap[brand].activeVehicles
      };
    });
  }, [locationVehicles, filteredBookings]);
  
  // Calculate compliance status
  const complianceStatus = useMemo(() => {
    const insuranceValid = records.filter(r => r.insuranceStatus === 'Valid').length;
    const insuranceExpired = records.filter(r => r.insuranceStatus === 'Expired').length;
    const pucValid = records.filter(r => r.pucStatus === 'Valid').length;
    const pucExpired = records.filter(r => r.pucStatus === 'Expired').length;
    const pucNA = records.filter(r => r.pucStatus === 'NA' || !r.pucStatus).length;
    
    return {
      insuranceValid,
      insuranceExpired,
      pucValid,
      pucExpired,
      pucNA
    };
  }, [records]);
  
  // Calculate trainer metrics
  const trainerMetrics = useMemo(() => {
    const trainerUsers = users.filter(u => u.role === 'trainer' && u.status === 'active');
    const totalTrainers = trainerUsers.length;
    const activeTrainers = trainerUsers.length;
    
    // Calculate vehicles per trainer
    const trainerAllocations: { [key: string]: number } = {};
    records.forEach(record => {
      if (record.allocatedTrainer && record.allocatedTrainer !== 'Unallocated') {
        trainerAllocations[record.allocatedTrainer] = (trainerAllocations[record.allocatedTrainer] || 0) + 1;
      }
    });
    
    const totalAllocated = Object.values(trainerAllocations).reduce((sum, count) => sum + count, 0);
    const avgVehiclesPerTrainer = totalTrainers > 0 ? Math.round((totalAllocated / totalTrainers) * 10) / 10 : 0;
    
    // Find top trainer
    let topTrainer = 'N/A';
    let maxVehicles = 0;
    Object.keys(trainerAllocations).forEach(trainer => {
      if (trainerAllocations[trainer] > maxVehicles) {
        maxVehicles = trainerAllocations[trainer];
        topTrainer = trainer;
      }
    });
    
    return {
      totalTrainers,
      activeTrainers,
      avgVehiclesPerTrainer,
      topTrainer
    };
  }, [users, records]);
  
  // Calculate trainer allocations
  const trainerAllocations = useMemo(() => {
    const allocations: { [key: string]: { vehicles: number; brands: Set<string> } } = {};
    
    records.forEach(record => {
      const trainer = record.allocatedTrainer || 'Unallocated';
      if (!allocations[trainer]) {
        allocations[trainer] = { vehicles: 0, brands: new Set() };
      }
      allocations[trainer].vehicles++;
      if (record.brand) {
        const brandCode = record.brand === 'SA' ? 'SA' : record.brand === 'VW' ? 'VW' : record.brand === 'AU' ? 'AU' : record.brand;
        allocations[trainer].brands.add(brandCode);
      }
    });
    
    return Object.keys(allocations)
      .map(trainer => ({
        trainer,
        vehicles: allocations[trainer].vehicles,
        brands: Array.from(allocations[trainer].brands)
      }))
      .sort((a, b) => b.vehicles - a.vehicles)
      .slice(0, 6);
  }, [records]);
  
  
  // Export to CSV
  const handleExport = () => {
    try {
      const csvData = [
        ['Fleet Analytics Report', format(new Date(), 'yyyy-MM-dd')],
        ['Time Range', timeRange],
        [],
        ['Overview'],
        ['Total Vehicles', overview.totalVehicles],
        ['Active Vehicles', overview.activeVehicles],
        ['Average Vehicle Age', `${overview.avgVehicleAge} years`],
        ['Fleet Utilization', `${overview.fleetUtilization}%`],
        [],
        ['Compliance Status'],
        ['Insurance Valid', complianceStatus.insuranceValid],
        ['Insurance Expired', complianceStatus.insuranceExpired],
        ['PUC Valid', complianceStatus.pucValid],
        ['PUC Expired', complianceStatus.pucExpired],
        ['PUC Not Required', complianceStatus.pucNA],
        [],
        ['Brand Distribution'],
        ['Brand', 'Total Vehicles', 'Active Vehicles', 'Utilization %'],
        ...brandDistribution.map(b => [b.brand, b.count, b.activeVehicles, b.utilization]),
        [],
        ['Monthly Trends'],
        ['Month', 'Bookings', 'Utilization %', 'Maintenance'],
        ...monthlyTrends.map(t => [t.month, t.bookings, t.utilization, t.maintenance]),
        [],
        ['Trainer Metrics'],
        ['Total Trainers', trainerMetrics.totalTrainers],
        ['Active Trainers', trainerMetrics.activeTrainers],
        ['Average Vehicles Per Trainer', trainerMetrics.avgVehiclesPerTrainer],
        ['Top Trainer', trainerMetrics.topTrainer],
        [],
        ['Trainer Allocations'],
        ['Trainer', 'Vehicles', 'Brands'],
        ...trainerAllocations.map(a => [a.trainer, a.vehicles, a.brands.join(', ')])
      ];
      
      const csv = csvData.map(row => 
        row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      ).join('\n');
      
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `fleet-analytics-${format(new Date(), 'yyyy-MM-dd')}-${timeRange}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: 'Export successful',
        description: 'Analytics data has been exported to CSV',
      });
    } catch (error) {
      toast({
        title: 'Export failed',
        description: 'Failed to export analytics data',
        variant: 'destructive',
      });
    }
  };
  
  const isLoading = vehiclesLoading || bookingsLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">Fleet Analytics Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">
            Comprehensive fleet management insights for Skoda, VW & Audi vehicles
          </p>
        </div>
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">Last Month</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="w-full sm:w-auto" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Vehicles"
            value={overview.totalVehicles}
            description="Fleet size"
            icon={Car}
            trend={{ value: 5, isPositive: true }}
          />
          <StatCard
            title="Active Vehicles"
            value={overview.activeVehicles}
            description="Currently operational"
            icon={CheckCircle}
            trend={{ value: 8.2, isPositive: true }}
          />
          <StatCard
            title="Fleet Utilization"
            value={`${overview.fleetUtilization}%`}
            description="Overall usage rate"
            icon={BarChart3}
            trend={{ value: 5.1, isPositive: true }}
          />
          <StatCard
            title="Avg Vehicle Age"
            value={`${overview.avgVehicleAge} yrs`}
            description="Fleet age"
            icon={Clock}
            trend={{ value: 2.1, isPositive: false }}
          />
        </div>
      )}

      {/* Compliance Status Alert */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="border-l-4 border-l-red-500 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-lg text-red-700">
              <AlertTriangle className="h-5 w-5" />
              <span>Compliance Alerts</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Insurance Expired</span>
                <Badge variant="destructive">{complianceStatus.insuranceExpired} vehicles</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">PUC Expired</span>
                <Badge variant="destructive">{complianceStatus.pucExpired} vehicles</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Under Maintenance</span>
                <Badge variant="outline">{locationVehicles.filter((v: any) => v.status === 'Maintenance').length} vehicles</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-lg text-green-700">
              <Shield className="h-5 w-5" />
              <span>Compliance Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Insurance Valid</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">{complianceStatus.insuranceValid} vehicles</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">PUC Valid</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">{complianceStatus.pucValid} vehicles</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">PUC Not Required</span>
                <Badge variant="outline">{complianceStatus.pucNA} vehicles</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Brand Distribution */}
        <Card className="shadow-sm border border-gray-200">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <PieChart className="h-5 w-5 text-blue-600" />
              <span>Brand Distribution</span>
            </CardTitle>
            <CardDescription className="text-sm text-gray-600">Fleet composition by brand</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse p-3 bg-gray-50 rounded-lg">
                    <div className="h-16 bg-muted rounded"></div>
                  </div>
                ))}
              </div>
            ) : brandDistribution.length > 0 ? (
              <div className="space-y-4">
                {brandDistribution.map((brand) => (
                  <div key={brand.brand} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-xs text-white font-medium">
                        {brand.brand.split(' ')[1]?.replace('(', '').replace(')', '') || brand.brand.substring(0, 2)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{brand.brand}</div>
                        <div className="text-xs text-gray-500">{brand.activeVehicles} active vehicles</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{brand.count} total</div>
                      <div className="text-xs text-gray-500">{brand.utilization}% utilization</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <PieChart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No brand data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Monthly Trends */}
        <Card className="shadow-sm border border-gray-200">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <BarChart3 className="h-5 w-5 text-green-600" />
              <span>Monthly Trends</span>
            </CardTitle>
            <CardDescription className="text-sm text-gray-600">Booking activity and maintenance over time</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="animate-pulse p-3 bg-gray-50 rounded-lg">
                    <div className="h-12 bg-muted rounded"></div>
                  </div>
                ))}
              </div>
            ) : monthlyTrends.length > 0 ? (
              <div className="space-y-3">
                {monthlyTrends.map((trend) => (
                  <div key={trend.month} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="text-sm font-medium text-gray-900">{trend.month}</div>
                      <Badge variant="outline" className="text-xs">{trend.bookings} bookings</Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{trend.utilization}%</div>
                      <div className="text-xs text-gray-500">utilization</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No trend data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Trainer Analytics */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Trainer Metrics */}
        <Card className="shadow-sm border border-gray-200">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Users className="h-5 w-5 text-purple-600" />
              <span>Trainer Overview</span>
            </CardTitle>
            <CardDescription className="text-sm text-gray-600">Trainer engagement and allocation metrics</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-8 w-32 bg-muted rounded"></div>
                <div className="h-8 w-32 bg-muted rounded"></div>
                <div className="h-4 w-48 bg-muted rounded"></div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-blue-600">{trainerMetrics.totalTrainers}</div>
                  <div className="text-sm text-gray-600">Total Trainers</div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-blue-600">{trainerMetrics.activeTrainers}</div>
                  <div className="text-sm text-gray-600">Active Trainers</div>
                </div>
                <div className="space-y-2 col-span-2">
                  <div className="text-lg font-medium text-gray-900">Top Trainer: {trainerMetrics.topTrainer}</div>
                  <div className="text-xs text-gray-500">Most vehicles allocated</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Trainer Allocations */}
        <Card className="shadow-sm border border-gray-200">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Calendar className="h-5 w-5 text-orange-600" />
              <span>Trainer Vehicle Allocations</span>
            </CardTitle>
            <CardDescription className="text-sm text-gray-600">Vehicle assignments per trainer</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse p-3 bg-gray-50 rounded-lg">
                    <div className="h-16 bg-muted rounded"></div>
                  </div>
                ))}
              </div>
            ) : trainerAllocations.length > 0 ? (
              <div className="space-y-3">
                {trainerAllocations.slice(0, 5).map((allocation) => (
                  <div key={allocation.trainer} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-gray-900">{allocation.trainer}</div>
                      <div className="flex space-x-1">
                        {allocation.brands.map((brand) => (
                          <Badge key={brand} variant="outline" className="text-xs">{brand}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{allocation.vehicles}</div>
                      <div className="text-xs text-gray-500">vehicles</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No trainer allocations available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  );
}