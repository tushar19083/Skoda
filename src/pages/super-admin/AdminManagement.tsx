import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Plus, Edit, Trash2, Shield, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { LOCATIONS, getLocationName } from '@/constants/locations';
import { LocationCode } from '@/types/auth';

interface Admin {
  id: string;
  name: string;
  email: string;
  location: LocationCode;
  status: 'active' | 'inactive';
  joinDate: string;
}

const mockAdmins: Admin[] = [
  {
    id: '1',
    name: 'John Administrator',
    email: 'admin@skoda.com',
    location: 'PTC',
    status: 'active',
    joinDate: '2023-01-15'
  },
  {
    id: '2',
    name: 'Priya Admin',
    email: 'admin.vgtap@skoda.com',
    location: 'VGTAP',
    status: 'active',
    joinDate: '2023-02-20'
  },
  {
    id: '3',
    name: 'Rajesh Kumar',
    email: 'admin.ncr@skoda.com',
    location: 'NCR',
    status: 'active',
    joinDate: '2023-03-10'
  },
  {
    id: '4',
    name: 'Ananya Sharma',
    email: 'admin.blr@skoda.com',
    location: 'BLR',
    status: 'active',
    joinDate: '2023-04-05'
  }
];

export function AdminManagement() {
  const [admins, setAdmins] = useState<Admin[]>(mockAdmins);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [adminForm, setAdminForm] = useState<Partial<Admin>>({
    name: '',
    email: '',
    location: 'PTC',
    status: 'active'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingAdmin) {
      setAdmins(prev => prev.map(admin => 
        admin.id === editingAdmin.id ? { ...admin, ...adminForm } as Admin : admin
      ));
      toast.success('Admin updated successfully');
    } else {
      const newAdmin: Admin = {
        ...adminForm,
        id: Date.now().toString(),
        joinDate: new Date().toISOString().split('T')[0]
      } as Admin;
      setAdmins(prev => [...prev, newAdmin]);
      toast.success('Admin created successfully');
    }
    
    resetForm();
  };

  const handleEdit = (admin: Admin) => {
    setEditingAdmin(admin);
    setAdminForm(admin);
    setIsDialogOpen(true);
  };

  const handleDelete = (adminId: string) => {
    if (confirm('Are you sure you want to remove this admin?')) {
      setAdmins(prev => prev.filter(admin => admin.id !== adminId));
      toast.success('Admin removed successfully');
    }
  };

  const resetForm = () => {
    setAdminForm({ name: '', email: '', location: 'PTC', status: 'active' });
    setEditingAdmin(null);
    setIsDialogOpen(false);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Management</h1>
          <p className="text-muted-foreground">
            Manage location administrators
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()} className="bg-gradient-primary hover:bg-primary-hover">
              <Plus className="h-4 w-4 mr-2" />
              Add Admin
            </Button>
          </DialogTrigger>
          
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingAdmin ? 'Edit Admin' : 'Add New Admin'}
              </DialogTitle>
              <DialogDescription>
                {editingAdmin ? 'Update admin information' : 'Create a new location administrator'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={adminForm.name}
                  onChange={(e) => setAdminForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter full name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={adminForm.email}
                  onChange={(e) => setAdminForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="admin@skoda.com"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Select
                  value={adminForm.location}
                  onValueChange={(value: LocationCode) => 
                    setAdminForm(prev => ({ ...prev, location: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LOCATIONS.map(loc => (
                      <SelectItem key={loc.code} value={loc.code}>
                        {loc.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={adminForm.status}
                  onValueChange={(value: 'active' | 'inactive') => 
                    setAdminForm(prev => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-gradient-primary hover:bg-primary-hover">
                  {editingAdmin ? 'Update Admin' : 'Create Admin'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="card-elevated">
        <CardHeader>
          <CardTitle>Location Administrators</CardTitle>
          <CardDescription>
            {admins.length} admin{admins.length !== 1 ? 's' : ''} across all locations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Admin</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.map((admin) => (
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
                      <span>{getLocationName(admin.location)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {admin.status === 'active' ? (
                      <Badge className="bg-success text-success-foreground">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell>{admin.joinDate}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(admin)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(admin.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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