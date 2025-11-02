import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { StatCard } from '@/components/dashboard/StatCard';
import { Plus, Edit, Trash2, Shield, MapPin, Search, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { LOCATIONS, getLocationName } from '@/constants/locations';
import { LocationCode } from '@/types/auth';
import { format } from 'date-fns';

const STORAGE_KEY = 'app_users';

interface Admin {
  id: string;
  name: string;
  email: string;
  location: LocationCode;
  status: 'active' | 'inactive';
  joinDate: string;
  employeeId?: string;
  department?: string;
  role: 'admin';
}

// Default admins for first-time setup
const defaultAdmins: Admin[] = [
    {
      id: '1',
      name: 'John Administrator',
      email: 'admin@skoda.com',
      location: 'PTC',
      status: 'active',
      joinDate: '2023-01-15',
      employeeId: 'EMP001',
      department: 'Operations',
      role: 'admin'
    },
    {
      id: '2',
      name: 'Priya Admin',
      email: 'admin.vgtap@skoda.com',
      location: 'VGTAP',
      status: 'active',
      joinDate: '2023-02-20',
      employeeId: 'EMP002',
      department: 'Operations',
      role: 'admin'
    },
    {
      id: '3',
      name: 'Rajesh Kumar',
      email: 'admin.ncr@skoda.com',
      location: 'NCR',
      status: 'active',
      joinDate: '2023-03-10',
      employeeId: 'EMP003',
      department: 'Operations',
      role: 'admin'
    },
    {
      id: '4',
      name: 'Ananya Sharma',
      email: 'admin.blr@skoda.com',
      location: 'BLR',
      status: 'active',
      joinDate: '2023-04-05',
      employeeId: 'EMP004',
      department: 'Operations',
      role: 'admin'
    },
    // Additional admins for testing
    {
      id: '5',
      name: 'Suresh Patel',
      email: 'suresh.patel@skoda.com',
      location: 'PTC',
      status: 'active',
      joinDate: '2023-05-12',
      employeeId: 'EMP025',
      department: 'Operations',
      role: 'admin'
    },
    {
      id: '6',
      name: 'Neha Gupta',
      email: 'neha.gupta@skoda.com',
      location: 'NCR',
      status: 'active',
      joinDate: '2023-06-18',
      employeeId: 'EMP026',
      department: 'Operations',
      role: 'admin'
    }
];

// Get initial admins from localStorage or use default
const getInitialAdmins = (): Admin[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    let allAdmins: Admin[] = [];
    
    if (stored) {
      const users = JSON.parse(stored);
      // Filter for admin role users
      const storedAdmins = users
        .filter((u: any) => u.role === 'admin')
        .map((u: any) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          location: u.location || 'PTC',
          status: u.status === 'active' || u.status === 'inactive' ? u.status : 'active',
          joinDate: u.joinDate || format(new Date(), 'yyyy-MM-dd'),
          employeeId: u.employeeId || '',
          department: u.department || '',
          role: 'admin' as const
        }));
      
      if (storedAdmins.length > 0) {
        allAdmins = storedAdmins;
      }
    }
    
    // Always merge with default admins to ensure all default admins exist
    const mergedAdmins: Admin[] = [];
    const existingIds = new Set(allAdmins.map((a: Admin) => a.id));
    
    // Add existing admins first
    mergedAdmins.push(...allAdmins);
    
    // Add default admins that don't exist
    defaultAdmins.forEach(defaultAdmin => {
      if (!existingIds.has(defaultAdmin.id)) {
        mergedAdmins.push(defaultAdmin);
      }
    });
    
    // Save merged admins if we added any default admins
    if (mergedAdmins.length > allAdmins.length) {
      saveAdmins(mergedAdmins);
    }
    
    return mergedAdmins.length > 0 ? mergedAdmins : defaultAdmins;
  } catch (err) {
    console.error('Error loading admins from localStorage:', err);
    return defaultAdmins;
  }
};

// Save admins to localStorage (updates the users array)
const saveAdmins = (admins: Admin[]) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    let users = stored ? JSON.parse(stored) : [];
    
    // Update or add admin users
    admins.forEach(admin => {
      const existingIndex = users.findIndex((u: any) => u.id === admin.id);
      if (existingIndex >= 0) {
        users[existingIndex] = { ...users[existingIndex], ...admin };
      } else {
        users.push({
          ...admin,
          lastLogin: undefined,
          avatar: undefined
        });
      }
    });
    
    // Remove admins that are no longer in the list
    const adminIds = admins.map(a => a.id);
    users = users.filter((u: any) => u.role !== 'admin' || adminIds.includes(u.id));
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Error saving admins to localStorage:', err);
  }
};

export function AdminManagement() {
  const { toast } = useToast();
  
  // Load admins from localStorage
  const [admins, setAdmins] = useState<Admin[]>(() => {
    return getInitialAdmins();
  });
  
  // Ensure all admins are loaded on mount (sync with localStorage)
  useEffect(() => {
    // Force reload all admins from localStorage on mount
    const loadedAdmins = getInitialAdmins();
    // Always update to ensure we have all admins
    setAdmins(loadedAdmins);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [adminForm, setAdminForm] = useState<Partial<Admin>>({
    name: '',
    email: '',
    location: 'PTC',
    status: 'active',
    employeeId: '',
    department: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Save admins to localStorage whenever they change
  useEffect(() => {
    saveAdmins(admins);
  }, [admins]);
  
  // Filter admins based on search and filters
  const filteredAdmins = useMemo(() => {
    return admins.filter(admin => {
      const matchesSearch = admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (admin.employeeId && admin.employeeId.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesLocation = locationFilter === 'all' || admin.location === locationFilter;
      const matchesStatus = statusFilter === 'all' || admin.status === statusFilter;
      
      return matchesSearch && matchesLocation && matchesStatus;
    });
  }, [admins, searchTerm, locationFilter, statusFilter]);
  
  // Calculate statistics
  const stats = useMemo(() => {
    return {
      total: admins.length,
      active: admins.filter(a => a.status === 'active').length,
      inactive: admins.filter(a => a.status === 'inactive').length,
      byLocation: LOCATIONS.reduce((acc, loc) => {
        acc[loc.code] = admins.filter(a => a.location === loc.code).length;
        return acc;
      }, {} as Record<string, number>)
    };
  }, [admins]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(adminForm.email || '')) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      });
      return;
    }
    
    // Check for duplicate email (excluding current admin if editing)
    const emailExists = admins.some(admin => 
      admin.email.toLowerCase() === (adminForm.email || '').toLowerCase() &&
      (!editingAdmin || admin.id !== editingAdmin.id)
    );
    
    if (emailExists) {
      toast({
        title: 'Validation Error',
        description: 'An admin with this email already exists',
        variant: 'destructive',
      });
      return;
    }
    
    if (editingAdmin) {
      setAdmins(prev => prev.map(admin => 
        admin.id === editingAdmin.id ? { ...admin, ...adminForm } as Admin : admin
      ));
      toast({
        title: 'Success',
        description: 'Admin updated successfully',
      });
    } else {
      const newAdmin: Admin = {
        ...adminForm,
        id: Date.now().toString(),
        joinDate: format(new Date(), 'yyyy-MM-dd'),
        role: 'admin'
      } as Admin;
      setAdmins(prev => [...prev, newAdmin]);
      toast({
        title: 'Success',
        description: 'Admin created successfully',
      });
    }
    
    resetForm();
  };

  const handleEdit = (admin: Admin) => {
    setEditingAdmin(admin);
    setAdminForm(admin);
    setIsDialogOpen(true);
  };

  const handleDelete = (adminId: string) => {
    if (confirm('Are you sure you want to remove this admin? This action cannot be undone.')) {
      setAdmins(prev => {
        const updated = prev.filter(admin => admin.id !== adminId);
        // Update localStorage to remove the admin
        saveAdmins(updated);
        return updated;
      });
      toast({
        title: 'Success',
        description: 'Admin removed successfully',
      });
    }
  };

  const resetForm = () => {
    setAdminForm({ name: '', email: '', location: 'PTC', status: 'active', employeeId: '', department: '' });
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
                <Label htmlFor="employeeId">Employee ID</Label>
                <Input
                  id="employeeId"
                  value={adminForm.employeeId || ''}
                  onChange={(e) => setAdminForm(prev => ({ ...prev, employeeId: e.target.value }))}
                  placeholder="EMP001"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={adminForm.department || ''}
                  onChange={(e) => setAdminForm(prev => ({ ...prev, department: e.target.value }))}
                  placeholder="Operations"
                />
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

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Admins"
          value={stats.total}
          description="All administrators"
          icon={Users}
        />
        <StatCard
          title="Active Admins"
          value={stats.active}
          description="Currently active"
          icon={Shield}
        />
        <StatCard
          title="Inactive Admins"
          value={stats.inactive}
          description="Inactive accounts"
          icon={Users}
        />
        <StatCard
          title="Locations"
          value={LOCATIONS.filter(loc => stats.byLocation[loc.code] > 0).length}
          description="With administrators"
          icon={MapPin}
        />
      </div>

      {/* Search and Filters */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or employee ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {LOCATIONS.map(loc => (
                  <SelectItem key={loc.code} value={loc.code}>
                    {loc.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="card-elevated">
        <CardHeader>
          <CardTitle>Location Administrators</CardTitle>
          <CardDescription>
            {filteredAdmins.length} of {admins.length} admin{admins.length !== 1 ? 's' : ''} across all locations
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
              {filteredAdmins.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No admins found matching your criteria</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAdmins.map((admin) => (
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
                  <TableCell>
                    {admin.joinDate ? format(new Date(admin.joinDate), 'MMM dd, yyyy') : 'N/A'}
                  </TableCell>
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
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}