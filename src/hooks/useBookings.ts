// src/hooks/useBookings.ts
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export interface Booking {
  id: string;
  vehicleId: string;
  trainerId: string;
  trainerName: string;
  startDate: string;
  endDate: string;
  purpose: string;
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
const initialBookings: Booking[] = [
  {
    id: 'booking_001',
    vehicleId: '1',
    trainerId: '2',
    trainerName: 'Sarah Trainer',
    startDate: '2025-01-08T09:00:00Z',
    endDate: '2025-01-08T17:00:00Z',
    purpose: 'DSG Transmission Training',
    status: 'active',
    notes: 'Focus on DQ200 dual clutch system',
    createdAt: '2025-01-07T10:00:00Z',
    updatedAt: '2025-01-07T10:00:00Z'
  },
  {
    id: 'booking_002',
    vehicleId: '2',
    trainerId: '2',
    trainerName: 'Sarah Trainer',
    startDate: '2025-01-09T14:00:00Z',
    endDate: '2025-01-09T18:00:00Z',
    purpose: 'Advanced TDI Engine Diagnostics',
    status: 'approved',
    notes: 'Training session for new diagnostic procedures',
    createdAt: '2025-01-06T15:30:00Z',
    updatedAt: '2025-01-07T09:15:00Z'
  },
  {
    id: 'booking_003',
    vehicleId: '3',
    trainerId: '2',
    trainerName: 'Sarah Trainer',
    startDate: '2025-01-10T10:00:00Z',
    endDate: '2025-01-10T16:00:00Z',
    purpose: 'Tiguan AllSpace Feature Training',
    status: 'pending',
    notes: 'Complete vehicle systems overview',
    createdAt: '2025-01-05T11:00:00Z',
    updatedAt: '2025-01-05T11:00:00Z'
  },
  {
    id: 'booking_004',
    vehicleId: '5',
    trainerId: '2',
    trainerName: 'Sarah Trainer',
    startDate: '2025-01-04T09:00:00Z',
    endDate: '2025-01-04T17:00:00Z',
    purpose: 'Taigun Technology Workshop',
    status: 'completed',
    notes: 'Successfully completed all training modules',
    createdAt: '2025-01-03T14:00:00Z',
    updatedAt: '2025-01-04T17:30:00Z'
  },
  {
    id: 'booking_005',
    vehicleId: '1',
    trainerId: '2',
    trainerName: 'Sarah Trainer',
    startDate: '2025-01-12T08:00:00Z',
    endDate: '2025-01-12T12:00:00Z',
    purpose: 'Emergency Brake System Testing',
    status: 'active',
    notes: 'Critical safety system validation required',
    createdAt: '2025-01-06T16:45:00Z',
    updatedAt: '2025-01-08T08:00:00Z'
  },
];

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
      setBookings(initialBookings);
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
    setBookings((prev) => [newBooking, ...prev]);
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
    setBookings((prev) =>
      prev.map((b) =>
        b.id === id
          ? ((updated = {
              ...b,
              status,
              notes: notes ?? b.notes,
              updatedAt: new Date().toISOString(),
            }),
            updated)
          : b
      )
    );
    toast({
      title: "Success",
      description: `Booking marked as ${status}`,
    });
    return updated;
  };

  // ---- Delete booking ----
  const deleteBooking = async (id: string): Promise<void> => {
    setBookings((prev) => prev.filter((b) => b.id !== id));
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
