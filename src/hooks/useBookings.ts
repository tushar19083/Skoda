import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export interface Booking {
  id: string;
  vehicleId: string;
  trainerId: string;
  trainerName: string;
  startDate: string;
  endDate: string;
  purpose: string;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'completed' | 'cancelled';
  urgency: 'normal' | 'high';
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedBookings: Booking[] = data.map(b => ({
        id: b.id,
        vehicleId: b.vehicle_id,
        trainerId: b.trainer_id,
        trainerName: b.trainer_name,
        startDate: b.start_date,
        endDate: b.end_date,
        purpose: b.purpose,
        status: b.status,
        urgency: b.urgency,
        notes: b.notes,
        createdAt: b.created_at,
        updatedAt: b.updated_at,
      }));

      setBookings(transformedBookings);
      setError(null);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch bookings');
      toast({
        title: "Error",
        description: "Failed to load bookings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createBooking = async (bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          vehicle_id: bookingData.vehicleId,
          trainer_id: bookingData.trainerId,
          trainer_name: bookingData.trainerName,
          start_date: bookingData.startDate,
          end_date: bookingData.endDate,
          purpose: bookingData.purpose,
          status: bookingData.status,
          urgency: bookingData.urgency,
          notes: bookingData.notes,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchBookings();
      toast({
        title: "Success",
        description: "Booking created successfully",
      });

      return data;
    } catch (err) {
      console.error('Error creating booking:', err);
      toast({
        title: "Error",
        description: "Failed to create booking",
        variant: "destructive"
      });
      throw err;
    }
  };

  const updateBookingStatus = async (id: string, status: Booking['status'], notes?: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          status,
          ...(notes && { notes }),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      await fetchBookings();
      toast({
        title: "Success",
        description: `Booking ${status} successfully`,
      });
    } catch (err) {
      console.error('Error updating booking:', err);
      toast({
        title: "Error",
        description: "Failed to update booking",
        variant: "destructive"
      });
      throw err;
    }
  };

  const deleteBooking = async (id: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchBookings();
      toast({
        title: "Success",
        description: "Booking cancelled successfully",
      });
    } catch (err) {
      console.error('Error deleting booking:', err);
      toast({
        title: "Error",
        description: "Failed to cancel booking",
        variant: "destructive"
      });
      throw err;
    }
  };

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
  };
}