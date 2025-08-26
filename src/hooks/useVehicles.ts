// src/hooks/useVehicles.ts

import { useState, useEffect } from "react";

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  licensePlate: string;
  fuelType: string;
  mileage: number;
  location: string;
  status: "Available" | "In Use" | "Maintenance";
  color: string;
}

const mockVehicles: Vehicle[] = [
  // Skoda
  {
    id: "1",
    brand: "Skoda",
    model: "Octavia",
    year: 2022,
    licensePlate: "MH12 AB 1234",
    fuelType: "Petrol",
    mileage: 15000,
    location: "Mumbai",
    status: "Available",
    color: "White",
  },
  {
    id: "2",
    brand: "Skoda",
    model: "Superb",
    year: 2020,
    licensePlate: "KA01 BB 9090",
    fuelType: "Petrol",
    mileage: 30000,
    location: "Bengaluru",
    status: "Maintenance",
    color: "Silver",
  },
  {
    id: "3",
    brand: "Skoda",
    model: "Kushaq",
    year: 2023,
    licensePlate: "MH14 KL 2233",
    fuelType: "Petrol",
    mileage: 7000,
    location: "Pune",
    status: "In Use",
    color: "Red",
  },
  {
    id: "4",
    brand: "Skoda",
    model: "Slavia",
    year: 2021,
    licensePlate: "MH14JX5906",
    fuelType: "Diesel",
    mileage: 18000,
    location: "Pune",
    status: "Available",
    color: "Blue",
  },

  // Volkswagen
  {
    id: "5",
    brand: "Volkswagen",
    model: "Polo",
    year: 2021,
    licensePlate: "MH14 XY 5678",
    fuelType: "Diesel",
    mileage: 22000,
    location: "Pune",
    status: "In Use",
    color: "Red",
  },
  {
    id: "6",
    brand: "Volkswagen",
    model: "Tiguan",
    year: 2022,
    licensePlate: "GJ01 CC 4455",
    fuelType: "Diesel",
    mileage: 12000,
    location: "Ahmedabad",
    status: "Available",
    color: "Blue",
  },
  {
    id: "7",
    brand: "Volkswagen",
    model: "Vento",
    year: 2019,
    licensePlate: "KA05 VW 3344",
    fuelType: "Petrol",
    mileage: 40000,
    location: "Bengaluru",
    status: "Maintenance",
    color: "Black",
  },
  {
    id: "8",
    brand: "Volkswagen",
    model: "Passat",
    year: 2020,
    licensePlate: "RJ14 VW 9988",
    fuelType: "Diesel",
    mileage: 28000,
    location: "Jaipur",
    status: "Available",
    color: "Grey",
  },
  {
    id: "9",
    brand: "Volkswagen",
    model: "Taigun",
    year: 2023,
    licensePlate: "DL2C VW 5566",
    fuelType: "Petrol",
    mileage: 6000,
    location: "Delhi",
    status: "In Use",
    color: "White",
  },

  // Audi
  {
    id: "10",
    brand: "Audi",
    model: "Q7",
    year: 2023,
    licensePlate: "DL3C AA 4321",
    fuelType: "Petrol",
    mileage: 5000,
    location: "Delhi",
    status: "Available",
    color: "Black",
  },
  {
    id: "11",
    brand: "Audi",
    model: "A4",
    year: 2021,
    licensePlate: "TN10 DD 7788",
    fuelType: "Petrol",
    mileage: 18000,
    location: "Chennai",
    status: "In Use",
    color: "Grey",
  },
  {
    id: "12",
    brand: "Audi",
    model: "Q5",
    year: 2022,
    licensePlate: "MH01 AU 4455",
    fuelType: "Diesel",
    mileage: 14000,
    location: "Mumbai",
    status: "Available",
    color: "Blue",
  },
  {
    id: "13",
    brand: "Audi",
    model: "A6",
    year: 2020,
    licensePlate: "KL07 AU 7788",
    fuelType: "Petrol",
    mileage: 26000,
    location: "Kochi",
    status: "Maintenance",
    color: "White",
  },
  {
    id: "14",
    brand: "Audi",
    model: "E-tron",
    year: 2023,
    licensePlate: "HR26 AU 1122",
    fuelType: "Electric",
    mileage: 3000,
    location: "Gurgaon",
    status: "Available",
    color: "Silver",
  },
  {
    id: "15",
    brand: "Audi",
    model: "RS5",
    year: 2022,
    licensePlate: "WB20 RS 4455",
    fuelType: "Petrol",
    mileage: 10000,
    location: "Kolkata",
    status: "In Use",
    color: "Red",
  },
];

export function useVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    // simulate API call
    setTimeout(() => {
      setVehicles(mockVehicles);
    }, 500);
  }, []);

  return { vehicles };
}
