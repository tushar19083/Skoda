// src/hooks/useVehicles.ts

import { useState, useEffect } from "react";
import { AcademyLocation } from "@/constants/locations";

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  regNo: string;
  fuelType: string;
  mileage: number;
  location: AcademyLocation;
  status: "Available" | "In Use" | "Maintenance";
  color: string;
}

const mockVehicles: Vehicle[] = [
  // Pune Location - Skoda
  {
    id: "1",
    brand: "Skoda",
    model: "Octavia",
    year: 2014,
    regNo: "MH20DJ2353",
    fuelType: "Petrol",
    mileage: 45000,
    location: "Pune",
    status: "Available",
    color: "White",
  },
  {
    id: "2",
    brand: "Skoda",
    model: "Superb",
    year: 2016,
    regNo: "MH20DV1650",
    fuelType: "Petrol",
    mileage: 32000,
    location: "Pune",
    status: "Available",
    color: "Silver",
  },
  {
    id: "3",
    brand: "Skoda",
    model: "Kushaq",
    year: 2023,
    regNo: "MH14JR2609",
    fuelType: "Petrol",
    mileage: 8500,
    location: "Pune",
    status: "Available",
    color: "Blue",
  },
  // Pune Location - Volkswagen
  {
    id: "4",
    brand: "Volkswagen",
    model: "Vento",
    year: 2015,
    regNo: "MH14EY185",
    fuelType: "Diesel",
    mileage: 42000,
    location: "Pune",
    status: "Available",
    color: "Silver",
  },
  {
    id: "5",
    brand: "Volkswagen",
    model: "Taigun",
    year: 2022,
    regNo: "MH14JU1691",
    fuelType: "Petrol",
    mileage: 12500,
    location: "Pune",
    status: "Available",
    color: "White",
  },
  // Pune Location - Audi
  {
    id: "6",
    brand: "Audi",
    model: "A4",
    year: 2020,
    regNo: "MH14GH0382",
    fuelType: "Petrol",
    mileage: 24500,
    location: "Pune",
    status: "Available",
    color: "Black",
  },
  {
    id: "7",
    brand: "Audi",
    model: "Q3",
    year: 2020,
    regNo: "MH14GH0381",
    fuelType: "Diesel",
    mileage: 28000,
    location: "Pune",
    status: "Available",
    color: "White",
  },

  // NCR Location - Volkswagen
  {
    id: "8",
    brand: "Volkswagen",
    model: "Virtus",
    year: 2022,
    regNo: "DL14KN0375",
    fuelType: "Petrol",
    mileage: 8200,
    location: "NCR",
    status: "Available",
    color: "Blue",
  },
  {
    id: "9",
    brand: "Volkswagen",
    model: "Polo",
    year: 2021,
    regNo: "DL08CD5678",
    fuelType: "Petrol",
    mileage: 20000,
    location: "NCR",
    status: "Available",
    color: "White",
  },
  // NCR Location - Skoda
  {
    id: "10",
    brand: "Skoda",
    model: "Slavia",
    year: 2023,
    regNo: "DL09OP3456",
    fuelType: "Petrol",
    mileage: 5000,
    location: "NCR",
    status: "Available",
    color: "Red",
  },

  // Bangalore Location - Volkswagen
  {
    id: "11",
    brand: "Volkswagen",
    model: "Virtus",
    year: 2022,
    regNo: "KA14KN0377",
    fuelType: "Petrol",
    mileage: 9800,
    location: "Bangalore",
    status: "Available",
    color: "Gray",
  },
  {
    id: "12",
    brand: "Volkswagen",
    model: "Tiguan",
    year: 2022,
    regNo: "KA05GH3456",
    fuelType: "Diesel",
    mileage: 12000,
    location: "Bangalore",
    status: "Maintenance",
    color: "Silver",
  },
  // Bangalore Location - Audi
  {
    id: "13",
    brand: "Audi",
    model: "A6",
    year: 2019,
    regNo: "KA02MN9012",
    fuelType: "Diesel",
    mileage: 35000,
    location: "Bangalore",
    status: "Available",
    color: "Black",
  },

  // VGTAP Location - Volkswagen
  {
    id: "14",
    brand: "Volkswagen",
    model: "Ameo",
    year: 2017,
    regNo: "MH14FS7324",
    fuelType: "Diesel",
    mileage: 38000,
    location: "VGTAP",
    status: "Available",
    color: "Silver",
  },
  {
    id: "15",
    brand: "Volkswagen",
    model: "Vento",
    year: 2018,
    regNo: "MH12EF7890",
    fuelType: "Petrol",
    mileage: 35000,
    location: "VGTAP",
    status: "Available",
    color: "Blue",
  },
];

/**
 * Custom hook for vehicle data management and operations.
 * Provides CRUD operations for vehicle fleet management.
 */
export function useVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(mockVehicles);
  const [isLoading, setIsLoading] = useState(false);

  // Simulate async loading on first mount
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  /**
   * Add a new vehicle to the fleet
   */
  const addVehicle = (vehicle: Omit<Vehicle, "id">) => {
    const newVehicle: Vehicle = {
      ...vehicle,
      id: (vehicles.length + 1).toString(),
    };
    setVehicles((prev) => [...prev, newVehicle]);
    return newVehicle;
  };

  /**
   * Update an existing vehicle
   */
  const updateVehicle = (id: string, updates: Partial<Vehicle>) => {
    setVehicles((prev) =>
      prev.map((vehicle) =>
        vehicle.id === id ? { ...vehicle, ...updates } : vehicle
      )
    );
  };

  /**
   * Remove a vehicle from the fleet
   */
  const deleteVehicle = (id: string) => {
    setVehicles((prev) => prev.filter((vehicle) => vehicle.id !== id));
  };

  /**
   * Get vehicles by location
   */
  const getVehiclesByLocation = (location: AcademyLocation) => {
    return vehicles.filter((vehicle) => vehicle.location === location);
  };

  /**
   * Get available vehicles by location
   */
  const getAvailableVehiclesByLocation = (location: AcademyLocation) => {
    return vehicles.filter(
      (vehicle) => vehicle.location === location && vehicle.status === "Available"
    );
  };

  /**
   * Get vehicles by status
   */
  const getVehiclesByStatus = (status: Vehicle["status"]) => {
    return vehicles.filter((vehicle) => vehicle.status === status);
  };

  /**
   * Get vehicle analytics
   */
  const getVehicleAnalytics = () => {
    const totalVehicles = vehicles.length;
    const availableVehicles = vehicles.filter(
      (v) => v.status === "Available"
    ).length;
    const inUseVehicles = vehicles.filter((v) => v.status === "In Use").length;
    const maintenanceVehicles = vehicles.filter(
      (v) => v.status === "Maintenance"
    ).length;

    return {
      totalVehicles,
      availableVehicles,
      inUseVehicles,
      maintenanceVehicles,
      utilizationRate: (inUseVehicles / totalVehicles) * 100,
    };
  };

  /**
   * Get vehicles grouped by brand
   */
  const getVehiclesByBrand = () => {
    return vehicles.reduce((acc, vehicle) => {
      if (!acc[vehicle.brand]) {
        acc[vehicle.brand] = [];
      }
      acc[vehicle.brand].push(vehicle);
      return acc;
    }, {} as Record<string, Vehicle[]>);
  };

  return {
    vehicles,
    isLoading,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    getVehiclesByLocation,
    getAvailableVehiclesByLocation,
    getVehiclesByStatus,
    getVehicleAnalytics,
    getVehiclesByBrand,
  };
}

export default useVehicles;