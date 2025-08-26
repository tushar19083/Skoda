import { useState } from 'react';
import { ArrowLeftRight, Search, Filter, Clock, CheckCircle, AlertTriangle, Car, User, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';

interface VehicleReturn {
  id: string;
  vehicle: string;
  trainer: string;
  keyIssued: string;
  expectedReturn: string;
  actualReturn?: string;
  status: 'active' | 'returned' | 'overdue' | 'damaged';
  mileage?: {
    issued: number;
    returned?: number;
  };
  condition: 'excellent' | 'good' | 'fair' | 'damaged';
  notes?: string;
  purpose: string;
}

const mockReturns: VehicleReturn[] = [
  {
    id: '1',
    vehicle: 'Skoda Octavia - SK001',
    trainer: 'Sarah Thompson',
    keyIssued: '08:30',
    expectedReturn: '12:30',
    status: 'active',
    mileage: { issued: 45230 },
    condition: 'excellent',
    purpose: 'Advanced Driving'
  },
  {
    id: '2',
    vehicle: 'VW Golf - VW003',
    trainer: 'Mike Johnson',
    keyIssued: '09:00',
    expectedReturn: '13:00',
    actualReturn: '12:45',
    status: 'returned',
    mileage: { issued: 32100, returned: 32145 },
    condition: 'good',
    purpose: 'Emergency Training'
  },
  {
    id: '3',
    vehicle: 'Audi A4 - AD002',
    trainer: 'Emma Wilson',
    keyIssued: '09:15',
    expectedReturn: '13:15',
    status: 'overdue',
    mileage: { issued: 28750 },
    condition: 'excellent',
    purpose: 'Standard Session'
  },
  {
    id: '4',
    vehicle: 'Skoda Superb - SK005',
    trainer: 'John Davis',
    keyIssued: '07:45',
    expectedReturn: '11:45',
    actualReturn: '11:30',
    status: 'damaged',
    mileage: { issued: 51200, returned: 51235 },
    condition: 'damaged',
    notes: 'Minor scratch on rear bumper',
    purpose: 'Highway Training'
  },
  {
    id: '5',
    vehicle: 'VW Passat - VW008',
    trainer: 'Lisa Brown',
    keyIssued: '10:00',
    expectedReturn: '14:00',
    status: 'active',
    mileage: { issued: 41500 },
    condition: 'good',
    purpose: 'City Driving'
  }
];

const mockStats = {
  totalActive: 12,
  returnsToday: 8,
  overdue: 2,
  damageReports: 1
};

export function VehicleReturns() {
  const [returns, setReturns] = useState<VehicleReturn[]>(mockReturns);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [processingReturn, setProcessingReturn] = useState<string | null>(null);
  const { toast } = useToast();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Active</Badge>;
      case 'returned':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Returned</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Overdue</Badge>;
      case 'damaged':
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200">Damaged</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getConditionBadge = (condition: string) => {
    switch (condition) {
      case 'excellent':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Excellent</Badge>;
      case 'good':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Good</Badge>;
      case 'fair':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Fair</Badge>;
      case 'damaged':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Damaged</Badge>;
      default:
        return <Badge variant="outline">{condition}</Badge>;
    }
  };

  const handleProcessReturn = async (returnId: string, condition: string, mileage?: number, notes?: string) => {
    setProcessingReturn(returnId);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setReturns(prev => prev.map(ret => 
      ret.id === returnId 
        ? { 
            ...ret, 
            status: condition === 'damaged' ? 'damaged' : 'returned',
            actualReturn: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
            condition: condition as any,
            mileage: mileage ? { ...ret.mileage, returned: mileage } : ret.mileage,
            notes
          }
        : ret
    ));
    
    setProcessingReturn(null);
    toast({
      title: "Vehicle Returned",
      description: `Vehicle return processed successfully${condition === 'damaged' ? ' with damage report' : ''}`,
    });
  };

  const filteredReturns = returns.filter(ret => {
    const matchesSearch = ret.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ret.trainer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ret.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Vehicle Returns</h1>
          <p className="text-muted-foreground">
            Track and process vehicle key returns
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Return History
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-elevated">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Out</p>
                <p className="text-2xl font-bold">{mockStats.totalActive}</p>
              </div>
              <Car className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-elevated">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Returns Today</p>
                <p className="text-2xl font-bold text-green-600">{mockStats.returnsToday}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-elevated">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{mockStats.overdue}</p>
              </div>
              <Clock className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-elevated">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Damage Reports</p>
                <p className="text-2xl font-bold text-orange-600">{mockStats.damageReports}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="card-elevated">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search vehicles or trainers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="returned">Returned</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="damaged">Damaged</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Returns Table */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ArrowLeftRight className="h-5 w-5" />
            <span>Vehicle Returns ({filteredReturns.length})</span>
          </CardTitle>
          <CardDescription>
            Current vehicle status and return processing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Trainer</TableHead>
                  <TableHead>Times</TableHead>
                  <TableHead>Mileage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReturns.map((ret) => (
                  <TableRow key={ret.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{ret.vehicle}</p>
                        <p className="text-sm text-muted-foreground">{ret.purpose}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{ret.trainer}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>Out: {ret.keyIssued}</p>
                        <p>Due: {ret.expectedReturn}</p>
                        {ret.actualReturn && <p className="text-green-600">Returned: {ret.actualReturn}</p>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>Start: {ret.mileage?.issued.toLocaleString()}</p>
                        {ret.mileage?.returned && (
                          <>
                            <p>End: {ret.mileage.returned.toLocaleString()}</p>
                            <p className="text-muted-foreground">
                              +{(ret.mileage.returned - ret.mileage.issued)} miles
                            </p>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(ret.status)}</TableCell>
                    <TableCell>{getConditionBadge(ret.condition)}</TableCell>
                    <TableCell>
                      {ret.status === 'active' || ret.status === 'overdue' ? (
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleProcessReturn(ret.id, 'good', 50000)}
                            disabled={processingReturn === ret.id}
                            className="h-8"
                          >
                            {processingReturn === ret.id ? 'Processing...' : 'Process Return'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleProcessReturn(ret.id, 'damaged', 50000, 'Damage reported')}
                            disabled={processingReturn === ret.id}
                            className="h-8"
                          >
                            Report Damage
                          </Button>
                        </div>
                      ) : (
                        <div className="flex space-x-2">
                          <Button size="sm" variant="ghost" className="h-8">
                            View Details
                          </Button>
                        </div>
                      )}
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