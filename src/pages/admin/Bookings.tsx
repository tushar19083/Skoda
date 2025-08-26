import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/dashboard/StatCard';
import { Calendar, Search, Filter, Clock, User, Car, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Booking {
  id: string;
  vehicleModel: string;
  licensePlate: string;
  trainerName: string;
  trainerEmail: string;
  startDate: string;
  endDate: string;
  duration: string;
  status: 'pending' | 'approved' | 'active' | 'completed' | 'cancelled';
  purpose: string;
  urgency: 'low' | 'medium' | 'high';
  notes?: string;
  createdAt: string;
}

const mockBookings: Booking[] = [
  {
    id: '1',
    vehicleModel: 'Skoda Octavia',
    licensePlate: 'SK-001-AB',
    trainerName: 'Sarah Thompson',
    trainerEmail: 'sarah.thompson@company.com',
    startDate: '2024-01-16',
    endDate: '2024-01-16',
    duration: '2 hours',
    status: 'active',
    purpose: 'Practical Driving Test',
    urgency: 'high',
    notes: 'Student final exam preparation',
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    vehicleModel: 'VW Golf',
    licensePlate: 'VW-003-CD',
    trainerName: 'Mike Johnson',
    trainerEmail: 'mike.johnson@company.com',
    startDate: '2024-01-17',
    endDate: '2024-01-17',
    duration: '3 hours',
    status: 'approved',
    purpose: 'Highway Training',
    urgency: 'medium',
    notes: 'Advanced highway driving practice',
    createdAt: '2024-01-15'
  },
  {
    id: '3',
    vehicleModel: 'Audi A4',
    licensePlate: 'AD-002-EF',
    trainerName: 'Emma Wilson',
    trainerEmail: 'emma.wilson@company.com',
    startDate: '2024-01-15',
    endDate: '2024-01-15',
    duration: '1.5 hours',
    status: 'completed',
    purpose: 'City Driving Practice',
    urgency: 'low',
    notes: 'Basic city navigation training',
    createdAt: '2024-01-14'
  },
  {
    id: '4',
    vehicleModel: 'Skoda Fabia',
    licensePlate: 'SK-004-GH',
    trainerName: 'David Lee',
    trainerEmail: 'david.lee@company.com',
    startDate: '2024-01-18',
    endDate: '2024-01-18',
    duration: '2.5 hours',
    status: 'pending',
    purpose: 'Parallel Parking Training',
    urgency: 'medium',
    notes: 'Focus on advanced parking maneuvers',
    createdAt: '2024-01-15'
  },
  {
    id: '5',
    vehicleModel: 'VW Passat',
    licensePlate: 'VW-008-IJ',
    trainerName: 'Lisa Davis',
    trainerEmail: 'lisa.davis@company.com',
    startDate: '2024-01-19',
    endDate: '2024-01-19',
    duration: '4 hours',
    status: 'approved',
    purpose: 'Long Distance Training',
    urgency: 'low',
    notes: 'Interstate highway practice',
    createdAt: '2024-01-15'
  },
  {
    id: '6',
    vehicleModel: 'Skoda Superb',
    licensePlate: 'SK-005-KL',
    trainerName: 'Tom Wilson',
    trainerEmail: 'tom.wilson@company.com',
    startDate: '2024-01-14',
    endDate: '2024-01-14',
    duration: '1 hour',
    status: 'cancelled',
    purpose: 'Emergency Brake Training',
    urgency: 'high',
    notes: 'Cancelled due to weather conditions',
    createdAt: '2024-01-13'
  }
];

export function Bookings() {
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [loading, setLoading] = useState<string | null>(null);

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.vehicleModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.trainerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.licensePlate.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    const matchesUrgency = urgencyFilter === 'all' || booking.urgency === urgencyFilter;
    
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const today = new Date();
      const bookingDate = new Date(booking.startDate);
      
      switch (dateFilter) {
        case 'today':
          matchesDate = bookingDate.toDateString() === today.toDateString();
          break;
        case 'upcoming':
          matchesDate = bookingDate >= today;
          break;
        case 'past':
          matchesDate = bookingDate < today;
          break;
      }
    }
    
    return matchesSearch && matchesStatus && matchesUrgency && matchesDate;
  });

  const handleStatusChange = async (bookingId: string, newStatus: Booking['status']) => {
    setLoading(bookingId);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId ? { ...booking, status: newStatus } : booking
      ));
      
      toast.success(`Booking ${newStatus} successfully`);
    } catch (error) {
      toast.error('Failed to update booking status');
    } finally {
      setLoading(null);
    }
  };

  const getStatusBadge = (status: Booking['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="border-warning text-warning">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-primary text-primary-foreground">Approved</Badge>;
      case 'active':
        return <Badge className="bg-success text-success-foreground">Active</Badge>;
      case 'completed':
        return <Badge variant="secondary">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getUrgencyBadge = (urgency: Booking['urgency']) => {
    switch (urgency) {
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge className="bg-warning text-warning-foreground">Medium</Badge>;
      case 'low':
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="outline">{urgency}</Badge>;
    }
  };

  const bookingStats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    active: bookings.filter(b => b.status === 'active').length,
    completed: bookings.filter(b => b.status === 'completed').length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Booking Management</h1>
          <p className="text-muted-foreground">
            Manage vehicle reservations and trainer schedules
          </p>
        </div>
      </div>

      {/* Booking Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Bookings"
          value={bookingStats.total}
          description="All time bookings"
          icon={Calendar}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Pending Approval"
          value={bookingStats.pending}
          description="Awaiting approval"
          icon={Clock}
          trend={{ value: 8, isPositive: false }}
        />
        <StatCard
          title="Active Bookings"
          value={bookingStats.active}
          description="Currently in progress"
          icon={CheckCircle}
          trend={{ value: 15, isPositive: true }}
        />
        <StatCard
          title="Completed"
          value={bookingStats.completed}
          description="Successfully completed"
          icon={Calendar}
          trend={{ value: 25, isPositive: true }}
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
                  placeholder="Search by vehicle, trainer, purpose, or license plate..."
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
              </SelectContent>
            </Select>
            
            <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="All Urgency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Urgency</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
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
            Showing {filteredBookings.length} of {bookings.length} bookings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Trainer</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Urgency</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium flex items-center space-x-2">
                          <Car className="h-4 w-4" />
                          <span>{booking.vehicleModel}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">{booking.licensePlate}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium flex items-center space-x-2">
                          <User className="h-4 w-4" />
                          <span>{booking.trainerName}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">{booking.trainerEmail}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{booking.startDate}</div>
                        <div className="text-sm text-muted-foreground">{booking.duration}</div>
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
                    <TableCell>{getStatusBadge(booking.status)}</TableCell>
                    <TableCell>{getUrgencyBadge(booking.urgency)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {booking.status === 'pending' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStatusChange(booking.id, 'approved')}
                              disabled={loading === booking.id}
                              className="text-success hover:text-success"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStatusChange(booking.id, 'cancelled')}
                              disabled={loading === booking.id}
                              className="text-destructive hover:text-destructive"
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
                            disabled={loading === booking.id}
                            className="text-primary hover:text-primary"
                          >
                            <AlertCircle className="h-4 w-4" />
                          </Button>
                        )}
                        {booking.status === 'active' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStatusChange(booking.id, 'completed')}
                            disabled={loading === booking.id}
                            className="text-success hover:text-success"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}