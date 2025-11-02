/**
 * Academy locations for vehicle fleet management
 * Based on Skoda training center locations across India
 */

export const ACADEMY_LOCATIONS = {
  PUNE: 'Pune',
  VGTAP: 'VGTAP',
  NCR: 'NCR',
  BANGALORE: 'Bangalore'
} as const;

export type AcademyLocation = typeof ACADEMY_LOCATIONS[keyof typeof ACADEMY_LOCATIONS];

export const LOCATION_OPTIONS = Object.values(ACADEMY_LOCATIONS);

/**
 * Location details with full names and additional info
 */
export const LOCATION_DETAILS = {
  [ACADEMY_LOCATIONS.PUNE]: {
    fullName: 'Pune Training Center',
    code: 'PUN',
    region: 'West'
  },
  [ACADEMY_LOCATIONS.VGTAP]: {
    fullName: 'VGTAP Training Center', 
    code: 'VGT',
    region: 'North'
  },
  [ACADEMY_LOCATIONS.NCR]: {
    fullName: 'NCR Training Center',
    code: 'NCR', 
    region: 'North'
  },
  [ACADEMY_LOCATIONS.BANGALORE]: {
    fullName: 'Bangalore Training Center',
    code: 'BLR',
    region: 'South'
  }
} as const;


//--------

import { Location, LocationCode } from '@/types/auth';

export const LOCATIONS: Location[] = [
  {
    code: 'PTC',
    name: 'Pune',
    fullName: 'Pune Training Center'
  },
  {
    code: 'VGTAP',
    name: 'VGTAP',
    fullName: 'VGTAP Training Center'
  },
  {
    code: 'NCR',
    name: 'NCR',
    fullName: 'NCR Training Center'
  },
  {
    code: 'BLR',
    name: 'Bangalore',
    fullName: 'Bangalore Training Center'
  }
];

export const getLocationName = (code: LocationCode | string): string => {
  if (!code || code === 'ALL') return 'All Locations';
  
  // Handle both LocationCode and string inputs
  const codeStr = String(code);
  
  // Try to find exact match first
  const location = LOCATIONS.find(l => l.code === codeStr || l.name === codeStr || l.fullName === codeStr);
  if (location) return location.fullName;
  
  // Handle location codes/names that might not match exactly
  const locationMap: Record<string, string> = {
    'PTC': 'Pune Training Center',
    'Pune': 'Pune Training Center',
    'VGTAP': 'VGTAP Training Center',
    'NCR': 'NCR Training Center',
    'BLR': 'Bangalore Training Center',
    'Bangalore': 'Bangalore Training Center',
  };
  
  return locationMap[codeStr] || codeStr;
};