import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StatCard } from '@/components/dashboard/StatCard';
import { Plus, Edit, Trash2, Users as UsersIcon, Search, Filter, UserCheck, UserX, Shield, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { LOCATIONS, getLocationName } from '@/constants/locations';
import { LocationCode } from '@/types/auth';
import { format } from 'date-fns';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'trainer' | 'security';
  status: 'active' | 'inactive';
  department: string;
  location?: LocationCode | string;
  employeeId?: string;
  joinDate: string;
  lastLogin: string;
  avatar?: string;
}

const STORAGE_KEY = 'app_users';

// Helper to map location code to name
const getLocationNameFromCode = (code?: LocationCode | string): string => {
  if (!code || code === 'ALL') return 'All Locations';
  const location = LOCATIONS.find(l => l.code === code || l.name === code);
  return location?.name || code || 'N/A';
};

// Get all users from localStorage or use empty array (will be populated by defaults from Users.tsx)
const getAllUsers = (): User[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const users = JSON.parse(stored);
      // Convert any suspended users to inactive and remove suspended status
      return users.map((user: any) => ({
        ...user,
        status: user.status === 'suspended' ? 'inactive' : (user.status === 'active' || user.status === 'inactive' ? user.status : 'inactive'),
        location: user.location || 'PTC'
      }));
    }
  } catch (err) {
    console.error('Error loading users from localStorage:', err);
  }
  return [];
};

// Save users to localStorage
const saveUsers = (users: User[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Error saving users to localStorage:', err);
  }
};

const initialUserForm: Omit<User, 'id' | 'joinDate' | 'lastLogin'> = {
  name: '',
  email: '',
  role: 'trainer',
  status: 'active',
  department: '',
  location: 'PTC',
  employeeId: '',
  avatar: undefined
};

export function AllUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState<Omit<User, 'id' | 'joinDate' | 'lastLogin'>>(initialUserForm);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [saving, setSaving] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Load users from localStorage on mount
  useEffect(() => {
    setLoading(true);
    try {
      const allUsers = getAllUsers();
      setUsers(allUsers);
    } catch (err) {
      console.error('Error loading users:', err);
      setUsers([]);
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  }, []);

  // Save to localStorage whenever users change (but avoid infinite loops)
  useEffect(() => {
    if (isInitialLoad) {
      return;
    }

    if (!loading && users.length >= 0) {
      // Check if any user has suspended status (from old localStorage data)
      // Type assertion needed because old data might have 'suspended' even though type doesn't include it
      const hasSuspended = users.some(user => (user as any).status === 'suspended' || user.status === ('suspended' as any));
      
      if (hasSuspended) {
        // Convert suspended to inactive and update state
        const cleanedUsers = users.map(user => ({
          ...user,
          status: ((user as any).status === 'suspended' ? 'inactive' : user.status) as 'active' | 'inactive'
        }));
        setUsers(cleanedUsers);
        saveUsers(cleanedUsers);
      } else {
        saveUsers(users);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users]);

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.employeeId && user.employeeId.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
      const matchesLocation = locationFilter === 'all' || user.location === locationFilter;
      
      return matchesSearch && matchesRole && matchesStatus && matchesLocation;
    });
  }, [users, searchTerm, roleFilter, statusFilter, locationFilter]);

  // Calculate dynamic stats
  const stats = useMemo(() => {
    return {
      totalUsers: users.length,
      activeUsers: users.filter(u => u.status === 'active').length,
      trainers: users.filter(u => u.role === 'trainer').length,
      admins: users.filter(u => u.role === 'admin').length,
      security: users.filter(u => u.role === 'security').length,
      inactiveUsers: users.filter(u => u.status === 'inactive').length,
    };
  }, [users]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (editingUser) {
        const updatedUser = { ...editingUser, ...userForm };
        setUsers(prev => prev.map(user => 
          user.id === editingUser.id ? updatedUser : user
        ));
        toast.success('User updated successfully');
      } else {
        // Check if email already exists
        const emailExists = users.some(u => u.email.toLowerCase() === userForm.email.toLowerCase());
        
        if (emailExists) {
          toast.error('A user with this email already exists');
          setSaving(false);
          return;
        }
        
        const newUser: User = {
          ...userForm,
          id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          joinDate: format(new Date(), 'yyyy-MM-dd'),
          lastLogin: 'Never'
        };
        setUsers(prev => [...prev, newUser]);
        toast.success('User created successfully');
      }
      resetForm();
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error('Failed to save user');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    const { id, joinDate, lastLogin, ...formData } = user;
    setUserForm(formData);
    setIsDialogOpen(true);
  };

  const handleDelete = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      setUsers(prev => {
        const updated = prev.filter(user => user.id !== userId);
        saveUsers(updated);
        return updated;
      });
      toast.success('User deleted successfully');
    }
  };

  const handleStatusChange = (userId: string, newStatus: User['status']) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, status: newStatus, lastLogin: user.status === 'active' && newStatus === 'inactive' ? format(new Date(), 'yyyy-MM-dd HH:mm') : user.lastLogin } 
        : user
    ));
    toast.success(`User status updated to ${newStatus}`);
  };

  const resetForm = () => {
    setUserForm(initialUserForm);
    setEditingUser(null);
    setIsDialogOpen(false);
  };

  const getStatusBadge = (status: User['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-600 text-white">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-600 text-white">Inactive</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: User['role']) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-primary text-primary-foreground">Admin</Badge>;
      case 'trainer':
        return <Badge variant="outline">Trainer</Badge>;
      case 'security':
        return <Badge className="bg-warning text-warning-foreground">Security</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold">User Management</h1>
            <Badge variant="outline" className="flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-200">
              <MapPin className="h-3 w-3" />
              All Locations (Global Access)
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Manage all system users and their permissions across all locations
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()} className="bg-gradient-primary hover:bg-primary-hover">
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingUser ? 'Edit User' : 'Add New User'}
              </DialogTitle>
              <DialogDescription>
                {editingUser ? 'Update user information and permissions' : 'Create a new system user account'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={userForm.name}
                    onChange={(e) => setUserForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter full name"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={userForm.email}
                    onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="user@skoda.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="employeeId">Employee ID</Label>
                <Input
                  id="employeeId"
                  value={userForm.employeeId || ''}
                  onChange={(e) => setUserForm(prev => ({ ...prev, employeeId: e.target.value.toUpperCase() }))}
                  placeholder="e.g., EMP001"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={userForm.role}
                    onValueChange={(value: User['role']) => 
                      setUserForm(prev => ({ ...prev, role: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trainer">Trainer</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={userForm.status}
                    onValueChange={(value: User['status']) => 
                      setUserForm(prev => ({ ...prev, status: value }))
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
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={userForm.department}
                    onChange={(e) => setUserForm(prev => ({ ...prev, department: e.target.value }))}
                    placeholder="Enter department"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Academy Location</Label>
                  <Select
                    value={userForm.location}
                    onValueChange={(value) => 
                      setUserForm(prev => ({ ...prev, location: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LOCATIONS.map(loc => (
                        <SelectItem key={loc.code} value={loc.code}>
                          {loc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving} className="bg-gradient-primary hover:bg-primary-hover">
                  {saving ? 'Saving...' : editingUser ? 'Update User' : 'Create User'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* User Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          description="All registered users"
          icon={UsersIcon}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Active Users"
          value={stats.activeUsers}
          description="Currently active"
          icon={UserCheck}
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Trainers"
          value={stats.trainers}
          description="Training staff"
          icon={UsersIcon}
        />
        <StatCard
          title="Administrators"
          value={stats.admins}
          description="Admin users"
          icon={Shield}
        />
      </div>

      {/* Additional Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <StatCard
          title="Security"
          value={stats.security}
          description="Security personnel"
          icon={Shield}
        />
        <StatCard
          title="Inactive Users"
          value={stats.inactiveUsers}
          description="Currently inactive"
          icon={UserX}
        />
      </div>

      {/* Filters and Search */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filter & Search Users</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, department, or employee ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {LOCATIONS.map(loc => (
                  <SelectItem key={loc.code} value={loc.code}>
                    {loc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="trainer">Trainer</SelectItem>
                <SelectItem value="security">Security</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="All Status" />
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

      {/* Users Table */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle>System Users</CardTitle>
          <CardDescription>
            {loading ? 'Loading users...' : `Showing ${filteredUsers.length} of ${users.length} users`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading users...</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <p className="text-muted-foreground">No users found matching your criteria.</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                          {user.employeeId && (
                            <div className="text-xs text-muted-foreground">ID: {user.employeeId}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {user.location ? getLocationNameFromCode(user.location) : 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.department}</TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell>{format(new Date(user.joinDate), 'MMM dd, yyyy')}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {user.lastLogin === 'Never' ? 'Never' : format(new Date(user.lastLogin), 'MMM dd, yyyy HH:mm')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStatusChange(user.id, user.status === 'active' ? 'inactive' : 'active')}
                        >
                          {user.status === 'active' ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(user.id)}
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}