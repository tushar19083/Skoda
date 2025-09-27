import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, Car, Search, Filter, Clock, MapPin, AlertTriangle } from 'lucide-react';
import { useBookings } from '@/hooks/useBookings';
import { useVehicles } from '@/hooks/useVehicles';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export function MyBookings() {
  const { user } = useAuth();
  const { bookings, loading: bookingsLoading, updateBookingStatus, deleteBooking } = useBookings();
  const { vehicles, loading: vehiclesLoading } = useVehicles();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [damageReport, setDamageReport] = useState({
    bookingId: '',
    condition: 'Good',
    damageDescription: '',
    partsRequest: '',
    open: false
  });

  // Filter bookings for current user
  const userBookings = bookings.filter(booking => booking.trainerId === user?.id);

  const filteredBookings = userBookings.filter(booking => {
    const vehicle = vehicles.find(v => v.id === booking.vehicleId);
    const matchesSearch = 
      booking.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle?.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle?.regNo.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-orange-500 text-primary-foreground">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'active':
        return <Badge className="bg-primary text-primary-foreground">In use</Badge>;
      case 'completed':
        return <Badge variant="secondary">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="outline">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };


  const handleCancelBooking = async (bookingId: string) => {
    if (confirm('Are you sure you want to cancel this booking?')) {
      await updateBookingStatus(bookingId, 'cancelled');
    }
  };

  const handleDamageReport = async () => {
    try {
       // Normally save damage report + requested parts to DB
      toast({
        title: "Damage Report Submitted",
        description: "Your damage report has been submitted to the admin team.",
      });
      setDamageReport({
        bookingId: '',
        condition: 'Good',
        damageDescription: '',
        partsRequest: '',
        open: false
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit damage report. Please try again.",
        variant: "destructive",
      });
    }
  };

  const openDamageDialog = (bookingId: string) => {
    setDamageReport({
      bookingId,
      condition: 'Good',
      damageDescription: '',
      partsRequest: '',
      open: true
    });
  };

  // const getVehicleDetails = (booking: any) => {
  //   const vehicle = vehicles.find(v => v.id === booking.vehicleId);
  //   return vehicle ? `${vehicle.brand} ${vehicle.model} (${vehicle.regNo})` : 'Unknown Vehicle';
  // };

  const stats = {
    total: userBookings.length,
    pending: userBookings.filter(b => b.status === 'pending').length,
    approved: userBookings.filter(b => b.status === 'approved').length,
    active: userBookings.filter(b => b.status === 'active').length,
  };

  if (bookingsLoading || vehiclesLoading) {
  return <div className="flex justify-center py-8">Loading data...</div>;
}


  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Bookings</h1>
          <p className="text-muted-foreground">
            Manage your vehicle reservations and training sessions
          </p>
        </div>
        <Button className="btn-skoda">
          <Calendar className="h-4 w-4 mr-2" />
          New Booking
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Total Bookings</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-warning" />
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Car className="h-5 w-5 text-success" />
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold">{stats.approved}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filter & Search</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by purpose, vehicle model, or license plate..."
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
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Your Bookings</CardTitle>
          <CardDescription>
            {filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredBookings.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.map((booking) => {
                  const vehicle = vehicles.find(v => v.id === booking.vehicleId);
                  return (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Vehicle not found'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {vehicle?.regNo}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{booking.purpose}</p>
                        {booking.notes && (
                          <p className="text-sm text-muted-foreground">{booking.notes}</p>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="text-sm">
                            {format(new Date(booking.startDate), 'MMM dd, yyyy HH:mm')}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            to {format(new Date(booking.endDate), 'MMM dd, yyyy HH:mm')}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(booking.status)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {booking.status === 'pending' && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleCancelBooking(booking.id)}
                            >
                              Cancel
                            </Button>
                          )}
                          {booking.status === 'approved' && (
                            <Badge className="bg-success text-success-foreground">
                              Ready for pickup
                            </Badge>
                          )}
                          {booking.status === 'active' && (
                              <Dialog open={damageReport.open} onOpenChange={(open) => setDamageReport(prev => ({ ...prev, open }))}>
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => openDamageDialog(booking.id)}
                                  >
                                    <AlertTriangle className="h-4 w-4 mr-2" />
                                    Report Damage / Request Parts
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md">
                                  <DialogHeader>
                                    <DialogTitle>Report Vehicle Damage / Request Parts</DialogTitle>
                                    <DialogDescription>
                                      Report damages or request replacement parts for booking #{booking.id}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <Label htmlFor="condition">Vehicle Condition</Label>
                                      <Select
                                        value={damageReport.condition}
                                        onValueChange={(value) => setDamageReport(prev => ({ ...prev, condition: value }))}
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select condition" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="Good">Good - No issues</SelectItem>
                                          <SelectItem value="Minor Issues">Minor Issues - Small problems</SelectItem>
                                          <SelectItem value="Damage">Damage - Requires attention</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    {damageReport.condition !== 'Good' && (
                                      <div>
                                        <Label htmlFor="damageDescription">Damage Description</Label>
                                        <Textarea
                                          id="damageDescription"
                                          placeholder="Please describe the damage or issues in detail..."
                                          value={damageReport.damageDescription}
                                          onChange={(e) => setDamageReport(prev => ({ ...prev, damageDescription: e.target.value }))}
                                          className="min-h-[120px]"
                                        />
                                      </div>
                                    )}
                                    <div>
                                      <Label htmlFor="partsRequest">Request Parts</Label>
                                      <Textarea
                                        id="partsRequest"
                                        placeholder="List the parts you want to request (e.g., tires, mirrors, etc.)"
                                        value={damageReport.partsRequest}
                                        onChange={e =>
                                          setDamageReport(prev => ({
                                            ...prev,
                                            partsRequest: e.target.value,
                                          }))
                                        }
                                        className="min-h-[80px]"
                                      />
                                    </div>
                                    <div className="flex justify-end space-x-2">
                                      <Button 
                                        variant="outline" 
                                        onClick={() => setDamageReport(prev => ({ ...prev, open: false }))}
                                      >
                                        Cancel
                                      </Button>
                                      <Button onClick={handleDamageReport}>
                                        Submit Report
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No bookings found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}