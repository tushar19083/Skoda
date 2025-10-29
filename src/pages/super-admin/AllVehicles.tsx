import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Car, Search, Filter, CheckCircle, Clock, AlertTriangle, Calendar } from 'lucide-react';
import { useVehicles } from '@/hooks/useVehicles';
import { StatCard } from '@/components/dashboard/StatCard';
import { LOCATIONS } from '@/constants/locations';

export function AllVehicles() {
  // Don't filter by location - get all vehicles
  const { vehicles, isLoading, updateVehicle } = useVehicles();
  const [searchTerm, setSearchTerm] = useState('');
  const [brandFilter, setBrandFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = 
      vehicle.regNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesBrand = brandFilter === 'all' || vehicle.brand === brandFilter;
    const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter;
    const matchesLocation = locationFilter === 'all' || vehicle.location === locationFilter;
    
    return matchesSearch && matchesBrand && matchesStatus && matchesLocation;
  });

  const uniqueBrands = [...new Set(vehicles.map(v => v.brand))];
  const uniqueLocations = [...new Set(vehicles.map(v => v.location))];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Available':
        return <Badge className="bg-success text-success-foreground">Available</Badge>;
      case 'In Use':
        return <Badge className="bg-primary text-primary-foreground">In Use</Badge>;
      case 'Maintenance':
        return <Badge className="bg-warning text-warning-foreground">Maintenance</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading vehicles...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">All Vehicles - All Locations</h1>
          <p className="text-muted-foreground">
            Monitor and manage fleet vehicles across all training centers
          </p>
        </div>
      </div>

      {/* Vehicle Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Vehicles"
          value={vehicles.length}
          description="Across all locations"
          icon={Car}
        />
        <StatCard
          title="Available"
          value={vehicles.filter(v => v.status === 'Available').length}
          description="Ready for use"
          icon={CheckCircle}
        />
        <StatCard
          title="In Use"
          value={vehicles.filter(v => v.status === 'In Use').length}
          description="Currently booked"
          icon={Clock}
        />
        <StatCard
          title="Maintenance"
          value={vehicles.filter(v => v.status === 'Maintenance').length}
          description="Under service"
          icon={AlertTriangle}
        />
      </div>

      {/* Filters */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filter & Search</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search vehicles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={brandFilter} onValueChange={setBrandFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Brands" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Brands</SelectItem>
                {uniqueBrands.map(brand => (
                  <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Maintenance">Maintenance</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
                <SelectItem value="Decommissioned">Decommissioned</SelectItem>
              </SelectContent>
            </Select>

            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {LOCATIONS.map(location => (
                  <SelectItem key={location.code} value={location.code}>
                    {location.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Vehicles Table */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle>Vehicle Fleet</CardTitle>
          <CardDescription>
            Showing {filteredVehicles.length} of {vehicles.length} vehicles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle No.</TableHead>
                  <TableHead>Brand/Model</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Insurance Expiry</TableHead>
                  <TableHead>PUC Expiry</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVehicles.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell className="font-medium">{vehicle.regNo}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{vehicle.brand}</div>
                        <div className="text-sm text-muted-foreground">{vehicle.model}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{vehicle.location}</Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(vehicle.status)}</TableCell>
                    <TableCell className="text-sm">N/A</TableCell>
                    <TableCell className="text-sm">N/A</TableCell>
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