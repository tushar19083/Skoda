import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/dashboard/StatCard';
import { Calendar, Search, Filter, Clock, User, Car, CheckCircle, XCircle, AlertCircle, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useLocationFilter } from '@/hooks/useLocationFilter';
import { useBookings } from '@/hooks/useBookings';
import { useVehicles } from '@/hooks/useVehicles';
import { useNotifications } from '@/contexts/NotificationContext';
import { getLocationName } from '@/constants/locations';
import { format, isAfter, isBefore, parseISO, isWithinInterval, startOfToday } from 'date-fns';

export function Bookings() {
  const { user } = useAuth();
  const { filterByLocation } = useLocationFilter();
  const { bookings, loading: bookingsLoading, updateBookingStatus } = useBookings();
  const { vehicles, updateVehicle } = useVehicles();
  const { notifyBookingApproved, notifyBookingRejected } = useNotifications();
  
  // Filter bookings by admin's location
  const locationFilteredBookings = filterByLocation(bookings.map(b => ({
    ...b,
    location: b.requestedLocation
  })));
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Calculate dynamic stats
  const stats = {
    total: locationFilteredBookings.length,
    pending: locationFilteredBookings.filter(b => b.status === 'pending').length,
    approved: locationFilteredBookings.filter(b => b.status === 'approved').length,
    active: locationFilteredBookings.filter(b => b.status === 'active').length,
    completed: locationFilteredBookings.filter(b => b.status === 'completed').length,
    cancelled: locationFilteredBookings.filter(b => b.status === 'cancelled').length,
  };

  const filteredBookings = locationFilteredBookings.filter(booking => {
    const vehicle = vehicles.find(v => v.id === booking.vehicleId);
    const vehicleName = vehicle ? `${vehicle.brand} ${vehicle.model}` : '';
    
    const matchesSearch = 
      vehicleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.trainerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle?.regNo.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const today = startOfToday();
      const bookingStartDate = parseISO(booking.startDate);
      
      switch (dateFilter) {
        case 'today':
          matchesDate = format(bookingStartDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
          break;
        case 'upcoming':
          matchesDate = isAfter(bookingStartDate, today) || format(bookingStartDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
          break;
        case 'past':
          matchesDate = isBefore(bookingStartDate, today) && format(bookingStartDate, 'yyyy-MM-dd') !== format(today, 'yyyy-MM-dd');
          break;
      }
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Update vehicle status based on active bookings
  useEffect(() => {
    const updateVehicleStatuses = () => {
      vehicles.forEach(vehicle => {
        const activeBookings = locationFilteredBookings.filter(booking => 
          booking.vehicleId === vehicle.id && 
          (booking.status === 'active' || booking.status === 'approved')
        );
        
        const now = new Date();
        const isCurrentlyBooked = activeBookings.some(booking => {
          const startDate = parseISO(booking.startDate);
          const endDate = parseISO(booking.endDate);
          return isWithinInterval(now, { start: startDate, end: endDate });
        });
        
        // Update vehicle status if needed
        if (isCurrentlyBooked && vehicle.status !== 'In Use') {
          updateVehicle(vehicle.id, { status: 'In Use' });
        } else if (!isCurrentlyBooked && vehicle.status === 'In Use') {
          // Check if vehicle is in maintenance before changing to Available
          // Get the current vehicle to check its actual status
          const currentVehicle = vehicles.find(v => v.id === vehicle.id);
          if (currentVehicle && currentVehicle.status !== 'Maintenance') {
            updateVehicle(vehicle.id, { status: 'Available' });
          }
        }
      });
    };

    if (bookings.length > 0 && vehicles.length > 0) {
      updateVehicleStatuses();
    }
  }, [bookings, vehicles, locationFilteredBookings, updateVehicle]);

  const handleStatusChange = async (bookingId: string, newStatus: 'pending' | 'approved' | 'active' | 'completed' | 'cancelled' | 'rejected') => {
    setActionLoading(bookingId);
    
    try {
      const booking = bookings.find(b => b.id === bookingId);
      if (!booking) return;

      // Update booking status
      await updateBookingStatus(bookingId, newStatus);
      
      const vehicle = vehicles.find(v => v.id === booking.vehicleId);
      const vehicleName = vehicle 
        ? `${vehicle.brand} ${vehicle.model} (${vehicle.regNo})`
        : 'Unknown Vehicle';
      
      // Send notifications
      if (newStatus === 'approved') {
        notifyBookingApproved(bookingId, booking.trainerId, vehicleName);
      } else if (newStatus === 'rejected') {
        notifyBookingRejected(bookingId, booking.trainerId, vehicleName);
      }
      
      // Update vehicle status based on booking status
      if (vehicle) {
        if (newStatus === 'active' || newStatus === 'approved') {
          // Mark vehicle as In Use
          updateVehicle(vehicle.id, { status: 'In Use' });
        } else if (newStatus === 'completed' || newStatus === 'cancelled' || newStatus === 'rejected') {
          // Check if vehicle has any other active bookings
          const otherActiveBookings = locationFilteredBookings.filter(b => 
            b.vehicleId === vehicle.id && 
            b.id !== bookingId &&
            (b.status === 'active' || b.status === 'approved')
          );
          
          const now = new Date();
          const hasOtherActiveBooking = otherActiveBookings.some(b => {
            const startDate = parseISO(b.startDate);
            const endDate = parseISO(b.endDate);
            return isWithinInterval(now, { start: startDate, end: endDate });
          });
          
          // Only mark as Available if no other active bookings
          if (!hasOtherActiveBooking && vehicle.status !== 'Maintenance') {
            updateVehicle(vehicle.id, { status: 'Available' });
          }
        }
      }
      
      toast.success(`Booking ${newStatus} successfully`);
    } catch (error) {
      toast.error('Failed to update booking status');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-600">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-blue-600 text-white">Approved</Badge>;
      case 'active':
        return <Badge className="bg-green-600 text-white">Active</Badge>;
      case 'completed':
        return <Badge variant="secondary">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const calculateDuration = (startDate: string, endDate: string): string => {
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
    } else {
      const days = Math.floor(diffHours / 24);
      const hours = diffHours % 24;
      return hours > 0 ? `${days}d ${hours}h` : `${days} day${days !== 1 ? 's' : ''}`;
    }
  };

  const userLocationName = user?.location ? getLocationName(user.location) : 'Pune Training Center';

  if (bookingsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold">Booking Management</h1>
            {user?.location && (
              <Badge variant="outline" className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {userLocationName}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            Manage vehicle reservations and trainer schedules {user?.location && `at ${userLocationName}`}
          </p>
        </div>
      </div>

      {/* Booking Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Bookings"
          value={stats.total}
          description="All time bookings"
          icon={Calendar}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Pending Approval"
          value={stats.pending}
          description="Awaiting approval"
          icon={Clock}
          trend={{ value: 8, isPositive: false }}
        />
        <StatCard
          title="Active Bookings"
          value={stats.active}
          description="Currently in progress"
          icon={CheckCircle}
          trend={{ value: 15, isPositive: true }}
        />
        <StatCard
          title="Completed"
          value={stats.completed}
          description="Successfully completed"
          icon={Calendar}
          trend={{ value: 25, isPositive: true }}
        />
      </div>

      {/* Additional Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <StatCard
          title="Approved"
          value={stats.approved}
          description="Ready for use"
          icon={CheckCircle}
        />
        <StatCard
          title="Cancelled"
          value={stats.cancelled}
          description="Cancelled bookings"
          icon={XCircle}
        />
      </div>

      {/* Filters and Search */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filter & Search Bookings</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by vehicle, trainer, purpose, or registration..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="All Dates" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Dates</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="past">Past</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle>All Bookings</CardTitle>
          <CardDescription>
            Showing {filteredBookings.length} of {locationFilteredBookings.length} bookings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            {filteredBookings.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No bookings found</p>
                <p className="text-sm mt-2">
                  {locationFilteredBookings.length === 0 
                    ? 'No bookings have been created yet.' 
                    : 'Try adjusting your search or filters.'}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Trainer</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.map((booking) => {
                    const vehicle = vehicles.find(v => v.id === booking.vehicleId);
                    const vehicleName = vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Unknown Vehicle';
                    
                    return (
                      <TableRow key={booking.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium flex items-center space-x-2">
                              <Car className="h-4 w-4" />
                              <span>{vehicleName}</span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {vehicle?.regNo || 'N/A'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium flex items-center space-x-2">
                              <User className="h-4 w-4" />
                              <span>{booking.trainerName}</span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {booking.vehicleId}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">
                              {format(parseISO(booking.startDate), 'MMM dd, yyyy')}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {format(parseISO(booking.startDate), 'HH:mm')} - {format(parseISO(booking.endDate), 'HH:mm')}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {calculateDuration(booking.startDate, booking.endDate)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{booking.purpose}</div>
                            {booking.notes && (
                              <div className="text-sm text-muted-foreground">{booking.notes}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {booking.requestedLocation}
                          </Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(booking.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {booking.status === 'pending' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleStatusChange(booking.id, 'approved')}
                                  disabled={actionLoading === booking.id}
                                  className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                                  title="Approve"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleStatusChange(booking.id, 'rejected')}
                                  disabled={actionLoading === booking.id}
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                  title="Reject"
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            {booking.status === 'approved' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleStatusChange(booking.id, 'active')}
                                disabled={actionLoading === booking.id}
                                className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700"
                                title="Mark as Active"
                              >
                                <AlertCircle className="h-4 w-4" />
                              </Button>
                            )}
                            {booking.status === 'active' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleStatusChange(booking.id, 'completed')}
                                disabled={actionLoading === booking.id}
                                className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                                title="Mark as Completed"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
