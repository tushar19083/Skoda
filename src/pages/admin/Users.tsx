import { useState, useEffect } from 'react';
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
import { useAuth } from '@/contexts/AuthContext';
import { useLocationFilter } from '@/hooks/useLocationFilter';
import { getLocationName, LOCATIONS } from '@/constants/locations';
import { format } from 'date-fns';
import { LocationCode } from '@/types/auth';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'trainer' | 'security';
  status: 'active' | 'inactive';
  location?: LocationCode;
  department: string;
  employeeId?: string;
  joinDate: string;
  lastLogin: string;
  avatar?: string;
}

const STORAGE_KEY = 'app_users';

// Helper to map location code to name
const getLocationNameFromCode = (code?: LocationCode): string => {
  if (!code || code === 'ALL') return 'All Locations';
  const location = LOCATIONS.find(l => l.code === code || l.name === code);
  return location?.name || code;
};

// Default users for initialization
const getDefaultUsers = (adminLocation: LocationCode): User[] => {
  const adminLoc = adminLocation || 'PTC';
  return [
    {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@skoda.com',
      role: 'admin',
      status: 'active',
      location: adminLoc,
      department: 'Fleet Management',
      employeeId: 'EMP001',
      joinDate: '2023-01-15',
      lastLogin: format(new Date(), 'yyyy-MM-dd HH:mm'),
      avatar: undefined
    },
    {
      id: '2',
      name: 'Sarah Trainer',
      email: 'sarah.trainer@skoda.com',
      role: 'trainer',
      status: 'active',
      location: adminLoc,
      department: 'Training Center',
      employeeId: 'EMP005',
      joinDate: '2023-03-20',
      lastLogin: format(new Date(Date.now() - 3600000), 'yyyy-MM-dd HH:mm'), // 1 hour ago
      avatar: undefined
    },
    {
      id: '3',
      name: 'Mike Johnson',
      email: 'mike.johnson@skoda.com',
      role: 'trainer',
      status: 'active',
      location: adminLoc,
      department: 'Training Center',
      employeeId: 'EMP007',
      joinDate: '2023-02-10',
      lastLogin: format(new Date(Date.now() - 7200000), 'yyyy-MM-dd HH:mm'), // 2 hours ago
      avatar: undefined
    },
    {
      id: '4',
      name: 'Emma Wilson',
      email: 'emma.wilson@skoda.com',
      role: 'trainer',
      status: 'active',
      location: adminLoc,
      department: 'Training Center',
      employeeId: 'EMP009',
      joinDate: '2023-06-01',
      lastLogin: format(new Date(Date.now() - 86400000), 'yyyy-MM-dd HH:mm'), // 1 day ago
      avatar: undefined
    },
    {
      id: '5',
      name: 'James Brown',
      email: 'james.brown@skoda.com',
      role: 'security',
      status: 'active',
      location: adminLoc,
      department: 'Security',
      employeeId: 'EMP010',
      joinDate: '2023-01-30',
      lastLogin: format(new Date(Date.now() - 1800000), 'yyyy-MM-dd HH:mm'), // 30 min ago
      avatar: undefined
    },
    {
      id: '6',
      name: 'Lisa Davis',
      email: 'lisa.davis@skoda.com',
      role: 'security',
      status: 'active',
      location: adminLoc,
      department: 'Security',
      employeeId: 'EMP011',
      joinDate: '2023-04-15',
      lastLogin: format(new Date(Date.now() - 900000), 'yyyy-MM-dd HH:mm'), // 15 min ago
      avatar: undefined
    },
    {
      id: '7',
      name: 'Robert Taylor',
      email: 'robert.taylor@skoda.com',
      role: 'trainer',
      status: 'inactive',
      location: adminLoc,
      department: 'Training Center',
      employeeId: 'EMP012',
      joinDate: '2023-05-20',
      lastLogin: format(new Date(Date.now() - 604800000), 'yyyy-MM-dd HH:mm'), // 7 days ago
      avatar: undefined
    },
    {
      id: '8',
      name: 'Priya Patel',
      email: 'priya.patel@skoda.com',
      role: 'trainer',
      status: 'active',
      location: adminLoc,
      department: 'Training Center',
      employeeId: 'EMP013',
      joinDate: '2023-07-10',
      lastLogin: format(new Date(Date.now() - 3600000), 'yyyy-MM-dd HH:mm'), // 1 hour ago
      avatar: undefined
    },
    {
      id: '9',
      name: 'David Kumar',
      email: 'david.kumar@skoda.com',
      role: 'security',
      status: 'inactive',
      location: adminLoc,
      department: 'Security',
      employeeId: 'EMP014',
      joinDate: '2023-08-05',
      lastLogin: format(new Date(Date.now() - 259200000), 'yyyy-MM-dd HH:mm'), // 3 days ago
      avatar: undefined
    },
    {
      id: '10',
      name: 'Anita Singh',
      email: 'anita.singh@skoda.com',
      role: 'trainer',
      status: 'inactive',
      location: adminLoc,
      department: 'Training Center',
      employeeId: 'EMP015',
      joinDate: '2023-09-15',
      lastLogin: format(new Date(Date.now() - 172800000), 'yyyy-MM-dd HH:mm'), // 2 days ago
      avatar: undefined
    }
  ];
};

// Default users for other locations
const getDefaultOtherLocationUsers = (): User[] => {
  return [
    // NCR Location Users
    {
      id: '11',
      name: 'Rahul Verma',
      email: 'rahul.verma@skoda.com',
      role: 'trainer',
      status: 'active',
      location: 'NCR',
      department: 'Training Center',
      employeeId: 'EMP016',
      joinDate: '2023-08-20',
      lastLogin: format(new Date(Date.now() - 7200000), 'yyyy-MM-dd HH:mm'),
      avatar: undefined
    },
    {
      id: '12',
      name: 'Sneha Sharma',
      email: 'sneha.sharma@skoda.com',
      role: 'trainer',
      status: 'active',
      location: 'NCR',
      department: 'Training Center',
      employeeId: 'EMP017',
      joinDate: '2023-07-15',
      lastLogin: format(new Date(Date.now() - 5400000), 'yyyy-MM-dd HH:mm'),
      avatar: undefined
    },
    {
      id: '13',
      name: 'Vikram Mehta',
      email: 'vikram.mehta@skoda.com',
      role: 'security',
      status: 'active',
      location: 'NCR',
      department: 'Security',
      employeeId: 'EMP018',
      joinDate: '2023-06-10',
      lastLogin: format(new Date(Date.now() - 3600000), 'yyyy-MM-dd HH:mm'),
      avatar: undefined
    },
    // Bangalore Location Users
    {
      id: '14',
      name: 'Kavya Reddy',
      email: 'kavya.reddy@skoda.com',
      role: 'trainer',
      status: 'active',
      location: 'BLR',
      department: 'Training Center',
      employeeId: 'EMP019',
      joinDate: '2023-05-25',
      lastLogin: format(new Date(Date.now() - 6300000), 'yyyy-MM-dd HH:mm'),
      avatar: undefined
    },
    {
      id: '15',
      name: 'Arjun Nair',
      email: 'arjun.nair@skoda.com',
      role: 'trainer',
      status: 'active',
      location: 'BLR',
      department: 'Training Center',
      employeeId: 'EMP020',
      joinDate: '2023-04-18',
      lastLogin: format(new Date(Date.now() - 4500000), 'yyyy-MM-dd HH:mm'),
      avatar: undefined
    },
    {
      id: '16',
      name: 'Preeti Iyer',
      email: 'preeti.iyer@skoda.com',
      role: 'security',
      status: 'active',
      location: 'BLR',
      department: 'Security',
      employeeId: 'EMP021',
      joinDate: '2023-03-12',
      lastLogin: format(new Date(Date.now() - 2700000), 'yyyy-MM-dd HH:mm'),
      avatar: undefined
    },
    // VGTAP Location Users
    {
      id: '17',
      name: 'Amit Desai',
      email: 'amit.desai@skoda.com',
      role: 'trainer',
      status: 'active',
      location: 'VGTAP',
      department: 'Training Center',
      employeeId: 'EMP022',
      joinDate: '2023-02-28',
      lastLogin: format(new Date(Date.now() - 8100000), 'yyyy-MM-dd HH:mm'),
      avatar: undefined
    },
    {
      id: '18',
      name: 'Meera Joshi',
      email: 'meera.joshi@skoda.com',
      role: 'trainer',
      status: 'active',
      location: 'VGTAP',
      department: 'Training Center',
      employeeId: 'EMP023',
      joinDate: '2023-01-22',
      lastLogin: format(new Date(Date.now() - 6900000), 'yyyy-MM-dd HH:mm'),
      avatar: undefined
    },
    {
      id: '19',
      name: 'Rohan Pawar',
      email: 'rohan.pawar@skoda.com',
      role: 'security',
      status: 'active',
      location: 'VGTAP',
      department: 'Security',
      employeeId: 'EMP024',
      joinDate: '2022-12-15',
      lastLogin: format(new Date(Date.now() - 4200000), 'yyyy-MM-dd HH:mm'),
      avatar: undefined
    },
  ];
};

// Get initial users from localStorage or use dummy data
const getInitialUsers = (adminLocation?: LocationCode): User[] => {
  const adminLoc = adminLocation || 'PTC';
  let storedUsers: User[] = [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const users = JSON.parse(stored);
      // Convert any suspended users to inactive and remove suspended status
      storedUsers = users.map((user: any) => ({
        ...user,
        status: user.status === 'suspended' ? 'inactive' : (user.status === 'active' || user.status === 'inactive' ? user.status : 'inactive'),
        location: user.location || adminLoc
      }));
    }
  } catch (err) {
    console.error('Error loading users from localStorage:', err);
  }
  
  // Get default users
  const defaultUsers = getDefaultUsers(adminLoc);
  const defaultOtherLocationUsers = getDefaultOtherLocationUsers();
  const allDefaultUsers = [...defaultUsers, ...defaultOtherLocationUsers];
  
  // Merge stored users with default users
  const mergedUsers: User[] = [];
  const existingUserIds = new Set(storedUsers.map(u => u.id));
  
  // Add stored users first (these take precedence)
  mergedUsers.push(...storedUsers);
  
  // Add default users that don't exist in stored data
  allDefaultUsers.forEach(defaultUser => {
    if (!existingUserIds.has(defaultUser.id)) {
      mergedUsers.push(defaultUser);
    }
  });
  
  // Save merged users if we added any default users or if localStorage was empty
  if (mergedUsers.length > storedUsers.length || storedUsers.length === 0) {
    saveUsers(mergedUsers);
  }
  
  return mergedUsers;
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
  location: 'PTC',
  department: '',
  employeeId: '',
  avatar: undefined
};

export function Users() {
  const { user: currentUser } = useAuth();
  const { filterByLocation } = useLocationFilter();
  
  // Check if user is super admin (has global access)
  const isSuperAdmin = currentUser?.role === 'super_admin';
  
  // Get admin's location (for non-super admins)
  const adminLocation = currentUser?.location || 'PTC';
  
  // Load users from localStorage
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Load and filter users on mount and when admin location changes
  useEffect(() => {
    // Wait for currentUser to be loaded
    if (!currentUser) {
      setLoading(true);
      return;
    }

    setLoading(true);
    try {
      // For super admin, get all users from all locations
      // For regular admin, use their location
      const locationForDefaultUsers = isSuperAdmin ? 'PTC' : adminLocation;
      const allUsers = getInitialUsers(locationForDefaultUsers);
      
      // Filter by admin's location (filterByLocation already handles super_admin by returning all)
      const locationFiltered = filterByLocation(allUsers.map(u => ({
        ...u,
        location: u.location || adminLocation
      }))) as User[];
      
      setUsers(locationFiltered);
    } catch (err) {
      console.error('Error loading users:', err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, adminLocation, isSuperAdmin, filterByLocation]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState<Omit<User, 'id' | 'joinDate' | 'lastLogin'>>({
    ...initialUserForm,
    location: isSuperAdmin ? 'PTC' : adminLocation
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [saving, setSaving] = useState(false);

  // Save to localStorage whenever users change (but avoid infinite loops)
  // This effect only runs when users are modified (not during initial load)
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  useEffect(() => {
    if (isInitialLoad) {
      setIsInitialLoad(false);
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
        // Save all users to localStorage (including those from other locations for consistency)
        try {
          // Load all users from localStorage first
          const stored = localStorage.getItem(STORAGE_KEY);
          let allStoredUsers: User[] = stored ? JSON.parse(stored) : [];
          
          // Update or add users from current filtered list
          const updatedAllUsers = allStoredUsers.map(storedUser => {
            const updatedUser = users.find(u => u.id === storedUser.id);
            return updatedUser || storedUser;
          });
          
          // Add any new users that don't exist in stored data
          users.forEach(user => {
            if (!updatedAllUsers.find(u => u.id === user.id)) {
              updatedAllUsers.push(user);
            }
          });
          
          // Also ensure we preserve users from other locations (for super admin view)
          // Don't remove users that are not in the current filtered list
          allStoredUsers.forEach(storedUser => {
            if (!updatedAllUsers.find(u => u.id === storedUser.id)) {
              // Only keep if it's from a different location (for super admin) or if it's being filtered
              const isInFilteredList = users.find(u => u.id === storedUser.id);
              if (!isInFilteredList) {
                // Keep the stored user if we're not filtering by that location
                // or if we're super admin
                if (isSuperAdmin || storedUser.location === adminLocation) {
                  updatedAllUsers.push(storedUser);
                }
              }
            }
          });
          
          saveUsers(updatedAllUsers);
        } catch (err) {
          console.error('Error saving users:', err);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.employeeId && user.employeeId.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesLocation = !isSuperAdmin || locationFilter === 'all' || user.location === locationFilter;
    
    return matchesSearch && matchesRole && matchesStatus && matchesLocation;
  });

  // Calculate dynamic stats
  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'active').length,
    trainers: users.filter(u => u.role === 'trainer').length,
    admins: users.filter(u => u.role === 'admin').length,
    security: users.filter(u => u.role === 'security').length,
    inactiveUsers: users.filter(u => u.status === 'inactive').length,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (editingUser) {
        const updatedUser = { 
          ...editingUser, 
          ...userForm, 
          location: isSuperAdmin ? (userForm.location || adminLocation) : adminLocation
        };
        setUsers(prev => prev.map(user => 
          user.id === editingUser.id ? updatedUser : user
        ));
        toast.success('User updated successfully');
      } else {
        // Check if email already exists (check all users across all locations)
        try {
          const stored = localStorage.getItem(STORAGE_KEY);
          const allUsers: User[] = stored ? JSON.parse(stored) : [];
          const emailExists = allUsers.some(u => u.email.toLowerCase() === userForm.email.toLowerCase());
          
          if (emailExists) {
            toast.error('A user with this email already exists');
            setSaving(false);
            return;
          }
        } catch (err) {
          console.error('Error checking email:', err);
        }
        
        const newUser: User = {
          ...userForm,
          id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          location: isSuperAdmin ? (userForm.location || adminLocation) : adminLocation,
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
        // Also update localStorage
        try {
          const locationForDelete = isSuperAdmin ? 'PTC' : adminLocation;
          const allUsers = getInitialUsers(locationForDelete);
          const filteredAllUsers = allUsers.filter(u => u.id !== userId);
          saveUsers(filteredAllUsers);
        } catch (err) {
          console.error('Error deleting user from localStorage:', err);
        }
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
    setUserForm({
      ...initialUserForm,
      location: isSuperAdmin ? 'PTC' : adminLocation
    });
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
        return <Badge className="bg-blue-600 text-white">Admin</Badge>;
      case 'trainer':
        return <Badge className="bg-purple-600 text-white">Trainer</Badge>;
      case 'security':
        return <Badge className="bg-orange-600 text-white">Security</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const userLocationName = isSuperAdmin 
    ? 'All Locations' 
    : (currentUser?.location ? getLocationName(currentUser.location) : 'Pune Training Center');

  return (
    <div className="space-y-6 animate-fade-in p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold">User Management</h1>
            {isSuperAdmin ? (
              <Badge variant="outline" className="flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-200">
                <MapPin className="h-3 w-3" />
                All Locations (Global Access)
              </Badge>
            ) : (
              <Badge variant="outline" className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {userLocationName}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            {isSuperAdmin 
              ? 'Manage all system users and their permissions across all locations'
              : 'Manage system users and their permissions'}
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

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                {isSuperAdmin ? (
                  <Select
                    value={userForm.location}
                    onValueChange={(value: LocationCode) => 
                      setUserForm(prev => ({ ...prev, location: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {LOCATIONS.map(loc => (
                        <SelectItem key={loc.code} value={loc.code}>
                          {loc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <>
                    <Input
                      id="location"
                      value={userLocationName}
                      disabled
                      className="bg-muted cursor-not-allowed"
                    />
                    <p className="text-xs text-muted-foreground">Location is set based on your assigned academy</p>
                  </>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={userForm.department}
                  onChange={(e) => setUserForm(prev => ({ ...prev, department: e.target.value }))}
                  placeholder="e.g., Training Center, Security, Fleet Management"
                  required
                />
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
          title="Security"
          value={stats.security}
          description="Security personnel"
          icon={Shield}
        />
      </div>

      {/* Additional Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <StatCard
          title="Administrators"
          value={stats.admins}
          description="Admin users"
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
            
            {isSuperAdmin && (
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
            )}
            
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
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStatusChange(user.id, user.status === 'active' ? 'inactive' : 'active')}
                            className="h-8 w-8 p-0"
                          >
                            {user.status === 'active' ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(user.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
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
