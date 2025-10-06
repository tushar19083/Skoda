import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface PartsOrder {
  id: string;
  orderType: 'Technical' | 'Body';
  orderDate: string;
  location: string;
  vehicleId: string | null;
  partName: string;
  quantity: number;
  partCost: number;
  totalCost: number;
  status: 'Ordered' | 'Received' | 'Installed' | 'Cancelled';
  createdAt: string;
  updatedAt: string;
}

// Mock parts orders data
const mockPartsOrders: PartsOrder[] = [
  {
    id: "parts_001",
    orderType: "Technical",
    orderDate: "2025-06-17",
    location: "Pune",
    vehicleId: "vehicle_003",
    partName: "Battery -Tiguan Allspace",
    quantity: 1,
    partCost: 7559.48,
    totalCost: 7559.48,
    status: "Ordered",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "parts_002",
    orderType: "Technical",
    orderDate: "2025-06-17",
    location: "Pune",
    vehicleId: null,
    partName: "Battery -Virtus 1.5TSI PS",
    quantity: 1,
    partCost: 6269.81,
    totalCost: 6269.81,
    status: "Ordered",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "parts_003",
    orderType: "Technical",
    orderDate: "2025-06-17",
    location: "Pune",
    vehicleId: null,
    partName: "Battery -Virtus 1.6MPI PS",
    quantity: 1,
    partCost: 4037.84,
    totalCost: 4037.84,
    status: "Ordered",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "parts_004",
    orderType: "Technical",
    orderDate: "2025-06-17",
    location: "Pune",
    vehicleId: null,
    partName: "Battery -Slavia 1.0TSI PS",
    quantity: 1,
    partCost: 5208.12,
    totalCost: 5208.12,
    status: "Ordered",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "parts_005",
    orderType: "Technical",
    orderDate: "2025-06-17",
    location: "Pune",
    vehicleId: null,
    partName: "Start-Stop Switch-Kodiaq",
    quantity: 1,
    partCost: 1178.80,
    totalCost: 1178.80,
    status: "Ordered",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "parts_006",
    orderType: "Body",
    orderDate: "2025-06-25",
    location: "Pune",
    vehicleId: null,
    partName: "B Pillar Left",
    quantity: 2,
    partCost: 1596.70,
    totalCost: 3193.40,
    status: "Ordered",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "parts_007",
    orderType: "Body",
    orderDate: "2025-06-25",
    location: "Pune",
    vehicleId: null,
    partName: "B Pillar Right",
    quantity: 2,
    partCost: 1573.18,
    totalCost: 3146.36,
    status: "Ordered",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "parts_008",
    orderType: "Technical",
    orderDate: "2025-04-30",
    location: "NCR",
    vehicleId: null,
    partName: "Spark plugs - Polo GT",
    quantity: 4,
    partCost: 691.43,
    totalCost: 2765.72,
    status: "Ordered",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  }
];

export function usePartsOrders() {
  const [partsOrders, setPartsOrders] = useState<PartsOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPartsOrders = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      setPartsOrders(mockPartsOrders);
      setError(null);
    } catch (err) {
      console.error('Error fetching parts orders:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch parts orders');
      toast({
        title: "Error",
        description: "Failed to load parts orders",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addPartsOrder = async (orderData: Omit<PartsOrder, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newOrder: PartsOrder = {
        ...orderData,
        id: `parts_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setPartsOrders(prev => [...prev, newOrder]);
      toast({
        title: "Success",
        description: "Parts order created successfully",
      });

      return newOrder;
    } catch (err) {
      console.error('Error adding parts order:', err);
      toast({
        title: "Error",
        description: "Failed to create parts order",
        variant: "destructive"
      });
      throw err;
    }
  };

  const updatePartsOrder = async (id: string, updates: Partial<Omit<PartsOrder, 'id' | 'createdAt' | 'updatedAt'>>) => {
    try {
      setPartsOrders(prev => prev.map(order => 
        order.id === id 
          ? { ...order, ...updates, updatedAt: new Date().toISOString() }
          : order
      ));

      toast({
        title: "Success",
        description: "Parts order updated successfully",
      });
    } catch (err) {
      console.error('Error updating parts order:', err);
      toast({
        title: "Error",
        description: "Failed to update parts order",
        variant: "destructive"
      });
      throw err;
    }
  };

  const deletePartsOrder = async (id: string) => {
    try {
      setPartsOrders(prev => prev.filter(order => order.id !== id));
      toast({
        title: "Success",
        description: "Parts order deleted successfully",
      });
    } catch (err) {
      console.error('Error deleting parts order:', err);
      toast({
        title: "Error",
        description: "Failed to delete parts order",
        variant: "destructive"
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchPartsOrders();
  }, []);

  return {
    partsOrders,
    loading,
    error,
    fetchPartsOrders,
    addPartsOrder,
    updatePartsOrder,
    deletePartsOrder,
  };
}