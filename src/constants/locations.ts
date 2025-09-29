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