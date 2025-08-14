import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, Car, Search, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Vehicle {
  id: string;
  brand: 'Skoda' | 'Volkswagen' | 'Audi';
  model: string;
  year: number;
  licensePlate: string;
  vin: string;
  color: string;
  fuelType: 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid';
  status: 'Available' | 'Booked' | 'Maintenance' | 'Out of Service';
  mileage: number;
  location: string;
  lastService: string;
  notes: string;
}

const mockVehicles: Vehicle[] = [
  {
    id: '1',
    brand: 'Skoda',
    model: 'Octavia',
    year: 2023,
    licensePlate: 'SK-123-AB',
    vin: 'TMBJG7NE5N1234567',
    color: 'White',
    fuelType: 'Petrol',
    status: 'Available',
    mileage: 15000,
    location: 'Garage A',
    lastService: '2024-01-15',
    notes: 'Regular maintenance completed'
  },
  {
    id: '2',
    brand: 'Volkswagen',
    model: 'Golf',
    year: 2022,
    licensePlate: 'VW-456-CD',
    vin: 'WVWZZZ1JZ1234567',
    color: 'Blue',
    fuelType: 'Diesel',
    status: 'Booked',
    mileage: 28000,
    location: 'Garage B',
    lastService: '2023-12-20',
    notes: 'Minor scratches on rear bumper'
  },
  {
    id: '3',
    brand: 'Audi',
    model: 'A4',
    year: 2024,
    licensePlate: 'AU-789-EF',
    vin: 'WAUZZZ4G1234567',
    color: 'Black',
    fuelType: 'Electric',
    status: 'Available',
    mileage: 5000,
    location: 'Garage A',
    lastService: '2024-02-10',
    notes: 'New vehicle, excellent condition'
  }
];

const initialVehicleForm: Omit<Vehicle, 'id'> = {
  brand: 'Skoda',
  model: '',
  year: new Date().getFullYear(),
  licensePlate: '',
  vin: '',
  color: '',
  fuelType: 'Petrol',
  status: 'Available',
  mileage: 0,
  location: '',
  lastService: '',
  notes: ''
};

export function VehicleManagement() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(mockVehicles);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [vehicleForm, setVehicleForm] = useState<Omit<Vehicle, 'id'>>(initialVehicleForm);
  const [searchTerm, setSearchTerm] = useState('');
  const [brandFilter, setBrandFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { toast } = useToast();

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = 
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.vin.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesBrand = brandFilter === 'all' || vehicle.brand === brandFilter;
    const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter;
    
    return matchesSearch && matchesBrand && matchesStatus;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingVehicle) {
      // Update existing vehicle
      setVehicles(prev => 
        prev.map(v => v.id === editingVehicle.id ? { ...vehicleForm, id: editingVehicle.id } : v)
      );
      toast({
        title: "Vehicle Updated",
        description: `${vehicleForm.brand} ${vehicleForm.model} has been updated successfully.`,
      });
    } else {
      // Add new vehicle
      const newVehicle: Vehicle = {
        ...vehicleForm,
        id: Math.random().toString(36).substr(2, 9)
      };
      setVehicles(prev => [...prev, newVehicle]);
      toast({
        title: "Vehicle Added",
        description: `${vehicleForm.brand} ${vehicleForm.model} has been added to the fleet.`,
      });
    }
    
    resetForm();
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setVehicleForm(vehicle);
    setIsDialogOpen(true);
  };

  const handleDelete = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    setVehicles(prev => prev.filter(v => v.id !== vehicleId));
    toast({
      title: "Vehicle Removed",
      description: `${vehicle?.brand} ${vehicle?.model} has been removed from the fleet.`,
      variant: "destructive"
    });
  };

  const resetForm = () => {
    setVehicleForm(initialVehicleForm);
    setEditingVehicle(null);
    setIsDialogOpen(false);
  };

  const getStatusBadgeVariant = (status: Vehicle['status']) => {
    switch (status) {
      case 'Available': return 'default';
      case 'Booked': return 'secondary';
      case 'Maintenance': return 'destructive';
      case 'Out of Service': return 'outline';
      default: return 'default';
    }
  };

  const getBrandColor = (brand: Vehicle['brand']) => {
    switch (brand) {
      case 'Skoda': return 'text-skoda';
      case 'Volkswagen': return 'text-vw';
      case 'Audi': return 'text-audi';
      default: return 'text-foreground';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Vehicle Management</h1>
          <p className="text-muted-foreground">Manage your fleet vehicles and their details</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()} className="btn-skoda">
              <Plus className="h-4 w-4 mr-2" />
              Add Vehicle
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
              </DialogTitle>
              <DialogDescription>
                {editingVehicle ? 'Update vehicle information' : 'Add a new vehicle to your fleet'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brand">Brand</Label>
                  <Select
                    value={vehicleForm.brand}
                    onValueChange={(value: Vehicle['brand']) => 
                      setVehicleForm(prev => ({ ...prev, brand: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Skoda">Skoda</SelectItem>
                      <SelectItem value="Volkswagen">Volkswagen</SelectItem>
                      <SelectItem value="Audi">Audi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    value={vehicleForm.model}
                    onChange={(e) => setVehicleForm(prev => ({ ...prev, model: e.target.value }))}
                    placeholder="Enter model name"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    type="number"
                    value={vehicleForm.year}
                    onChange={(e) => setVehicleForm(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                    min="2000"
                    max={new Date().getFullYear() + 1}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="licensePlate">License Plate</Label>
                  <Input
                    id="licensePlate"
                    value={vehicleForm.licensePlate}
                    onChange={(e) => setVehicleForm(prev => ({ ...prev, licensePlate: e.target.value }))}
                    placeholder="XX-123-AB"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vin">VIN Number</Label>
                  <Input
                    id="vin"
                    value={vehicleForm.vin}
                    onChange={(e) => setVehicleForm(prev => ({ ...prev, vin: e.target.value }))}
                    placeholder="17-character VIN"
                    maxLength={17}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    value={vehicleForm.color}
                    onChange={(e) => setVehicleForm(prev => ({ ...prev, color: e.target.value }))}
                    placeholder="Enter color"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fuelType">Fuel Type</Label>
                  <Select
                    value={vehicleForm.fuelType}
                    onValueChange={(value: Vehicle['fuelType']) => 
                      setVehicleForm(prev => ({ ...prev, fuelType: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Petrol">Petrol</SelectItem>
                      <SelectItem value="Diesel">Diesel</SelectItem>
                      <SelectItem value="Electric">Electric</SelectItem>
                      <SelectItem value="Hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={vehicleForm.status}
                    onValueChange={(value: Vehicle['status']) => 
                      setVehicleForm(prev => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Available">Available</SelectItem>
                      <SelectItem value="Booked">Booked</SelectItem>
                      <SelectItem value="Maintenance">Maintenance</SelectItem>
                      <SelectItem value="Out of Service">Out of Service</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mileage">Mileage (km)</Label>
                  <Input
                    id="mileage"
                    type="number"
                    value={vehicleForm.mileage}
                    onChange={(e) => setVehicleForm(prev => ({ ...prev, mileage: parseInt(e.target.value) || 0 }))}
                    min="0"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={vehicleForm.location}
                    onChange={(e) => setVehicleForm(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Garage A, Building 1, etc."
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastService">Last Service Date</Label>
                <Input
                  id="lastService"
                  type="date"
                  value={vehicleForm.lastService}
                  onChange={(e) => setVehicleForm(prev => ({ ...prev, lastService: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={vehicleForm.notes}
                  onChange={(e) => setVehicleForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes about the vehicle..."
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit" className="btn-skoda">
                  {editingVehicle ? 'Update Vehicle' : 'Add Vehicle'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters and Search */}
      <Card className="card-elevated">
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
                  placeholder="Search by model, license plate, or VIN..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={brandFilter} onValueChange={setBrandFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="All Brands" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Brands</SelectItem>
                <SelectItem value="Skoda">Skoda</SelectItem>
                <SelectItem value="Volkswagen">Volkswagen</SelectItem>
                <SelectItem value="Audi">Audi</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Available">Available</SelectItem>
                <SelectItem value="Booked">Booked</SelectItem>
                <SelectItem value="Maintenance">Maintenance</SelectItem>
                <SelectItem value="Out of Service">Out of Service</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Vehicle Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="card-elevated">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Car className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Vehicles</p>
                <p className="text-2xl font-bold">{vehicles.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-elevated">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <Car className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Available</p>
                <p className="text-2xl font-bold">{vehicles.filter(v => v.status === 'Available').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-elevated">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-warning/10 rounded-lg">
                <Car className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Booked</p>
                <p className="text-2xl font-bold">{vehicles.filter(v => v.status === 'Booked').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-elevated">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <Car className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Maintenance</p>
                <p className="text-2xl font-bold">{vehicles.filter(v => v.status === 'Maintenance').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vehicle Table */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle>Fleet Vehicles</CardTitle>
          <CardDescription>
            Showing {filteredVehicles.length} of {vehicles.length} vehicles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>License Plate</TableHead>
                  <TableHead>VIN</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Mileage</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVehicles.map((vehicle) => (
                  <TableRow key={vehicle.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className={`font-semibold ${getBrandColor(vehicle.brand)}`}>
                          {vehicle.brand}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {vehicle.model} ({vehicle.year})
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {vehicle.color} • {vehicle.fuelType}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">{vehicle.licensePlate}</TableCell>
                    <TableCell className="font-mono text-xs">{vehicle.vin}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(vehicle.status)}>
                        {vehicle.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{vehicle.mileage.toLocaleString()} km</TableCell>
                    <TableCell>{vehicle.location}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(vehicle)}
                          className="hover-scale"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(vehicle.id)}
                          className="hover-scale text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {filteredVehicles.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No vehicles found matching your criteria.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}