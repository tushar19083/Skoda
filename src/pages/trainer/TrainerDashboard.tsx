import { Calendar, Car, Clock, BookOpen, TicketCheck, } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useBookings } from '@/hooks/useBookings';
import { useVehicles } from '@/hooks/useVehicles';
import { useAuth } from '@/contexts/AuthContext';
import { format, isAfter, isBefore, addDays, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';

const mockQuickActions = [
  {
    title: 'Book Skoda Vehicle',
    description: 'Reserve a Skoda for training',
    action: 'book-skoda',
    brand: 'skoda'
  },
  {
    title: 'Book VW Vehicle',
    description: 'Reserve a Volkswagen',
    action: 'book-vw',
    brand: 'vw'
  },
  {
    title: 'Book Audi Vehicle',
    description: 'Reserve an Audi',
    action: 'book-audi',
    brand: 'audi'
  },
];

export function TrainerDashboard() {
  const { user } = useAuth();
  const { bookings, loading: bookingsLoading } = useBookings();
  const { vehicles, isLoading: vehiclesLoading } = useVehicles();

  // Filter bookings for current trainer
  const userBookings = bookings.filter(booking => booking.trainerId === user?.id);

  // Calculate stats
  const now = new Date();
  const next7Days = addDays(now, 7);
  const startOfCurrentMonth = startOfMonth(now);
  const endOfCurrentMonth = endOfMonth(now);
  const currentMonthInterval = { start: startOfCurrentMonth, end: endOfCurrentMonth };

  // Upcoming bookings (future bookings - start date is after now)
  const upcomingBookings = userBookings.filter(booking => {
    const startDate = parseISO(booking.startDate);
    return isAfter(startDate, now) && (booking.status === 'pending' || booking.status === 'approved');
  }).sort((a, b) => parseISO(a.startDate).getTime() - parseISO(b.startDate).getTime());

  // Active bookings (currently ongoing)
  const activeBookings = userBookings.filter(booking => {
    const startDate = parseISO(booking.startDate);
    const endDate = parseISO(booking.endDate);
    return booking.status === 'active' || 
           (isBefore(startDate, now) && isAfter(endDate, now) && booking.status === 'approved');
  }).sort((a, b) => parseISO(a.startDate).getTime() - parseISO(b.startDate).getTime());

  // Completed bookings (recently completed)
  const completedBookings = userBookings.filter(booking => {
    return booking.status === 'completed';
  }).sort((a, b) => parseISO(b.endDate).getTime() - parseISO(a.endDate).getTime()); // Most recent first

  // Confirmed/Approved bookings this month
  const confirmedBookings = userBookings.filter(booking => {
    const startDate = parseISO(booking.startDate);
    return booking.status === 'approved' && 
           isWithinInterval(startDate, currentMonthInterval);
  });

  // Pending bookings this month
  const pendingBookings = userBookings.filter(booking => {
    const startDate = parseISO(booking.startDate);
    return booking.status === 'pending' && 
           isWithinInterval(startDate, currentMonthInterval);
  });

  // Total bookings this month
  const totalBookingsThisMonth = userBookings.filter(booking => {
    const startDate = parseISO(booking.startDate);
    return isWithinInterval(startDate, currentMonthInterval);
  }).length;

  const stats = {
    upcomingBookings: upcomingBookings.length,
    confirmBooking: confirmedBookings.length,
    pendingBooking: pendingBookings.length,
    totalBookings: totalBookingsThisMonth,
  };

  // Determine which bookings to display: upcoming > active > completed
  let displayBookings = upcomingBookings;
  let displayTitle = 'Upcoming Bookings';
  let displayDescription = 'Your scheduled vehicle reservations';

  if (upcomingBookings.length === 0) {
    if (activeBookings.length > 0) {
      displayBookings = activeBookings;
      displayTitle = 'Active Bookings';
      displayDescription = 'Currently ongoing vehicle reservations';
    } else if (completedBookings.length > 0) {
      displayBookings = completedBookings;
      displayTitle = 'Recent Bookings';
      displayDescription = 'Recently completed vehicle reservations';
    }
  }

  // Get bookings with vehicle details (show all, not just top 3)
  const bookingsWithDetails = displayBookings
    .map(booking => {
      const vehicle = vehicles.find(v => v.id === booking.vehicleId);
      const startDate = parseISO(booking.startDate);
      const endDate = parseISO(booking.endDate);
      
      return {
        id: booking.id,
        vehicle: vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Unknown Vehicle',
        regNo: vehicle?.regNo || (vehicle as any)?.vehicleRegNo || 'N/A',
        date: format(startDate, 'MMM dd, yyyy'),
        time: `${format(startDate, 'HH:mm')} - ${format(endDate, 'HH:mm')}`,
        purpose: booking.purpose,
        status: booking.status === 'approved' ? 'confirmed' : booking.status
      };
    });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'approved':
        return <Badge className="bg-success text-success-foreground">Confirmed</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'active':
        return <Badge className="bg-primary text-primary-foreground">Active</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      case 'completed':
        return <Badge variant="secondary">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getBrandButton = (brand: string) => {
    switch (brand) {
      case 'skoda':
        return 'btn-skoda';
      case 'vw':
        return 'btn-vw';
      case 'audi':
        return 'btn-audi';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Trainer Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your vehicle bookings and training sessions
          </p>
        </div>
        <Button className="bg-gradient-primary hover:bg-primary-hover" onClick={() => window.location.href = '/trainer/book'}>
          <Car className="h-4 w-4 mr-2" />
          Book Vehicle
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Upcoming Bookings"
          value={stats.upcomingBookings}
          description="Next 7 days"
          icon={Calendar}
        />
        <StatCard
          title="Confirm Booking"
          value={stats.confirmBooking}
          description="This month"
          icon={TicketCheck}
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Pending Booking"
          value={stats.pendingBooking}
          description="This month"
          icon={Clock}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Total Bookings"
          value={stats.totalBookings}
          description="This month"
          icon={Car}
          trend={{ value: 15, isPositive: true }}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upcoming Bookings - Takes 2 columns */}
        <div className="lg:col-span-2">
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>{displayTitle}</span>
              </CardTitle>
              <CardDescription>
                {displayDescription}
              </CardDescription>
            </CardHeader>
              <CardContent>
              {bookingsLoading || vehiclesLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading bookings...</div>
              ) : bookingsWithDetails.length > 0 ? (
                <>
                  <div className="space-y-4">
                    {bookingsWithDetails.map((booking) => (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
                      >
                        <div className="space-y-2">
                          <p className="font-medium">{booking.vehicle}</p>
                          <p className='text-sm text-muted-foreground'>{booking.regNo}</p>
                          <p className="text-sm text-muted-foreground">{booking.purpose}</p>
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <span>{booking.date}</span>
                            <span>{booking.time}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(booking.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <Button 
                      variant="ghost" 
                      className="w-full"
                      onClick={() => window.location.href = '/trainer/bookings'}
                    >
                      View All Bookings
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No bookings found
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}