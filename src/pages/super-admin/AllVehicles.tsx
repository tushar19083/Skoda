import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Car, Search, Filter, CheckCircle, Clock, AlertTriangle, Calendar, MapPin } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { LOCATIONS, getLocationName } from '@/constants/locations';
import { format } from 'date-fns';

interface Vehicle {
  id: string;
  academyLocation: string;
  brand: 'VW' | 'SA' | 'AU' | string;
  model: string;
  name: string;
  vehicleRegNo: string;
  vinNo?: string;
  insuranceValidityDate?: string;
  insuranceStatus?: 'Valid' | 'Expired';
  pucValidityDate?: string;
  pucStatus?: 'Valid' | 'Expired' | 'NA';
  status: 'Active' | 'Inactive' | 'Maintenance' | 'Available' | 'In Use';
  dateDecommissioned?: string;
  allocatedTrainer?: string;
  remarks?: string;
  createdAt?: string;
  updatedAt?: string;
  // Legacy fields from useVehicles hook
  regNo?: string;
  location?: string;
  year?: number;
  fuelType?: string;
  color?: string;
}

const STORAGE_KEY = 'app_fleet_vehicles';

// Helper to map location code to name
const getLocationNameFromCode = (code: string): string => {
  if (!code || code === 'ALL') return 'All Locations';
  const location = LOCATIONS.find(l => l.code === code || l.name === code || l.fullName === code);
  return location?.name || location?.fullName || code;
};

// Default vehicles for all locations
const getDefaultVehicles = (): Vehicle[] => {
  return [
    // Pune Location
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
      status: 'Active',
      allocatedTrainer: 'Transferred to VGTAP',
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
      status: 'Active',
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
      status: 'Active',
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
      status: 'Maintenance',
      allocatedTrainer: 'Dattaprasad Duble',
      createdAt: '2025-01-01',
      updatedAt: '2025-08-04'
    },
    {
      id: '5',
      academyLocation: 'Pune',
      brand: 'SA',
      model: 'Octavia',
      name: 'OCTAVIA ELE TS132/1.8A7F',
      vehicleRegNo: 'MH20DJ2353',
      vinNo: 'TMBBLANP5GA300001',
      insuranceValidityDate: '2026-03-15',
      insuranceStatus: 'Valid',
      pucValidityDate: '2025-11-20',
      pucStatus: 'Valid',
      status: 'Active',
      allocatedTrainer: 'Sanjay Borade',
      createdAt: '2025-01-01',
      updatedAt: '2025-08-04'
    },
    {
      id: '6',
      academyLocation: 'Pune',
      brand: 'SA',
      model: 'Kushaq',
      name: 'Kushaq Style 1.0TSIAT',
      vehicleRegNo: 'MH14JR2609',
      vinNo: 'TMBBLANP5GA300002',
      insuranceValidityDate: '2026-05-10',
      insuranceStatus: 'Valid',
      pucValidityDate: '2025-12-01',
      pucStatus: 'Valid',
      status: 'Active',
      allocatedTrainer: 'Sanjay Borade',
      createdAt: '2025-01-01',
      updatedAt: '2025-08-04'
    },
    // NCR Location
    {
      id: '7',
      academyLocation: 'NCR',
      brand: 'VW',
      model: 'Virtus',
      name: 'VIRTUS 1.0L TSI 85kW AT Topline',
      vehicleRegNo: 'DL14KN0375',
      vinNo: 'WVWJ11609CT011422',
      insuranceValidityDate: '2026-07-20',
      insuranceStatus: 'Valid',
      pucValidityDate: '2025-10-15',
      pucStatus: 'Valid',
      status: 'Active',
      allocatedTrainer: 'Rahul Verma',
      createdAt: '2025-01-01',
      updatedAt: '2025-08-04'
    },
    {
      id: '8',
      academyLocation: 'NCR',
      brand: 'SA',
      model: 'Slavia',
      name: 'Slavia Style 1.5TSIAT',
      vehicleRegNo: 'DL09OP3456',
      vinNo: 'TMBBLANP5GA300010',
      insuranceValidityDate: '2026-04-25',
      insuranceStatus: 'Valid',
      pucValidityDate: '2025-11-10',
      pucStatus: 'Valid',
      status: 'Active',
      allocatedTrainer: 'Sneha Sharma',
      createdAt: '2025-01-01',
      updatedAt: '2025-08-04'
    },
    {
      id: '9',
      academyLocation: 'NCR',
      brand: 'AU',
      model: 'Q3',
      name: 'Q3 TDI quatt.2.0 I4135 A7',
      vehicleRegNo: 'DL08CD5678',
      vinNo: 'WAUZKGF43HY700410',
      insuranceValidityDate: '2026-06-15',
      insuranceStatus: 'Valid',
      pucValidityDate: '2025-09-25',
      pucStatus: 'Valid',
      status: 'Active',
      createdAt: '2025-01-01',
      updatedAt: '2025-08-04'
    },
    // Bangalore Location
    {
      id: '10',
      academyLocation: 'Bangalore',
      brand: 'VW',
      model: 'Virtus',
      name: 'VIRTUS 1.0L TSI 85kW AT Topline',
      vehicleRegNo: 'KA14KN0377',
      vinNo: 'WVWJ11609CT011423',
      insuranceValidityDate: '2026-08-10',
      insuranceStatus: 'Valid',
      pucValidityDate: '2025-12-20',
      pucStatus: 'Valid',
      status: 'Active',
      allocatedTrainer: 'Kavya Reddy',
      createdAt: '2025-01-01',
      updatedAt: '2025-08-04'
    },
    {
      id: '11',
      academyLocation: 'Bangalore',
      brand: 'VW',
      model: 'Tiguan',
      name: 'Tiguan L 2.0 HL GT140TSI D7A',
      vehicleRegNo: 'KA05GH3456',
      vinNo: 'WVWJ11609CT011424',
      insuranceValidityDate: '2026-05-30',
      insuranceStatus: 'Valid',
      pucValidityDate: '2025-10-05',
      pucStatus: 'Valid',
      status: 'Maintenance',
      createdAt: '2025-01-01',
      updatedAt: '2025-08-04'
    },
    {
      id: '12',
      academyLocation: 'Bangalore',
      brand: 'AU',
      model: 'A6',
      name: 'A6 Sal. 1.8 I4140 A7',
      vehicleRegNo: 'KA02MN9012',
      vinNo: 'WAUZKGF43HY700411',
      insuranceValidityDate: '2026-07-05',
      insuranceStatus: 'Valid',
      pucValidityDate: '2025-11-15',
      pucStatus: 'Valid',
      status: 'Active',
      allocatedTrainer: 'Arjun Nair',
      createdAt: '2025-01-01',
      updatedAt: '2025-08-04'
    },
    // VGTAP Location
    {
      id: '13',
      academyLocation: 'VGTAP',
      brand: 'VW',
      model: 'Vento',
      name: 'POLO A05 1.5 HIGHL 77 TDI D7F',
      vehicleRegNo: 'MH14FS7324',
      vinNo: 'WVWJ11609CT011425',
      insuranceValidityDate: '2026-06-20',
      insuranceStatus: 'Valid',
      pucValidityDate: '2025-09-10',
      pucStatus: 'Valid',
      status: 'Active',
      allocatedTrainer: 'Amit Desai',
      createdAt: '2025-01-01',
      updatedAt: '2025-08-04'
    },
    {
      id: '14',
      academyLocation: 'VGTAP',
      brand: 'SA',
      model: 'Rapid',
      name: 'RAPID STY TD81/1.5 A7F',
      vehicleRegNo: 'MH15AB1234',
      vinNo: 'TMBBLANP5GA300011',
      insuranceValidityDate: '2026-04-30',
      insuranceStatus: 'Valid',
      pucValidityDate: '2025-10-25',
      pucStatus: 'Valid',
      status: 'Active',
      allocatedTrainer: 'Meera Joshi',
      createdAt: '2025-01-01',
      updatedAt: '2025-08-04'
    },
    {
      id: '15',
      academyLocation: 'VGTAP',
      brand: 'AU',
      model: 'Q5',
      name: 'Q5 quat. TDI2.0 I4140/DE5A7',
      vehicleRegNo: 'MH14GY1270',
      vinNo: 'WAUZKGF43HY700412',
      insuranceValidityDate: '2026-08-15',
      insuranceStatus: 'Valid',
      pucValidityDate: '2025-12-05',
      pucStatus: 'Valid',
      status: 'Active',
      createdAt: '2025-01-01',
      updatedAt: '2025-08-04'
    },
    // Additional Pune vehicles
    {
      id: '16',
      academyLocation: 'Pune',
      brand: 'SA',
      model: 'Rapid',
      name: 'RAPID STY TD81/1.5 A7F',
      vehicleRegNo: 'MH20EE2704',
      vinNo: 'TMBBLANP5GA300003',
      insuranceValidityDate: '2026-02-15',
      insuranceStatus: 'Valid',
      pucValidityDate: '2025-08-30',
      pucStatus: 'Expired',
      status: 'Active',
      allocatedTrainer: 'Mahesh Deshmukh',
      createdAt: '2025-01-01',
      updatedAt: '2025-08-04'
    },
    {
      id: '17',
      academyLocation: 'Pune',
      brand: 'SA',
      model: 'Slavia',
      name: 'SlaviaStyle1.5TSIAT',
      vehicleRegNo: 'MH14JX5905',
      vinNo: 'TMBBLANP5GA300004',
      insuranceValidityDate: '2026-09-20',
      insuranceStatus: 'Valid',
      pucValidityDate: '2026-01-10',
      pucStatus: 'Valid',
      status: 'Active',
      allocatedTrainer: 'Sanjay Borade',
      createdAt: '2025-01-01',
      updatedAt: '2025-08-04'
    },
    {
      id: '18',
      academyLocation: 'Pune',
      brand: 'AU',
      model: 'Q3',
      name: 'Q3 TDI quatt.2.0 I4135 A7',
      vehicleRegNo: 'MH14GH0381',
      vinNo: 'WAUZKGF43HY700403',
      insuranceValidityDate: '2026-03-30',
      insuranceStatus: 'Valid',
      pucValidityDate: '2025-09-20',
      pucStatus: 'Valid',
      status: 'In Use',
      allocatedTrainer: 'Yogesh Sundaramurthy',
      createdAt: '2025-01-01',
      updatedAt: '2025-08-04'
    },
    {
      id: '19',
      academyLocation: 'Pune',
      brand: 'AU',
      model: 'A6',
      name: 'A6 Sal. 1.8 I4140 A7',
      vehicleRegNo: 'MH14GH0873',
      vinNo: 'WAUZKGF43HY700404',
      insuranceValidityDate: '2026-05-25',
      insuranceStatus: 'Valid',
      pucValidityDate: '2025-10-30',
      pucStatus: 'Valid',
      status: 'Active',
      allocatedTrainer: 'Yogesh Sundaramurthy',
      createdAt: '2025-01-01',
      updatedAt: '2025-08-04'
    },
    {
      id: '20',
      academyLocation: 'Pune',
      brand: 'AU',
      model: 'Q7',
      name: 'Q7 quat. TDI 3.0 V6183 A8',
      vehicleRegNo: 'MH14GH0380',
      vinNo: 'WAUZKGF43HY700405',
      insuranceValidityDate: '2026-07-15',
      insuranceStatus: 'Valid',
      pucValidityDate: '2025-11-05',
      pucStatus: 'Valid',
      status: 'Active',
      allocatedTrainer: 'Dattaprasad Duble',
      createdAt: '2025-01-01',
      updatedAt: '2025-08-04'
    },
    {
      id: '21',
      academyLocation: 'Pune',
      brand: 'VW',
      model: 'T Roc',
      name: 'T-ROC 1.5 GT110 TSID7F',
      vehicleRegNo: 'MH14JH4307',
      vinNo: 'WVWJ11609CT011427',
      insuranceValidityDate: '2026-04-10',
      insuranceStatus: 'Valid',
      pucValidityDate: '2025-08-15',
      pucStatus: 'Expired',
      status: 'Active',
      allocatedTrainer: 'Ranjeet Thorat',
      createdAt: '2025-01-01',
      updatedAt: '2025-08-04'
    },
    {
      id: '22',
      academyLocation: 'Pune',
      brand: 'VW',
      model: 'Taigun',
      name: 'TAIGUN GT PLUS 1.5L TSI 110kW DSG',
      vehicleRegNo: 'MH14JU1691',
      vinNo: 'WVWJ11609CT011428',
      insuranceValidityDate: '2026-06-05',
      insuranceStatus: 'Valid',
      pucValidityDate: '2025-09-30',
      pucStatus: 'Valid',
      status: 'In Use',
      allocatedTrainer: 'Ranjeet Thorat',
      createdAt: '2025-01-01',
      updatedAt: '2025-08-04'
    },
    {
      id: '23',
      academyLocation: 'Pune',
      brand: 'VW',
      model: 'Virtus',
      name: 'VIRTUS 1.0L TSI 85kW AT Topline',
      vehicleRegNo: 'MH14KN0378',
      vinNo: 'WVWJ11609CT011429',
      insuranceValidityDate: '2026-08-25',
      insuranceStatus: 'Valid',
      pucValidityDate: '2025-12-15',
      pucStatus: 'Valid',
      status: 'Active',
      allocatedTrainer: 'Sanjay Borade',
      createdAt: '2025-01-01',
      updatedAt: '2025-08-04'
    },
    {
      id: '24',
      academyLocation: 'Pune',
      brand: 'AU',
      model: 'A6',
      name: 'A6  Sedan 2.0 R4180 A7',
      vehicleRegNo: 'MH14JM8226',
      vinNo: 'WAUZKGF43HY700406',
      insuranceValidityDate: '2026-09-05',
      insuranceStatus: 'Valid',
      pucValidityDate: '2026-01-20',
      pucStatus: 'Valid',
      status: 'Active',
      createdAt: '2025-01-01',
      updatedAt: '2025-08-04'
    },
    {
      id: '25',
      academyLocation: 'Pune',
      brand: 'AU',
      model: 'e-Tron',
      name: 'e-tron Spb 300',
      vehicleRegNo: 'MH14JR3793',
      vinNo: 'WAUZKGF43HY700407',
      insuranceValidityDate: '2026-10-15',
      insuranceStatus: 'Valid',
      pucValidityDate: 'NA',
      pucStatus: 'NA',
      status: 'Active',
      createdAt: '2025-01-01',
      updatedAt: '2025-08-04'
    }
  ];
};

// Get all vehicles from localStorage
const getAllVehicles = (): Vehicle[] => {
  let storedVehicles: Vehicle[] = [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const vehicles = JSON.parse(stored);
      storedVehicles = vehicles.map((v: any) => ({
        ...v,
        // Map legacy fields to new structure
        vehicleRegNo: v.vehicleRegNo || v.regNo || '',
        academyLocation: v.academyLocation || v.location || 'Pune',
        status: v.status || 'Active'
      }));
    }
  } catch (err) {
    console.error('Error loading vehicles from localStorage:', err);
  }
  
  // Get default vehicles
  const defaultVehicles = getDefaultVehicles();
  
  // If localStorage is empty or has very few vehicles, merge with defaults
  if (storedVehicles.length === 0 || storedVehicles.length < 10) {
    // Merge stored vehicles with default vehicles
    const mergedVehicles: Vehicle[] = [];
    const existingIds = new Set(storedVehicles.map(v => v.id));
    
    // Add stored vehicles first (these take precedence)
    mergedVehicles.push(...storedVehicles);
    
    // Add default vehicles that don't exist in stored data
    defaultVehicles.forEach(defaultVehicle => {
      if (!existingIds.has(defaultVehicle.id)) {
        mergedVehicles.push(defaultVehicle);
      }
    });
    
    // Save merged vehicles if we added any default vehicles
    if (mergedVehicles.length > storedVehicles.length) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedVehicles));
      } catch (err) {
        console.error('Error saving merged vehicles to localStorage:', err);
      }
    }
    
    return mergedVehicles;
  }
  
  // Return stored vehicles if we have enough
  return storedVehicles;
};

export function AllVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [brandFilter, setBrandFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');

  // Load vehicles from localStorage dynamically
  const loadVehicles = () => {
    try {
      const allVehicles = getAllVehicles();
      // Only update if vehicles actually changed
      setVehicles(prev => {
        const prevIds = new Set(prev.map(v => v.id));
        const newIds = new Set(allVehicles.map(v => v.id));
        const hasChanged = prev.length !== allVehicles.length ||
          !Array.from(newIds).every(id => prevIds.has(id)) ||
          !Array.from(prevIds).every(id => newIds.has(id)) ||
          allVehicles.some(v => {
            const prevV = prev.find(p => p.id === v.id);
            return !prevV || JSON.stringify(prevV) !== JSON.stringify(v);
          });
        
        if (hasChanged) {
          return allVehicles;
        }
        return prev;
      });
    } catch (err) {
      console.error('Error loading vehicles:', err);
      setVehicles([]);
    }
  };

  // Load vehicles on mount
  useEffect(() => {
    setLoading(true);
    loadVehicles();
    setLoading(false);
  }, []);

  // Listen for storage changes (cross-tab updates)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        loadVehicles();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Reload when page becomes visible (handles same-tab updates)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadVehicles();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Reload when window gains focus (handles same-tab updates)
  useEffect(() => {
    const handleFocus = () => {
      loadVehicles();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // Periodic check for updates (every 5 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      loadVehicles();
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Custom event listener for vehicle updates (same-tab updates)
  useEffect(() => {
    const handleVehicleUpdate = () => {
      loadVehicles();
    };

    // Listen for custom event when vehicles are updated
    window.addEventListener('vehicles-updated', handleVehicleUpdate);
    return () => window.removeEventListener('vehicles-updated', handleVehicleUpdate);
  }, []);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(vehicle => {
      const regNo = vehicle.vehicleRegNo || vehicle.regNo || '';
      const brand = vehicle.brand || '';
      const model = vehicle.model || '';
      const name = vehicle.name || '';
      
      const matchesSearch = 
        regNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesBrand = brandFilter === 'all' || vehicle.brand === brandFilter;
      const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter;
      const location = vehicle.academyLocation || vehicle.location || '';
      const matchesLocation = locationFilter === 'all' || location === locationFilter;
      
      return matchesSearch && matchesBrand && matchesStatus && matchesLocation;
    });
  }, [vehicles, searchTerm, brandFilter, statusFilter, locationFilter]);

  const uniqueBrands = useMemo(() => [...new Set(vehicles.map(v => v.brand).filter(Boolean))], [vehicles]);
  const uniqueLocations = useMemo(() => {
    const locations = vehicles.map(v => v.academyLocation || v.location || '').filter(Boolean);
    return [...new Set(locations)];
  }, [vehicles]);

  // Calculate dynamic stats
  const stats = useMemo(() => {
    return {
      total: vehicles.length,
      available: vehicles.filter(v => v.status === 'Available' || v.status === 'Active').length,
      inUse: vehicles.filter(v => v.status === 'In Use').length,
      maintenance: vehicles.filter(v => v.status === 'Maintenance').length,
      inactive: vehicles.filter(v => v.status === 'Inactive').length,
      insuranceValid: vehicles.filter(v => v.insuranceStatus === 'Valid').length,
      insuranceExpired: vehicles.filter(v => v.insuranceStatus === 'Expired').length,
      pucValid: vehicles.filter(v => v.pucStatus === 'Valid').length,
      pucExpired: vehicles.filter(v => v.pucStatus === 'Expired').length,
    };
  }, [vehicles]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Available':
      case 'Active':
        return <Badge className="bg-green-600 text-white">Available</Badge>;
      case 'In Use':
        return <Badge className="bg-blue-600 text-white">In Use</Badge>;
      case 'Maintenance':
        return <Badge className="bg-yellow-600 text-white">Maintenance</Badge>;
      case 'Inactive':
        return <Badge className="bg-gray-600 text-white">Inactive</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getInsuranceStatusBadge = (status?: string) => {
    if (!status) return null;
    switch (status) {
      case 'Valid':
        return <Badge className="bg-green-600 text-white text-xs">Valid</Badge>;
      case 'Expired':
        return <Badge className="bg-red-600 text-white text-xs">Expired</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{status}</Badge>;
    }
  };

  const getPucStatusBadge = (status?: string) => {
    if (!status || status === 'NA') return <Badge variant="outline" className="text-xs">N/A</Badge>;
    switch (status) {
      case 'Valid':
        return <Badge className="bg-green-600 text-white text-xs">Valid</Badge>;
      case 'Expired':
        return <Badge className="bg-red-600 text-white text-xs">Expired</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold">All Vehicles</h1>
            <Badge variant="outline" className="flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-200">
              <MapPin className="h-3 w-3" />
              All Locations (Global Access)
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Monitor and manage fleet vehicles across all training centers
          </p>
        </div>
      </div>

      {/* Vehicle Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Vehicles"
          value={stats.total}
          description="Across all locations"
          icon={Car}
        />
        <StatCard
          title="Available"
          value={stats.available}
          description="Ready for use"
          icon={CheckCircle}
        />
        <StatCard
          title="In Use"
          value={stats.inUse}
          description="Currently booked"
          icon={Clock}
        />
        <StatCard
          title="Maintenance"
          value={stats.maintenance}
          description="Under service"
          icon={AlertTriangle}
        />
      </div>

      {/* Additional Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Insurance Valid"
          value={stats.insuranceValid}
          description="Valid insurance policies"
          icon={CheckCircle}
        />
        <StatCard
          title="Insurance Expired"
          value={stats.insuranceExpired}
          description="Require renewal"
          icon={AlertTriangle}
        />
        <StatCard
          title="PUC Valid"
          value={stats.pucValid}
          description="Valid PUC certificates"
          icon={CheckCircle}
        />
        <StatCard
          title="PUC Expired"
          value={stats.pucExpired}
          description="Require renewal"
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
                <SelectItem value="Available">Available</SelectItem>
                <SelectItem value="In Use">In Use</SelectItem>
                <SelectItem value="Maintenance">Maintenance</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {LOCATIONS.map(location => (
                  <SelectItem key={location.code} value={location.name || location.code}>
                    {location.name}
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
            {loading ? 'Loading vehicles...' : `Showing ${filteredVehicles.length} of ${vehicles.length} vehicles`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading vehicles...</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehicle No.</TableHead>
                    <TableHead>Brand/Model</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Insurance</TableHead>
                    <TableHead>PUC</TableHead>
                    <TableHead>Allocated Trainer</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVehicles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <p className="text-muted-foreground">No vehicles found matching your criteria.</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredVehicles.map((vehicle) => {
                      const regNo = vehicle.vehicleRegNo || vehicle.regNo || 'N/A';
                      const location = vehicle.academyLocation || vehicle.location || 'N/A';
                      const brandName = vehicle.brand === 'VW' ? 'Volkswagen' : vehicle.brand === 'SA' ? 'Skoda' : vehicle.brand === 'AU' ? 'Audi' : vehicle.brand;
                      
                      return (
                        <TableRow key={vehicle.id}>
                          <TableCell className="font-medium">{regNo}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{brandName}</div>
                              <div className="text-sm text-muted-foreground">{vehicle.model}</div>
                              {vehicle.name && (
                                <div className="text-xs text-muted-foreground">{vehicle.name}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {getLocationNameFromCode(location)}
                            </Badge>
                          </TableCell>
                          <TableCell>{getStatusBadge(vehicle.status)}</TableCell>
                          <TableCell>
                            {vehicle.insuranceStatus ? (
                              <div className="space-y-1">
                                {getInsuranceStatusBadge(vehicle.insuranceStatus)}
                                {vehicle.insuranceValidityDate && (
                                  <div className="text-xs text-muted-foreground">
                                    {format(new Date(vehicle.insuranceValidityDate), 'MMM dd, yyyy')}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">N/A</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {vehicle.pucStatus ? (
                              <div className="space-y-1">
                                {getPucStatusBadge(vehicle.pucStatus)}
                                {vehicle.pucValidityDate && vehicle.pucStatus !== 'NA' && (
                                  <div className="text-xs text-muted-foreground">
                                    {format(new Date(vehicle.pucValidityDate), 'MMM dd, yyyy')}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">N/A</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {vehicle.allocatedTrainer ? (
                              <span className="text-sm">{vehicle.allocatedTrainer}</span>
                            ) : (
                              <span className="text-xs text-muted-foreground">Not allocated</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}