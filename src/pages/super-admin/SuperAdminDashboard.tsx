import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/dashboard/StatCard';
import { Users, Car, MapPin, Shield, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { LOCATIONS, getLocationName } from '@/constants/locations';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const mockAdmins = [
  {
    id: '1',
    name: 'John Administrator',
    email: 'admin@skoda.com',
    location: 'PTC',
    status: 'active',
    joinDate: '2023-01-15',
    vehicles: 18,
    trainers: 12,
    bookings: 8
  },
  {
    id: '2',
    name: 'Priya Admin',
    email: 'admin.vgtap@skoda.com',
    location: 'VGTAP',
    status: 'active',
    joinDate: '2023-02-20',
    vehicles: 22,
    trainers: 15,
    bookings: 12
  },
  {
    id: '3',
    name: 'Rajesh Kumar',
    email: 'admin.ncr@skoda.com',
    location: 'NCR',
    status: 'active',
    joinDate: '2023-03-10',
    vehicles: 16,
    trainers: 10,
    bookings: 6
  },
  {
    id: '4',
    name: 'Ananya Sharma',
    email: 'admin.blr@skoda.com',
    location: 'BLR',
    status: 'active',
    joinDate: '2023-04-05',
    vehicles: 20,
    trainers: 14,
    bookings: 9
  }
];

export function SuperAdminDashboard() {
  const navigate = useNavigate();
  
  // Mock statistics
  const stats = {
    totalLocations: 4,
    totalAdmins: 4,
    totalUsers: 142,
    totalVehicles: 76,
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Location Management</h1>
          <p className="text-muted-foreground">
            Manage training centers and administrators
          </p>
        </div>
        <Button onClick={() => navigate('/super_admin/admins')} className="bg-gradient-primary hover:bg-primary-hover">
          <Shield className="h-4 w-4 mr-2" />
          Manage Admins
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Training Centers"
          value={stats.totalLocations}
          description="Active locations"
          icon={MapPin}
        />
        <StatCard
          title="Location Admins"
          value={stats.totalAdmins}
          description="Managing centers"
          icon={Shield}
        />
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          description="All system users"
          icon={Users}
        />
        <StatCard
          title="Total Vehicles"
          value={stats.totalVehicles}
          description="Fleet-wide"
          icon={Car}
        />
      </div>

      {/* Training Centers with Admins */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle>Training Centers & Administrators</CardTitle>
          <CardDescription>
            Location-wise admin assignments and statistics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Administrator</TableHead>
                <TableHead>Training Center</TableHead>
                <TableHead>Vehicles</TableHead>
                <TableHead>Trainers</TableHead>
                <TableHead>Active Bookings</TableHead>
                <TableHead>Status</TableHead>
                {/* <TableHead>Actions</TableHead> */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockAdmins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{getInitials(admin.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{admin.name}</div>
                        <div className="text-sm text-muted-foreground">{admin.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{getLocationName(admin.location as any)}</span>
                    </div>
                  </TableCell>
                  <TableCell>{admin.vehicles}</TableCell>
                  <TableCell>{admin.trainers}</TableCell>
                  <TableCell>{admin.bookings}</TableCell>
                  <TableCell>
                    <Badge className="bg-success text-success-foreground">Active</Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate('/super_admin/admins')}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

    
    </div>
  );
}