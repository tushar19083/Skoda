import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/dashboard/StatCard';
import { useAuth } from '@/contexts/AuthContext';
import { useVehicles } from '@/hooks/useVehicles';
import { useBookings } from '@/hooks/useBookings';
import { useLocationFilter } from '@/hooks/useLocationFilter';
import { useToast } from '@/hooks/use-toast';
import { format, subWeeks, subMonths, subYears, parseISO, isWithinInterval } from 'date-fns';
import { 
  Download, 
  FileText, 
  BarChart3, 
  Calendar, 
  Users, 
  Car,
  Send,
  Eye,
  Clock,
} from 'lucide-react';

const STORAGE_KEY_REPORTS = 'app_reports';
const STORAGE_KEY_USERS = 'app_users';
const STORAGE_KEY_RECORDS = 'app_vehicle_records';

interface User {
  id: string;
  name: string;
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
  costIncurred?: number;
}

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

const getReports = (): Report[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_REPORTS);
    return stored ? JSON.parse(stored) : [];
  } catch (err) {
    console.error('Error loading reports from localStorage:', err);
    return [];
  }
};

const saveReports = (reports: Report[]) => {
  try {
    localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(reports));
  } catch (err) {
    console.error('Error saving reports to localStorage:', err);
  }
};

interface Report {
  id: string;
  name: string;
  type: 'vehicle' | 'booking' | 'trainer' | 'maintenance';
  description: string;
  lastGenerated: string;
  frequency: 'weekly' | 'monthly' | 'custom';
  status: 'ready' | 'generating';
  fileSize?: string;
}

// Initial default reports
const getInitialReports = (): Report[] => [
  {
    id: '1',
    name: 'Fleet Utilization Report',
    type: 'vehicle',
    description: 'Vehicle usage and efficiency analysis',
    lastGenerated: format(new Date(), 'yyyy-MM-dd'),
    frequency: 'monthly',
    status: 'ready',
    fileSize: '0 KB'
  },
  {
    id: '2',
    name: 'Booking Summary',
    type: 'booking',
    description: 'Trainer booking patterns and statistics',
    lastGenerated: format(new Date(), 'yyyy-MM-dd'),
    frequency: 'weekly',
    status: 'ready',
    fileSize: '0 KB'
  },
  {
    id: '3',
    name: 'Trainer Activity Report',
    type: 'trainer',
    description: 'Trainer usage and engagement metrics',
    lastGenerated: format(new Date(), 'yyyy-MM-dd'),
    frequency: 'monthly',
    status: 'ready',
    fileSize: '0 KB'
  },
  {
    id: '4',
    name: 'Maintenance Log',
    type: 'maintenance',
    description: 'Vehicle maintenance and downtime tracking',
    lastGenerated: format(new Date(), 'yyyy-MM-dd'),
    frequency: 'monthly',
    status: 'ready',
    fileSize: '0 KB'
  }
];

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

export function Reports() {
  const { user } = useAuth();
  const { vehicles, isLoading: vehiclesLoading } = useVehicles();
  const { bookings, loading: bookingsLoading } = useBookings();
  const { filterByLocation } = useLocationFilter();
  const { toast } = useToast();
  
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
    format: 'csv'
  });
  const [loading, setLoading] = useState<string | null>(null);
  
  // Get admin's location
  const adminLocation = user?.location ? (user.location === 'PTC' ? 'Pune' : user.location === 'BLR' ? 'Bangalore' : user.location) : 'Pune';
  
  // Load users and service records
  const [users, setUsers] = useState<User[]>([]);
  const [records, setRecords] = useState<VehicleRecord[]>([]);
  
  useEffect(() => {
    const allUsers = getUsers();
    const allRecords = getVehicleRecords();
    
    // Filter by location
    const locationUsers = filterByLocation(allUsers.map(u => ({
      ...u,
      location: u.location || user?.location
    }))) as User[];
    
    const locationRecords = filterByLocation(allRecords.map(r => ({
      ...r,
      location: r.academyLocation
    }))) as VehicleRecord[];
    
    setUsers(locationUsers);
    setRecords(locationRecords);
  }, [user?.location, filterByLocation]);
  
  // Filter vehicles and bookings by location
  const locationVehicles = filterByLocation(vehicles.map(v => ({
    ...v,
    location: v.location
  })));
  
  const locationBookings = filterByLocation(bookings.map(b => ({
    ...b,
    location: b.requestedLocation
  })));
  
  // Save reports to localStorage whenever they change
  useEffect(() => {
    saveReports(reports);
  }, [reports]);

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
  
  // Generate report data based on type
  const generateReportData = (report: Report, dateRange?: string) => {
    const range = dateRange ? getDateRange(dateRange) : getDateRange('last-month');
    const filteredBookings = locationBookings.filter(b => {
      const bookingDate = parseISO(b.createdAt);
      return isWithinInterval(bookingDate, { start: range.startDate, end: range.endDate });
    });
    
    switch (report.type) {
      case 'vehicle':
        return generateVehicleReport(locationVehicles, records, filteredBookings);
      case 'booking':
        return generateBookingReport(filteredBookings, locationVehicles);
      case 'trainer':
        return generateTrainerReport(users, records, filteredBookings);
      case 'maintenance':
        return generateMaintenanceReport(records, locationVehicles);
      default:
        return [];
    }
  };
  
  const generateVehicleReport = (vehicles: any[], records: VehicleRecord[], bookings: any[]) => {
    const csvData = [
      ['Fleet Utilization Report', format(new Date(), 'yyyy-MM-dd')],
      ['Location', adminLocation],
      [],
      ['Vehicle Overview'],
      ['Total Vehicles', vehicles.length],
      ['Active Vehicles', vehicles.filter(v => v.status === 'Available' || v.status === 'In Use').length],
      ['Under Maintenance', vehicles.filter(v => v.status === 'Maintenance').length],
      [],
      ['Vehicle Details'],
      ['Registration No', 'Brand', 'Model', 'Year', 'Status', 'Location', 'Allocated Trainer'],
      ...vehicles.map((v: any) => [
        v.regNo || 'N/A',
        v.brand || 'N/A',
        v.model || 'N/A',
        v.year || 'N/A',
        v.status || 'N/A',
        v.location || 'N/A',
        records.find(r => r.vehicleRegNo === v.regNo)?.allocatedTrainer || 'Unallocated'
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
  
  const generateBookingReport = (bookings: any[], vehicles: any[]) => {
    const csvData = [
      ['Booking Summary Report', format(new Date(), 'yyyy-MM-dd')],
      ['Location', adminLocation],
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
          vehicle ? `${vehicle.brand} ${vehicle.model} - ${vehicle.regNo}` : 'N/A',
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
  
  const generateTrainerReport = (users: User[], records: VehicleRecord[], bookings: any[]) => {
    const trainers = users.filter(u => u.role === 'trainer' && u.status === 'active');
    
    const csvData = [
      ['Trainer Activity Report', format(new Date(), 'yyyy-MM-dd')],
      ['Location', adminLocation],
      [],
      ['Trainer Overview'],
      ['Total Trainers', trainers.length],
      ['Active Trainers', trainers.length],
      [],
      ['Trainer Details'],
      ['Name', 'Email', 'Status', 'Location', 'Vehicles Allocated', 'Total Bookings'],
      ...trainers.map(trainer => {
        const allocatedVehicles = records.filter(r => r.allocatedTrainer === trainer.name).length;
        const trainerBookings = bookings.filter(b => b.trainerName === trainer.name).length;
        
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
  
  const generateMaintenanceReport = (records: VehicleRecord[], vehicles: any[]) => {
    const csvData = [
      ['Maintenance Log Report', format(new Date(), 'yyyy-MM-dd')],
      ['Location', adminLocation],
      [],
      ['Maintenance Overview'],
      ['Total Vehicles', vehicles.length],
      ['Under Maintenance', vehicles.filter((v: any) => v.status === 'Maintenance').length],
      ['Insurance Expired', records.filter(r => r.insuranceStatus === 'Expired').length],
      ['PUC Expired', records.filter(r => r.pucStatus === 'Expired').length],
      [],
      ['Maintenance Details'],
      ['Vehicle Registration', 'Brand', 'Model', 'Insurance Status', 'PUC Status', 'Next Service Date', 'Allocated Trainer'],
      ...records.map(r => {
        const vehicle = vehicles.find((v: any) => v.regNo === r.vehicleRegNo);
        return [
          r.vehicleRegNo,
          r.brand || (vehicle?.brand || 'N/A'),
          r.model || (vehicle?.model || 'N/A'),
          r.insuranceStatus || 'N/A',
          r.pucStatus || 'N/A',
          r.nextServiceDate ? format(parseISO(r.nextServiceDate), 'yyyy-MM-dd') : 'N/A',
          r.allocatedTrainer || 'Unallocated'
        ];
      }),
      [],
      ['Vehicles Under Maintenance'],
      ['Registration No', 'Brand', 'Model', 'Status'],
      ...vehicles
        .filter((v: any) => v.status === 'Maintenance')
        .map((v: any) => [
          v.regNo || 'N/A',
          v.brand || 'N/A',
          v.model || 'N/A',
          v.status || 'N/A'
        ])
    ];
    
    return csvData;
  };
  
  // Export CSV function
  const exportToCSV = (csvData: any[][], filename: string) => {
    const csv = csvData.map(row => 
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n');
    
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleGenerateReport = async (reportId: string) => {
    setLoading(reportId);
    
    try {
      const report = reports.find(r => r.id === reportId);
      if (!report) {
        throw new Error('Report not found');
      }
      
      // Generate report data
      const csvData = generateReportData(report);
      const filename = `${report.name.replace(/\s+/g, '-')}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      
      // Export the report
      exportToCSV(csvData, filename);
      
      // Calculate file size (approximate)
      const csvString = csvData.map(row => row.join(',')).join('\n');
      const fileSizeKB = Math.round(csvString.length / 1024);
      const fileSize = fileSizeKB > 1024 
        ? `${(fileSizeKB / 1024).toFixed(1)} MB` 
        : `${fileSizeKB} KB`;
      
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
      
      toast({
        title: 'Report generated successfully',
        description: `Report "${report.name}" has been downloaded`,
      });
    } catch (error) {
      toast({
        title: 'Failed to generate report',
        description: 'An error occurred while generating the report',
        variant: 'destructive',
      });
    } finally {
      setLoading(null);
    }
  };
  
  const handleViewReport = (reportId: string) => {
    const report = reports.find(r => r.id === reportId);
    if (!report) return;
    
    const csvData = generateReportData(report);
    const csv = csvData.map(row => row.join(',')).join('\n');
    
    // Open in new window as text
    const blob = new Blob([csv], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };
  
  const handleDownloadReport = (reportId: string) => {
    handleGenerateReport(reportId);
  };

  const handleCreateCustomReport = async () => {
    if (!selectedTemplate || !reportForm.name) {
      toast({
        title: 'Validation Error',
        description: 'Please select a template and enter a report name',
        variant: 'destructive',
      });
      return;
    }

    setLoading('custom');
    
    try {
      const template = reportTemplates.find(t => t.id === selectedTemplate);
      const newReport: Report = {
        id: Date.now().toString(),
        name: reportForm.name,
        type: (template?.type || 'vehicle') as Report['type'],
        description: template?.description || '',
        lastGenerated: format(new Date(), 'yyyy-MM-dd'),
        frequency: reportForm.frequency as Report['frequency'],
        status: 'ready',
        fileSize: '0 KB'
      };
      
      // Generate and download the report immediately
      const csvData = generateReportData(newReport, reportForm.dateRange);
      const filename = `${newReport.name.replace(/\s+/g, '-')}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      exportToCSV(csvData, filename);
      
      // Calculate file size
      const csvString = csvData.map(row => row.join(',')).join('\n');
      const fileSizeKB = Math.round(csvString.length / 1024);
      newReport.fileSize = fileSizeKB > 1024 
        ? `${(fileSizeKB / 1024).toFixed(1)} MB` 
        : `${fileSizeKB} KB`;
      
      setReports(prev => [...prev, newReport]);
      
      // Reset form
      setReportForm({
        name: '',
        dateRange: 'last-month',
        frequency: 'monthly',
        format: 'csv'
      });
      setSelectedTemplate('');
      
      toast({
        title: 'Report created successfully',
        description: `Report "${newReport.name}" has been created and downloaded`,
      });
    } catch (error) {
      toast({
        title: 'Failed to create report',
        description: 'An error occurred while creating the report',
        variant: 'destructive',
      });
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
        <h1 className="text-3xl font-bold">System Reports</h1>
        <p className="text-muted-foreground">
          Generate and download fleet management reports
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
        {/* <StatCard
          title="Generating"
          value={reportStats.generating}
          description="Currently processing"
          icon={Clock}
        /> */}
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
                        disabled={loading === report.id}
                        title="Download Report"
                      >
                        {loading === report.id ? (
                          <Clock className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
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