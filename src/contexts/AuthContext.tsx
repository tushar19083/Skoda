import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, AuthState, LoginCredentials, UserRole } from '@/types/auth';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demonstration
const mockUsers: Record<string, User> = {
  'superadmin@skoda.com': {
    id: '0',
    name: 'Super Administrator',
    email: 'superadmin@skoda.com',
    role: 'super_admin',
    location: 'ALL',
    department: 'System Administration',
    employeeId: 'EMP000'
  },
  'admin@skoda.com': {
    id: '1',
    name: 'John Administrator',
    email: 'admin@skoda.com',
    role: 'admin',
    location: 'PTC',
    department: 'Fleet Management',
    employeeId: 'EMP001'
  },
  'admin.vgtap@skoda.com': {
    id: '2',
    name: 'Priya Admin',
    email: 'admin.vgtap@skoda.com',
    role: 'admin',
    location: 'VGTAP',
    department: 'Fleet Management',
    employeeId: 'EMP002'
  },
  'admin.ncr@skoda.com': {
    id: '3',
    name: 'Rajesh Kumar',
    email: 'admin.ncr@skoda.com',
    role: 'admin',
    location: 'NCR',
    department: 'Fleet Management',
    employeeId: 'EMP003'
  },
  'admin.blr@skoda.com': {
    id: '4',
    name: 'Ananya Sharma',
    email: 'admin.blr@skoda.com',
    role: 'admin',
    location: 'BLR',
    department: 'Fleet Management',
    employeeId: 'EMP004'
  },
  'trainer@skoda.com': {
    id: '5',
    name: 'Sarah Trainer',
    email: 'trainer@skoda.com',
    role: 'trainer',
    location: 'PTC',
    department: 'Training Center',
    employeeId: 'EMP005'
  },
  'security@skoda.com': {
    id: '6',
    name: 'Mike Security',
    email: 'security@skoda.com',
    role: 'security',
    location: 'PTC',
    department: 'Security',
    employeeId: 'EMP006'
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(() => {
    // Try to load from localStorage
    const stored = localStorage.getItem("authState");
    return stored
      ? JSON.parse(stored)
      : { user: null, isAuthenticated: false, isLoading: false };
  });

  useEffect(() => {
    localStorage.setItem("authState", JSON.stringify(authState));
  }, [authState]);

  const login = async (credentials: LoginCredentials) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user = mockUsers[credentials.email];
    
    if (user && user.role === credentials.role) {
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false
      });
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw new Error('Invalid credentials or incorrect role');
    }
  };

  const logout = () => {
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}