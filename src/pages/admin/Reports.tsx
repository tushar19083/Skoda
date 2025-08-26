import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { StatCard } from '@/components/dashboard/StatCard';
import { 
  Download, 
  FileText, 
  BarChart3, 
  PieChart, 
  Calendar, 
  Users, 
  Car, 
  DollarSign,
  Send,
  Eye,
  Clock,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';

interface Report {
  id: string;
  name: string;
  type: 'vehicle' | 'booking' | 'user' | 'maintenance';
  description: string;
  lastGenerated: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
  status: 'ready' | 'generating' | 'scheduled';
  recipients: string[];
  fileSize?: string;
}

const mockReports: Report[] = [
  {
    id: '1',
    name: 'Monthly Fleet Utilization',
    type: 'vehicle',
    description: 'Comprehensive analysis of vehicle usage and efficiency metrics',
    lastGenerated: '2024-01-15',
    frequency: 'monthly',
    status: 'ready',
    recipients: ['admin@company.com', 'fleet@company.com'],
    fileSize: '2.4 MB'
  },
  {
    id: '2',
    name: 'Weekly Booking Summary',
    type: 'booking',
    description: 'Summary of all bookings, cancellations, and utilization rates',
    lastGenerated: '2024-01-14',
    frequency: 'weekly',
    status: 'ready',
    recipients: ['management@company.com'],
    fileSize: '1.8 MB'
  },
  {
    id: '3',
    name: 'User Activity Report',
    type: 'user',
    description: 'User engagement, login patterns, and activity metrics',
    lastGenerated: '2024-01-10',
    frequency: 'monthly',
    status: 'ready',
    recipients: ['hr@company.com'],
    fileSize: '956 KB'
  },
  {
    id: '4',
    name: 'Maintenance Cost Analysis',
    type: 'maintenance',
    description: 'Breakdown of maintenance costs, trends, and predictive insights',
    lastGenerated: '2024-01-12',
    frequency: 'monthly',
    status: 'generating',
    recipients: ['maintenance@company.com', 'finance@company.com'],
  }
];

const reportTemplates = [
  {
    id: 'fleet-summary',
    name: 'Fleet Summary Report',
    type: 'vehicle',
    description: 'Overview of fleet status, utilization, and performance',
    icon: Car,
    metrics: ['Total Vehicles', 'Utilization Rate', 'Maintenance Status', 'Cost per Mile']
  },
  {
    id: 'booking-analytics',
    name: 'Booking Analytics Report',
    type: 'booking',
    description: 'Detailed analysis of booking patterns and trends',
    icon: Calendar,
    metrics: ['Total Bookings', 'Peak Hours', 'Cancellation Rate', 'User Satisfaction']
  },
  {
    id: 'user-engagement',
    name: 'User Engagement Report',
    type: 'user',
    description: 'User activity, retention, and engagement statistics',
    icon: Users,
    metrics: ['Active Users', 'Login Frequency', 'Feature Usage', 'Retention Rate']
  }
];

export function Reports() {
  const [reports, setReports] = useState<Report[]>(mockReports);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [reportForm, setReportForm] = useState({
    name: '',
    dateRange: 'last-month',
    frequency: 'monthly',
    recipients: [''],
    includeCharts: true,
    includeRawData: false,
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
        recipients: reportForm.recipients.filter(r => r.trim() !== ''),
        fileSize: `${(Math.random() * 3 + 1).toFixed(1)} MB`
      };
      
      setReports(prev => [...prev, newReport]);
      
      // Reset form
      setReportForm({
        name: '',
        dateRange: 'last-month',
        frequency: 'monthly',
        recipients: [''],
        includeCharts: true,
        includeRawData: false,
        format: 'pdf'
      });
      setSelectedTemplate('');
      
      toast.success('Custom report created successfully');
    } catch (error) {
      toast.error('Failed to create custom report');
    } finally {
      setLoading(null);
    }
  };

  const getStatusBadge = (status: Report['status']) => {
    switch (status) {
      case 'ready':
        return <Badge className="bg-success text-success-foreground">Ready</Badge>;
      case 'generating':
        return <Badge className="bg-warning text-warning-foreground">Generating</Badge>;
      case 'scheduled':
        return <Badge variant="outline">Scheduled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: Report['type']) => {
    const colors = {
      vehicle: 'bg-primary text-primary-foreground',
      booking: 'bg-blue-500 text-white',
      financial: 'bg-green-500 text-white',
      user: 'bg-purple-500 text-white',
      maintenance: 'bg-orange-500 text-white'
    };
    
    return <Badge className={colors[type]}>{type.charAt(0).toUpperCase() + type.slice(1)}</Badge>;
  };

  const reportStats = {
    total: reports.length,
    ready: reports.filter(r => r.status === 'ready').length,
    scheduled: reports.filter(r => r.status === 'scheduled').length,
    generating: reports.filter(r => r.status === 'generating').length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Generate comprehensive reports and business insights
          </p>
        </div>
      </div>

      {/* Report Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Reports"
          value={reportStats.total}
          description="All configured reports"
          icon={FileText}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Ready Reports"
          value={reportStats.ready}
          description="Available for download"
          icon={Download}
          trend={{ value: 25, isPositive: true }}
        />
        <StatCard
          title="Scheduled"
          value={reportStats.scheduled}
          description="Automated generation"
          icon={Clock}
        />
        <StatCard
          title="Generating"
          value={reportStats.generating}
          description="Currently processing"
          icon={TrendingUp}
        />
      </div>

      {/* Create Custom Report */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Create Custom Report</span>
          </CardTitle>
          <CardDescription>Generate a new report based on predefined templates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Template Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  <div className="flex-1">
                    <div className="font-medium text-sm">{template.name}</div>
                    {getTypeBadge(template.type)}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-3">{template.description}</p>
                <div className="space-y-1">
                  {template.metrics.map((metric, index) => (
                    <div key={index} className="text-xs text-muted-foreground">• {metric}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {selectedTemplate && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-lg bg-muted/20">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reportName">Report Name</Label>
                  <Input
                    id="reportName"
                    value={reportForm.name}
                    onChange={(e) => setReportForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter custom report name"
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
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="frequency">Generation Frequency</Label>
                  <Select
                    value={reportForm.frequency}
                    onValueChange={(value) => setReportForm(prev => ({ ...prev, frequency: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="custom">One-time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Email Recipients</Label>
                  {reportForm.recipients.map((recipient, index) => (
                    <Input
                      key={index}
                      value={recipient}
                      onChange={(e) => {
                        const newRecipients = [...reportForm.recipients];
                        newRecipients[index] = e.target.value;
                        setReportForm(prev => ({ ...prev, recipients: newRecipients }));
                      }}
                      placeholder="email@company.com"
                    />
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setReportForm(prev => ({ 
                      ...prev, 
                      recipients: [...prev.recipients, ''] 
                    }))}
                  >
                    Add Recipient
                  </Button>
                </div>
                
                <div className="space-y-3">
                  <Label>Report Options</Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeCharts"
                      checked={reportForm.includeCharts}
                      onCheckedChange={(checked) => 
                        setReportForm(prev => ({ ...prev, includeCharts: !!checked }))
                      }
                    />
                    <Label htmlFor="includeCharts" className="text-sm">Include Charts & Graphs</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeRawData"
                      checked={reportForm.includeRawData}
                      onCheckedChange={(checked) => 
                        setReportForm(prev => ({ ...prev, includeRawData: !!checked }))
                      }
                    />
                    <Label htmlFor="includeRawData" className="text-sm">Include Raw Data</Label>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="format">Export Format</Label>
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
            <span>Existing Reports</span>
          </CardTitle>
          <CardDescription>Manage and download generated reports</CardDescription>
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
                    <div className="font-medium">{report.name}</div>
                    <div className="text-sm text-muted-foreground">{report.description}</div>
                    <div className="flex items-center space-x-2">
                      {getTypeBadge(report.type)}
                      {getStatusBadge(report.status)}
                      <span className="text-xs text-muted-foreground">
                        Last generated: {report.lastGenerated}
                      </span>
                      {report.fileSize && (
                        <span className="text-xs text-muted-foreground">
                          • {report.fileSize}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {report.status === 'ready' && (
                    <>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Send className="h-4 w-4 mr-1" />
                        Send
                      </Button>
                    </>
                  )}
                  {report.status === 'scheduled' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleGenerateReport(report.id)}
                      disabled={loading === report.id}
                    >
                      {loading === report.id ? 'Generating...' : 'Generate Now'}
                    </Button>
                  )}
                  {report.status === 'generating' && (
                    <div className="text-sm text-muted-foreground">Generating...</div>
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