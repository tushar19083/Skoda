import { useAuth } from '@/contexts/AuthContext';
import { LocationCode } from '@/types/auth';
import { LOCATIONS } from '@/constants/locations';

/**
 * Normalize location name/code for comparison
 * Maps location names (Pune, Bangalore) to codes (PTC, BLR) and vice versa
 */
const normalizeLocation = (location: LocationCode | string): string => {
  if (!location) return '';
  
  // If already a code, return as is
  if (location === 'PTC' || location === 'VGTAP' || location === 'NCR' || location === 'BLR' || location === 'ALL') {
    return location;
  }
  
  // Map location names to codes
  const locationMap: Record<string, string> = {
    'Pune': 'PTC',
    'Bangalore': 'BLR',
    'pune': 'PTC',
    'bangalore': 'BLR',
    'PTC': 'PTC',
    'BLR': 'BLR',
    'VGTAP': 'VGTAP',
    'NCR': 'NCR',
  };
  
  // Try to find matching location
  const found = LOCATIONS.find(loc => 
    loc.code === location || 
    loc.name === location || 
    loc.name.toLowerCase() === location.toLowerCase()
  );
  
  if (found) return found.code;
  
  // Fallback to mapping
  return locationMap[location] || locationMap[location.toLowerCase()] || location;
};

/**
 * Hook to filter data by user's location
 * Admin and security users can only see data from their assigned location
 * Trainers can see all locations
 * Super admin can see all locations
 */
export function useLocationFilter() {
  const { user } = useAuth();

  const canAccessLocation = (location: LocationCode | string): boolean => {
    if (!user) return false;
    
    // Super admin can access all locations
    if (user.role === 'super_admin') return true;
    
    // Trainers can access all locations for booking
    if (user.role === 'trainer') return true;
    
    // Admin and security can only access their assigned location
    if (user.role === 'admin' || user.role === 'security') {
      const userLocation = normalizeLocation(user.location || '');
      const itemLocation = normalizeLocation(location);
      return userLocation === itemLocation || user.location === 'ALL';
    }
    
    return false;
  };

  const getFilteredLocations = (locations: (LocationCode | string)[]): (LocationCode | string)[] => {
    if (!user) return [];
    
    // Super admin and trainers can see all locations
    if (user.role === 'super_admin' || user.role === 'trainer') {
      return locations;
    }
    
    // Admin and security can only see their location
    if (user.role === 'admin' || user.role === 'security') {
      return user.location ? [user.location] : [];
    }
    
    return [];
  };

  const filterByLocation = <T extends { location?: LocationCode | string }>(items: T[]): T[] => {
    if (!user) return [];
    
    // Super admin and trainers can see all items
    if (user.role === 'super_admin' || user.role === 'trainer') {
      return items;
    }
    
    // Admin and security can only see items from their location
    if (user.role === 'admin' || user.role === 'security') {
      const userLocation = normalizeLocation(user.location || '');
      return items.filter(item => {
        if (!item.location) return false;
        const itemLocation = normalizeLocation(item.location);
        return userLocation === itemLocation || user.location === 'ALL';
      });
    }
    
    return [];
  };

  return {
    canAccessLocation,
    getFilteredLocations,
    filterByLocation,
    userLocation: user?.location,
    isLocationRestricted: user?.role === 'admin' || user?.role === 'security',
  };
}

