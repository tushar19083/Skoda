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
import { Plus, Edit, Trash2, Car, Search, Filter, AlertTriangle, CheckCircle, Shield } from 'lucide-react';

interface Vehicle {
  id: string;
  academyLocation: 'Pune' | 'VGTAP';
  brand: 'VW' | 'SA' | 'AU';
  model: string;
  name: string;
  vehicleRegNo: string;
  vinNo: string;
  insuranceValidityDate: string;
  insuranceStatus: 'Valid' | 'Expired';
  pucValidityDate: string;
  pucStatus: 'Valid' | 'Expired' | 'NA';
  dateDecommissioned?: string;
  allocatedTrainer?: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

const initialVehicleForm: Omit<Vehicle, 'id' | 'slNo' | 'createdAt' | 'updatedAt'> = {
  academyLocation: 'Pune',
  brand: 'SA',
  model: '',
  name: '',
  vehicleRegNo: '',
  vinNo: '',
  insuranceValidityDate: '',
  insuranceStatus: 'Valid',
  pucValidityDate: '',
  pucStatus: 'Valid',
  dateDecommissioned: '',
  allocatedTrainer: '',
  remarks: ''
};

const mockVehicles: Vehicle[] = [
  {
    id: '1',
    academyLocation: 'Pune',
    brand: 'VW',
    model: 'Vento',
    name: 'Polo A05 Ind.Highl 77 A6F',
    vehicleRegNo: 'MH14DX2031',
    vinNo: 'WVWJ11609CT011421',
    insuranceValidityDate: '2026-06-30',
    insuranceStatus: 'Valid',
    pucValidityDate: '2025-05-20',
    pucStatus: 'Expired',
    allocatedTrainer: 'Transferred to VGTAP',
    remarks: 'Transferred to VGTAP, NSTI, Hyderabad on 08.07.2025. PUC is not required as the car is used solely for static training purposes.',
    createdAt: '2025-01-01',
    updatedAt: '2025-08-04'
  },
  {
    id: '2',
    academyLocation: 'Pune',
    brand: 'VW',
    model: 'Vento',
    name: 'POLO A05 1.5 HIGHL 77 TDI D7F',
    vehicleRegNo: 'MH14EY185',
    vinNo: 'MEXD1560XFT089626',
    insuranceValidityDate: '2026-06-30',
    insuranceStatus: 'Valid',
    pucValidityDate: '2025-09-15',
    pucStatus: 'Valid',
    allocatedTrainer: 'Mahesh Deshmukh',
    createdAt: '2025-01-01',
    updatedAt: '2025-08-04'
  },
  {
    id: '3',
    academyLocation: 'Pune',
    brand: 'SA',
    model: 'Superb',
    name: 'SUPERB GrtSTY TS132/1.8M6F',
    vehicleRegNo: 'MH20DV1650',
    vinNo: 'TMBBLANP5GA300004',
    insuranceValidityDate: '2026-01-29',
    insuranceStatus: 'Valid',
    pucValidityDate: '2026-02-04',
    pucStatus: 'Valid',
    allocatedTrainer: 'Ranjeet Thorat',
    createdAt: '2025-01-01',
    updatedAt: '2025-08-04'
  },
  {
    id: '4',
    academyLocation: 'Pune',
    brand: 'AU',
    model: 'A4',
    name: 'A4 Sedan 1.4 R4110 A7',
    vehicleRegNo: 'MH14GH0382',
    vinNo: 'WAUZKGF43HY700402',
    insuranceValidityDate: '2026-06-30',
    insuranceStatus: 'Valid',
    pucValidityDate: '2025-09-15',
    pucStatus: 'Valid',
    allocatedTrainer: 'Dattaprasad Duble',
    createdAt: '2025-01-01',
    updatedAt: '2025-08-04'
  }
];

export function VehicleManagement() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(mockVehicles);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [vehicleForm, setVehicleForm] = useState<Omit<Vehicle, 'id' | 'slNo' | 'createdAt' | 'updatedAt'>>(initialVehicleForm);
  const [searchTerm, setSearchTerm] = useState('');
  const [brandFilter, setBrandFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = 
      vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.vehicleRegNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.vinNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (vehicle.allocatedTrainer && vehicle.allocatedTrainer.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesBrand = brandFilter === 'all' || vehicle.brand === brandFilter;
    const matchesLocation = locationFilter === 'all' || vehicle.academyLocation === locationFilter;
    
    return matchesSearch && matchesBrand && matchesLocation;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingVehicle) {
        setVehicles(prev => prev.map(v => 
          v.id === editingVehicle.id 
            ? { ...v, ...vehicleForm, updatedAt: new Date().toISOString() }
            : v
        ));
      } else {
        const newVehicle: Vehicle = {
          id: Date.now().toString(),
          ...vehicleForm,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setVehicles(prev => [...prev, newVehicle]);
      }
      resetForm();
    } catch (error) {
      console.error('Failed to save vehicle:', error);
    }
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    const { id, createdAt, updatedAt, ...formData } = vehicle;
    setVehicleForm(formData);
    setIsDialogOpen(true);
  };

  const handleDelete = async (vehicleId: string) => {
    if (confirm('Are you sure you want to delete this vehicle?')) {
      setVehicles(prev => prev.filter(v => v.id !== vehicleId));
    }
  };

  const resetForm = () => {
    setVehicleForm(initialVehicleForm);
    setEditingVehicle(null);
    setIsDialogOpen(false);
  };

  const getInsuranceStatusBadge = (status: string) => {
    return status === 'Valid' ? 'default' : 'destructive';
  };

  const getPucStatusBadge = (status: string) => {
    if (status === 'Valid') return 'default';
    if (status === 'Expired') return 'destructive';
    return 'outline';
  };

  const getBrandColor = (brand: string) => {
    switch (brand) {
      case 'SA': return 'text-green-600';
      case 'VW': return 'text-blue-600';
      case 'AU': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getBrandName = (brand: string) => {
    switch (brand) {
      case 'SA': return 'Skoda';
      case 'VW': return 'Volkswagen';
      case 'AU': return 'Audi';
      default: return brand;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">Fleet Vehicle Management</h1>
          <p className="text-sm text-gray-600 mt-1">Manage your fleet vehicles, compliance, and trainer assignments</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Vehicle
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">
                {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
              </DialogTitle>
              <DialogDescription>
                {editingVehicle ? 'Update vehicle information and compliance details' : 'Add a new vehicle to your fleet with compliance tracking'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="academyLocation">Academy Location</Label>
                  <Select
                    value={vehicleForm.academyLocation}
                    onValueChange={(value: 'Pune' | 'VGTAP') => 
                      setVehicleForm(prev => ({ ...prev, academyLocation: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pune">Pune</SelectItem>
                      <SelectItem value="VGTAP">VGTAP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="brand">Brand</Label>
                  <Select
                    value={vehicleForm.brand}
                    onValueChange={(value: 'VW' | 'SA' | 'AU') => 
                      setVehicleForm(prev => ({ ...prev, brand: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SA">Skoda (SA)</SelectItem>
                      <SelectItem value="VW">Volkswagen (VW)</SelectItem>
                      <SelectItem value="AU">Audi (AU)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    value={vehicleForm.model}
                    onChange={(e) => setVehicleForm(prev => ({ ...prev, model: e.target.value }))}
                    placeholder="e.g., Octavia, A4, Vento"
                    required
                  />
                </div>
              </div>
              
              {/* Vehicle Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Vehicle Name/Description</Label>
                  <Input
                    id="name"
                    value={vehicleForm.name}
                    onChange={(e) => setVehicleForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., OCTAVIA ELE TS132/1.8A7F"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="vehicleRegNo">Vehicle Registration No.</Label>
                  <Input
                    id="vehicleRegNo"
                    value={vehicleForm.vehicleRegNo}
                    onChange={(e) => setVehicleForm(prev => ({ ...prev, vehicleRegNo: e.target.value.toUpperCase() }))}
                    placeholder="e.g., MH14DX2031"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="vinNo">VIN Number</Label>
                <Input
                  id="vinNo"
                  value={vehicleForm.vinNo}
                  onChange={(e) => setVehicleForm(prev => ({ ...prev, vinNo: e.target.value.toUpperCase() }))}
                  placeholder="e.g., WVWJ11609CT011421"
                  maxLength={17}
                  required
                />
              </div>
              
              {/* Insurance Details */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-4">Insurance & Compliance</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="insuranceValidityDate">Insurance Validity Date</Label>
                    <Input
                      id="insuranceValidityDate"
                      type="date"
                      value={vehicleForm.insuranceValidityDate}
                      onChange={(e) => setVehicleForm(prev => ({ ...prev, insuranceValidityDate: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="insuranceStatus">Insurance Status</Label>
                    <Select
                      value={vehicleForm.insuranceStatus}
                      onValueChange={(value: 'Valid' | 'Expired') => 
                        setVehicleForm(prev => ({ ...prev, insuranceStatus: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Valid">Valid</SelectItem>
                        <SelectItem value="Expired">Expired</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="pucValidityDate">PUC Validity Date</Label>
                    <Input
                      id="pucValidityDate"
                      type="date"
                      value={vehicleForm.pucValidityDate}
                      onChange={(e) => setVehicleForm(prev => ({ ...prev, pucValidityDate: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="pucStatus">PUC Status</Label>
                    <Select
                      value={vehicleForm.pucStatus}
                      onValueChange={(value: 'Valid' | 'Expired' | 'NA') => 
                        setVehicleForm(prev => ({ ...prev, pucStatus: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Valid">Valid</SelectItem>
                        <SelectItem value="Expired">Expired</SelectItem>
                        <SelectItem value="NA">Not Required</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              {/* Assignment & Status */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-4">Assignment & Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="allocatedTrainer">Allocated Trainer</Label>
                    <Input
                      id="allocatedTrainer"
                      value={vehicleForm.allocatedTrainer || ''}
                      onChange={(e) => setVehicleForm(prev => ({ ...prev, allocatedTrainer: e.target.value }))}
                      placeholder="e.g., Ranjeet Thorat"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="dateDecommissioned">Date Decommissioned (if any)</Label>
                    <Input
                      id="dateDecommissioned"
                      type="date"
                      value={vehicleForm.dateDecommissioned || ''}
                      onChange={(e) => setVehicleForm(prev => ({ ...prev, dateDecommissioned: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div className="space-y-2 mt-4">
                  <Label htmlFor="remarks">Remarks</Label>
                  <Textarea
                    id="remarks"
                    value={vehicleForm.remarks || ''}
                    onChange={(e) => setVehicleForm(prev => ({ ...prev, remarks: e.target.value }))}
                    placeholder="Additional notes, transfer details, maintenance status, etc."
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-6 border-t">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                  {editingVehicle ? 'Update Vehicle' : 'Add Vehicle'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters and Search */}
      <Card className="shadow-sm border border-gray-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <Filter className="h-5 w-5" />
            <span>Filter & Search</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, registration, VIN, trainer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={brandFilter} onValueChange={setBrandFilter}>
              <SelectTrigger className="w-full lg:w-40">
                <SelectValue placeholder="All Brands" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Brands</SelectItem>
                <SelectItem value="SA">Skoda (SA)</SelectItem>
                <SelectItem value="VW">Volkswagen (VW)</SelectItem>
                <SelectItem value="AU">Audi (AU)</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="w-full lg:w-40">
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="Pune">Pune</SelectItem>
                <SelectItem value="VGTAP">VGTAP</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Fleet Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Car className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Vehicles</p>
                <p className="text-2xl font-bold text-gray-900">{vehicles.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Insurance Valid</p>
                <p className="text-2xl font-bold text-gray-900">{vehicles.filter(v => v.insuranceStatus === 'Valid').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Insurance Expired</p>
                <p className="text-2xl font-bold text-gray-900">{vehicles.filter(v => v.insuranceStatus === 'Expired').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Shield className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">PUC Valid</p>
                <p className="text-2xl font-bold text-gray-900">{vehicles.filter(v => v.pucStatus === 'Valid').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vehicle Table */}
      <Card className="shadow-sm border border-gray-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Fleet Vehicles</CardTitle>
          <CardDescription>
            Showing {filteredVehicles.length} of {vehicles.length} vehicles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold">Vehicle Details</TableHead>
                  <TableHead className="font-semibold">Registration & VIN</TableHead>
                  <TableHead className="font-semibold">Insurance</TableHead>
                  <TableHead className="font-semibold">PUC</TableHead>
                  <TableHead className="font-semibold">Trainer</TableHead>
                  <TableHead className="font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVehicles.map((vehicle) => (
                  <TableRow key={vehicle.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className={`font-semibold ${getBrandColor(vehicle.brand)}`}>
                            {getBrandName(vehicle.brand)}
                          </span>
                          <Badge variant="outline" className="text-xs">{vehicle.academyLocation}</Badge>
                        </div>
                        <div className="text-sm font-medium text-gray-900">{vehicle.model}</div>
                        <div className="text-xs text-gray-500">{vehicle.name}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-mono font-medium text-sm">{vehicle.vehicleRegNo}</div>
                        <div className="font-mono text-xs text-gray-500">{vehicle.vinNo}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge variant={getInsuranceStatusBadge(vehicle.insuranceStatus)} className="text-xs">
                          {vehicle.insuranceStatus}
                        </Badge>
                        <div className="text-xs text-gray-500">
                          {new Date(vehicle.insuranceValidityDate).toLocaleDateString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge variant={getPucStatusBadge(vehicle.pucStatus)} className="text-xs">
                          {vehicle.pucStatus}
                        </Badge>
                        {vehicle.pucValidityDate && vehicle.pucStatus !== 'NA' && (
                          <div className="text-xs text-gray-500">
                            {new Date(vehicle.pucValidityDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {vehicle.allocatedTrainer || <span className="text-gray-400">Unassigned</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(vehicle)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(vehicle.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
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
                <p className="text-gray-500">No vehicles found matching your criteria.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}