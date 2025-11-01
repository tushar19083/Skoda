import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/dashboard/StatCard';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
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

const mockAnalytics = {
  overview: {
    totalVehicles: 21,
    activeVehicles: 18,
    avgVehicleAge: 3.2,
    fleetUtilization: 85.7,
  },
  monthlyTrends: [
    { month: 'Jan', bookings: 98, utilization: 72, maintenance: 5 },
    { month: 'Feb', bookings: 125, utilization: 78, maintenance: 3 },
    { month: 'Mar', bookings: 142, utilization: 85, maintenance: 7 },
    { month: 'Apr', bookings: 118, utilization: 68, maintenance: 4 },
    { month: 'May', bookings: 156, utilization: 82, maintenance: 6 },
    { month: 'Jun', bookings: 178, utilization: 89, maintenance: 2 },
  ],
  brandDistribution: [
    { brand: 'Skoda (SA)', count: 6, utilization: 92, activeVehicles: 6 },
    { brand: 'Volkswagen (VW)', count: 8, utilization: 87, activeVehicles: 6 },
    { brand: 'Audi (AU)', count: 7, utilization: 78, activeVehicles: 6 },
  ],
  trainerMetrics: {
    totalTrainers: 7,
    activeTrainers: 6,
    avgVehiclesPerTrainer: 3.2,
    topTrainer: 'Ranjeet Thorat',
  },
  complianceStatus: {
    insuranceValid: 18,
    insuranceExpired: 3,
    pucValid: 12,
    pucExpired: 6,
    pucNA: 3,
  },
  locationDistribution: [
    { location: 'Pune', vehicles: 18, utilization: 88 },
    { location: 'VGTAP', vehicles: 3, utilization: 65 },
  ],
  trainerAllocations: [
    { trainer: 'Ranjeet Thorat', vehicles: 4, brands: ['VW', 'SA'] },
    { trainer: 'Sanjay Borade', vehicles: 3, brands: ['SA', 'VW'] },
    { trainer: 'Mahesh Deshmukh', vehicles: 2, brands: ['VW', 'SA'] },
    { trainer: 'Dattaprasad Duble', vehicles: 3, brands: ['AU'] },
    { trainer: 'Yogesh Sundaramurthy', vehicles: 3, brands: ['AU'] },
    { trainer: 'Unallocated', vehicles: 6, brands: ['VW', 'SA'] },
  ],
};

export function Analytics() {
  const [timeRange, setTimeRange] = useState('6months');
  const [viewType, setViewType] = useState('overview');

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
          <Button variant="outline" className="w-full sm:w-auto">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Vehicles"
          value={mockAnalytics.overview.totalVehicles}
          description="Fleet size"
          icon={Car}
          trend={{ value: 5, isPositive: true }}
        />
        <StatCard
          title="Active Vehicles"
          value={mockAnalytics.overview.activeVehicles}
          description="Currently operational"
          icon={CheckCircle}
          trend={{ value: 8.2, isPositive: true }}
        />
        <StatCard
          title="Fleet Utilization"
          value={`${mockAnalytics.overview.fleetUtilization}%`}
          description="Overall usage rate"
          icon={BarChart3}
          trend={{ value: 5.1, isPositive: true }}
        />
        <StatCard
          title="Avg Vehicle Age"
          value={`${mockAnalytics.overview.avgVehicleAge} yrs`}
          description="Fleet age"
          icon={Clock}
          trend={{ value: 2.1, isPositive: false }}
        />
      </div>

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
                <Badge variant="destructive">{mockAnalytics.complianceStatus.insuranceExpired} vehicles</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">PUC Expired</span>
                <Badge variant="destructive">{mockAnalytics.complianceStatus.pucExpired} vehicles</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Under Repair</span>
                <Badge variant="outline">2 vehicles</Badge>
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
                <Badge variant="secondary" className="bg-green-100 text-green-800">{mockAnalytics.complianceStatus.insuranceValid} vehicles</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">PUC Valid</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">{mockAnalytics.complianceStatus.pucValid} vehicles</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">PUC Not Required</span>
                <Badge variant="outline">{mockAnalytics.complianceStatus.pucNA} vehicles</Badge>
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
            <div className="space-y-4">
              {mockAnalytics.brandDistribution.map((brand, index) => (
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
          </CardContent>
        </Card>

        {/* Location Distribution */}
        <Card className="shadow-sm border border-gray-200">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <BarChart3 className="h-5 w-5 text-green-600" />
              <span>Location Analysis</span>
            </CardTitle>
            <CardDescription className="text-sm text-gray-600">Vehicle distribution by academy location</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockAnalytics.locationDistribution.map((location) => (
                <div key={location.location} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900">{location.location}</span>
                    <span className="text-sm text-gray-600">{location.vehicles} vehicles</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-600 rounded-full transition-all duration-300"
                        style={{ width: `${location.utilization}%` }}
                      />
                    </div>
                    <div className="text-sm font-medium text-gray-900 w-10 text-right">{location.utilization}%</div>
                  </div>
                </div>
              ))}
            </div>
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-2xl font-bold text-blue-600">{mockAnalytics.trainerMetrics.totalTrainers}</div>
                <div className="text-sm text-gray-600">Total Trainers</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-blue-600">{mockAnalytics.trainerMetrics.activeTrainers}</div>
                <div className="text-sm text-gray-600">Active Trainers</div>
              </div>
              <div className="space-y-2 col-span-2">
                <div className="text-lg font-medium text-gray-900">Top Trainer: {mockAnalytics.trainerMetrics.topTrainer}</div>
                <div className="text-xs text-gray-500">Most vehicles allocated</div>
              </div>
            </div>
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
            <div className="space-y-3">
              {mockAnalytics.trainerAllocations.slice(0, 5).map((allocation) => (
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
          </CardContent>
        </Card>
      </div>

    </div>
  );
}