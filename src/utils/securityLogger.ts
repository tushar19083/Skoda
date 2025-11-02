// Security Logger Utility
// Logs all security actions (key issued, vehicle returned, etc.)

export interface SecurityLog {
  id: string;
  type: 'Key Issued' | 'Vehicle Returned' | 'Damage Reported' | 'Parts Requested';
  timestamp: string;
  securityOfficer: {
    id: string;
    name: string;
    email: string;
  };
  trainer: {
    id: string;
    name: string;
  };
  vehicle: {
    id: string;
    brand: string;
    model: string;
    regNo: string;
  };
  booking: {
    id: string;
    bookingRef: string;
    purpose: string;
    startDate: string;
    endDate: string;
    expectedReturnDate: string;
    actualReturnDate?: string;
    location: string;
  };
  notes?: string;
  damageReport?: string;
  partsRequest?: string;
}

const STORAGE_KEY = 'app_security_logs';

// Get all logs
export const getSecurityLogs = (): SecurityLog[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Save logs
export const saveSecurityLogs = (logs: SecurityLog[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  } catch (err) {
    console.error('Error saving security logs:', err);
  }
};

// Log key issued
export const logKeyIssued = (
  securityOfficer: { id: string; name: string; email: string },
  booking: any,
  vehicle: any,
  trainer: any,
  notes?: string
) => {
  const logs = getSecurityLogs();
  const newLog: SecurityLog = {
    id: crypto.randomUUID(),
    type: 'Key Issued',
    timestamp: new Date().toISOString(),
    securityOfficer,
    trainer: {
      id: trainer.id || booking.trainerId,
      name: trainer.name || booking.trainerName,
    },
    vehicle: {
      id: vehicle.id,
      brand: vehicle.brand,
      model: vehicle.model,
      regNo: vehicle.regNo,
    },
    booking: {
      id: booking.id,
      bookingRef: booking.id,
      purpose: booking.purpose,
      startDate: booking.startDate,
      endDate: booking.endDate,
      expectedReturnDate: booking.endDate, // From booking, filled by trainer
      location: booking.requestedLocation || 'Unknown',
    },
    notes,
  };
  
  logs.unshift(newLog); // Add to beginning
  saveSecurityLogs(logs);
  return newLog;
};

// Log vehicle returned
export const logVehicleReturned = (
  securityOfficer: { id: string; name: string; email: string },
  booking: any,
  vehicle: any,
  trainer: any,
  condition: string,
  notes?: string
) => {
  const logs = getSecurityLogs();
  const newLog: SecurityLog = {
    id: crypto.randomUUID(),
    type: 'Vehicle Returned',
    timestamp: new Date().toISOString(),
    securityOfficer,
    trainer: {
      id: trainer.id || booking.trainerId,
      name: trainer.name || booking.trainerName,
    },
    vehicle: {
      id: vehicle.id,
      brand: vehicle.brand,
      model: vehicle.model,
      regNo: vehicle.regNo,
    },
    booking: {
      id: booking.id,
      bookingRef: booking.id,
      purpose: booking.purpose,
      startDate: booking.startDate,
      endDate: booking.endDate,
      expectedReturnDate: booking.endDate,
      actualReturnDate: new Date().toISOString(),
      location: booking.requestedLocation || 'Unknown',
    },
    notes,
    damageReport: condition === 'damaged' ? notes : 'No damage reported',
  };
  
  logs.unshift(newLog);
  saveSecurityLogs(logs);
  return newLog;
};

// Log damage reported
export const logDamageReported = (
  booking: any,
  vehicle: any,
  trainer: any,
  damageDescription: string
) => {
  const logs = getSecurityLogs();
  const newLog: SecurityLog = {
    id: crypto.randomUUID(),
    type: 'Damage Reported',
    timestamp: new Date().toISOString(),
    securityOfficer: {
      id: 'system',
      name: 'System',
      email: 'system@skoda.com',
    },
    trainer: {
      id: trainer.id || booking.trainerId,
      name: trainer.name || booking.trainerName,
    },
    vehicle: {
      id: vehicle.id,
      brand: vehicle.brand,
      model: vehicle.model,
      regNo: vehicle.regNo,
    },
    booking: {
      id: booking.id,
      bookingRef: booking.id,
      purpose: booking.purpose,
      startDate: booking.startDate,
      endDate: booking.endDate,
      expectedReturnDate: booking.endDate,
      location: booking.requestedLocation || 'Unknown',
    },
    damageReport: damageDescription,
  };
  
  logs.unshift(newLog);
  saveSecurityLogs(logs);
  return newLog;
};

// Log parts requested
export const logPartsRequested = (
  booking: any,
  vehicle: any,
  trainer: any,
  partsDescription: string
) => {
  const logs = getSecurityLogs();
  const newLog: SecurityLog = {
    id: crypto.randomUUID(),
    type: 'Parts Requested',
    timestamp: new Date().toISOString(),
    securityOfficer: {
      id: 'system',
      name: 'System',
      email: 'system@skoda.com',
    },
    trainer: {
      id: trainer.id || booking.trainerId,
      name: trainer.name || booking.trainerName,
    },
    vehicle: {
      id: vehicle.id,
      brand: vehicle.brand,
      model: vehicle.model,
      regNo: vehicle.regNo,
    },
    booking: {
      id: booking.id,
      bookingRef: booking.id,
      purpose: booking.purpose,
      startDate: booking.startDate,
      endDate: booking.endDate,
      expectedReturnDate: booking.endDate,
      location: booking.requestedLocation || 'Unknown',
    },
    partsRequest: partsDescription,
  };
  
  logs.unshift(newLog);
  saveSecurityLogs(logs);
  return newLog;
};

