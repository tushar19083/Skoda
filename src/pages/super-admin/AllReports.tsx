import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/dashboard/StatCard';
import { useBookings } from '@/hooks/useBookings';
import { useVehicles } from '@/hooks/useVehicles';
import { format, subWeeks, subMonths, subYears, parseISO, isWithinInterval } from 'date-fns';
import { 
  Download, 
  FileText, 
  BarChart3, 
  Calendar, 
  Users, 
  Car,
  Eye,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import { LOCATIONS } from '@/constants/locations';

const STORAGE_KEY_REPORTS = 'app_reports';
const STORAGE_KEY_USERS = 'app_users';
const STORAGE_KEY_RECORDS = 'app_vehicle_records';

interface Report {
  id: string;
  name: string;
  type: 'vehicle' | 'booking' | 'trainer' | 'maintenance';
  description: string;
  lastGenerated: string;
  frequency: 'weekly' | 'monthly' | 'custom';
  status: 'ready' | 'generating';
  fileSize?: string;
  location?: string;
}

interface User {
  id: string;
  name: string;
  email?: string;
  role: string;
  status: string;
  location?: string;
}

interface VehicleRecord {
  id: string;
  academyLocation: string;
  vehicleRegNo: string;
  insuranceStatus: string;
  pucStatus: string;
  insuranceValidityDate?: string;
  pucValidityDate?: string;
  nextServiceDate?: string;
  allocatedTrainer: string;
  brand: string;
  model: string;
}

// Get reports from localStorage
const getReports = (): Report[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_REPORTS);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (err) {
    console.error('Error loading reports from localStorage:', err);
  }
  return [];
};

// Save reports to localStorage
const saveReports = (reports: Report[]) => {
  try {
    localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(reports));
  } catch (err) {
    console.error('Error saving reports to localStorage:', err);
  }
};

// Initial default reports
const getInitialReports = (): Report[] => [
  {
    id: '1',
    name: 'Fleet Utilization Report - All Locations',
    type: 'vehicle',
    description: 'Vehicle usage and efficiency analysis across all centers',
    lastGenerated: format(new Date(), 'yyyy-MM-dd'),
    frequency: 'monthly',
    status: 'ready',
    fileSize: '0 KB',
    location: 'all'
  },
  {
    id: '2',
    name: 'Booking Summary - All Locations',
    type: 'booking',
    description: 'Trainer booking patterns across all locations',
    lastGenerated: format(new Date(), 'yyyy-MM-dd'),
    frequency: 'weekly',
    status: 'ready',
    fileSize: '0 KB',
    location: 'all'
  },
  {
    id: '3',
    name: 'Trainer Activity Report - All Locations',
    type: 'trainer',
    description: 'Trainer usage and engagement metrics system-wide',
    lastGenerated: format(new Date(), 'yyyy-MM-dd'),
    frequency: 'monthly',
    status: 'ready',
    fileSize: '0 KB',
    location: 'all'
  },
  {
    id: '4',
    name: 'Maintenance Log - All Locations',
    type: 'maintenance',
    description: 'Vehicle maintenance and downtime tracking across all centers',
    lastGenerated: format(new Date(), 'yyyy-MM-dd'),
    frequency: 'monthly',
    status: 'ready',
    fileSize: '0 KB',
    location: 'all'
  }
];

const getUsers = (): User[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_USERS);
    return stored ? JSON.parse(stored) : [];
  } catch (err) {
    console.error('Error loading users from localStorage:', err);
    return [];
  }
};

const getVehicleRecords = (): VehicleRecord[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_RECORDS);
    return stored ? JSON.parse(stored) : [];
  } catch (err) {
    console.error('Error loading vehicle records from localStorage:', err);
    return [];
  }
};

// Get date range based on selection
const getDateRange = (dateRange: string) => {
  const now = new Date();
  let startDate: Date;
  
  switch (dateRange) {
    case 'last-week':
      startDate = subWeeks(now, 1);
      break;
    case 'last-month':
      startDate = subMonths(now, 1);
      break;
    case 'last-quarter':
      startDate = subMonths(now, 3);
      break;
    case 'last-year':
      startDate = subYears(now, 1);
      break;
    default:
      startDate = subMonths(now, 1);
  }
  
  return { startDate, endDate: now };
};

// Export to CSV utility
const exportToCSV = (csvData: (string | number)[][], filename: string) => {
  // Add BOM for Excel compatibility
  const BOM = '\uFEFF';
  const csvContent = csvData.map(row => 
    row.map(cell => {
      const cellStr = String(cell || '');
      // Escape commas, quotes, and newlines
      if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
        return `"${cellStr.replace(/"/g, '""')}"`;
      }
      return cellStr;
    }).join(',')
  ).join('\n');
  
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const reportTemplates = [
  {
    id: 'fleet-summary',
    name: 'Fleet Summary',
    type: 'vehicle',
    description: 'Overview of fleet status and performance',
    icon: Car,
  },
  {
    id: 'booking-analytics',
    name: 'Booking Analytics',
    type: 'booking',
    description: 'Trainer booking patterns',
    icon: Calendar,
  },
  {
    id: 'trainer-activity',
    name: 'Trainer Activity',
    type: 'trainer',
    description: 'Trainer usage statistics',
    icon: Users,
  }
];

export function AllReports() {
  const { bookings, loading: bookingsLoading } = useBookings();
  const { vehicles, isLoading: vehiclesLoading } = useVehicles();
  
  // Load reports from localStorage or use initial reports
  const [reports, setReports] = useState<Report[]>(() => {
    const stored = getReports();
    if (stored.length > 0) {
      return stored;
    }
    const initial = getInitialReports();
    saveReports(initial);
    return initial;
  });
  
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [reportForm, setReportForm] = useState({
    name: '',
    dateRange: 'last-month',
    frequency: 'monthly',
    format: 'csv',
    location: 'all'
  });
  const [loading, setLoading] = useState<string | null>(null);
  
  // Load users and records dynamically
  const [users, setUsers] = useState<User[]>([]);
  const [records, setRecords] = useState<VehicleRecord[]>([]);
  
  useEffect(() => {
    const allUsers = getUsers();
    const allRecords = getVehicleRecords();
    setUsers(allUsers);
    setRecords(allRecords);
  }, []);
  
  // Save reports to localStorage whenever they change
  useEffect(() => {
    saveReports(reports);
  }, [reports]);
  
  // Reload data when storage changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY_REPORTS || e.key === STORAGE_KEY_USERS || e.key === STORAGE_KEY_RECORDS) {
        const stored = getReports();
        if (stored.length > 0) {
          setReports(stored);
        }
        const allUsers = getUsers();
        const allRecords = getVehicleRecords();
        setUsers(allUsers);
        setRecords(allRecords);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  // Generate report data based on type
  const generateReportData = (report: Report, dateRange?: string) => {
    const range = dateRange ? getDateRange(dateRange) : getDateRange('last-month');
    const filteredBookings = bookings.filter(b => {
      const bookingDate = parseISO(b.createdAt);
      return isWithinInterval(bookingDate, { start: range.startDate, end: range.endDate });
    });
    
    // Filter by location if not 'all'
    const locationFilter = report.location && report.location !== 'all' 
      ? (item: any) => {
          const itemLocation = item.location || item.requestedLocation || item.academyLocation || '';
          return normalizeLocation(itemLocation) === normalizeLocation(report.location || '');
        }
      : () => true;
    
    const filteredVehicles = vehicles.filter(locationFilter);
    const filteredUsers = users.filter(u => {
      if (report.location && report.location !== 'all') {
        return normalizeLocation(u.location || '') === normalizeLocation(report.location || '');
      }
      return true;
    });
    const filteredRecords = records.filter(r => {
      if (report.location && report.location !== 'all') {
        return normalizeLocation(r.academyLocation || '') === normalizeLocation(report.location || '');
      }
      return true;
    });
    const filteredBookingsByLocation = filteredBookings.filter(b => {
      if (report.location && report.location !== 'all') {
        return normalizeLocation(b.requestedLocation || '') === normalizeLocation(report.location || '');
      }
      return true;
    });
    
    switch (report.type) {
      case 'vehicle':
        return generateVehicleReport(filteredVehicles, filteredRecords, filteredBookingsByLocation, report.location || 'all');
      case 'booking':
        return generateBookingReport(filteredBookingsByLocation, filteredVehicles, report.location || 'all');
      case 'trainer':
        return generateTrainerReport(filteredUsers, filteredRecords, filteredBookingsByLocation, report.location || 'all');
      case 'maintenance':
        return generateMaintenanceReport(filteredRecords, filteredVehicles, report.location || 'all');
      default:
        return [];
    }
  };
  
  // Helper to normalize location
  const normalizeLocation = (location: string): string => {
    if (!location) return '';
    const locationMap: Record<string, string> = {
      'Pune': 'PTC',
      'PTC': 'PTC',
      'VGTAP': 'VGTAP',
      'NCR': 'NCR',
      'BLR': 'BLR',
      'Bangalore': 'BLR',
    };
    return locationMap[location] || location;
  };
  
  const generateVehicleReport = (vehicles: any[], records: VehicleRecord[], bookings: any[], location: string) => {
    const csvData = [
      ['Fleet Utilization Report - ' + (location === 'all' ? 'All Locations' : location), format(new Date(), 'yyyy-MM-dd')],
      ['Location', location === 'all' ? 'All Locations' : location],
      [],
      ['Vehicle Overview'],
      ['Total Vehicles', vehicles.length],
      ['Active Vehicles', vehicles.filter(v => v.status === 'Available' || v.status === 'Active' || v.status === 'In Use').length],
      ['Under Maintenance', vehicles.filter(v => v.status === 'Maintenance').length],
      [],
      ['Vehicle Details'],
      ['Registration No', 'Brand', 'Model', 'Status', 'Location', 'Allocated Trainer'],
      ...vehicles.map((v: any) => [
        v.vehicleRegNo || v.regNo || 'N/A',
        v.brand || 'N/A',
        v.model || 'N/A',
        v.status || 'N/A',
        v.academyLocation || v.location || 'N/A',
        records.find(r => r.vehicleRegNo === (v.vehicleRegNo || v.regNo))?.allocatedTrainer || 'Unallocated'
      ]),
      [],
      ['Compliance Status'],
      ['Registration No', 'Insurance Status', 'PUC Status', 'Insurance Valid Until', 'PUC Valid Until'],
      ...records.map(r => [
        r.vehicleRegNo,
        r.insuranceStatus || 'N/A',
        r.pucStatus || 'N/A',
        r.insuranceValidityDate ? format(parseISO(r.insuranceValidityDate), 'yyyy-MM-dd') : 'N/A',
        r.pucValidityDate ? format(parseISO(r.pucValidityDate), 'yyyy-MM-dd') : 'N/A'
      ]),
      [],
      ['Booking Statistics'],
      ['Total Bookings', bookings.length],
      ['Active Bookings', bookings.filter(b => b.status === 'active').length],
      ['Completed Bookings', bookings.filter(b => b.status === 'completed').length]
    ];
    
    return csvData;
  };
  
  const generateBookingReport = (bookings: any[], vehicles: any[], location: string) => {
    const csvData = [
      ['Booking Summary Report - ' + (location === 'all' ? 'All Locations' : location), format(new Date(), 'yyyy-MM-dd')],
      ['Location', location === 'all' ? 'All Locations' : location],
      [],
      ['Summary Statistics'],
      ['Total Bookings', bookings.length],
      ['Pending', bookings.filter(b => b.status === 'pending').length],
      ['Approved', bookings.filter(b => b.status === 'approved').length],
      ['Active', bookings.filter(b => b.status === 'active').length],
      ['Completed', bookings.filter(b => b.status === 'completed').length],
      ['Cancelled', bookings.filter(b => b.status === 'cancelled').length],
      [],
      ['Booking Details'],
      ['Booking ID', 'Trainer Name', 'Vehicle', 'Purpose', 'Start Date', 'End Date', 'Status', 'Location'],
      ...bookings.map(b => {
        const vehicle = vehicles.find((v: any) => v.id === b.vehicleId);
        return [
          b.id,
          b.trainerName || 'N/A',
          vehicle ? `${vehicle.brand} ${vehicle.model} - ${vehicle.vehicleRegNo || vehicle.regNo || 'N/A'}` : 'N/A',
          b.purpose || 'N/A',
          format(parseISO(b.startDate), 'yyyy-MM-dd HH:mm'),
          format(parseISO(b.endDate), 'yyyy-MM-dd HH:mm'),
          b.status || 'N/A',
          b.requestedLocation || 'N/A'
        ];
      })
    ];
    
    return csvData;
  };
  
  const generateTrainerReport = (users: User[], records: VehicleRecord[], bookings: any[], location: string) => {
    const trainers = users.filter(u => u.role === 'trainer' && u.status === 'active');
    
    const csvData = [
      ['Trainer Activity Report - ' + (location === 'all' ? 'All Locations' : location), format(new Date(), 'yyyy-MM-dd')],
      ['Location', location === 'all' ? 'All Locations' : location],
      [],
      ['Trainer Overview'],
      ['Total Trainers', trainers.length],
      ['Active Trainers', trainers.length],
      [],
      ['Trainer Details'],
      ['Name', 'Email', 'Status', 'Location', 'Vehicles Allocated', 'Total Bookings'],
      ...trainers.map(trainer => {
        const allocatedVehicles = records.filter(r => r.allocatedTrainer === trainer.name).length;
        const trainerBookings = bookings.filter(b => b.trainerName === trainer.name || b.trainerId === trainer.id).length;
        
        return [
          trainer.name || 'N/A',
          (trainer as any).email || 'N/A',
          trainer.status || 'N/A',
          trainer.location || 'N/A',
          allocatedVehicles,
          trainerBookings
        ];
      }),
      [],
      ['Trainer Vehicle Allocations'],
      ['Trainer', 'Vehicle Registration', 'Brand', 'Model'],
      ...records
        .filter(r => r.allocatedTrainer && r.allocatedTrainer !== 'Unallocated')
        .map(r => [
          r.allocatedTrainer,
          r.vehicleRegNo,
          r.brand,
          r.model
        ])
    ];
    
    return csvData;
  };
  
  const generateMaintenanceReport = (records: VehicleRecord[], vehicles: any[], location: string) => {
    const csvData = [
      ['Maintenance Log Report - ' + (location === 'all' ? 'All Locations' : location), format(new Date(), 'yyyy-MM-dd')],
      ['Location', location === 'all' ? 'All Locations' : location],
      [],
      ['Maintenance Overview'],
      ['Total Vehicles', vehicles.length],
      ['Under Maintenance', vehicles.filter((v: any) => v.status === 'Maintenance').length],
      ['Insurance Expired', records.filter(r => r.insuranceStatus === 'Expired').length],
      ['PUC Expired', records.filter(r => r.pucStatus === 'Expired').length],
      [],
      ['Maintenance Details'],
      ['Registration No', 'Brand', 'Model', 'Insurance Status', 'PUC Status', 'Insurance Valid Until', 'PUC Valid Until', 'Next Service Date'],
      ...records.map(r => [
        r.vehicleRegNo,
        r.brand,
        r.model,
        r.insuranceStatus || 'N/A',
        r.pucStatus || 'N/A',
        r.insuranceValidityDate ? format(parseISO(r.insuranceValidityDate), 'yyyy-MM-dd') : 'N/A',
        r.pucValidityDate ? format(parseISO(r.pucValidityDate), 'yyyy-MM-dd') : 'N/A',
        r.nextServiceDate ? format(parseISO(r.nextServiceDate), 'yyyy-MM-dd') : 'N/A'
      ])
    ];
    
    return csvData;
  };

  const handleGenerateReport = async (reportId: string) => {
    setLoading(reportId);
    
    try {
      const report = reports.find(r => r.id === reportId);
      if (!report) return;
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate report data
      const csvData = generateReportData(report, reportForm.dateRange);
      
      // Calculate file size
      const csvString = csvData.map(row => row.join(',')).join('\n');
      const fileSizeInBytes = new Blob([csvString]).size;
      const fileSizeInKB = (fileSizeInBytes / 1024).toFixed(1);
      const fileSizeInMB = (fileSizeInBytes / (1024 * 1024)).toFixed(1);
      const fileSize = parseFloat(fileSizeInMB) >= 1 ? `${fileSizeInMB} MB` : `${fileSizeInKB} KB`;
      
      // Update report status
      setReports(prev => prev.map(r => 
        r.id === reportId 
          ? { 
              ...r, 
              status: 'ready' as const, 
              lastGenerated: format(new Date(), 'yyyy-MM-dd'),
              fileSize
            }
          : r
      ));
      
      toast.success('Report generated successfully');
    } catch (error) {
      toast.error('Failed to generate report');
    } finally {
      setLoading(null);
    }
  };
  
  const handleViewReport = (reportId: string) => {
    const report = reports.find(r => r.id === reportId);
    if (!report) return;
    
    const csvData = generateReportData(report, reportForm.dateRange);
    const csvString = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    if (win) {
      setTimeout(() => URL.revokeObjectURL(url), 100);
    }
  };
  
  const handleDownloadReport = (reportId: string) => {
    const report = reports.find(r => r.id === reportId);
    if (!report) return;
    
    const csvData = generateReportData(report, reportForm.dateRange);
    const filename = `${report.name.replace(/[^a-z0-9]/gi, '_')}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    exportToCSV(csvData, filename);
    toast.success('Report downloaded successfully');
  };

  const handleCreateCustomReport = async () => {
    if (!selectedTemplate || !reportForm.name) {
      toast.error('Please select a template and enter a report name');
      return;
    }

    setLoading('custom');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const template = reportTemplates.find(t => t.id === selectedTemplate);
      const newReport: Report = {
        id: Date.now().toString(),
        name: reportForm.name,
        type: (template?.type || 'vehicle') as Report['type'],
        description: template?.description || '',
        lastGenerated: format(new Date(), 'yyyy-MM-dd'),
        frequency: reportForm.frequency as Report['frequency'],
        status: 'ready',
        fileSize: '0 KB',
        location: reportForm.location
      };
      
      // Generate and download the report immediately
      const csvData = generateReportData(newReport, reportForm.dateRange);
      const filename = `${newReport.name.replace(/[^a-z0-9]/gi, '_')}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      exportToCSV(csvData, filename);
      
      // Calculate file size
      const csvString = csvData.map(row => row.join(',')).join('\n');
      const fileSizeInBytes = new Blob([csvString]).size;
      const fileSizeInKB = (fileSizeInBytes / 1024).toFixed(1);
      const fileSizeInMB = (fileSizeInBytes / (1024 * 1024)).toFixed(1);
      newReport.fileSize = parseFloat(fileSizeInMB) >= 1 ? `${fileSizeInMB} MB` : `${fileSizeInKB} KB`;
      
      setReports(prev => [...prev, newReport]);
      
      // Reset form
      setReportForm({
        name: '',
        dateRange: 'last-month',
        frequency: 'monthly',
        format: 'csv',
        location: 'all'
      });
      setSelectedTemplate('');
      
      toast.success('Report created and downloaded successfully');
    } catch (error) {
      toast.error('Failed to create report');
    } finally {
      setLoading(null);
    }
  };

  const getStatusBadge = (status: Report['status']) => {
    return status === 'ready' 
      ? <Badge className="bg-success text-success-foreground">Ready</Badge>
      : <Badge className="bg-warning text-warning-foreground">Generating</Badge>;
  };

  const getTypeBadge = (type: Report['type']) => {
    const colors = {
      vehicle: 'bg-primary text-primary-foreground',
      booking: 'bg-blue-500 text-white',
      trainer: 'bg-purple-500 text-white',
      maintenance: 'bg-orange-500 text-white'
    };
    
    return <Badge className={colors[type]}>{type.charAt(0).toUpperCase() + type.slice(1)}</Badge>;
  };

  const reportStats = {
    total: reports.length,
    ready: reports.filter(r => r.status === 'ready').length,
    generating: reports.filter(r => r.status === 'generating').length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">System Reports - All Locations</h1>
        <p className="text-muted-foreground">
          Generate and download fleet management reports across all training centers
        </p>
      </div>

      {/* Report Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Reports"
          value={reportStats.total}
          description="All configured reports"
          icon={FileText}
        />
        <StatCard
          title="Ready Reports"
          value={reportStats.ready}
          description="Available for download"
          icon={Download}
        />
        <StatCard
          title="Generating"
          value={reportStats.generating}
          description="Currently processing"
          icon={Clock}
        />
      </div>

      {/* Create Custom Report */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Create Custom Report</span>
          </CardTitle>
          <CardDescription>Generate a new report from templates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Template Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {reportTemplates.map((template) => (
              <div
                key={template.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedTemplate === template.id 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setSelectedTemplate(template.id)}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <template.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">{template.name}</div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{template.description}</p>
              </div>
            ))}
          </div>

          {selectedTemplate && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/20">
              <div className="space-y-2">
                <Label htmlFor="reportName">Report Name</Label>
                <Input
                  id="reportName"
                  value={reportForm.name}
                  onChange={(e) => setReportForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter report name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Select
                  value={reportForm.location}
                  onValueChange={(value) => setReportForm(prev => ({ ...prev, location: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {LOCATIONS.map(loc => (
                      <SelectItem key={loc.code} value={loc.code}>
                        {loc.fullName}
                      </SelectItem>
                    ))}</SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dateRange">Date Range</Label>
                <Select
                  value={reportForm.dateRange}
                  onValueChange={(value) => setReportForm(prev => ({ ...prev, dateRange: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="last-week">Last Week</SelectItem>
                    <SelectItem value="last-month">Last Month</SelectItem>
                    <SelectItem value="last-quarter">Last Quarter</SelectItem>
                    <SelectItem value="last-year">Last Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Select
                  value={reportForm.frequency}
                  onValueChange={(value) => setReportForm(prev => ({ ...prev, frequency: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="custom">One-time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="format">Format</Label>
                <Select
                  value={reportForm.format}
                  onValueChange={(value) => setReportForm(prev => ({ ...prev, format: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="md:col-span-2 flex justify-end">
                <Button 
                  onClick={handleCreateCustomReport}
                  disabled={loading === 'custom'}
                  className="bg-gradient-primary hover:bg-primary-hover"
                >
                  {loading === 'custom' ? 'Creating...' : 'Create Report'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Existing Reports */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Available Reports</span>
          </CardTitle>
          <CardDescription>Download and manage generated reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium">{report.name}</h3>
                      {getTypeBadge(report.type)}
                      {getStatusBadge(report.status)}
                      {report.location && (
                        <Badge variant="outline">{report.location === 'all' ? 'All Locations' : report.location}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{report.description}</p>
                    <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                      <span>Last generated: {report.lastGenerated}</span>
                      {report.fileSize && <span>• {report.fileSize}</span>}
                      <span>• {report.frequency}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {report.status === 'ready' && (
                    <>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewReport(report.id)}
                        title="View Report"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDownloadReport(report.id)}
                        title="Download Report"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  {report.status === 'generating' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled={loading === report.id}
                      onClick={() => handleGenerateReport(report.id)}
                    >
                      {loading === report.id ? 'Generating...' : 'Generate Now'}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
