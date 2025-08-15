export interface Database {
  public: {
    Tables: {
      vehicles: {
        Row: {
          id: string;
          brand: 'Skoda' | 'Volkswagen' | 'Audi';
          model: string;
          year: number;
          license_plate: string;
          vin: string;
          color: string;
          fuel_type: 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid';
          status: 'Available' | 'Booked' | 'Maintenance' | 'Out of Service';
          mileage: number;
          location: string;
          last_service: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          brand: 'Skoda' | 'Volkswagen' | 'Audi';
          model: string;
          year: number;
          license_plate: string;
          vin: string;
          color: string;
          fuel_type: 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid';
          status?: 'Available' | 'Booked' | 'Maintenance' | 'Out of Service';
          mileage: number;
          location: string;
          last_service?: string | null;
          notes?: string | null;
        };
        Update: {
          brand?: 'Skoda' | 'Volkswagen' | 'Audi';
          model?: string;
          year?: number;
          license_plate?: string;
          vin?: string;
          color?: string;
          fuel_type?: 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid';
          status?: 'Available' | 'Booked' | 'Maintenance' | 'Out of Service';
          mileage?: number;
          location?: string;
          last_service?: string | null;
          notes?: string | null;
          updated_at?: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          vehicle_id: string;
          trainer_id: string;
          trainer_name: string;
          start_date: string;
          end_date: string;
          purpose: string;
          status: 'pending' | 'approved' | 'rejected' | 'active' | 'completed' | 'cancelled';
          urgency: 'normal' | 'high';
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          vehicle_id: string;
          trainer_id: string;
          trainer_name: string;
          start_date: string;
          end_date: string;
          purpose: string;
          status?: 'pending' | 'approved' | 'rejected' | 'active' | 'completed' | 'cancelled';
          urgency?: 'normal' | 'high';
          notes?: string | null;
        };
        Update: {
          vehicle_id?: string;
          trainer_id?: string;
          trainer_name?: string;
          start_date?: string;
          end_date?: string;
          purpose?: string;
          status?: 'pending' | 'approved' | 'rejected' | 'active' | 'completed' | 'cancelled';
          urgency?: 'normal' | 'high';
          notes?: string | null;
          updated_at?: string;
        };
      };
      key_issues: {
        Row: {
          id: string;
          booking_id: string;
          vehicle_id: string;
          issued_by: string;
          issued_at: string;
          expected_return: string;
          actual_return: string | null;
          return_condition: string | null;
          damage_notes: string | null;
          status: 'issued' | 'returned' | 'overdue';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          vehicle_id: string;
          issued_by: string;
          issued_at?: string;
          expected_return: string;
          actual_return?: string | null;
          return_condition?: string | null;
          damage_notes?: string | null;
          status?: 'issued' | 'returned' | 'overdue';
        };
        Update: {
          booking_id?: string;
          vehicle_id?: string;
          issued_by?: string;
          issued_at?: string;
          expected_return?: string;
          actual_return?: string | null;
          return_condition?: string | null;
          damage_notes?: string | null;
          status?: 'issued' | 'returned' | 'overdue';
          updated_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          role: 'admin' | 'trainer' | 'security';
          department: string;
          employee_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          role: 'admin' | 'trainer' | 'security';
          department: string;
          employee_id: string;
        };
        Update: {
          name?: string;
          email?: string;
          role?: 'admin' | 'trainer' | 'security';
          department?: string;
          employee_id?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}