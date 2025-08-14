import { Car, Users, Calendar, Settings, TrendingUp, AlertTriangle } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const mockStats = {
  totalVehicles: 45,
  activeBookings: 12,
  totalUsers: 89,
  maintenanceDue: 3,
};

const mockRecentBookings = [
  {
    id: '1',
    vehicle: 'Skoda Octavia - SK001',
    trainer: 'Sarah Thompson',
    date: '2024-01-15',
    status: 'active',
    duration: '2 hours'
  },
  {
    id: '2',
    vehicle: 'VW Golf - VW003',
    trainer: 'Mike Johnson',
    date: '2024-01-15',
    status: 'pending',
    duration: '3 hours'
  },
  {
    id: '3',
    vehicle: 'Audi A4 - AD002',
    trainer: 'Emma Wilson',
    date: '2024-01-14',
    status: 'completed',
    duration: '1.5 hours'
  },
];

const mockMaintenanceAlerts = [
  {
    id: '1',
    vehicle: 'Skoda Superb - SK005',
    type: 'Service Due',
    dueDate: '2024-01-20',
    priority: 'high'
  },
  {
    id: '2',
    vehicle: 'VW Passat - VW008',
    type: 'Inspection',
    dueDate: '2024-01-25',
    priority: 'medium'
  },
];

export function AdminDashboard() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-success text-success-foreground">Active</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'completed':
        return <Badge variant="secondary">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge className="bg-warning text-warning-foreground">Medium</Badge>;
      case 'low':
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of fleet operations and system management
          </p>
        </div>
        <Button className="bg-gradient-primary hover:bg-primary-hover">
          Generate Report
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Vehicles"
          value={mockStats.totalVehicles}
          description="Active fleet vehicles"
          icon={Car}
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Active Bookings"
          value={mockStats.activeBookings}
          description="Current reservations"
          icon={Calendar}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Total Users"
          value={mockStats.totalUsers}
          description="Registered system users"
          icon={Users}
          trend={{ value: 3, isPositive: true }}
        />
        <StatCard
          title="Maintenance Due"
          value={mockStats.maintenanceDue}
          description="Vehicles requiring service"
          icon={AlertTriangle}
          className="border-warning"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Bookings */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Recent Bookings</span>
            </CardTitle>
            <CardDescription>
              Latest vehicle reservations and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockRecentBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{booking.vehicle}</p>
                    <p className="text-sm text-muted-foreground">
                      {booking.trainer} • {booking.duration}
                    </p>
                    <p className="text-xs text-muted-foreground">{booking.date}</p>
                  </div>
                  {getStatusBadge(booking.status)}
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

        {/* Maintenance Alerts */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Maintenance Alerts</span>
            </CardTitle>
            <CardDescription>
              Vehicles requiring attention or scheduled maintenance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockMaintenanceAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{alert.vehicle}</p>
                    <p className="text-sm text-muted-foreground">{alert.type}</p>
                    <p className="text-xs text-muted-foreground">Due: {alert.dueDate}</p>
                  </div>
                  {getPriorityBadge(alert.priority)}
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <Button variant="ghost" className="w-full">
                View All Maintenance
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Quick Actions</span>
          </CardTitle>
          <CardDescription>
            Common administrative tasks and shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="text-left">
                <p className="font-medium">Add Vehicle</p>
                <p className="text-xs text-muted-foreground">Register new vehicle</p>
              </div>
            </Button>
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="text-left">
                <p className="font-medium">Create User</p>
                <p className="text-xs text-muted-foreground">Add new system user</p>
              </div>
            </Button>
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="text-left">
                <p className="font-medium">Schedule Service</p>
                <p className="text-xs text-muted-foreground">Plan maintenance</p>
              </div>
            </Button>
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="text-left">
                <p className="font-medium">Export Data</p>
                <p className="text-xs text-muted-foreground">Generate reports</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}