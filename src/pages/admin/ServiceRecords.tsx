import React, { useState } from 'react';
import { Search, Plus, Filter, Calendar, Wrench, AlertTriangle, CheckCircle, Clock, Car, User, FileText, Download, Eye, Shield, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface VehicleRecord {
  id: string;
  academyLocation: string;
  brand: string;
  model: string;
  name: string;
  vehicleRegNo: string;
  vinNo: string;
  insuranceValidityDate: string;
  insuranceStatus: 'Valid' | 'Expired';
  pucValidityDate: string;
  pucStatus: 'Valid' | 'Expired' | 'NA';
  dateDecommissioned?: string;
  allocatedTrainer: string;
  remarks: string;
  costIncurred?: number;
  modelYear: number;
  fuel: string;
  capacity: string;
  gearbox: string;
  trainingSchedule?: {
    from: string;
    to: string;
    training: string;
  };
}

const mockVehicleRecords: VehicleRecord[] = [
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
    allocatedTrainer: '',
    remarks: 'Transferred to VGTAP, NSTI, Hyderabad on 08.07.2025. PUC is not required as the car is used solely for static training purposes within the VGTAP institute.',
    modelYear: 2015,
    fuel: 'TDI',
    capacity: '1.5',
    gearbox: 'DQ200-7F'
  },
  {
    id: '2',
    academyLocation: 'Pune',
    brand: 'VW',
    model: 'Vento',
    name: 'POLO A05 1.5 HIGHL 77 TDI D7F',
    vehicleRegNo: 'MH14EY0185',
    vinNo: 'MEXD1560XFT089626',
    insuranceValidityDate: '2026-06-30',
    insuranceStatus: 'Valid',
    pucValidityDate: '2025-09-15',
    pucStatus: 'Valid',
    allocatedTrainer: 'Mahesh Deshmukh',
    remarks: '',
    modelYear: 2015,
    fuel: 'TDI',
    capacity: '1.5',
    gearbox: 'DQ200-7F'
  },
  {
    id: '3',
    academyLocation: 'Pune',
    brand: 'VW',
    model: 'Passat',
    name: 'PASSAT Sed. HL 130 TDID6F',
    vehicleRegNo: 'MH14GN0436',
    vinNo: 'WVWK163CZHA000013',
    insuranceValidityDate: '2026-06-30',
    insuranceStatus: 'Valid',
    pucValidityDate: '2025-09-23',
    pucStatus: 'Valid',
    allocatedTrainer: 'Ranjeet Thorat',
    remarks: '',
    modelYear: 2017,
    fuel: 'TDI',
    capacity: '2.0',
    gearbox: 'DQ250-6F',
    trainingSchedule: {
      from: 'Monday',
      to: 'Friday',
      training: 'Diagnostics'
    }
  },
  {
    id: '4',
    academyLocation: 'Pune',
    brand: 'VW',
    model: 'Tiguan AllSpace',
    name: 'Tiguan L 2.0 HL GT140TSI D7A',
    vehicleRegNo: 'MH14JH4308',
    vinNo: 'WVGZZZ5NZLM088776',
    insuranceValidityDate: '2025-12-09',
    insuranceStatus: 'Valid',
    pucValidityDate: '2025-09-15',
    pucStatus: 'Valid',
    allocatedTrainer: 'Ranjeet Thorat',
    remarks: 'Battery required. Under process',
    costIncurred: 7559.48,
    modelYear: 2020,
    fuel: 'TFSI',
    capacity: '2.0',
    gearbox: 'DQ381-7A'
  },
  {
    id: '5',
    academyLocation: 'Pune',
    brand: 'VW',
    model: 'T Roc',
    name: 'T-ROC 1.5 GT110 TSID7F',
    vehicleRegNo: 'MH14JH4307',
    vinNo: 'WVGZZZA1ZLV079005',
    insuranceValidityDate: '2025-12-09',
    insuranceStatus: 'Valid',
    pucValidityDate: '2025-04-21',
    pucStatus: 'Expired',
    allocatedTrainer: 'Ranjeet Thorat',
    remarks: 'it had been diagnosed for the Mechatronics replacement as vehicle was not moving.',
    modelYear: 2020,
    fuel: 'TSI ACT',
    capacity: '1.5',
    gearbox: 'DQ200-7F'
  },
  {
    id: '6',
    academyLocation: 'Pune',
    brand: 'VW',
    model: 'Taigun',
    name: 'TAIGUN GT PLUS 1.5L TSI 110kW DSG',
    vehicleRegNo: 'MH14JU1691',
    vinNo: 'MEXH21CW9NT000126',
    insuranceValidityDate: '2025-10-09',
    insuranceStatus: 'Valid',
    pucValidityDate: '2025-09-15',
    pucStatus: 'Valid',
    allocatedTrainer: 'Ranjeet Thorat',
    remarks: '',
    modelYear: 2022,
    fuel: 'TSI ACT',
    capacity: '1.5',
    gearbox: 'DQ200-7F',
    trainingSchedule: {
      from: 'Monday',
      to: 'Friday',
      training: 'Diagnostics'
    }
  },
  {
    id: '7',
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
    remarks: '',
    modelYear: 2016,
    fuel: 'FSI turbo',
    capacity: '1.8',
    gearbox: 'MQ350-6F'
  },
  {
    id: '8',
    academyLocation: 'Pune',
    brand: 'VW',
    model: 'Virtus',
    name: 'VIRTUS 1.0L TSI 85kW AT Topline',
    vehicleRegNo: 'MH14KN0378',
    vinNo: 'MEXC22D21NT000259',
    insuranceValidityDate: '2025-11-13',
    insuranceStatus: 'Valid',
    pucValidityDate: '2025-04-21',
    pucStatus: 'Expired',
    allocatedTrainer: 'Sanjay Borade',
    remarks: 'Breakdown - Vehicle not moving',
    modelYear: 2022,
    fuel: 'TSI',
    capacity: '1.0',
    gearbox: 'AQ250-6F'
  },
  {
    id: '9',
    academyLocation: 'Pune',
    brand: 'AU',
    model: 'e-Tron',
    name: 'e-tron Spb 300',
    vehicleRegNo: 'MH14JR3793',
    vinNo: 'WAUZCMGE2MB034889',
    insuranceValidityDate: '2026-08-01',
    insuranceStatus: 'Valid',
    pucValidityDate: '',
    pucStatus: 'NA',
    allocatedTrainer: 'Dattaprasad Duble',
    remarks: '',
    modelYear: 2021,
    fuel: 'Electric',
    capacity: 'NA',
    gearbox: 'NA'
  }
];

export default function ServiceRecords() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [brandFilter, setBrandFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const filteredRecords = mockVehicleRecords.filter(record => {
    const matchesSearch = record.vehicleRegNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.allocatedTrainer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.brand.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'insurance-expired' && record.insuranceStatus === 'Expired') ||
                         (statusFilter === 'puc-expired' && record.pucStatus === 'Expired') ||
                         (statusFilter === 'active' && record.insuranceStatus === 'Valid');
    
    const matchesLocation = locationFilter === 'all' || record.academyLocation === locationFilter;
    const matchesBrand = brandFilter === 'all' || record.brand === brandFilter;
    
    return matchesSearch && matchesStatus && matchesLocation && matchesBrand;
  });

  const handleViewDetails = (recordId: string) => {
    toast({
      title: "Vehicle Details",
      description: `Viewing details for vehicle ${recordId}`,
    });
  };

  const handleDownloadReport = (recordId: string) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Report Downloaded",
        description: `Vehicle report for ${recordId} has been downloaded.`,
      });
    }, 1000);
  };

  const getInsuranceStatusBadge = (status: string) => {
    return status === 'Valid' ? 
      <Badge variant="default" className="bg-green-100 text-green-800">Valid</Badge> :
      <Badge variant="destructive">Expired</Badge>;
  };

  const getPucStatusBadge = (status: string) => {
    if (status === 'NA') return <Badge variant="outline">N/A</Badge>;
    return status === 'Valid' ? 
      <Badge variant="default" className="bg-green-100 text-green-800">Valid</Badge> :
      <Badge variant="destructive">Expired</Badge>;
  };

  const totalVehicles = mockVehicleRecords.length;
  const validInsurance = mockVehicleRecords.filter(r => r.insuranceStatus === 'Valid').length;
  const expiredPuc = mockVehicleRecords.filter(r => r.pucStatus === 'Expired').length;
  const totalCostIncurred = mockVehicleRecords.reduce((sum, record) => sum + (record.costIncurred || 0), 0);

  const uniqueLocations = [...new Set(mockVehicleRecords.map(r => r.academyLocation))];
  const uniqueBrands = [...new Set(mockVehicleRecords.map(r => r.brand))];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Vehicle Records</h1>
          <p className="text-muted-foreground">Comprehensive vehicle management and compliance tracking</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Vehicle
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVehicles}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valid Insurance</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{validInsurance}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired PUC</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expiredPuc}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cost Incurred</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalCostIncurred.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by vehicle reg, name, trainer, or brand..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active (Valid Insurance)</SelectItem>
                <SelectItem value="insurance-expired">Insurance Expired</SelectItem>
                <SelectItem value="puc-expired">PUC Expired</SelectItem>
              </SelectContent>
            </Select>
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {uniqueLocations.map(location => (
                  <SelectItem key={location} value={location}>{location}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={brandFilter} onValueChange={setBrandFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by brand" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Brands</SelectItem>
                {uniqueBrands.map(brand => (
                  <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Vehicle Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Records ({filteredRecords.length})</CardTitle>
          <CardDescription>Complete vehicle inventory with compliance status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Location</TableHead>
                  <TableHead>Vehicle Details</TableHead>
                  <TableHead>Registration</TableHead>
                  <TableHead>Insurance</TableHead>
                  <TableHead>PUC</TableHead>
                  <TableHead>Trainer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{record.academyLocation}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{record.brand} {record.model}</div>
                        <div className="text-sm text-muted-foreground">{record.name}</div>
                        <div className="text-xs text-muted-foreground">{record.fuel} • {record.capacity}L • {record.modelYear}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{record.vehicleRegNo}</div>
                        <div className="text-xs text-muted-foreground">{record.vinNo}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        {getInsuranceStatusBadge(record.insuranceStatus)}
                        <div className="text-xs text-muted-foreground mt-1">
                          Till: {new Date(record.insuranceValidityDate).toLocaleDateString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        {getPucStatusBadge(record.pucStatus)}
                        {record.pucValidityDate && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Till: {new Date(record.pucValidityDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{record.allocatedTrainer || 'Unassigned'}</div>
                        {record.trainingSchedule && (
                          <div className="text-xs text-muted-foreground">
                            {record.trainingSchedule.from} - {record.trainingSchedule.to}<br/>
                            {record.trainingSchedule.training}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {record.costIncurred && (
                          <div className="font-medium text-red-600">
                            Cost: ₹{record.costIncurred.toLocaleString()}
                          </div>
                        )}
                        {record.remarks && (
                          <div className="text-xs text-muted-foreground mt-1 max-w-[200px] truncate" title={record.remarks}>
                            {record.remarks}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(record.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadReport(record.id)}
                          disabled={loading}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
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