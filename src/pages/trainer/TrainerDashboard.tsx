import { Calendar, Car, Clock, BookOpen, TrendingUp } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const mockStats = {
  upcomingBookings: 3,
  totalBookings: 24,
  hoursThisMonth: 18,
  completedSessions: 21,
};

const mockUpcomingBookings = [
  {
    id: '1',
    vehicle: 'Skoda Octavia RS - SK003',
    date: '2024-01-16',
    time: '09:00 - 11:00',
    purpose: 'Advanced Driving Training',
    status: 'confirmed'
  },
  {
    id: '2',
    vehicle: 'VW Golf GTI - VW005',
    date: '2024-01-17',
    time: '14:00 - 16:00',
    purpose: 'Safety Course',
    status: 'pending'
  },
  {
    id: '3',
    vehicle: 'Audi A3 - AD001',
    date: '2024-01-18',
    time: '10:00 - 12:00',
    purpose: 'Eco Driving Session',
    status: 'confirmed'
  },
];

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
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-success text-success-foreground">Confirmed</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
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
        <Button className="bg-gradient-primary hover:bg-primary-hover">
          <Car className="h-4 w-4 mr-2" />
          Book Vehicle
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Upcoming Bookings"
          value={mockStats.upcomingBookings}
          description="Next 7 days"
          icon={Calendar}
        />
        <StatCard
          title="Total Bookings"
          value={mockStats.totalBookings}
          description="This month"
          icon={Car}
          trend={{ value: 15, isPositive: true }}
        />
        <StatCard
          title="Training Hours"
          value={mockStats.hoursThisMonth}
          description="This month"
          icon={Clock}
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Completed Sessions"
          value={mockStats.completedSessions}
          description="This month"
          icon={BookOpen}
          trend={{ value: 12, isPositive: true }}
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
                <span>Upcoming Bookings</span>
              </CardTitle>
              <CardDescription>
                Your scheduled vehicle reservations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockUpcomingBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
                  >
                    <div className="space-y-2">
                      <p className="font-medium">{booking.vehicle}</p>
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
                <Button variant="ghost" className="w-full">
                  View All Bookings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Book Actions */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Quick Book</span>
            </CardTitle>
            <CardDescription>
              Fast vehicle reservation by brand
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockQuickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className={`w-full justify-start h-auto p-4 ${getBrandButton(action.brand)}`}
                >
                  <div className="text-left">
                    <p className="font-medium">{action.title}</p>
                    <p className="text-xs opacity-80">{action.description}</p>
                  </div>
                </Button>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <Button variant="ghost" className="w-full">
                Advanced Booking
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Training Progress */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <span>Training Progress</span>
          </CardTitle>
          <CardDescription>
            Your training activities and achievements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-primary">85%</p>
              <p className="text-sm text-muted-foreground">Course Completion</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-primary">4.8</p>
              <p className="text-sm text-muted-foreground">Average Rating</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-primary">156</p>
              <p className="text-sm text-muted-foreground">Total Hours</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}