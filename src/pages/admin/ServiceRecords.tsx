import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, Calendar, Wrench, AlertTriangle, CheckCircle, Clock, Car, User, FileText, Download, Eye, Shield, AlertCircle, MapPin } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useLocationFilter } from '@/hooks/useLocationFilter';
import { useNotifications } from '@/contexts/NotificationContext';
import { getLocationName } from '@/constants/locations';
import { StatCard } from '@/components/dashboard/StatCard';
import AddServiceRecordDialog from '@/components/admin/AddServiceRecordDialog';
import { format } from 'date-fns';

interface VehicleRecord {
  id: string;
  academyLocation: string;
  brand: string;
  model: string;
  name: string;
  vehicleRegNo: string;
  vinNo?: string;
  insuranceValidityDate?: string;
  insuranceStatus: 'Valid' | 'Expired' | 'NA';
  pucValidityDate?: string;
  pucStatus: 'Valid' | 'Expired' | 'NA';
  dateDecommissioned?: string;
  allocatedTrainer: string;
  remarks: string;
  costIncurred?: number;
  modelYear: number;
  fuel: string;
  capacity: string;
  gearbox: string;
  trainingSchedule?: {
    from: string;
    to: string;
    training: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

const STORAGE_KEY = 'app_vehicle_records';

// Sample data from user's request
const getInitialVehicleRecords = (): VehicleRecord[] => {
  return [
    {
      id: '1',
      academyLocation: 'Pune',
      brand: 'VW',
      model: 'Vento',
      name: 'POLO A05 1.5 HIGHL 77 TDI D7F',
      vehicleRegNo: 'MH14EY0185',
      vinNo: 'MEXD1560XFT089626',
      insuranceValidityDate: '2026-06-30',
      insuranceStatus: 'Valid',
      pucValidityDate: '2025-09-15',
      pucStatus: 'Valid',
      allocatedTrainer: 'Mahesh Deshmukh',
      remarks: '',
      costIncurred: 0,
      modelYear: 2015,
      fuel: 'TDI',
      capacity: '1,5',
      gearbox: 'DQ200-7F',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '2',
      academyLocation: 'Pune',
      brand: 'VW',
      model: 'Passat',
      name: 'PASSAT Sed. HL 130 TDID6F',
      vehicleRegNo: 'MH14GN0436',
      vinNo: 'WVWK163CZHA000013',
      insuranceValidityDate: '2026-06-30',
      insuranceStatus: 'Valid',
      pucValidityDate: '2025-09-23',
      pucStatus: 'Valid',
      allocatedTrainer: 'Ranjeet Thorat',
      remarks: '',
      costIncurred: 0,
      modelYear: 2017,
      fuel: 'TDI',
      capacity: '2,0',
      gearbox: 'DQ250-6F',
      trainingSchedule: {
        from: 'Monday',
        to: 'Friday',
        training: 'Diagnostics'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '3',
      academyLocation: 'Pune',
      brand: 'VW',
      model: 'Tiguan AllSpace',
      name: 'Tiguan L 2.0 HL GT140TSI D7A',
      vehicleRegNo: 'MH14JH4308',
      vinNo: 'WVGZZZ5NZLM088776',
      insuranceValidityDate: '2025-12-09',
      insuranceStatus: 'Valid',
      pucValidityDate: '2025-09-15',
      pucStatus: 'Valid',
      allocatedTrainer: 'Ranjeet Thorat',
      remarks: 'Battery required. Under process',
      costIncurred: 7559.48,
      modelYear: 2020,
      fuel: 'TFSI',
      capacity: '2,0',
      gearbox: 'DQ381-7A',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '4',
      academyLocation: 'Pune',
      brand: 'VW',
      model: 'T Roc',
      name: 'T-ROC 1.5 GT110 TSID7F',
      vehicleRegNo: 'MH14JH4307',
      vinNo: 'WVGZZZA1ZLV079005',
      insuranceValidityDate: '2025-12-09',
      insuranceStatus: 'Valid',
      pucValidityDate: '2025-04-21',
      pucStatus: 'Expired',
      allocatedTrainer: 'Ranjeet Thorat',
      remarks: '',
      costIncurred: 0,
      modelYear: 2020,
      fuel: 'TSI ACT',
      capacity: '1,5',
      gearbox: 'DQ200-7F',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '5',
      academyLocation: 'Pune',
      brand: 'VW',
      model: 'Taigun',
      name: 'TAIGUN GT PLUS 1.5L TSI 110kW DSG',
      vehicleRegNo: 'MH14JU1691',
      vinNo: 'MEXH21CW9NT000126',
      insuranceValidityDate: '2025-10-09',
      insuranceStatus: 'Valid',
      pucValidityDate: '2025-09-15',
      pucStatus: 'Valid',
      allocatedTrainer: 'Ranjeet Thorat',
      remarks: '',
      costIncurred: 0,
      modelYear: 2022,
      fuel: 'TSI ACT',
      capacity: '1,5',
      gearbox: 'DQ200-7F',
      trainingSchedule: {
        from: 'Monday',
        to: 'Friday',
        training: 'Diagnostics'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '6',
      academyLocation: 'Pune',
      brand: 'SA',
      model: 'Superb',
      name: 'SUPERB GrtSTY TS132/1.8M6F',
      vehicleRegNo: 'MH20DV1650',
      vinNo: 'TMBBLANP5GA300004',
      insuranceValidityDate: '2026-01-29',
      insuranceStatus: 'Valid',
      pucValidityDate: '2026-02-04',
      pucStatus: 'Valid',
      allocatedTrainer: 'Ranjeet Thorat',
      remarks: '',
      costIncurred: 0,
      modelYear: 2016,
      fuel: 'FSI  turbo',
      capacity: '1,8',
      gearbox: 'MQ350-6F',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '7',
      academyLocation: 'Pune',
      brand: 'SA',
      model: 'Rapid',
      name: 'RAPID STY TD81/1.5 A7F',
      vehicleRegNo: 'MH20EE2704',
      vinNo: '',
      insuranceValidityDate: '2026-06-30',
      insuranceStatus: 'Valid',
      pucValidityDate: '2025-09-15',
      pucStatus: 'Valid',
      allocatedTrainer: 'Mahesh Deshmukh',
      remarks: '',
      costIncurred: 0,
      modelYear: 2017,
      fuel: 'TDI',
      capacity: '1,5',
      gearbox: 'DQ200-7F',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '8',
      academyLocation: 'Pune',
      brand: 'SA',
      model: 'Octavia',
      name: 'OCTAVIA ELE TS132/1.8A7F',
      vehicleRegNo: 'MH20DJ2353',
      vinNo: '',
      insuranceValidityDate: '2026-06-30',
      insuranceStatus: 'Valid',
      pucValidityDate: '2025-09-15',
      pucStatus: 'Valid',
      allocatedTrainer: 'Sanjay Borade',
      remarks: '',
      costIncurred: 0,
      modelYear: 2014,
      fuel: 'FSI  turbo',
      capacity: '1,8',
      gearbox: 'DQ200-7F',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '9',
      academyLocation: 'Pune',
      brand: 'SA',
      model: 'Kushaq',
      name: 'Kushaq Style 1.0TSIAT',
      vehicleRegNo: 'MH14JR2609',
      vinNo: '',
      insuranceValidityDate: '2026-06-30',
      insuranceStatus: 'Valid',
      pucValidityDate: '2025-09-15',
      pucStatus: 'Valid',
      allocatedTrainer: 'Sanjay Borade',
      remarks: '',
      costIncurred: 0,
      modelYear: 2021,
      fuel: 'TSI',
      capacity: '1,0',
      gearbox: 'AQ250-6F',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '10',
      academyLocation: 'Pune',
      brand: 'SA',
      model: 'Slavia',
      name: 'SlaviaStyle1.5TSIAT',
      vehicleRegNo: 'MH14JX5905',
      vinNo: '',
      insuranceValidityDate: '2026-06-30',
      insuranceStatus: 'Valid',
      pucValidityDate: '2025-09-15',
      pucStatus: 'Valid',
      allocatedTrainer: 'Sanjay Borade',
      remarks: '',
      costIncurred: 0,
      modelYear: 2022,
      fuel: 'TSI',
      capacity: '1,5',
      gearbox: 'DQ200-7F',
      trainingSchedule: {
        from: 'Thursday',
        to: 'Thursday',
        training: 'Advance Transmission'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '11',
      academyLocation: 'Pune',
      brand: 'AU',
      model: 'A4',
      name: 'A4 Sedan 1.4 R4110 A7',
      vehicleRegNo: 'MH14GH0382',
      vinNo: 'WAUZKGF43HY700402',
      insuranceValidityDate: '2026-06-30',
      insuranceStatus: 'Valid',
      pucValidityDate: '2025-09-15',
      pucStatus: 'Valid',
      allocatedTrainer: 'Dattaprasad Duble',
      remarks: '',
      costIncurred: 0,
      modelYear: 2017,
      fuel: 'FSI',
      capacity: '1,4',
      gearbox: 'DL382-7F',
      trainingSchedule: {
        from: 'Monday',
        to: 'Friday',
        training: 'Advance Engines'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '12',
      academyLocation: 'Pune',
      brand: 'AU',
      model: 'Q3',
      name: 'Q3 TDI quatt.2.0 I4135 A7',
      vehicleRegNo: 'MH14GH0381',
      vinNo: '',
      insuranceValidityDate: '2026-06-30',
      insuranceStatus: 'Valid',
      pucValidityDate: '2025-09-15',
      pucStatus: 'Valid',
      allocatedTrainer: 'Yogesh Sundaramurthy',
      remarks: '',
      costIncurred: 0,
      modelYear: 2017,
      fuel: 'TDI',
      capacity: '2,0',
      gearbox: 'DQ500-7A',
      trainingSchedule: {
        from: 'Monday',
        to: 'Friday',
        training: 'Advance Engines'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '13',
      academyLocation: 'Pune',
      brand: 'AU',
      model: 'A6',
      name: 'A6 Sal. 1.8 I4140 A7',
      vehicleRegNo: 'MH14GH0873',
      vinNo: '',
      insuranceValidityDate: '2026-06-30',
      insuranceStatus: 'Valid',
      pucValidityDate: '2025-09-15',
      pucStatus: 'Valid',
      allocatedTrainer: 'Yogesh Sundaramurthy',
      remarks: '',
      costIncurred: 0,
      modelYear: 2017,
      fuel: 'FSI+MPI',
      capacity: '1.8',
      gearbox: 'DL382-7F',
      trainingSchedule: {
        from: 'Monday',
        to: 'Friday',
        training: 'Advance Engines'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '14',
      academyLocation: 'Pune',
      brand: 'AU',
      model: 'Q7',
      name: 'Q7 quat. TDI 3.0 V6183 A8',
      vehicleRegNo: 'MH14GH0380',
      vinNo: '',
      insuranceValidityDate: '2026-06-30',
      insuranceStatus: 'Valid',
      pucValidityDate: '2025-09-15',
      pucStatus: 'Valid',
      allocatedTrainer: 'Dattaprasad Duble',
      remarks: '',
      costIncurred: 0,
      modelYear: 2017,
      fuel: 'TDI',
      capacity: '3,0',
      gearbox: 'AL552-8Q',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '15',
      academyLocation: 'Pune',
      brand: 'AU',
      model: 'Q5',
      name: 'Q5 quat. TDI2.0 I4140/DE5A7',
      vehicleRegNo: 'MH14GY1270',
      vinNo: '',
      insuranceValidityDate: '2026-06-30',
      insuranceStatus: 'Valid',
      pucValidityDate: '2025-09-15',
      pucStatus: 'Valid',
      allocatedTrainer: 'Dattaprasad Duble',
      remarks: '',
      costIncurred: 0,
      modelYear: 2017,
      fuel: 'TDI',
      capacity: '2,0',
      gearbox: 'DL382-7F',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '16',
      academyLocation: 'Pune',
      brand: 'AU',
      model: 'A6',
      name: 'A6  Sedan 2.0 R4180 A7',
      vehicleRegNo: 'MH14JM8226',
      vinNo: '',
      insuranceValidityDate: '2026-06-30',
      insuranceStatus: 'Valid',
      pucValidityDate: '2025-09-15',
      pucStatus: 'Valid',
      allocatedTrainer: 'Yogesh Sundaramurthy',
      remarks: '',
      costIncurred: 0,
      modelYear: 2019,
      fuel: 'TFSI',
      capacity: '2,0',
      gearbox: 'DL382-7F',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '17',
      academyLocation: 'Pune',
      brand: 'VW',
      model: 'Virtus',
      name: 'VIRTUS 1.0L TSI 85kW AT Topline',
      vehicleRegNo: 'MH14KN0378',
      vinNo: '',
      insuranceValidityDate: '2025-11-13',
      insuranceStatus: 'Valid',
      pucValidityDate: '2025-04-21',
      pucStatus: 'Expired',
      allocatedTrainer: 'Sanjay Borade',
      remarks: 'Breakdown - Vehicle not moving',
      costIncurred: 0,
      modelYear: 2022,
      fuel: 'TSI',
      capacity: '1,0',
      gearbox: 'AQ250-6F',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '18',
      academyLocation: 'Pune',
      brand: 'AU',
      model: 'e-Tron',
      name: 'e-tron Spb 300',
      vehicleRegNo: 'MH14JR3793',
      vinNo: '',
      insuranceValidityDate: '2026-08-01',
      insuranceStatus: 'Valid',
      pucValidityDate: '',
      pucStatus: 'NA',
      allocatedTrainer: 'Dattaprasad Duble',
      remarks: '',
      costIncurred: 0,
      modelYear: 2021,
      fuel: 'Electric',
      capacity: 'NA',
      gearbox: 'NA',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '19',
      academyLocation: 'Pune',
      brand: 'SA',
      model: 'Kodiaq',
      name: 'KODIAQ STY TD110/2.0A7A',
      vehicleRegNo: 'MH20EJ0362',
      vinNo: '',
      insuranceValidityDate: '2026-06-30',
      insuranceStatus: 'Valid',
      pucValidityDate: '2025-09-15',
      pucStatus: 'Valid',
      allocatedTrainer: 'Atmaram Desai',
      remarks: '',
      costIncurred: 1178.80,
      modelYear: 2020,
      fuel: 'TDI',
      capacity: '2,0',
      gearbox: 'DQ500-7A',
      trainingSchedule: {
        from: 'Thursday',
        to: 'Thursday',
        training: 'Advance Transmission'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '20',
      academyLocation: 'Pune',
      brand: 'SA',
      model: 'Slavia',
      name: 'Slavia 1.0/85kW TSI AT',
      vehicleRegNo: 'NA',
      vinNo: '',
      insuranceValidityDate: '2026-06-30',
      insuranceStatus: 'Valid',
      pucValidityDate: '2025-09-15',
      pucStatus: 'Valid',
      allocatedTrainer: 'Atmaram Desai',
      remarks: 'Battery required. Under proces',
      costIncurred: 5208.12,
      modelYear: 2023,
      fuel: 'TSI',
      capacity: '1,0',
      gearbox: 'AQ250-6F',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '21',
      academyLocation: 'Pune',
      brand: 'VW',
      model: 'Virtus',
      name: 'Virtus 1.6/81kW MPI AT',
      vehicleRegNo: 'NA',
      vinNo: '',
      insuranceValidityDate: '2026-06-30',
      insuranceStatus: 'Valid',
      pucValidityDate: '2025-09-15',
      pucStatus: 'Valid',
      allocatedTrainer: 'Mahesh Deshmukh',
      remarks: 'Battery required. Under proces',
      costIncurred: 4037.84,
      modelYear: 2022,
      fuel: 'MPI',
      capacity: '1,6',
      gearbox: 'AQ250-6F',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '22',
      academyLocation: 'Pune',
      brand: 'VW',
      model: 'Virtus',
      name: 'Virtus 1.5/110kW TSI AT',
      vehicleRegNo: 'NA',
      vinNo: '',
      insuranceValidityDate: '2026-06-30',
      insuranceStatus: 'Valid',
      pucValidityDate: '2025-09-15',
      pucStatus: 'Valid',
      allocatedTrainer: 'Mahesh Deshmukh',
      remarks: 'Battery required. Under proces',
      costIncurred: 6269.81,
      modelYear: 2023,
      fuel: 'TSI',
      capacity: '1,5',
      gearbox: 'DQ200-7F',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '23',
      academyLocation: 'Pune',
      brand: 'SA',
      model: 'Kylaq',
      name: 'Kylaq Prestige 1.0 TSI MT',
      vehicleRegNo: 'MH14MC5288',
      vinNo: '',
      insuranceValidityDate: '2026-06-30',
      insuranceStatus: 'Valid',
      pucValidityDate: '2025-09-15',
      pucStatus: 'Valid',
      allocatedTrainer: 'Atmaram Desai',
      remarks: '',
      costIncurred: 0,
      modelYear: 2025,
      fuel: 'TSI',
      capacity: '1,0',
      gearbox: 'MQ200-6F',
      trainingSchedule: {
        from: 'Wednesday',
        to: 'Wednesday',
        training: 'Advance Transmission'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    // NCR Location Records
    {
      id: '24',
      academyLocation: 'NCR',
      brand: 'VW',
      model: 'Virtus',
      name: 'VIRTUS 1.0L TSI 85kW AT Topline',
      vehicleRegNo: 'DL14KN0375',
      vinNo: '',
      insuranceValidityDate: '2026-08-15',
      insuranceStatus: 'Valid',
      pucValidityDate: '2025-10-20',
      pucStatus: 'Valid',
      allocatedTrainer: 'Rahul Verma',
      remarks: '',
      costIncurred: 0,
      modelYear: 2022,
      fuel: 'TSI',
      capacity: '1,0',
      gearbox: 'AQ250-6F',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '25',
      academyLocation: 'NCR',
      brand: 'VW',
      model: 'Polo',
      name: 'POLO GT TSI',
      vehicleRegNo: 'DL08CD5678',
      vinNo: '',
      insuranceValidityDate: '2026-05-10',
      insuranceStatus: 'Valid',
      pucValidityDate: '2024-12-15',
      pucStatus: 'Expired',
      allocatedTrainer: 'Sneha Sharma',
      remarks: '',
      costIncurred: 1250.00,
      modelYear: 2021,
      fuel: 'Petrol',
      capacity: '1,0',
      gearbox: 'DQ200-7F',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '26',
      academyLocation: 'NCR',
      brand: 'SA',
      model: 'Slavia',
      name: 'SlaviaStyle1.5TSIAT',
      vehicleRegNo: 'DL09OP3456',
      vinNo: '',
      insuranceValidityDate: '2026-11-30',
      insuranceStatus: 'Valid',
      pucValidityDate: '2025-08-25',
      pucStatus: 'Valid',
      allocatedTrainer: 'Rahul Verma',
      remarks: '',
      costIncurred: 0,
      modelYear: 2023,
      fuel: 'TSI',
      capacity: '1,5',
      gearbox: 'DQ200-7F',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '27',
      academyLocation: 'NCR',
      brand: 'AU',
      model: 'A3',
      name: 'A3 Sedan 1.4 R4110 A7',
      vehicleRegNo: 'DL10AB3456',
      vinNo: '',
      insuranceValidityDate: '2026-09-20',
      insuranceStatus: 'Valid',
      pucValidityDate: '2025-06-10',
      pucStatus: 'Valid',
      allocatedTrainer: 'Sneha Sharma',
      remarks: '',
      costIncurred: 3200.50,
      modelYear: 2022,
      fuel: 'FSI',
      capacity: '1,4',
      gearbox: 'DL382-7F',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    // Bangalore Location Records
    {
      id: '28',
      academyLocation: 'Bangalore',
      brand: 'VW',
      model: 'Virtus',
      name: 'VIRTUS 1.0L TSI 85kW AT Topline',
      vehicleRegNo: 'KA14KN0377',
      vinNo: '',
      insuranceValidityDate: '2026-07-25',
      insuranceStatus: 'Valid',
      pucValidityDate: '2025-09-30',
      pucStatus: 'Valid',
      allocatedTrainer: 'Kavya Reddy',
      remarks: '',
      costIncurred: 0,
      modelYear: 2022,
      fuel: 'TSI',
      capacity: '1,0',
      gearbox: 'AQ250-6F',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '29',
      academyLocation: 'Bangalore',
      brand: 'VW',
      model: 'Tiguan',
      name: 'Tiguan AllSpace',
      vehicleRegNo: 'KA05GH3456',
      vinNo: '',
      insuranceValidityDate: '2026-03-15',
      insuranceStatus: 'Valid',
      pucValidityDate: '2024-11-20',
      pucStatus: 'Expired',
      allocatedTrainer: 'Arjun Nair',
      remarks: '',
      costIncurred: 4500.00,
      modelYear: 2022,
      fuel: 'Diesel',
      capacity: '2,0',
      gearbox: 'DQ500-7A',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '30',
      academyLocation: 'Bangalore',
      brand: 'AU',
      model: 'A6',
      name: 'A6 Sal. 1.8 I4140 A7',
      vehicleRegNo: 'KA02MN9012',
      vinNo: '',
      insuranceValidityDate: '2026-04-10',
      insuranceStatus: 'Valid',
      pucValidityDate: '2025-10-05',
      pucStatus: 'Valid',
      allocatedTrainer: 'Kavya Reddy',
      remarks: '',
      costIncurred: 0,
      modelYear: 2019,
      fuel: 'FSI+MPI',
      capacity: '1.8',
      gearbox: 'DL382-7F',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '31',
      academyLocation: 'Bangalore',
      brand: 'SA',
      model: 'Kushaq',
      name: 'Kushaq Style 1.0TSIAT',
      vehicleRegNo: 'KA06EF1234',
      vinNo: '',
      insuranceValidityDate: '2027-01-15',
      insuranceStatus: 'Valid',
      pucValidityDate: '2025-12-20',
      pucStatus: 'Valid',
      allocatedTrainer: 'Arjun Nair',
      remarks: '',
      costIncurred: 0,
      modelYear: 2023,
      fuel: 'TSI',
      capacity: '1,0',
      gearbox: 'AQ250-6F',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '32',
      academyLocation: 'Bangalore',
      brand: 'AU',
      model: 'Q7',
      name: 'Q7 quat. TDI 3.0 V6183 A8',
      vehicleRegNo: 'KA07GH5678',
      vinNo: '',
      insuranceValidityDate: '2026-06-30',
      insuranceStatus: 'Valid',
      pucValidityDate: '2025-08-15',
      pucStatus: 'Valid',
      allocatedTrainer: 'Kavya Reddy',
      remarks: '',
      costIncurred: 6800.25,
      modelYear: 2020,
      fuel: 'TDI',
      capacity: '3,0',
      gearbox: 'AL552-8Q',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    // VGTAP Location Records
    {
      id: '33',
      academyLocation: 'VGTAP',
      brand: 'VW',
      model: 'Ameo',
      name: 'AMEO TDI',
      vehicleRegNo: 'MH14FS7324',
      vinNo: '',
      insuranceValidityDate: '2026-05-20',
      insuranceStatus: 'Valid',
      pucValidityDate: '2025-07-10',
      pucStatus: 'Valid',
      allocatedTrainer: 'Amit Desai',
      remarks: '',
      costIncurred: 0,
      modelYear: 2017,
      fuel: 'Diesel',
      capacity: '1,5',
      gearbox: 'DQ200-7F',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '34',
      academyLocation: 'VGTAP',
      brand: 'VW',
      model: 'Vento',
      name: 'VENTO TSI',
      vehicleRegNo: 'MH12EF7890',
      vinNo: '',
      insuranceValidityDate: '2026-08-30',
      insuranceStatus: 'Valid',
      pucValidityDate: '2024-10-25',
      pucStatus: 'Expired',
      allocatedTrainer: 'Meera Joshi',
      remarks: '',
      costIncurred: 2100.00,
      modelYear: 2018,
      fuel: 'Petrol',
      capacity: '1,2',
      gearbox: 'DQ200-7F',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '35',
      academyLocation: 'VGTAP',
      brand: 'SA',
      model: 'Rapid',
      name: 'RAPID STY TD81/1.5 A7F',
      vehicleRegNo: 'MH15AB1234',
      vinNo: '',
      insuranceValidityDate: '2026-10-15',
      insuranceStatus: 'Valid',
      pucValidityDate: '2025-09-20',
      pucStatus: 'Valid',
      allocatedTrainer: 'Amit Desai',
      remarks: '',
      costIncurred: 0,
      modelYear: 2019,
      fuel: 'TDI',
      capacity: '1,5',
      gearbox: 'DQ200-7F',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '36',
      academyLocation: 'VGTAP',
      brand: 'AU',
      model: 'Q5',
      name: 'Q5 quat. TDI2.0 I4140/DE5A7',
      vehicleRegNo: 'MH16CD5678',
      vinNo: '',
      insuranceValidityDate: '2026-12-20',
      insuranceStatus: 'Valid',
      pucValidityDate: '2025-11-15',
      pucStatus: 'Valid',
      allocatedTrainer: 'Meera Joshi',
      remarks: '',
      costIncurred: 5400.75,
      modelYear: 2021,
      fuel: 'TDI',
      capacity: '2,0',
      gearbox: 'DL382-7F',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
};

// Get records from localStorage or use initial data
const getVehicleRecords = (): VehicleRecord[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (err) {
    console.error('Error loading vehicle records from localStorage:', err);
  }
  
  // Initialize with sample data
  const initialRecords = getInitialVehicleRecords();
  saveVehicleRecords(initialRecords);
  return initialRecords;
};

// Save records to localStorage
const saveVehicleRecords = (records: VehicleRecord[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('vehicle-records-updated'));
  } catch (err) {
    console.error('Error saving vehicle records to localStorage:', err);
  }
};

export default function ServiceRecords() {
  const { user } = useAuth();
  const { filterByLocation } = useLocationFilter();
  const { notifyMaintenanceRequired } = useNotifications();
  const { toast } = useToast();
  
  // Load records from localStorage
  const [records, setRecords] = useState<VehicleRecord[]>(() => {
    const allRecords = getVehicleRecords();
    return filterByLocation(allRecords.map(r => ({
      ...r,
      location: r.academyLocation
    }))) as VehicleRecord[];
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [brandFilter, setBrandFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<VehicleRecord | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  
  // Get admin's location (fixed, cannot be changed)
  const adminLocation = user?.location ? (user.location === 'PTC' ? 'Pune' : user.location === 'BLR' ? 'Bangalore' : user.location) : 'Pune';

  // Load records dynamically
  const loadRecords = () => {
    const allRecords = getVehicleRecords();
    const locationFiltered = filterByLocation(allRecords.map(r => ({
      ...r,
      location: r.academyLocation
    }))) as VehicleRecord[];
    setRecords(prev => {
      // Only update if records actually changed
      const prevIds = new Set(prev.map(r => r.id));
      const newIds = new Set(locationFiltered.map(r => r.id));
      const hasChanged = prev.length !== locationFiltered.length ||
        !Array.from(newIds).every(id => prevIds.has(id)) ||
        locationFiltered.some(r => {
          const prevR = prev.find(p => p.id === r.id);
          return !prevR || JSON.stringify(prevR) !== JSON.stringify(r);
        });
      
      if (hasChanged) {
        return locationFiltered;
      }
      return prev;
    });
  };

  // Initial load
  useEffect(() => {
    loadRecords();
  }, []);

  // Save to localStorage whenever records change (merge with all records from other locations)
  useEffect(() => {
    const allRecords = getVehicleRecords();
    const recordMap = new Map(allRecords.map(r => [r.id, r]));
    
    // Update with current location-filtered records
    records.forEach(record => {
      recordMap.set(record.id, record);
    });
    
    const mergedRecords = Array.from(recordMap.values());
    saveVehicleRecords(mergedRecords);
  }, [records]);

  // Filter records by location when user location changes
  useEffect(() => {
    loadRecords();
  }, [user?.location, filterByLocation]);

  // Listen for storage changes (cross-tab updates)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY || e.key === 'app_fleet_vehicles') {
        loadRecords();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Reload when page becomes visible (handles same-tab updates)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadRecords();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Reload when window gains focus (handles same-tab updates)
  useEffect(() => {
    const handleFocus = () => {
      loadRecords();
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // Periodic check for updates (every 5 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      loadRecords();
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Listen for custom vehicle-records-updated event
  useEffect(() => {
    const handleVehicleRecordsUpdate = () => {
      loadRecords();
    };
    
    window.addEventListener('vehicle-records-updated', handleVehicleRecordsUpdate);
    return () => window.removeEventListener('vehicle-records-updated', handleVehicleRecordsUpdate);
  }, []);

  const filteredRecords = records.filter(record => {
    const matchesSearch = record.vehicleRegNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.allocatedTrainer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.model.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'insurance-expired' && record.insuranceStatus === 'Expired') ||
                         (statusFilter === 'puc-expired' && record.pucStatus === 'Expired') ||
                         (statusFilter === 'active' && record.insuranceStatus === 'Valid');
    
    // Location is already filtered by filterByLocation, so no need to filter again
    const matchesBrand = brandFilter === 'all' || record.brand === brandFilter;
    
    return matchesSearch && matchesStatus && matchesBrand;
  });

  // Calculate dynamic stats
  const stats = {
    totalVehicles: records.length,
    validInsurance: records.filter(r => r.insuranceStatus === 'Valid').length,
    expiredPuc: records.filter(r => r.pucStatus === 'Expired').length,
    totalCostIncurred: records.reduce((sum, record) => sum + (record.costIncurred || 0), 0),
  };

  // Handle adding new service record (updating existing vehicle record)
  const handleAddServiceRecord = (serviceData: {
    vehicleRegNo: string;
    costIncurred: number;
    serviceType: string;
    description: string;
    serviceDate: Date;
  }) => {
    // Find the vehicle record by registration number
    const vehicleRecord = records.find(r => r.vehicleRegNo === serviceData.vehicleRegNo);
    
    if (vehicleRecord) {
      // Update existing record with service information
      const updatedRecord: VehicleRecord = {
        ...vehicleRecord,
        costIncurred: (vehicleRecord.costIncurred || 0) + serviceData.costIncurred,
        remarks: vehicleRecord.remarks 
          ? `${vehicleRecord.remarks}\n${serviceData.serviceType}: ${serviceData.description} (${format(serviceData.serviceDate, 'MMM dd, yyyy')})`
          : `${serviceData.serviceType}: ${serviceData.description} (${format(serviceData.serviceDate, 'MMM dd, yyyy')})`,
        updatedAt: new Date().toISOString()
      };
      
      setRecords(prev => prev.map(r => 
        r.id === vehicleRecord.id ? updatedRecord : r
      ));
      
      toast({
        title: "Service Record Added",
        description: `Service record for ${serviceData.vehicleRegNo} has been added successfully.`,
      });
      
      // Check if maintenance is required based on service type or description
      const requiresMaintenance = serviceData.description.toLowerCase().includes('battery') ||
                                  serviceData.description.toLowerCase().includes('maintenance') ||
                                  serviceData.description.toLowerCase().includes('repair') ||
                                  serviceData.serviceType.toLowerCase().includes('repair');
      
      if (requiresMaintenance && vehicleRecord) {
        const vehicleName = `${vehicleRecord.brand} ${vehicleRecord.model} (${vehicleRecord.vehicleRegNo})`;
        notifyMaintenanceRequired(
          vehicleRecord.id,
          vehicleName,
          vehicleRecord.academyLocation,
          serviceData.description
        );
      }
    } else {
      toast({
        title: "Vehicle Not Found",
        description: `Vehicle with registration ${serviceData.vehicleRegNo} not found. Please add the vehicle first.`,
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = (recordId: string) => {
    const record = records.find(r => r.id === recordId);
    if (record) {
      setSelectedRecord(record);
      setIsDetailsDialogOpen(true);
    }
  };

  const handleDownloadReport = (recordId: string) => {
    setLoading(true);
    const record = records.find(r => r.id === recordId);
    
    if (record) {
      // Generate CSV report
      const csvData = [
        ['Vehicle Record Report'],
        [''],
        ['Registration Number', record.vehicleRegNo],
        ['Brand', record.brand],
        ['Model', record.model],
        ['Name', record.name],
        ['Fuel', record.fuel],
        ['Capacity', record.capacity],
        ['Gearbox', record.gearbox],
        ['Model Year', record.modelYear.toString()],
        ['Insurance Status', record.insuranceStatus],
        ['PUC Status', record.pucStatus],
        ['Allocated Trainer', record.allocatedTrainer],
        ['Cost Incurred', record.costIncurred?.toString() || '0'],
        ['Remarks', record.remarks],
      ];
      
      const csvContent = csvData.map(row => row.map(field => `"${field}"`).join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `vehicle_record_${record.vehicleRegNo}_${format(new Date(), 'yyyy-MM-dd')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
    
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Report Downloaded",
        description: `Vehicle report has been downloaded.`,
      });
    }, 500);
  };

  const getInsuranceStatusBadge = (status: string) => {
    return status === 'Valid' ? 
      <Badge variant="default" className="bg-green-600 text-white">Valid</Badge> :
      status === 'NA' ?
      <Badge variant="outline">N/A</Badge> :
      <Badge variant="destructive">Expired</Badge>;
  };

  const getPucStatusBadge = (status: string) => {
    if (status === 'NA') return <Badge variant="outline">N/A</Badge>;
    return status === 'Valid' ? 
      <Badge variant="default" className="bg-green-600 text-white">Valid</Badge> :
      <Badge variant="destructive">Expired</Badge>;
  };

  const uniqueLocations = [...new Set(records.map(r => r.academyLocation))];
  const uniqueBrands = [...new Set(records.map(r => r.brand))];
  
  const userLocationName = user?.location ? getLocationName(user.location) : 'Pune Training Center';

  return (
    <div className="space-y-6 animate-fade-in p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold">Vehicle Records</h1>
            <Badge variant="outline" className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {userLocationName}
            </Badge>
          </div>
          <p className="text-muted-foreground">Comprehensive vehicle management and compliance tracking</p>
        </div>
        <AddServiceRecordDialog 
          onAdd={handleAddServiceRecord} 
          vehicles={records.filter(r => r.academyLocation === adminLocation)}
          adminLocation={adminLocation}
        >
          <Button className="bg-gradient-primary hover:bg-primary-hover">
            <Plus className="h-4 w-4 mr-2" />
            Add Service Record
          </Button>
        </AddServiceRecordDialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Vehicles"
          value={stats.totalVehicles}
          description="All registered vehicles"
          icon={Car}
        />
        <StatCard
          title="Valid Insurance"
          value={stats.validInsurance}
          description="Vehicles with valid insurance"
          icon={Shield}
        />
        <StatCard
          title="Expired PUC"
          value={stats.expiredPuc}
          description="Vehicles with expired PUC"
          icon={AlertCircle}
        />
        <StatCard
          title="Cost Incurred"
          value={`₹${stats.totalCostIncurred.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          description="Total service costs"
          icon={FileText}
        />
      </div>

      {/* Filters */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Search & Filter</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by vehicle reg, name, trainer, brand, or model..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active (Valid Insurance)</SelectItem>
                <SelectItem value="insurance-expired">Insurance Expired</SelectItem>
                <SelectItem value="puc-expired">PUC Expired</SelectItem>
              </SelectContent>
            </Select>
            <Select value={brandFilter} onValueChange={setBrandFilter}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Filter by brand" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Brands</SelectItem>
                {uniqueBrands.map(brand => (
                  <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Vehicle Records Table */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle>Vehicle Records ({filteredRecords.length})</CardTitle>
          <CardDescription>Complete vehicle inventory with compliance status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            {filteredRecords.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Car className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No vehicle records found</p>
                <p className="text-sm mt-2">
                  {records.length === 0 
                    ? 'No vehicle records have been created yet.' 
                    : 'Try adjusting your search or filters.'}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Location</TableHead>
                    <TableHead>Vehicle Details</TableHead>
                    <TableHead>Registration</TableHead>
                    <TableHead>Insurance</TableHead>
                    <TableHead>PUC</TableHead>
                    <TableHead>Trainer</TableHead>
                    <TableHead>Cost & Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{record.academyLocation}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{record.brand} {record.model}</div>
                          <div className="text-sm text-muted-foreground">{record.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {record.fuel} • {record.capacity}L • {record.modelYear}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{record.vehicleRegNo || 'Unregistered'}</div>
                          {record.vinNo && (
                            <div className="text-xs text-muted-foreground">{record.vinNo}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          {getInsuranceStatusBadge(record.insuranceStatus)}
                          {record.insuranceValidityDate && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Till: {format(new Date(record.insuranceValidityDate), 'MMM dd, yyyy')}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          {getPucStatusBadge(record.pucStatus)}
                          {record.pucValidityDate && record.pucStatus !== 'NA' && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Till: {format(new Date(record.pucValidityDate), 'MMM dd, yyyy')}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{record.allocatedTrainer || 'Unassigned'}</div>
                          {record.trainingSchedule && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {record.trainingSchedule.from} - {record.trainingSchedule.to}<br/>
                              {record.trainingSchedule.training}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {record.costIncurred && record.costIncurred > 0 && (
                            <div className="font-medium text-red-600 mb-1">
                              ₹{record.costIncurred.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                          )}
                          {record.remarks && (
                            <div className="text-xs text-muted-foreground mt-1 max-w-[200px] truncate" title={record.remarks}>
                              {record.remarks.split('\n')[0]}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(record.id)}
                            className="h-8 w-8 p-0"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadReport(record.id)}
                            disabled={loading}
                            className="h-8 w-8 p-0"
                            title="Download Report"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>

      {/* View Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Vehicle Record Details
            </DialogTitle>
            <DialogDescription>
              Complete information about the vehicle and its service history
            </DialogDescription>
          </DialogHeader>
          
          {selectedRecord && (
            <div className="space-y-6">
              {/* Vehicle Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Vehicle Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Brand & Model</p>
                    <p className="font-medium">{selectedRecord.brand} {selectedRecord.model}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Vehicle Name</p>
                    <p className="font-medium">{selectedRecord.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Registration Number</p>
                    <p className="font-medium font-mono">{selectedRecord.vehicleRegNo || 'Unregistered'}</p>
                  </div>
                  {selectedRecord.vinNo && (
                    <div>
                      <p className="text-sm text-muted-foreground">VIN Number</p>
                      <p className="font-medium font-mono text-xs">{selectedRecord.vinNo}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Fuel Type</p>
                    <p className="font-medium">{selectedRecord.fuel}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Capacity</p>
                    <p className="font-medium">{selectedRecord.capacity}L</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Gearbox</p>
                    <p className="font-medium">{selectedRecord.gearbox}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Model Year</p>
                    <p className="font-medium">{selectedRecord.modelYear}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <Badge variant="outline">{selectedRecord.academyLocation}</Badge>
                  </div>
                  {selectedRecord.dateDecommissioned && (
                    <div>
                      <p className="text-sm text-muted-foreground">Date Decommissioned</p>
                      <p className="font-medium">{format(new Date(selectedRecord.dateDecommissioned), 'MMM dd, yyyy')}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Compliance Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Compliance Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Insurance Status</p>
                    <div className="mt-1">{getInsuranceStatusBadge(selectedRecord.insuranceStatus)}</div>
                    {selectedRecord.insuranceValidityDate && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Valid until: {format(new Date(selectedRecord.insuranceValidityDate), 'MMM dd, yyyy')}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">PUC Status</p>
                    <div className="mt-1">{getPucStatusBadge(selectedRecord.pucStatus)}</div>
                    {selectedRecord.pucValidityDate && selectedRecord.pucStatus !== 'NA' && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Valid until: {format(new Date(selectedRecord.pucValidityDate), 'MMM dd, yyyy')}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Trainer & Training Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Trainer & Training Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Allocated Trainer</p>
                    <p className="font-medium">{selectedRecord.allocatedTrainer || 'Unassigned'}</p>
                  </div>
                  {selectedRecord.trainingSchedule && (
                    <>
                      <div>
                        <p className="text-sm text-muted-foreground">Training Schedule</p>
                        <p className="font-medium">{selectedRecord.trainingSchedule.from} - {selectedRecord.trainingSchedule.to}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm text-muted-foreground">Training Course</p>
                        <p className="font-medium">{selectedRecord.trainingSchedule.training}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Cost & Service History */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Cost & Service History
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedRecord.costIncurred && selectedRecord.costIncurred > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground">Total Cost Incurred</p>
                      <p className="text-2xl font-bold text-red-600">
                        ₹{selectedRecord.costIncurred.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  )}
                  {selectedRecord.remarks && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Service Remarks & History</p>
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm whitespace-pre-wrap">{selectedRecord.remarks}</p>
                      </div>
                    </div>
                  )}
                  {selectedRecord.createdAt && (
                    <div className="text-xs text-muted-foreground">
                      Record created: {format(new Date(selectedRecord.createdAt), 'MMM dd, yyyy HH:mm')}
                    </div>
                  )}
                  {selectedRecord.updatedAt && (
                    <div className="text-xs text-muted-foreground">
                      Last updated: {format(new Date(selectedRecord.updatedAt), 'MMM dd, yyyy HH:mm')}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
