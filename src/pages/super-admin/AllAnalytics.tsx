import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/dashboard/StatCard';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Calendar, 
  Users, 
  Car,
  Download,
  Activity
} from 'lucide-react';

const mockAnalytics = {
  overview: {
    totalBookings: 1284,
    avgBookingDuration: 2.4,
    fleetUtilization: 76.8,
    activeTrainers: 45
  },
  monthlyTrends: [
    { month: 'Jan', bookings: 98, utilization: 72, trainers: 42 },
    { month: 'Feb', bookings: 125, utilization: 78, trainers: 43 },
    { month: 'Mar', bookings: 142, utilization: 85, trainers: 44 },
    { month: 'Apr', bookings: 118, utilization: 68, trainers: 44 },
    { month: 'May', bookings: 156, utilization: 82, trainers: 45 },
    { month: 'Jun', bookings: 178, utilization: 89, trainers: 45 },
  ],
  topVehicles: [
    { model: 'Skoda Octavia', bookings: 45, utilization: 92 },
    { model: 'VW Golf', bookings: 38, utilization: 87 },
    { model: 'Audi A4', bookings: 32, utilization: 78 },
    { model: 'Skoda Fabia', bookings: 28, utilization: 65 },
    { model: 'VW Passat', bookings: 25, utilization: 58 },
  ],
  trainerMetrics: {
    activeTrainers: 45,
    avgBookingsPerTrainer: 28.5,
    avgUtilizationRate: 76.8,
  },
};

export function AllAnalytics() {
  const [timeRange, setTimeRange] = useState('6months');

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
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Bookings"
          value={mockAnalytics.overview.totalBookings}
          description="Completed bookings"
          icon={Calendar}
          trend={{ value: 8.2, isPositive: true }}
        />
        <StatCard
          title="Active Trainers"
          value={mockAnalytics.overview.activeTrainers}
          description="Currently assigned"
          icon={Users}
          trend={{ value: 5.1, isPositive: true }}
        />
        <StatCard
          title="Avg Duration"
          value={`${mockAnalytics.overview.avgBookingDuration}h`}
          description="Per booking session"
          icon={Activity}
        />
        <StatCard
          title="Fleet Utilization"
          value={`${mockAnalytics.overview.fleetUtilization}%`}
          description="Overall efficiency"
          icon={Car}
          trend={{ value: 3.2, isPositive: false }}
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
            <div className="space-y-4">
              {mockAnalytics.monthlyTrends.map((trend) => (
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
          </CardContent>
        </Card>

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
            <div className="space-y-4">
              {mockAnalytics.topVehicles.map((vehicle, index) => (
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
          </CardContent>
        </Card>
      </div>

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
              <div className="text-2xl font-bold text-primary">{mockAnalytics.trainerMetrics.activeTrainers}</div>
              <div className="text-sm text-muted-foreground">Active Trainers</div>
              <div className="text-xs text-success">All locations combined</div>
            </div>
            <div className="space-y-2 p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-primary">{mockAnalytics.trainerMetrics.avgBookingsPerTrainer}</div>
              <div className="text-sm text-muted-foreground">Avg Bookings per Trainer</div>
              <div className="text-xs text-success">Per month</div>
            </div>
            <div className="space-y-2 p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-primary">{mockAnalytics.trainerMetrics.avgUtilizationRate}%</div>
              <div className="text-sm text-muted-foreground">Avg Utilization Rate</div>
              <div className="text-xs text-muted-foreground">Fleet-wide average</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle>Analytics Reports</CardTitle>
          <CardDescription>Generate detailed reports and insights</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="text-left">
                <p className="font-medium">Usage Statistics</p>
                <p className="text-xs text-muted-foreground">Fleet utilization metrics</p>
              </div>
            </Button>
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="text-left">
                <p className="font-medium">Trainer Activity</p>
                <p className="text-xs text-muted-foreground">Booking patterns and engagement</p>
              </div>
            </Button>
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="text-left">
                <p className="font-medium">Vehicle Performance</p>
                <p className="text-xs text-muted-foreground">Usage and maintenance trends</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}