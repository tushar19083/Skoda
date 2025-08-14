import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Car, Shield, GraduationCap, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/auth';

const roleConfig = {
  admin: {
    icon: Settings,
    title: 'Administrator',
    description: 'Full system access and management',
    defaultEmail: 'admin@skoda.com'
  },
  trainer: {
    icon: GraduationCap,
    title: 'Trainer',
    description: 'Book vehicles and manage training sessions',
    defaultEmail: 'trainer@skoda.com'
  },
  security: {
    icon: Shield,
    title: 'Security',
    description: 'Key management and vehicle security',
    defaultEmail: 'security@skoda.com'
  }
};

export function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const [email, setEmail] = useState(roleConfig.admin.defaultEmail);
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  
  const { login, isLoading } = useAuth();

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setEmail(roleConfig[role].defaultEmail);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await login({
        email,
        password,
        role: selectedRole
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  const config = roleConfig[selectedRole];
  const IconComponent = config.icon;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero bg-cover bg-center bg-no-repeat p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Car className="h-8 w-8 text-white" />
            <h1 className="text-2xl font-bold text-white">Skoda Fleet</h1>
          </div>
          <p className="text-white/80">Vehicle Management Portal</p>
        </div>

        <Card className="card-elevated">
          <CardHeader className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <IconComponent className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">{config.title} Login</CardTitle>
                <CardDescription>{config.description}</CardDescription>
              </div>
            </div>

            {/* Role Selection */}
            <Tabs value={selectedRole} onValueChange={handleRoleChange as (value: string) => void}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="admin" className="text-xs">Admin</TabsTrigger>
                <TabsTrigger value="trainer" className="text-xs">Trainer</TabsTrigger>
                <TabsTrigger value="security" className="text-xs">Security</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>

              {/* Demo Credentials */}
              <div className="text-xs text-muted-foreground space-y-1 p-3 bg-muted/50 rounded-lg">
                <p className="font-medium">Demo Credentials:</p>
                <p>Email: {config.defaultEmail}</p>
                <p>Password: password123</p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}