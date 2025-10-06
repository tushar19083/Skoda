export type UserRole = 'super_admin' | 'admin' | 'trainer' | 'security';

export type LocationCode = 'PTC' | 'VGTAP' | 'NCR' | 'BLR' | 'ALL';

export interface Location {
  code: LocationCode;
  name: string;
  fullName: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  location?: LocationCode;
  avatar?: string;
  department?: string;
  employeeId?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  role: UserRole;
}