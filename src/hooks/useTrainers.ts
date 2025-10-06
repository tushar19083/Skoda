import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface Trainer {
  id: string;
  name: string;
  location: string;
  specializations: string[];
  createdAt: string;
  updatedAt: string;
}

// Mock trainers data based on VGA Training Cars
const mockTrainers: Trainer[] = [
  {
    id: "trainer_001",
    name: "Mahesh Deshmukh",
    location: "Pune",
    specializations: ["Technology", "Advance Transmission", "Running Gear", "Advance Engines"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "trainer_002",
    name: "Ranjeet Thorat",
    location: "Pune",
    specializations: ["Diagnostics", "HVAC & Convenience", "Advance Transmission"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "trainer_003",
    name: "Sanjay Borade",
    location: "Pune",
    specializations: ["Advance Engines", "Electrics", "Fundamental"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "trainer_004",
    name: "Dattaprasad Duble",
    location: "Pune",
    specializations: ["Advance Engines", "HVAC & Convenience", "Advance Transmission", "Advance Elec"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "trainer_005",
    name: "Yogesh Sundaramurthy",
    location: "Pune",
    specializations: ["Diagnostics", "HVAC & Convenience", "Advance Engines"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "trainer_006",
    name: "Atmaram Desai",
    location: "Pune",
    specializations: ["Technology", "Advance Transmission", "Running Gear", "Advance Engines", "Fundamental"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "trainer_007",
    name: "Sanjay Singh",
    location: "NCR",
    specializations: ["General Training"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "trainer_008",
    name: "Ashish Ghiya",
    location: "NCR",
    specializations: ["General Training"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "trainer_009",
    name: "Suresh Nagaraja",
    location: "Bangalore",
    specializations: ["General Training"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "trainer_010",
    name: "Abhilash T",
    location: "Bangalore",
    specializations: ["General Training"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "trainer_011",
    name: "Dasharatha Kumar",
    location: "Bangalore",
    specializations: ["General Training", "Master"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  }
];

export function useTrainers() {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchTrainers = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      setTrainers(mockTrainers);
      setError(null);
    } catch (err) {
      console.error('Error fetching trainers:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch trainers');
      toast({
        title: "Error",
        description: "Failed to load trainers",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addTrainer = async (trainerData: Omit<Trainer, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newTrainer: Trainer = {
        ...trainerData,
        id: `trainer_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setTrainers(prev => [...prev, newTrainer]);
      toast({
        title: "Success",
        description: "Trainer added successfully",
      });

      return newTrainer;
    } catch (err) {
      console.error('Error adding trainer:', err);
      toast({
        title: "Error",
        description: "Failed to add trainer",
        variant: "destructive"
      });
      throw err;
    }
  };

  const updateTrainer = async (id: string, updates: Partial<Omit<Trainer, 'id' | 'createdAt' | 'updatedAt'>>) => {
    try {
      setTrainers(prev => prev.map(trainer => 
        trainer.id === id 
          ? { ...trainer, ...updates, updatedAt: new Date().toISOString() }
          : trainer
      ));

      toast({
        title: "Success",
        description: "Trainer updated successfully",
      });
    } catch (err) {
      console.error('Error updating trainer:', err);
      toast({
        title: "Error",
        description: "Failed to update trainer",
        variant: "destructive"
      });
      throw err;
    }
  };

  const deleteTrainer = async (id: string) => {
    try {
      setTrainers(prev => prev.filter(trainer => trainer.id !== id));
      toast({
        title: "Success",
        description: "Trainer deleted successfully",
      });
    } catch (err) {
      console.error('Error deleting trainer:', err);
      toast({
        title: "Error",
        description: "Failed to delete trainer",
        variant: "destructive"
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchTrainers();
  }, []);

  return {
    trainers,
    loading,
    error,
    fetchTrainers,
    addTrainer,
    updateTrainer,
    deleteTrainer,
  };
}