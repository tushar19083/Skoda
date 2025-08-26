import { Key, ArrowLeftRight, Shield, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const mockStats = {
  keysIssued: 8,
  pendingReturns: 5,
  securityAlerts: 2,
  vehiclesInUse: 12,
};

const mockPendingKeyRequests = [
  {
    id: '1',
    vehicle: 'Skoda Octavia - SK001',
    trainer: 'Sarah Thompson',
    requestTime: '09:15',
    purpose: 'Advanced Driving',
    urgency: 'normal'
  },
  {
    id: '2',
    vehicle: 'VW Golf - VW003',
    trainer: 'Mike Johnson',
    requestTime: '09:45',
    purpose: 'Emergency Training',
    urgency: 'high'
  },
  {
    id: '3',
    vehicle: 'Audi A4 - AD002',
    trainer: 'Emma Wilson',
    requestTime: '10:30',
    purpose: 'Standard Session',
    urgency: 'normal'
  },
];

const mockActiveIssues = [
  {
    id: '1',
    vehicle: 'Skoda Superb - SK005',
    trainer: 'John Davis',
    issuedTime: '08:30',
    expectedReturn: '12:30',
    status: 'active'
  },
  {
    id: '2',
    vehicle: 'VW Passat - VW008',
    trainer: 'Lisa Brown',
    issuedTime: '09:00',
    expectedReturn: '13:00',
    status: 'overdue'
  },
];

const mockSecurityAlerts = [
  {
    id: '1',
    type: 'Overdue Return',
    vehicle: 'VW Passat - VW008',
    description: 'Vehicle is 30 minutes overdue',
    severity: 'high',
    time: '13:30'
  },
  {
    id: '2',
    type: 'Damage Report',
    vehicle: 'Skoda Fabia - SK012',
    description: 'Minor scratch reported on return',
    severity: 'medium',
    time: '12:15'
  },
];

export function SecurityDashboard() {
  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge className="bg-warning text-warning-foreground">Medium</Badge>;
      case 'normal':
        return <Badge variant="outline">Normal</Badge>;
      default:
        return <Badge variant="outline">{urgency}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-success text-success-foreground">Active</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Overdue</Badge>;
      case 'returned':
        return <Badge variant="secondary">Returned</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge className="bg-warning text-warning-foreground">Medium</Badge>;
      case 'low':
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Security Dashboard</h1>
          <p className="text-muted-foreground">
            Vehicle key management and security monitoring
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Shield className="h-4 w-4 mr-2" />
            Security Log
          </Button>
          <Button 
            variant="outline"
            onClick={() => window.location.href = '/security/returns'}
          >
            <ArrowLeftRight className="h-4 w-4 mr-2" />
            Vehicle Returns
          </Button>
          <Button 
            className="bg-gradient-primary hover:bg-primary-hover"
            onClick={() => window.location.href = '/security/issue-keys'}
          >
            <Key className="h-4 w-4 mr-2" />
            Issue Keys
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Keys Issued Today"
          value={mockStats.keysIssued}
          description="Active key handouts"
          icon={Key}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Pending Returns"
          value={mockStats.pendingReturns}
          description="Vehicles still out"
          icon={ArrowLeftRight}
        />
        <StatCard
          title="Security Alerts"
          value={mockStats.securityAlerts}
          description="Requires attention"
          icon={AlertCircle}
          className="border-warning"
        />
        <StatCard
          title="Vehicles in Use"
          value={mockStats.vehiclesInUse}
          description="Currently deployed"
          icon={Shield}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending Key Requests */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Key className="h-5 w-5" />
              <span>Pending Key Requests</span>
            </CardTitle>
            <CardDescription>
              Trainers waiting for vehicle key approval
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockPendingKeyRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{request.vehicle}</p>
                    <p className="text-sm text-muted-foreground">
                      {request.trainer} • {request.purpose}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Requested at {request.requestTime}
                    </p>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    {getUrgencyBadge(request.urgency)}
                    <Button size="sm" className="h-7">
                      Issue Key
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <Button variant="ghost" className="w-full">
                View All Requests
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Active Key Issues */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Active Key Issues</span>
            </CardTitle>
            <CardDescription>
              Currently issued keys and expected returns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockActiveIssues.map((issue) => (
                <div
                  key={issue.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{issue.vehicle}</p>
                    <p className="text-sm text-muted-foreground">{issue.trainer}</p>
                    <p className="text-xs text-muted-foreground">
                      Issued: {issue.issuedTime} | Return: {issue.expectedReturn}
                    </p>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    {getStatusBadge(issue.status)}
                    <Button size="sm" variant="outline" className="h-7">
                      Check Return
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <Button variant="ghost" className="w-full">
                View All Active Issues
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Alerts */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5" />
            <span>Security Alerts</span>
          </CardTitle>
          <CardDescription>
            Important security notifications and incidents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockSecurityAlerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <p className="font-medium">{alert.type}</p>
                    {getSeverityBadge(alert.severity)}
                  </div>
                  <p className="text-sm text-muted-foreground">{alert.vehicle}</p>
                  <p className="text-sm">{alert.description}</p>
                  <p className="text-xs text-muted-foreground">Time: {alert.time}</p>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    Investigate
                  </Button>
                  <Button size="sm">
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}