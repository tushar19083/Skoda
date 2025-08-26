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
  urgency: "normal" | "high";
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

// ---- Mock data (instead of DB) ----
const initialBookings: Booking[] = [
  {
    id: "1",
    vehicleId: "V001",
    trainerId: "T001",
    trainerName: "John Doe",
    startDate: "2025-08-25",
    endDate: "2025-08-27",
    purpose: "Driver Training",
    status: "approved",
    urgency: "normal",
    notes: "Handle with care",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    vehicleId: "V002",
    trainerId: "T002",
    trainerName: "Jane Smith",
    startDate: "2025-08-26",
    endDate: "2025-08-28",
    purpose: "Security Patrol",
    status: "pending",
    urgency: "high",
    notes: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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
