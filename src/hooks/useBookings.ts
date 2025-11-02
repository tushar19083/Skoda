// src/hooks/useBookings.ts
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { AcademyLocation } from "@/constants/locations";

export interface Booking {
  id: string;
  vehicleId: string;
  trainerId: string;
  trainerName: string;
  startDate: string;
  endDate: string;
  purpose: string;
  requestedLocation: AcademyLocation;
  status:
    | "pending"
    | "approved"
    | "rejected"
    | "active"
    | "completed"
    | "cancelled";
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

// ---- Mock data (instead of DB) ----
// Fixed dates stored as if from database
// These dates are relative to current date but stored as ISO strings
const getBookingDates = () => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  return {
    tomorrow9am: new Date(today.getTime() + 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000).toISOString(),
    tomorrow5pm: new Date(today.getTime() + 24 * 60 * 60 * 1000 + 17 * 60 * 60 * 1000).toISOString(),
    dayAfter2pm: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000).toISOString(),
    dayAfter6pm: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000 + 18 * 60 * 60 * 1000).toISOString(),
    threeDays10am: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000).toISOString(),
    threeDays4pm: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000 + 16 * 60 * 60 * 1000).toISOString(),
    fiveDaysAgo9am: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000).toISOString(),
    fiveDaysAgo5pm: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000 + 17 * 60 * 60 * 1000).toISOString(),
    fiveDays8am: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000).toISOString(),
    fiveDays12pm: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000 + 12 * 60 * 60 * 1000).toISOString(),
    sixDays9am: new Date(today.getTime() + 6 * 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000).toISOString(),
    sixDays5pm: new Date(today.getTime() + 6 * 24 * 60 * 60 * 1000 + 17 * 60 * 60 * 1000).toISOString(),
    twoDaysAgo10am: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000).toISOString(),
    twoDaysAgo4pm: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000 + 16 * 60 * 60 * 1000).toISOString(),
    yesterday8am: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000).toISOString(),
    yesterday2pm: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000).toISOString(),
    fourDays9am: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000).toISOString(),
    fourDays3pm: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000 + 15 * 60 * 60 * 1000).toISOString(),
    threeDaysAgo10am: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000).toISOString(),
    threeDaysAgo4pm: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000 + 16 * 60 * 60 * 1000).toISOString(),
    sevenDays8am: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000).toISOString(),
    sevenDays12pm: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000 + 12 * 60 * 60 * 1000).toISOString(),
    tenDays9am: new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000).toISOString(),
    tenDays5pm: new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000 + 17 * 60 * 60 * 1000).toISOString(),
    now: new Date().toISOString(),
  };
};

const initialBookings: Booking[] = (() => {
  const dates = getBookingDates();
  return [
    {
      id: 'booking_001',
      vehicleId: '1',
      trainerId: '5',
      trainerName: 'Sarah Trainer',
      startDate: dates.tomorrow9am,
      endDate: dates.tomorrow5pm,
      purpose: 'DSG Transmission Training',
      requestedLocation: 'Pune',
      status: 'active',
      notes: 'Focus on DQ200 dual clutch system',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: dates.now
    },
    {
      id: 'booking_002',
      vehicleId: '2',
      trainerId: '5',
      trainerName: 'Sarah Trainer',
      startDate: dates.dayAfter2pm,
      endDate: dates.dayAfter6pm,
      purpose: 'Advanced TDI Engine Diagnostics',
      requestedLocation: 'Pune',
      status: 'approved',
      notes: 'Training session for new diagnostic procedures',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: dates.now
    },
    {
      id: 'booking_003',
      vehicleId: '3',
      trainerId: '5',
      trainerName: 'Sarah Trainer',
      startDate: dates.threeDays10am,
      endDate: dates.threeDays4pm,
      purpose: 'Tiguan AllSpace Feature Training',
      requestedLocation: 'Pune',
      status: 'pending',
      notes: 'Complete vehicle systems overview',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'booking_004',
      vehicleId: '5',
      trainerId: '5',
      trainerName: 'Sarah Trainer',
      startDate: dates.fiveDaysAgo9am,
      endDate: dates.fiveDaysAgo5pm,
      purpose: 'Taigun Technology Workshop',
      requestedLocation: 'Pune',
      status: 'completed',
      notes: 'Successfully completed all training modules',
      createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: dates.fiveDaysAgo5pm
    },
    {
      id: 'booking_005',
      vehicleId: '1',
      trainerId: '5',
      trainerName: 'Sarah Trainer',
      startDate: dates.fiveDays8am,
      endDate: dates.fiveDays12pm,
      purpose: 'Emergency Brake System Testing',
      requestedLocation: 'Pune',
      status: 'active',
      notes: 'Critical safety system validation required',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: dates.now
    },
    {
      id: 'booking_006',
      vehicleId: '2',
      trainerId: '5',
      trainerName: 'Sarah Trainer',
      startDate: dates.sixDays9am,
      endDate: dates.sixDays5pm,
      purpose: 'ŠKODA Basic Qualification Electrics',
      requestedLocation: 'Pune',
      status: 'active',
      notes: 'Electrical systems training session',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: dates.now
    },
    {
      id: 'booking_007',
      vehicleId: '13',
      trainerId: '5',
      trainerName: 'Sarah Trainer',
      startDate: dates.twoDaysAgo10am,
      endDate: dates.twoDaysAgo4pm,
      purpose: 'Audi Basics of Engine Technology',
      requestedLocation: 'Bangalore',
      status: 'active',
      notes: 'Engine technology fundamentals training',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: dates.twoDaysAgo10am
    },
    {
      id: 'booking_008',
      vehicleId: '14',
      trainerId: '5',
      trainerName: 'Sarah Trainer',
      startDate: dates.yesterday8am,
      endDate: dates.yesterday2pm,
      purpose: 'VW Basic Qualification Fundamental',
      requestedLocation: 'VGTAP',
      status: 'active',
      notes: 'Basic qualification training',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: dates.yesterday8am
    },
    {
      id: 'booking_009',
      vehicleId: '8',
      trainerId: '5',
      trainerName: 'Sarah Trainer',
      startDate: dates.fourDays9am,
      endDate: dates.fourDays3pm,
      purpose: 'Audi AC Systems',
      requestedLocation: 'NCR',
      status: 'active',
      notes: 'AC system troubleshooting training',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: dates.now
    },
    {
      id: 'booking_010',
      vehicleId: '3',
      trainerId: '5',
      trainerName: 'Sarah Trainer',
      startDate: dates.threeDaysAgo10am,
      endDate: dates.threeDaysAgo4pm,
      purpose: 'ŠKODA Advance Qualification Engines',
      requestedLocation: 'Pune',
      status: 'active',
      notes: 'Advanced engine diagnostics training',
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: dates.threeDaysAgo10am
    },
    {
      id: 'booking_011',
      vehicleId: '5',
      trainerId: '5',
      trainerName: 'Sarah Trainer',
      startDate: dates.sevenDays8am,
      endDate: dates.sevenDays12pm,
      purpose: 'VW Expert Qualification Diagnostic Technology',
      requestedLocation: 'Pune',
      status: 'pending',
      notes: 'Expert level diagnostic training',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'booking_012',
      vehicleId: '11',
      trainerId: '5',
      trainerName: 'Sarah Trainer',
      startDate: dates.tenDays9am,
      endDate: dates.tenDays5pm,
      purpose: 'Audi Diagnostic Practical Test, Viva-Voce',
      requestedLocation: 'Bangalore',
      status: 'approved',
      notes: 'Practical diagnostic assessment',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: dates.now
    },
    // NCR Location Bookings
    {
      id: 'booking_013',
      vehicleId: '8',
      trainerId: '6',
      trainerName: 'Mike Johnson',
      startDate: dates.tomorrow9am,
      endDate: dates.tomorrow5pm,
      purpose: 'VW Basic Qualification Fundamental',
      requestedLocation: 'NCR',
      status: 'active',
      notes: 'Basic qualification training session',
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      updatedAt: dates.now
    },
    {
      id: 'booking_014',
      vehicleId: '9',
      trainerId: '6',
      trainerName: 'Mike Johnson',
      startDate: dates.dayAfter2pm,
      endDate: dates.dayAfter6pm,
      purpose: 'VW Basic Qualification Engines',
      requestedLocation: 'NCR',
      status: 'approved',
      notes: 'Engine fundamentals training',
      createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
      updatedAt: dates.now
    },
    {
      id: 'booking_015',
      vehicleId: '18',
      trainerId: '7',
      trainerName: 'Emma Wilson',
      startDate: dates.threeDays10am,
      endDate: dates.threeDays4pm,
      purpose: 'ŠKODA Basic Qualification Electrics',
      requestedLocation: 'NCR',
      status: 'pending',
      notes: 'Electrical systems training',
      createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'booking_016',
      vehicleId: '19',
      trainerId: '7',
      trainerName: 'Emma Wilson',
      startDate: dates.fiveDaysAgo9am,
      endDate: dates.fiveDaysAgo5pm,
      purpose: 'Audi Basics of Engine Technology',
      requestedLocation: 'NCR',
      status: 'completed',
      notes: 'Engine technology fundamentals completed',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: dates.fiveDaysAgo5pm
    },
    // Bangalore Location Bookings
    {
      id: 'booking_017',
      vehicleId: '11',
      trainerId: '8',
      trainerName: 'Priya Patel',
      startDate: dates.tomorrow9am,
      endDate: dates.tomorrow5pm,
      purpose: 'VW Basic Qualification Fundamental',
      requestedLocation: 'Bangalore',
      status: 'active',
      notes: 'Fundamental training session',
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      updatedAt: dates.now
    },
    {
      id: 'booking_018',
      vehicleId: '13',
      trainerId: '8',
      trainerName: 'Priya Patel',
      startDate: dates.dayAfter2pm,
      endDate: dates.dayAfter6pm,
      purpose: 'Audi Basic Qualification Engines',
      requestedLocation: 'Bangalore',
      status: 'approved',
      notes: 'Engine qualification training',
      createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
      updatedAt: dates.now
    },
    {
      id: 'booking_019',
      vehicleId: '21',
      trainerId: '4',
      trainerName: 'Emma Wilson',
      startDate: dates.threeDays10am,
      endDate: dates.threeDays4pm,
      purpose: 'ŠKODA Advance Qualification Transmissions',
      requestedLocation: 'Bangalore',
      status: 'pending',
      notes: 'Advanced transmission training',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'booking_020',
      vehicleId: '22',
      trainerId: '4',
      trainerName: 'Emma Wilson',
      startDate: dates.fiveDaysAgo9am,
      endDate: dates.fiveDaysAgo5pm,
      purpose: 'Audi AC Systems',
      requestedLocation: 'Bangalore',
      status: 'completed',
      notes: 'AC systems training completed',
      createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: dates.fiveDaysAgo5pm
    },
    // VGTAP Location Bookings
    {
      id: 'booking_021',
      vehicleId: '14',
      trainerId: '9',
      trainerName: 'David Kumar',
      startDate: dates.tomorrow9am,
      endDate: dates.tomorrow5pm,
      purpose: 'VW Basic Qualification Fundamental',
      requestedLocation: 'VGTAP',
      status: 'active',
      notes: 'Basic qualification training',
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      updatedAt: dates.now
    },
    {
      id: 'booking_022',
      vehicleId: '15',
      trainerId: '9',
      trainerName: 'David Kumar',
      startDate: dates.dayAfter2pm,
      endDate: dates.dayAfter6pm,
      purpose: 'VW Basic Qualification Engines',
      requestedLocation: 'VGTAP',
      status: 'approved',
      notes: 'Engine fundamentals training',
      createdAt: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
      updatedAt: dates.now
    },
    {
      id: 'booking_023',
      vehicleId: '16',
      trainerId: '10',
      trainerName: 'Anita Singh',
      startDate: dates.threeDays10am,
      endDate: dates.threeDays4pm,
      purpose: 'ŠKODA Basic Qualification Electrics',
      requestedLocation: 'VGTAP',
      status: 'pending',
      notes: 'Electrical systems training',
      createdAt: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'booking_024',
      vehicleId: '17',
      trainerId: '10',
      trainerName: 'Anita Singh',
      startDate: dates.fiveDaysAgo9am,
      endDate: dates.fiveDaysAgo5pm,
      purpose: 'Audi Basics of Engine Technology',
      requestedLocation: 'VGTAP',
      status: 'completed',
      notes: 'Engine technology training completed',
      createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: dates.fiveDaysAgo5pm
    },
  ];
})();

export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // ---- Fetch bookings (mock) ----
  const fetchBookings = async () => {
    try {
      setLoading(true);
      await new Promise((res) => setTimeout(res, 500)); // fake delay
      
      // Load from localStorage if available (persistent "database")
      try {
        const stored = localStorage.getItem('app_bookings');
        if (stored) {
          const parsed = JSON.parse(stored);
          // Validate and use stored bookings if they exist
          if (Array.isArray(parsed) && parsed.length > 0) {
            setBookings(parsed);
            setError(null);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error('Error loading bookings from localStorage:', err);
      }
      
      // Use initialBookings as default (first time setup)
      setBookings(initialBookings);
      
      // Save to localStorage for persistence
      try {
        localStorage.setItem('app_bookings', JSON.stringify(initialBookings));
      } catch (err) {
        console.error('Error saving bookings to localStorage:', err);
      }
      
      setError(null);
    } catch (err) {
      setError("Failed to fetch bookings");
      toast({
        title: "Error",
        description: "Failed to load bookings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // ---- Create booking ----
  const createBooking = async (
    bookingData: Omit<Booking, "id" | "createdAt" | "updatedAt">
  ): Promise<Booking> => {
    const newBooking: Booking = {
      ...bookingData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setBookings((prev) => {
      const updated = [newBooking, ...prev];
      // Save to localStorage
      try {
        localStorage.setItem('app_bookings', JSON.stringify(updated));
      } catch (err) {
        console.error('Error saving bookings to localStorage:', err);
      }
      return updated;
    });
    toast({
      title: "Success",
      description: "Booking created successfully",
    });
    return newBooking;
  };

  // ---- Update booking status ----
  const updateBookingStatus = async (
    id: string,
    status: Booking["status"],
    notes?: string
  ): Promise<Booking | undefined> => {
    let updated: Booking | undefined;
    setBookings((prev) => {
      const updatedList = prev.map((b) =>
        b.id === id
          ? ((updated = {
              ...b,
              status,
              notes: notes ?? b.notes,
              updatedAt: new Date().toISOString(),
            }),
            updated)
          : b
      );
      // Save to localStorage
      try {
        localStorage.setItem('app_bookings', JSON.stringify(updatedList));
      } catch (err) {
        console.error('Error saving bookings to localStorage:', err);
      }
      return updatedList;
    });
    toast({
      title: "Success",
      description: `Booking marked as ${status}`,
    });
    return updated;
  };

  // ---- Delete booking ----
  const deleteBooking = async (id: string): Promise<void> => {
    setBookings((prev) => {
      const updated = prev.filter((b) => b.id !== id);
      // Save to localStorage
      try {
        localStorage.setItem('app_bookings', JSON.stringify(updated));
      } catch (err) {
        console.error('Error saving bookings to localStorage:', err);
      }
      return updated;
    });
    toast({
      title: "Success",
      description: "Booking deleted successfully",
    });
  };

  // ---- Helpers ----
  const getBookingsByTrainer = (trainerId: string) =>
    bookings.filter((b) => b.trainerId === trainerId);

  const getBookingById = (id: string) =>
    bookings.find((b) => b.id === id) ?? null;

  // ---- Persist bookings to localStorage whenever they change ----
  useEffect(() => {
    if (bookings.length > 0) {
      try {
        localStorage.setItem('app_bookings', JSON.stringify(bookings));
      } catch (err) {
        console.error('Error saving bookings to localStorage:', err);
      }
    }
  }, [bookings]);

  // ---- Init fetch ----
  useEffect(() => {
    fetchBookings();
  }, []);

  return {
    bookings,
    loading,
    error,
    fetchBookings,
    createBooking,
    updateBookingStatus,
    deleteBooking,
    getBookingsByTrainer,
    getBookingById,
  };
}
