import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Car, Calendar, Users, FileText, X, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { useAuth } from '@/contexts/AuthContext';
import { useLocationFilter } from '@/hooks/useLocationFilter';

interface SearchResult {
  id: string;
  type: 'vehicle' | 'booking' | 'user' | 'service-record';
  title: string;
  subtitle?: string;
  url: string;
  metadata?: Record<string, any>;
}

const STORAGE_KEY_VEHICLES = 'app_fleet_vehicles';
const STORAGE_KEY_BOOKINGS = 'app_bookings';
const STORAGE_KEY_USERS = 'app_users';
const STORAGE_KEY_RECORDS = 'app_vehicle_records';

export function GlobalSearch() {
  const { user } = useAuth();
  const { filterByLocation } = useLocationFilter();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load all data from localStorage
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);

  useEffect(() => {
    const loadData = () => {
      try {
        // Load vehicles
        const vehiclesData = localStorage.getItem(STORAGE_KEY_VEHICLES);
        if (vehiclesData) {
          const parsed = JSON.parse(vehiclesData);
          setVehicles(Array.isArray(parsed) ? parsed : []);
        }

        // Load bookings
        const bookingsData = localStorage.getItem(STORAGE_KEY_BOOKINGS);
        if (bookingsData) {
          const parsed = JSON.parse(bookingsData);
          setBookings(Array.isArray(parsed) ? parsed : []);
        }

        // Load users
        const usersData = localStorage.getItem(STORAGE_KEY_USERS);
        if (usersData) {
          const parsed = JSON.parse(usersData);
          setUsers(Array.isArray(parsed) ? parsed : []);
        }

        // Load service records
        const recordsData = localStorage.getItem(STORAGE_KEY_RECORDS);
        if (recordsData) {
          const parsed = JSON.parse(recordsData);
          setRecords(Array.isArray(parsed) ? parsed : []);
        }
      } catch (err) {
        console.error('Error loading search data:', err);
      }
    };

    loadData();

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (
        e.key === STORAGE_KEY_VEHICLES ||
        e.key === STORAGE_KEY_BOOKINGS ||
        e.key === STORAGE_KEY_USERS ||
        e.key === STORAGE_KEY_RECORDS
      ) {
        loadData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Filter data by location for admin/security
  const filteredData = useMemo(() => {
    if (!user) return { vehicles: [], bookings: [], users: [], records: [] };

    // Super admin sees all data
    if (user.role === 'super_admin') {
      return { vehicles, bookings, users, records };
    }

    // Admin and security see only their location's data
    const locationFilteredVehicles = filterByLocation(
      vehicles.map((v) => ({
        ...v,
        location: v.academyLocation || v.location,
      }))
    );

    const locationFilteredBookings = filterByLocation(
      bookings.map((b) => ({
        ...b,
        location: b.requestedLocation,
      }))
    );

    const locationFilteredUsers = filterByLocation(
      users.map((u) => ({
        ...u,
        location: u.location,
      }))
    );

    const locationFilteredRecords = filterByLocation(
      records.map((r) => ({
        ...r,
        location: r.academyLocation,
      }))
    );

    return {
      vehicles: locationFilteredVehicles,
      bookings: locationFilteredBookings,
      users: locationFilteredUsers,
      records: locationFilteredRecords,
    };
  }, [vehicles, bookings, users, records, user, filterByLocation]);

  // Search results
  const searchResults = useMemo(() => {
    if (!searchTerm.trim() || searchTerm.length < 2) return [];

    const term = searchTerm.toLowerCase();
    const results: SearchResult[] = [];

    // Search vehicles
    filteredData.vehicles.forEach((vehicle) => {
      const regNo = (vehicle.vehicleRegNo || vehicle.regNo || '').toLowerCase();
      const brand = (vehicle.brand || '').toLowerCase();
      const model = (vehicle.model || '').toLowerCase();
      const name = (vehicle.name || '').toLowerCase();
      const location = (vehicle.academyLocation || vehicle.location || '').toLowerCase();

      if (
        regNo.includes(term) ||
        brand.includes(term) ||
        model.includes(term) ||
        name.includes(term) ||
        location.includes(term)
      ) {
        results.push({
          id: vehicle.id,
          type: 'vehicle',
          title: `${vehicle.brand} ${vehicle.model}`,
          subtitle: `${vehicle.vehicleRegNo || vehicle.regNo || 'N/A'} - ${vehicle.academyLocation || vehicle.location || 'N/A'}`,
          url: user?.role === 'super_admin' ? '/super_admin/vehicles' : '/admin/vehicles',
          metadata: { vehicle },
        });
      }
    });

    // Search bookings
    filteredData.bookings.forEach((booking) => {
      const trainerName = (booking.trainerName || '').toLowerCase();
      const purpose = (booking.purpose || '').toLowerCase();
      const bookingRef = (booking.id || '').toLowerCase();
      const location = (booking.requestedLocation || '').toLowerCase();

      if (
        trainerName.includes(term) ||
        purpose.includes(term) ||
        bookingRef.includes(term) ||
        location.includes(term)
      ) {
        const vehicle = filteredData.vehicles.find((v) => v.id === booking.vehicleId);
        const vehicleInfo = vehicle
          ? `${vehicle.brand} ${vehicle.model} - ${vehicle.vehicleRegNo || vehicle.regNo || 'N/A'}`
          : 'Unknown Vehicle';

        results.push({
          id: booking.id,
          type: 'booking',
          title: `${booking.trainerName || 'Unknown Trainer'}`,
          subtitle: `${vehicleInfo} - ${booking.requestedLocation || 'N/A'}`,
          url: user?.role === 'super_admin' ? '/super_admin/reports' : '/admin/bookings',
          metadata: { booking },
        });
      }
    });

    // Search users
    filteredData.users.forEach((userData) => {
      const name = (userData.name || '').toLowerCase();
      const email = (userData.email || '').toLowerCase();
      const employeeId = (userData.employeeId || '').toLowerCase();
      const department = (userData.department || '').toLowerCase();

      if (
        name.includes(term) ||
        email.includes(term) ||
        employeeId.includes(term) ||
        department.includes(term)
      ) {
        results.push({
          id: userData.id,
          type: 'user',
          title: userData.name || 'Unknown User',
          subtitle: `${userData.email || 'N/A'} - ${userData.role || 'N/A'}`,
          url: user?.role === 'super_admin' ? '/super_admin/users' : '/admin/users',
          metadata: { user: userData },
        });
      }
    });

    // Search service records
    filteredData.records.forEach((record) => {
      const regNo = (record.vehicleRegNo || '').toLowerCase();
      const brand = (record.brand || '').toLowerCase();
      const model = (record.model || '').toLowerCase();
      const trainer = (record.allocatedTrainer || '').toLowerCase();

      if (
        regNo.includes(term) ||
        brand.includes(term) ||
        model.includes(term) ||
        trainer.includes(term)
      ) {
        results.push({
          id: record.id,
          type: 'service-record',
          title: `${record.brand} ${record.model}`,
          subtitle: `${record.vehicleRegNo} - ${record.allocatedTrainer || 'Unallocated'}`,
          url: '/admin/service-records',
          metadata: { record },
        });
      }
    });

    return results.slice(0, 10); // Limit to 10 results
  }, [searchTerm, filteredData, user]);

  // Group results by type
  const groupedResults = useMemo(() => {
    const groups: Record<string, SearchResult[]> = {
      vehicles: [],
      bookings: [],
      users: [],
      'service-records': [],
    };

    searchResults.forEach((result) => {
      if (result.type === 'vehicle') {
        groups.vehicles.push(result);
      } else if (result.type === 'booking') {
        groups.bookings.push(result);
      } else if (result.type === 'user') {
        groups.users.push(result);
      } else if (result.type === 'service-record') {
        groups['service-records'].push(result);
      }
    });

    return groups;
  }, [searchResults]);

  const handleResultClick = (result: SearchResult) => {
    setIsOpen(false);
    setSearchTerm('');
    navigate(result.url);
  };

  // Keyboard shortcut to open search (Ctrl+K / Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchTerm('');
      inputRef.current?.blur();
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      setIsOpen(true);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'vehicle':
        return Car;
      case 'booking':
        return Calendar;
      case 'user':
        return Users;
      case 'service-record':
        return FileText;
      default:
        return Search;
    }
  };

  return (
    <>
      <div className="relative w-64">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
        <Input
          ref={inputRef}
          placeholder="Search vehicles, bookings..."
          className="pl-10 pr-10"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (e.target.value.length >= 2) {
              setIsOpen(true);
            } else {
              setIsOpen(false);
            }
          }}
          onFocus={() => {
            if (searchTerm.length >= 2) {
              setIsOpen(true);
            }
          }}
          onKeyDown={handleInputKeyDown}
        />
        {searchTerm && (
          <button
            onClick={() => {
              setSearchTerm('');
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground"
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <CommandDialog 
        open={isOpen} 
        onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) {
            setSearchTerm('');
            inputRef.current?.blur();
          }
        }}
      >
        <CommandInput
          placeholder="Search vehicles, bookings, users, service records..."
          value={searchTerm}
          onValueChange={(value) => {
            setSearchTerm(value);
            if (value.length < 2) {
              setIsOpen(false);
            } else {
              setIsOpen(true);
            }
          }}
        />
        <CommandList>
          <CommandEmpty>
            {searchTerm.length < 2
              ? 'Type at least 2 characters to search...'
              : 'No results found.'}
          </CommandEmpty>

          {groupedResults.vehicles.length > 0 && (
            <CommandGroup heading="Vehicles">
              {groupedResults.vehicles.map((result) => {
                const Icon = getTypeIcon(result.type);
                return (
                  <CommandItem
                    key={result.id}
                    onSelect={() => handleResultClick(result)}
                    className="cursor-pointer"
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{result.title}</div>
                      <div className="text-xs text-muted-foreground truncate">{result.subtitle}</div>
                    </div>
                    <ArrowRight className="ml-2 h-4 w-4 opacity-50" />
                  </CommandItem>
                );
              })}
            </CommandGroup>
          )}

          {groupedResults.bookings.length > 0 && (
            <CommandGroup heading="Bookings">
              {groupedResults.bookings.map((result) => {
                const Icon = getTypeIcon(result.type);
                return (
                  <CommandItem
                    key={result.id}
                    onSelect={() => handleResultClick(result)}
                    className="cursor-pointer"
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{result.title}</div>
                      <div className="text-xs text-muted-foreground truncate">{result.subtitle}</div>
                    </div>
                    <ArrowRight className="ml-2 h-4 w-4 opacity-50" />
                  </CommandItem>
                );
              })}
            </CommandGroup>
          )}

          {groupedResults.users.length > 0 && (
            <CommandGroup heading="Users">
              {groupedResults.users.map((result) => {
                const Icon = getTypeIcon(result.type);
                return (
                  <CommandItem
                    key={result.id}
                    onSelect={() => handleResultClick(result)}
                    className="cursor-pointer"
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{result.title}</div>
                      <div className="text-xs text-muted-foreground truncate">{result.subtitle}</div>
                    </div>
                    <ArrowRight className="ml-2 h-4 w-4 opacity-50" />
                  </CommandItem>
                );
              })}
            </CommandGroup>
          )}

          {groupedResults['service-records'].length > 0 && (
            <CommandGroup heading="Service Records">
              {groupedResults['service-records'].map((result) => {
                const Icon = getTypeIcon(result.type);
                return (
                  <CommandItem
                    key={result.id}
                    onSelect={() => handleResultClick(result)}
                    className="cursor-pointer"
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{result.title}</div>
                      <div className="text-xs text-muted-foreground truncate">{result.subtitle}</div>
                    </div>
                    <ArrowRight className="ml-2 h-4 w-4 opacity-50" />
                  </CommandItem>
                );
              })}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
