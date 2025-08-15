import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export interface Vehicle {
  id: string;
  brand: 'Skoda' | 'Volkswagen' | 'Audi';
  model: string;
  year: number;
  licensePlate: string;
  vin: string;
  color: string;
  fuelType: 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid';
  status: 'Available' | 'Booked' | 'Maintenance' | 'Out of Service';
  mileage: number;
  location: string;
  lastService: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export function useVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedVehicles: Vehicle[] = data.map(v => ({
        id: v.id,
        brand: v.brand,
        model: v.model,
        year: v.year,
        licensePlate: v.license_plate,
        vin: v.vin,
        color: v.color,
        fuelType: v.fuel_type,
        status: v.status,
        mileage: v.mileage,
        location: v.location,
        lastService: v.last_service,
        notes: v.notes,
        createdAt: v.created_at,
        updatedAt: v.updated_at,
      }));

      setVehicles(transformedVehicles);
      setError(null);
    } catch (err) {
      console.error('Error fetching vehicles:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch vehicles');
      toast({
        title: "Error",
        description: "Failed to load vehicles",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addVehicle = async (vehicleData: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .insert({
          brand: vehicleData.brand,
          model: vehicleData.model,
          year: vehicleData.year,
          license_plate: vehicleData.licensePlate,
          vin: vehicleData.vin,
          color: vehicleData.color,
          fuel_type: vehicleData.fuelType,
          status: vehicleData.status,
          mileage: vehicleData.mileage,
          location: vehicleData.location,
          last_service: vehicleData.lastService,
          notes: vehicleData.notes,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchVehicles();
      toast({
        title: "Success",
        description: `${vehicleData.brand} ${vehicleData.model} added successfully`,
      });

      return data;
    } catch (err) {
      console.error('Error adding vehicle:', err);
      toast({
        title: "Error",
        description: "Failed to add vehicle",
        variant: "destructive"
      });
      throw err;
    }
  };

  const updateVehicle = async (id: string, updates: Partial<Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>>) => {
    try {
      const { error } = await supabase
        .from('vehicles')
        .update({
          ...(updates.brand && { brand: updates.brand }),
          ...(updates.model && { model: updates.model }),
          ...(updates.year && { year: updates.year }),
          ...(updates.licensePlate && { license_plate: updates.licensePlate }),
          ...(updates.vin && { vin: updates.vin }),
          ...(updates.color && { color: updates.color }),
          ...(updates.fuelType && { fuel_type: updates.fuelType }),
          ...(updates.status && { status: updates.status }),
          ...(updates.mileage !== undefined && { mileage: updates.mileage }),
          ...(updates.location && { location: updates.location }),
          ...(updates.lastService !== undefined && { last_service: updates.lastService }),
          ...(updates.notes !== undefined && { notes: updates.notes }),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      await fetchVehicles();
      toast({
        title: "Success",
        description: "Vehicle updated successfully",
      });
    } catch (err) {
      console.error('Error updating vehicle:', err);
      toast({
        title: "Error",
        description: "Failed to update vehicle",
        variant: "destructive"
      });
      throw err;
    }
  };

  const deleteVehicle = async (id: string) => {
    try {
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchVehicles();
      toast({
        title: "Success",
        description: "Vehicle removed successfully",
      });
    } catch (err) {
      console.error('Error deleting vehicle:', err);
      toast({
        title: "Error",
        description: "Failed to remove vehicle",
        variant: "destructive"
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  return {
    vehicles,
    loading,
    error,
    fetchVehicles,
    addVehicle,
    updateVehicle,
    deleteVehicle,
  };
}