import { useState } from 'react';
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
import { Plus, Edit, Trash2, Users as UsersIcon, Search, Filter, UserCheck, UserX, Shield } from 'lucide-react';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'trainer' | 'security';
  status: 'active' | 'inactive' | 'suspended';
  department: string;
  joinDate: string;
  lastLogin: string;
  avatar?: string;
}

const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@company.com',
    role: 'admin',
    status: 'active',
    department: 'Administration',
    joinDate: '2023-01-15',
    lastLogin: '2024-01-15 09:30',
    avatar: undefined
  },
  {
    id: '2',
    name: 'Sarah Thompson',
    email: 'sarah.thompson@company.com',
    role: 'trainer',
    status: 'active',
    department: 'Training',
    joinDate: '2023-03-20',
    lastLogin: '2024-01-15 14:22',
    avatar: undefined
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike.johnson@company.com',
    role: 'trainer',
    status: 'active',
    department: 'Training',
    joinDate: '2023-02-10',
    lastLogin: '2024-01-14 16:45',
    avatar: undefined
  },
  {
    id: '4',
    name: 'Emma Wilson',
    email: 'emma.wilson@company.com',
    role: 'trainer',
    status: 'inactive',
    department: 'Training',
    joinDate: '2023-06-01',
    lastLogin: '2024-01-10 11:15',
    avatar: undefined
  },
  {
    id: '5',
    name: 'James Brown',
    email: 'james.brown@company.com',
    role: 'security',
    status: 'active',
    department: 'Security',
    joinDate: '2023-01-30',
    lastLogin: '2024-01-15 08:00',
    avatar: undefined
  },
  {
    id: '6',
    name: 'Lisa Davis',
    email: 'lisa.davis@company.com',
    role: 'security',
    status: 'active',
    department: 'Security',
    joinDate: '2023-04-15',
    lastLogin: '2024-01-15 07:45',
    avatar: undefined
  }
];

const initialUserForm: Omit<User, 'id' | 'joinDate' | 'lastLogin'> = {
  name: '',
  email: '',
  role: 'trainer',
  status: 'active',
  department: '',
  avatar: undefined
};

export function Users() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState<Omit<User, 'id' | 'joinDate' | 'lastLogin'>>(initialUserForm);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (editingUser) {
        setUsers(prev => prev.map(user => 
          user.id === editingUser.id 
            ? { ...user, ...userForm }
            : user
        ));
        toast.success('User updated successfully');
      } else {
        const newUser: User = {
          ...userForm,
          id: Date.now().toString(),
          joinDate: new Date().toISOString().split('T')[0],
          lastLogin: 'Never'
        };
        setUsers(prev => [...prev, newUser]);
        toast.success('User created successfully');
      }
      resetForm();
    } catch (error) {
      toast.error('Failed to save user');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setUserForm(user);
    setIsDialogOpen(true);
  };

  const handleDelete = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      setUsers(prev => prev.filter(user => user.id !== userId));
      toast.success('User deleted successfully');
    }
  };

  const handleStatusChange = (userId: string, newStatus: User['status']) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, status: newStatus } : user
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
        return <Badge className="bg-success text-success-foreground">Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      case 'suspended':
        return <Badge variant="destructive">Suspended</Badge>;
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
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Manage system users and their permissions
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
                    placeholder="user@company.com"
                    required
                  />
                </div>
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
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
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
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="bg-gradient-primary hover:bg-primary-hover">
                  {loading ? 'Saving...' : editingUser ? 'Update User' : 'Create User'}
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
          value={users.length}
          description="All registered users"
          icon={UsersIcon}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Active Users"
          value={users.filter(u => u.status === 'active').length}
          description="Currently active"
          icon={UserCheck}
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Trainers"
          value={users.filter(u => u.role === 'trainer').length}
          description="Training staff"
          icon={UsersIcon}
        />
        <StatCard
          title="Administrators"
          value={users.filter(u => u.role === 'admin').length}
          description="Admin users"
          icon={Shield}
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
                  placeholder="Search by name, email, or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
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
                <SelectItem value="suspended">Suspended</SelectItem>
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
            Showing {filteredUsers.length} of {users.length} users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
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
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{user.department}</TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell>{user.joinDate}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{user.lastLogin}</TableCell>
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
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}