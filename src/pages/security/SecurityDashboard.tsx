import { Key, ArrowLeftRight, Shield, AlertCircle, Clock, CheckCircle, MapPin } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useBookings } from '@/hooks/useBookings';
import { useVehicles } from '@/hooks/useVehicles';
import { useLocationFilter } from '@/hooks/useLocationFilter';
import { getLocationName } from '@/constants/locations';
import { format, isAfter, isBefore, startOfDay, endOfDay, isToday } from 'date-fns';

export function SecurityDashboard() {
  const { user } = useAuth();
  const { bookings, loading: bookingsLoading } = useBookings();
  const { vehicles, isLoading: vehiclesLoading } = useVehicles();
  const { filterByLocation } = useLocationFilter();
  
  // Filter bookings by location for security user
  const locationBookings = filterByLocation(bookings.map(b => ({
    ...b,
    location: b.requestedLocation
  })));
  
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  
  // Calculate stats dynamically
  // Keys issued today = approved bookings that started today or are active
  const keysIssuedToday = locationBookings.filter(b => {
    const startDate = new Date(b.startDate);
    return (b.status === 'approved' || b.status === 'active') && 
           (isToday(startDate) || isBefore(startDate, now));
  }).length;
  
  // Pending returns = active bookings that haven't ended yet
  const pendingReturns = locationBookings.filter(b => {
    const endDate = new Date(b.endDate);
    return b.status === 'active' && isAfter(endDate, now);
  }).length;
  
  // Security alerts = overdue bookings (end date has passed but status is still active)
  const securityAlerts = locationBookings.filter(b => {
    const endDate = new Date(b.endDate);
    return b.status === 'active' && isBefore(endDate, now);
  }).length;
  
  // Vehicles in use = active bookings
  const vehiclesInUse = locationBookings.filter(b => b.status === 'active').length;
  
  const stats = {
    keysIssued: keysIssuedToday,
    pendingReturns,
    securityAlerts,
    vehiclesInUse,
  };
  
  // Pending key requests = approved bookings that are ready (start date is today or in the past)
  const pendingKeyRequests = locationBookings
    .filter(b => {
      const startDate = new Date(b.startDate);
      return b.status === 'approved' && 
             (isToday(startDate) || isBefore(startDate, now) || isAfter(startDate, now));
    })
    .slice(0, 3)
    .map(booking => {
      const vehicle = vehicles.find(v => v.id === booking.vehicleId);
      const startDate = new Date(booking.startDate);
      return {
        id: booking.id,
        vehicle: vehicle ? `${vehicle.brand} ${vehicle.model} - ${vehicle.regNo}` : 'Unknown Vehicle',
        trainer: booking.trainerName,
        requestTime: format(startDate, 'HH:mm'),
        purpose: booking.purpose,
        booking
      };
    });
  
  // Active key issues = active bookings
  const activeIssues = locationBookings
    .filter(b => b.status === 'active')
    .slice(0, 3)
    .map(booking => {
      const vehicle = vehicles.find(v => v.id === booking.vehicleId);
      const startDate = new Date(booking.startDate);
      const endDate = new Date(booking.endDate);
      const isOverdue = isBefore(endDate, now);
      return {
        id: booking.id,
        vehicle: vehicle ? `${vehicle.brand} ${vehicle.model} - ${vehicle.regNo}` : 'Unknown Vehicle',
        trainer: booking.trainerName,
        issuedTime: format(startDate, 'HH:mm'),
        expectedReturn: format(endDate, 'HH:mm'),
        status: isOverdue ? 'overdue' : 'active',
        booking
      };
    });
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-success text-success-foreground">Active</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Overdue</Badge>;
      case 'returned':
        return <Badge variant="secondary">Returned</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold">Security Dashboard</h1>
            {user?.location && (
              <Badge variant="outline" className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {getLocationName(user.location)}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            Vehicle key management and security monitoring {user?.location && `at ${getLocationName(user.location)}`}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline"
          onClick={() => window.location.href = '/security/logs'}
          >
            <Shield className="h-4 w-4 mr-2" />
            Security Log
          </Button>
          <Button 
            variant="outline"
            onClick={() => window.location.href = '/security/returns'}
          >
            <ArrowLeftRight className="h-4 w-4 mr-2" />
            Vehicle Returns
          </Button>
          <Button 
            className="bg-gradient-primary hover:bg-primary-hover"
            onClick={() => window.location.href = '/security/keys'}
          >
            <Key className="h-4 w-4 mr-2" />
            Issue Keys
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Keys Issued Today"
          value={stats.keysIssued}
          description="Active key handouts"
          icon={Key}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Pending Returns"
          value={stats.pendingReturns}
          description="Vehicles still out"
          icon={ArrowLeftRight}
        />
        <StatCard
          title="Security Alerts"
          value={stats.securityAlerts}
          description="Requires attention"
          icon={AlertCircle}
          className="border-warning"
        />
        <StatCard
          title="Vehicles in Use"
          value={stats.vehiclesInUse}
          description="Currently deployed"
          icon={Shield}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending Key Requests */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Key className="h-5 w-5" />
              <span>Pending Key Requests</span>
            </CardTitle>
            <CardDescription>
              Trainers waiting for vehicle key approval
            </CardDescription>
          </CardHeader>
          <CardContent>
            {bookingsLoading || vehiclesLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : pendingKeyRequests.length > 0 ? (
              <>
                <div className="space-y-4">
                  {pendingKeyRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
                    >
                      <div className="space-y-1">
                        <p className="font-medium">{request.vehicle}</p>
                        <p className="text-sm text-muted-foreground">
                          {request.trainer} • {request.purpose}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Requested at {request.requestTime}
                        </p>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <Button 
                          size="sm" 
                          className="h-7"
                          onClick={() => window.location.href = '/security/keys'}
                        >
                          Issue Key
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t">
                  <Button 
                    variant="ghost" 
                    className="w-full"
                    onClick={() => window.location.href = '/security/keys'}
                  >
                    View All Requests
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No pending key requests
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Key Issues */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Active Key Issues</span>
            </CardTitle>
            <CardDescription>
              Currently issued keys and expected returns
            </CardDescription>
          </CardHeader>
          <CardContent>
            {bookingsLoading || vehiclesLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : activeIssues.length > 0 ? (
              <>
                <div className="space-y-4">
                  {activeIssues.map((issue) => (
                    <div
                      key={issue.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
                    >
                      <div className="space-y-1">
                        <p className="font-medium">{issue.vehicle}</p>
                        <p className="text-sm text-muted-foreground">{issue.trainer}</p>
                        <p className="text-xs text-muted-foreground">
                          Issued: {issue.issuedTime} | Return: {issue.expectedReturn}
                        </p>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        {getStatusBadge(issue.status)}
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-7"
                          onClick={() => window.location.href = '/security/returns'}
                        >
                          Check Return
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t">
                  <Button 
                    variant="ghost" 
                    className="w-full"
                    onClick={() => window.location.href = '/security/returns'}
                  >
                    View All Active Issues
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No active key issues
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}