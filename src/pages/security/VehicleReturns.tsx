import { useState } from 'react';
import { ArrowLeftRight, Search, Filter, Clock, CheckCircle, AlertTriangle, Car, User, Calendar, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useBookings } from '@/hooks/useBookings';
import { useVehicles } from '@/hooks/useVehicles';
import { useLocationFilter } from '@/hooks/useLocationFilter';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { format, isAfter, isBefore, isToday, startOfDay, endOfDay } from 'date-fns';
import { logVehicleReturned } from '@/utils/securityLogger';

interface VehicleReturn {
  id: string;
  vehicle: string;
  trainer: string;
  keyIssued: string;
  expectedReturn: string;
  actualReturn?: string;
  status: 'active' | 'returned' | 'overdue' | 'damaged';
  condition: 'excellent' | 'good' | 'fair' | 'damaged';
  notes?: string;
  purpose: string;
  booking?: any; // Reference to the original booking object
}

// Get vehicle returns from bookings and key issues
const getVehicleReturnsFromBookings = (
  bookings: any[],
  vehicles: any[],
  keyIssues: Array<{ bookingId: string; status: string; issuedAt: string }>
): VehicleReturn[] => {
  const now = new Date();
  
  return bookings
    .filter(b => {
      // Only include bookings that have keys issued (active status)
      const hasKeyIssued = keyIssues.some(key => key.bookingId === b.id);
      return (b.status === 'active' || hasKeyIssued);
    })
    .map(booking => {
      const vehicle = vehicles.find(v => v.id === booking.vehicleId);
      const keyIssue = keyIssues.find(k => k.bookingId === booking.id);
      const startDate = new Date(booking.startDate);
      const endDate = new Date(booking.endDate);
      const isOverdue = isBefore(endDate, now) && booking.status === 'active';
      const isReturned = booking.status === 'completed' || booking.status === 'returned';
      
      // Check if returned today
      const returnDate = booking.status === 'completed' ? new Date(booking.updatedAt) : null;
      const returnedToday = returnDate && isToday(returnDate);
      
      return {
        id: booking.id,
        vehicle: vehicle ? `${vehicle.brand} ${vehicle.model} - ${vehicle.regNo || vehicle.vehicleRegNo || 'N/A'}` : 'Unknown Vehicle',
        trainer: booking.trainerName,
        keyIssued: format(startDate, 'HH:mm'),
        expectedReturn: format(endDate, 'HH:mm'),
        actualReturn: isReturned && returnDate ? format(returnDate, 'HH:mm') : undefined,
        status: isOverdue ? 'overdue' : isReturned ? 'returned' : 'active',
        condition: isReturned ? (booking.notes?.includes('damage') ? 'damaged' : 'good') : 'excellent',
        notes: booking.notes || undefined,
        purpose: booking.purpose,
        booking
      };
    });
};

// Get key issues from localStorage
const getKeyIssues = (): Array<{ bookingId: string; status: string; issuedAt: string }> => {
  try {
    const stored = localStorage.getItem('app_key_issues');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export function VehicleReturns() {
  const { bookings, loading: bookingsLoading, updateBookingStatus } = useBookings();
  const { vehicles, isLoading: vehiclesLoading } = useVehicles();
  const { filterByLocation } = useLocationFilter();
  const { notifyVehicleReturned } = useNotifications();
  const { user } = useAuth();
  const keyIssues = getKeyIssues();
  
  // Filter bookings by location
  const locationBookings = filterByLocation(bookings.map(b => ({
    ...b,
    location: b.requestedLocation
  })));
  
  const returns = getVehicleReturnsFromBookings(locationBookings, vehicles, keyIssues);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [processingReturn, setProcessingReturn] = useState<string | null>(null);
  const [selectedReturn, setSelectedReturn] = useState<VehicleReturn | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const { toast } = useToast();
  
  // Calculate stats dynamically
  const totalActive = returns.filter(r => r.status === 'active' || r.status === 'overdue').length;
  const returnsToday = returns.filter(r => {
    if (r.actualReturn && r.booking && r.booking.updatedAt) {
      const returnDate = new Date(r.booking.updatedAt);
      return isToday(returnDate) && r.status === 'returned';
    }
    return false;
  }).length;
  const overdue = returns.filter(r => r.status === 'overdue').length;
  
  const stats = {
    totalActive,
    returnsToday,
    overdue,
    damageReports: returns.filter(r => r.condition === 'damaged').length
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Active</Badge>;
      case 'returned':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Returned</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Overdue</Badge>;
      case 'damaged':
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200">Damaged</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getConditionBadge = (condition: string) => {
    switch (condition) {
      case 'excellent':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Excellent</Badge>;
      case 'good':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Good</Badge>;
      case 'fair':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Fair</Badge>;
      case 'damaged':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Damaged</Badge>;
      default:
        return <Badge variant="outline">{condition}</Badge>;
    }
  };

  const handleProcessReturn = async (returnId: string, condition: string, notes?: string) => {
    setProcessingReturn(returnId);
    
    try {
      // Find the booking and vehicle
      const booking = bookings.find(b => b.id === returnId);
      const vehicle = booking ? vehicles.find(v => v.id === booking.vehicleId) : null;
      
      if (!booking || !vehicle || !user) {
        throw new Error('Booking, vehicle, or user not found');
      }
      
      // Update booking status to completed
      await updateBookingStatus(returnId, 'completed', notes || undefined);
      
      // Log the vehicle return action
      logVehicleReturned(
        { id: user.id, name: user.name, email: user.email },
        booking,
        vehicle,
        { id: booking.trainerId, name: booking.trainerName },
        condition,
        notes
      );
      
      // Notify trainer and admin
      const vehicleName = `${vehicle.brand} ${vehicle.model} (${vehicle.regNo || (vehicle as any).vehicleRegNo || 'N/A'})`;
      const conditionText = condition === 'excellent' ? 'Excellent' : 
                            condition === 'good' ? 'Good' : 
                            condition === 'fair' ? 'Fair' : 
                            condition === 'damaged' ? 'Damaged' : condition;
      notifyVehicleReturned(booking.id, booking.trainerId, vehicleName, user.name, conditionText);
      
      toast({
        title: "Vehicle Returned",
        description: `Vehicle return processed successfully${condition === 'damaged' ? ' with damage report' : ''}`,
      });
    } catch (err) {
      console.error('Error processing return:', err);
      toast({
        title: "Error",
        description: "Failed to process vehicle return. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingReturn(null);
    }
  };

  const filteredReturns = returns.filter(ret => {
    const matchesSearch = ret.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ret.trainer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ret.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleViewDetails = (returnItem: VehicleReturn) => {
    setSelectedReturn(returnItem);
    setIsDetailsDialogOpen(true);
  };

  const getFullBookingDetails = (returnItem: VehicleReturn) => {
    if (!returnItem.booking) return null;
    const booking = returnItem.booking;
    const vehicle = vehicles.find(v => v.id === booking.vehicleId);
    const keyIssue = keyIssues.find(k => k.bookingId === booking.id);
    
    return {
      booking,
      vehicle,
      keyIssue,
      startDate: new Date(booking.startDate),
      endDate: new Date(booking.endDate),
      returnDate: booking.status === 'completed' ? new Date(booking.updatedAt) : null,
    };
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Vehicle Returns</h1>
          <p className="text-muted-foreground">
            Track and process vehicle key returns
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Return History
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-elevated">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Out</p>
                <p className="text-2xl font-bold">{stats.totalActive}</p>
              </div>
              <Car className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-elevated">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Returns Today</p>
                <p className="text-2xl font-bold text-green-600">{stats.returnsToday}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-elevated">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
              </div>
              <Clock className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
      </div>

      {/* Filters */}
      <Card className="card-elevated">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search vehicles or trainers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="returned">Returned</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Returns Table */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ArrowLeftRight className="h-5 w-5" />
            <span>Vehicle Returns ({filteredReturns.length})</span>
          </CardTitle>
          <CardDescription>
            Current vehicle status and return processing
          </CardDescription>
        </CardHeader>
        <CardContent>
          {bookingsLoading || vehiclesLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : filteredReturns.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No vehicle returns found</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Trainer</TableHead>
                    <TableHead>Times</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Condition</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReturns.map((ret) => (
                  <TableRow key={ret.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{ret.vehicle}</p>
                        <p className="text-sm text-muted-foreground">{ret.purpose}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{ret.trainer}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>Out: {ret.keyIssued}</p>
                        <p>Due: {ret.expectedReturn}</p>
                        {ret.actualReturn && <p className="text-green-600">Returned: {ret.actualReturn}</p>}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(ret.status)}</TableCell>
                    <TableCell>{getConditionBadge(ret.condition)}</TableCell>
                    <TableCell>
                      {ret.status === 'active' || ret.status === 'overdue' ? (
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleProcessReturn(ret.id, 'good')}
                            disabled={processingReturn === ret.id}
                            className="h-8"
                          >
                            {processingReturn === ret.id ? 'Processing...' : 'Process Return'}
                          </Button>
                        </div>
                      ) : (
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-8"
                            onClick={() => handleViewDetails(ret)}
                          >
                            View Details
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Vehicle Return Details
            </DialogTitle>
            <DialogDescription>
              Complete information about the vehicle return transaction
            </DialogDescription>
          </DialogHeader>
          
          {selectedReturn && (() => {
            const details = getFullBookingDetails(selectedReturn);
            const booking = details?.booking;
            const vehicle = details?.vehicle;
            
            return (
              <div className="space-y-6">
                {/* Vehicle Information */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Car className="h-4 w-4" />
                    Vehicle Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Vehicle</p>
                      <p className="font-medium">{selectedReturn.vehicle}</p>
                    </div>
                    {vehicle && (
                      <>
                        <div>
                          <p className="text-sm text-muted-foreground">Registration Number</p>
                          <p className="font-medium">{vehicle.regNo || (vehicle as any).vehicleRegNo || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Brand & Model</p>
                          <p className="font-medium">{vehicle.brand} {vehicle.model}</p>
                        </div>
                        {vehicle.year && (
                          <div>
                            <p className="text-sm text-muted-foreground">Year</p>
                            <p className="font-medium">{vehicle.year}</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Trainer Information */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Trainer Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Trainer Name</p>
                      <p className="font-medium">{selectedReturn.trainer}</p>
                    </div>
                    {booking && (
                      <>
                        <div>
                          <p className="text-sm text-muted-foreground">Booking ID</p>
                          <p className="font-medium font-mono text-xs">{booking.id}</p>
                        </div>
                        {booking.trainerId && (
                          <div>
                            <p className="text-sm text-muted-foreground">Trainer ID</p>
                            <p className="font-medium font-mono text-xs">{booking.trainerId}</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Booking & Schedule Information */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Booking & Schedule
                  </h3>
                  <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Purpose</p>
                      <p className="font-medium">{selectedReturn.purpose}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <div className="mt-1">{getStatusBadge(selectedReturn.status)}</div>
                    </div>
                    {details && (
                      <>
                        <div>
                          <p className="text-sm text-muted-foreground">Start Date & Time</p>
                          <p className="font-medium">{format(details.startDate, 'MMM dd, yyyy HH:mm')}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Expected Return</p>
                          <p className="font-medium">{format(details.endDate, 'MMM dd, yyyy HH:mm')}</p>
                        </div>
                        {details.returnDate && (
                          <div>
                            <p className="text-sm text-muted-foreground">Actual Return Date & Time</p>
                            <p className="font-medium text-green-600">{format(details.returnDate, 'MMM dd, yyyy HH:mm')}</p>
                          </div>
                        )}
                        {booking && booking.createdAt && (
                          <div>
                            <p className="text-sm text-muted-foreground">Booking Created</p>
                            <p className="font-medium">{format(new Date(booking.createdAt), 'MMM dd, yyyy HH:mm')}</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Key & Return Information */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <ArrowLeftRight className="h-4 w-4" />
                    Key & Return Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Key Issued Time</p>
                      <p className="font-medium">{selectedReturn.keyIssued}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Expected Return Time</p>
                      <p className="font-medium">{selectedReturn.expectedReturn}</p>
                    </div>
                    {selectedReturn.actualReturn && (
                      <div>
                        <p className="text-sm text-muted-foreground">Actual Return Time</p>
                        <p className="font-medium text-green-600">{selectedReturn.actualReturn}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-muted-foreground">Condition</p>
                      <div className="mt-1">{getConditionBadge(selectedReturn.condition)}</div>
                    </div>
                  </div>
                </div>

                {/* Additional Notes */}
                {selectedReturn.notes && (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">Additional Notes</h3>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm whitespace-pre-wrap">{selectedReturn.notes}</p>
                    </div>
                  </div>
                )}

                {/* Booking Location */}
                {booking && booking.requestedLocation && (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Location
                    </h3>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="font-medium">{booking.requestedLocation}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}