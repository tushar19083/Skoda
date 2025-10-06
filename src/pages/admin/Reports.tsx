import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/dashboard/StatCard';
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
import { toast } from 'sonner';

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

const mockReports: Report[] = [
  {
    id: '1',
    name: 'Fleet Utilization Report',
    type: 'vehicle',
    description: 'Vehicle usage and efficiency analysis',
    lastGenerated: '2024-01-15',
    frequency: 'monthly',
    status: 'ready',
    fileSize: '2.4 MB'
  },
  {
    id: '2',
    name: 'Booking Summary',
    type: 'booking',
    description: 'Trainer booking patterns and statistics',
    lastGenerated: '2024-01-14',
    frequency: 'weekly',
    status: 'ready',
    fileSize: '1.8 MB'
  },
  {
    id: '3',
    name: 'Trainer Activity Report',
    type: 'trainer',
    description: 'Trainer usage and engagement metrics',
    lastGenerated: '2024-01-10',
    frequency: 'monthly',
    status: 'ready',
    fileSize: '956 KB'
  },
  {
    id: '4',
    name: 'Maintenance Log',
    type: 'maintenance',
    description: 'Vehicle maintenance and downtime tracking',
    lastGenerated: '2024-01-12',
    frequency: 'monthly',
    status: 'generating',
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
  const [reports, setReports] = useState<Report[]>(mockReports);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [reportForm, setReportForm] = useState({
    name: '',
    dateRange: 'last-month',
    frequency: 'monthly',
    format: 'pdf'
  });
  const [loading, setLoading] = useState<string | null>(null);

  const handleGenerateReport = async (reportId: string) => {
    setLoading(reportId);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setReports(prev => prev.map(report => 
        report.id === reportId 
          ? { 
              ...report, 
              status: 'ready' as const, 
              lastGenerated: new Date().toISOString().split('T')[0],
              fileSize: `${(Math.random() * 3 + 1).toFixed(1)} MB`
            }
          : report
      ));
      
      toast.success('Report generated successfully');
    } catch (error) {
      toast.error('Failed to generate report');
    } finally {
      setLoading(null);
    }
  };

  const handleCreateCustomReport = async () => {
    if (!selectedTemplate || !reportForm.name) {
      toast.error('Please select a template and enter a report name');
      return;
    }

    setLoading('custom');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const template = reportTemplates.find(t => t.id === selectedTemplate);
      const newReport: Report = {
        id: Date.now().toString(),
        name: reportForm.name,
        type: (template?.type || 'vehicle') as Report['type'],
        description: template?.description || '',
        lastGenerated: new Date().toISOString().split('T')[0],
        frequency: reportForm.frequency as Report['frequency'],
        status: 'ready',
        fileSize: `${(Math.random() * 3 + 1).toFixed(1)} MB`
      };
      
      setReports(prev => [...prev, newReport]);
      
      // Reset form
      setReportForm({
        name: '',
        dateRange: 'last-month',
        frequency: 'monthly',
        format: 'pdf'
      });
      setSelectedTemplate('');
      
      toast.success('Report created successfully');
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
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
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
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
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