import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ArrowLeft, Car, Calendar as CalendarIcon, Clock, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useVehicles } from '@/hooks/useVehicles';
import { useBookings } from '@/hooks/useBookings';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { useToast } from '@/hooks/use-toast';
import { ACADEMY_LOCATIONS, LOCATION_OPTIONS, LOCATION_DETAILS, AcademyLocation } from '@/constants/locations';
import { trainingCourses } from '@/constants/trainingCourses';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import SkodaLogo from '@/assets/skodalogo.png';
import VWLogo from '@/assets/vw.png';
import AudiLogo from '@/assets/audi.png';



type BookingStep = 'location' | 'brand' | 'vehicle' | 'details' | 'confirmation';

export function BookVehicle() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { vehicles, isLoading: vehiclesLoading, updateVehicle } = useVehicles();
  const { bookings, createBooking } = useBookings();
  const { notifyBookingCreated, addNotification } = useNotifications();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState<BookingStep>('location');
  const [selectedLocation, setSelectedLocation] = useState<AcademyLocation | ''>('');
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [startDate, setStartDate] = useState<Date>();
  const [startTime, setStartTime] = useState<string>('');
  const [endDate, setEndDate] = useState<Date>();
  const [endTime, setEndTime] = useState<string>('');
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [otherCourse, setOtherCourse] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Filter vehicles that are available and not booked during selected time
  const availableVehicles = vehicles.filter(v => {
    if (v.brand !== selectedBrand || v.status !== 'Available' || v.location !== selectedLocation) {
      return false;
    }
    
    // If dates are selected, check for booking conflicts
    if (startDate && endDate && startTime && endTime) {
      const startDateTime = new Date(startDate);
      const [startHours, startMinutes] = startTime.split(':');
      startDateTime.setHours(parseInt(startHours), parseInt(startMinutes));
      
      const endDateTime = new Date(endDate);
      const [endHours, endMinutes] = endTime.split(':');
      endDateTime.setHours(parseInt(endHours), parseInt(endMinutes));
      
      // Check if vehicle has any overlapping bookings (pending, approved, or active)
      const hasConflict = bookings.some(booking => {
        if (booking.vehicleId !== v.id) return false;
        if (booking.status === 'completed' || booking.status === 'cancelled' || booking.status === 'rejected') return false;
        
        const bookingStart = new Date(booking.startDate);
        const bookingEnd = new Date(booking.endDate);
        
        // Check for overlap
        return (startDateTime < bookingEnd && endDateTime > bookingStart);
      });
      
      return !hasConflict;
    }
    
    // If dates not selected yet, just check status
    return true;
  });

  const selectedVehicleData = vehicles.find(v => v.id === selectedVehicle);

  const getBrandLogo = (brand: string) => {
  switch (brand.toLowerCase()) {
    case 'skoda':
      return SkodaLogo;
    case 'volkswagen':
      return VWLogo;
    case 'audi':
      return AudiLogo;
    default:
      return '';
  }
};

  const handleLocationSelect = (location: AcademyLocation) => {
    setSelectedLocation(location);
    setSelectedBrand('');
    setSelectedVehicle('');
    setCurrentStep('brand');
  };

  const handleBrandSelect = (brand: string) => {
    setSelectedBrand(brand);
    setSelectedVehicle('');
    setCurrentStep('vehicle');
  };

  const handleVehicleSelect = (vehicleId: string) => {
    setSelectedVehicle(vehicleId);
    setCurrentStep('details');
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !selectedVehicle || !selectedLocation) return;
    if (!startDate || !endDate || !startTime || !endTime) {
      toast({
        title: "Missing Information",
        description: "Please select both start and end date/time",
        variant: "destructive",
      });
      return;
    }
    if (!selectedCourse && !otherCourse) {
      toast({
        title: "Missing Information",
        description: "Please select a training course or specify other",
        variant: "destructive",
      });
      return;
    }

    // Combine date and time
    const startDateTime = new Date(startDate);
    const [startHours, startMinutes] = startTime.split(':');
    startDateTime.setHours(parseInt(startHours), parseInt(startMinutes));

    const endDateTime = new Date(endDate);
    const [endHours, endMinutes] = endTime.split(':');
    endDateTime.setHours(parseInt(endHours), parseInt(endMinutes));

    // Validate dates: start date and time should not be in the past
    const now = new Date();
    now.setSeconds(0, 0); // Reset seconds and milliseconds for fair comparison
    const startWithSeconds = new Date(startDateTime);
    startWithSeconds.setSeconds(0, 0);
    
    if (startWithSeconds < now) {
      toast({
        title: "Invalid Date",
        description: "Booking start date and time cannot be in the past. Please select a future date and time.",
        variant: "destructive",
      });
      return;
    }

    // Validate time range: end date/time should be after start date/time
    const endWithSeconds = new Date(endDateTime);
    endWithSeconds.setSeconds(0, 0);
    
    if (endWithSeconds <= startWithSeconds) {
      toast({
        title: "Invalid Time Range",
        description: "End date and time must be after start date and time. Please select a valid time range.",
        variant: "destructive",
      });
      return;
    }

    // Validate minimum booking duration (at least 1 hour)
    const durationInMs = endWithSeconds.getTime() - startWithSeconds.getTime();
    const durationInHours = durationInMs / (1000 * 60 * 60);
    if (durationInHours < 1) {
      toast({
        title: "Invalid Duration",
        description: "Booking duration must be at least 1 hour. Please select a longer time range.",
        variant: "destructive",
      });
      return;
    }

    // Check if vehicle is still available (double-check before creating booking)
    const vehicle = vehicles.find(v => v.id === selectedVehicle);
    if (!vehicle || vehicle.status !== 'Available') {
      toast({
        title: "Vehicle Not Available",
        description: "This vehicle is no longer available. Please select another vehicle.",
        variant: "destructive",
      });
      return;
    }
    
    // Check for any overlapping bookings
    const hasConflict = bookings.some(booking => {
      if (booking.vehicleId !== selectedVehicle) return false;
      if (booking.status === 'completed' || booking.status === 'cancelled' || booking.status === 'rejected') return false;
      
      const bookingStart = new Date(booking.startDate);
      const bookingEnd = new Date(booking.endDate);
      
      return (startDateTime < bookingEnd && endDateTime > bookingStart);
    });
    
    if (hasConflict) {
      toast({
        title: "Booking Conflict",
        description: "This vehicle is already booked for the selected time period. Please choose a different time or vehicle.",
        variant: "destructive",
      });
      return;
    }

    try {
      const selectedVehicleData = vehicles.find(v => v.id === selectedVehicle);
      const vehicleName = selectedVehicleData 
        ? `${selectedVehicleData.brand} ${selectedVehicleData.model} (${selectedVehicleData.regNo})`
        : 'Unknown Vehicle';

      const newBooking = await createBooking({
        vehicleId: selectedVehicle,
        trainerId: user.id,
        trainerName: user.name,
        startDate: startDateTime.toISOString(),
        endDate: endDateTime.toISOString(),
        purpose: selectedCourse === 'other' ? otherCourse : selectedCourse,
        requestedLocation: selectedLocation as AcademyLocation,
        status: 'pending',
        notes: notes,
      });

      // Notify admin (trainer notification is handled separately)
      notifyBookingCreated(newBooking.id, user.name, vehicleName, selectedLocation);
      
      // Also notify trainer directly
      addNotification({
        type: 'booking_created',
        title: 'Booking Request Submitted',
        message: `Your booking request for ${vehicleName} has been submitted and is pending approval`,
        userId: user.id,
        relatedEntityType: 'booking',
        relatedEntityId: newBooking.id,
        actionUrl: `/trainer/bookings`,
      });

      // Note: Vehicle status will be updated when booking is approved/activated
      // For now, we keep it as Available until approved

      setCurrentStep('confirmation');
    } catch (error) {
      console.error('Booking failed:', error);
      toast({
        title: "Error",
        description: "Failed to create booking. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Get training courses based on selected vehicle brand
  const getTrainingCoursesForBrand = () => {
    if (!selectedVehicleData) return [];
    // Map vehicle brand names to training courses keys
    const brandMap: Record<string, keyof typeof trainingCourses> = {
      'Skoda': 'Skoda',
      'Volkswagen': 'Volkswagen',
      'Audi': 'Audi',
    };
    const brandName = brandMap[selectedVehicleData.brand] || '';
    return brandName ? trainingCourses[brandName] || [] : [];
  };

  const availableCourses = getTrainingCoursesForBrand();

  // Calculate available vehicle counts by brand for selected location
  const brandCounts = useMemo(() => {
    if (!selectedLocation) {
      return { Skoda: 0, Volkswagen: 0, Audi: 0 };
    }

    // Helper function to normalize location names
    const normalizeLocation = (loc: string): string => {
      const locationMap: Record<string, string> = {
        'Pune': 'Pune',
        'PTC': 'Pune',
        'VGTAP': 'VGTAP',
        'NCR': 'NCR',
        'Bangalore': 'Bangalore',
        'BLR': 'Bangalore',
      };
      return locationMap[loc] || loc;
    };

    // Helper function to normalize brand names
    const normalizeBrand = (brand: string): string => {
      const brandMap: Record<string, string> = {
        'Skoda': 'Skoda',
        'SA': 'Skoda',
        'Volkswagen': 'Volkswagen',
        'VW': 'Volkswagen',
        'Audi': 'Audi',
        'AU': 'Audi',
      };
      return brandMap[brand] || brand;
    };

    const normalizedSelectedLocation = normalizeLocation(selectedLocation);
    
    // Filter vehicles by location and status
    const locationVehicles = vehicles.filter(v => {
      const vehicleLocation = v.location || (v as any).academyLocation || '';
      const normalizedVehicleLocation = normalizeLocation(vehicleLocation);
      
      if (normalizedVehicleLocation !== normalizedSelectedLocation) return false;
      
      // Only count available vehicles (not in use or maintenance)
      const status = v.status || (v as any).status || '';
      return status === 'Available' || status === 'Active';
    });

    // Count by brand
    const counts = { Skoda: 0, Volkswagen: 0, Audi: 0 };
    
    locationVehicles.forEach(v => {
      const normalizedBrand = normalizeBrand(v.brand);
      if (normalizedBrand === 'Skoda') counts.Skoda++;
      else if (normalizedBrand === 'Volkswagen') counts.Volkswagen++;
      else if (normalizedBrand === 'Audi') counts.Audi++;
    });

    return counts;
  }, [vehicles, selectedLocation]);

  const renderStepContent = () => {
    switch (currentStep) {
      case 'location':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Select Training Location</h2>
              <p className="text-muted-foreground">Choose the academy location where you need the vehicle</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              {LOCATION_OPTIONS.map((location) => {
                const details = LOCATION_DETAILS[location as AcademyLocation];
                return (
                  <Card
                    key={location}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
                      selectedLocation === location ? 'ring-2 ring-primary shadow-lg scale-[1.02]' : ''
                    }`}
                    onClick={() => handleLocationSelect(location as AcademyLocation)}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="flex flex-col items-center space-y-3">
                        <div className="p-3 bg-primary/10 rounded-full">
                          <MapPin className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{details.fullName}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{details.region} Region</p>
                          <Badge variant="outline" className="mt-2">{details.code}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            
            {selectedLocation && (
              <div className="text-center pt-4">
                <Button onClick={() => setCurrentStep('brand')} className="btn-professional">
                  Continue to Brand Selection
                  <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                </Button>
              </div>
            )}
          </div>
        );
        
      case 'brand':
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-4 mb-4">
              <Button variant="ghost" onClick={() => {
                setCurrentStep('location');
                setSelectedLocation('');
                setSelectedBrand('');
                setSelectedVehicle('');
              }}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Location
              </Button>
              <div className="flex-1">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-2">Choose Brand</h2>
                  <p className="text-muted-foreground">Select the vehicle brand for your training session</p>
                  {selectedLocation && (
                    <Badge variant="outline" className="mt-2 flex items-center gap-1 w-fit mx-auto">
                      <MapPin className="h-3 w-3" />
                      {LOCATION_DETAILS[selectedLocation as AcademyLocation]?.fullName || selectedLocation}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {['Skoda', 'Volkswagen', 'Audi'].map((brand) => (
                <Card 
                  key={brand}
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
                  onClick={() => handleBrandSelect(brand)}
                >
                  <CardContent className="p-8 text-center">
                    <img
                      src={getBrandLogo(brand)}
                      alt={`${brand} logo`}
                      className="h-16 mx-auto mb-4 object-contain"
                    />
                    <h3 className="text-xl font-semibold mb-2">{brand}</h3>
                    <p className="text-sm text-muted-foreground">
                      {brandCounts[brand as keyof typeof brandCounts] || 0} available
                    </p>
                  </CardContent>

                </Card>
              ))}
            </div>
          </div>
        );

      case 'vehicle':
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => setCurrentStep('brand')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Brands
              </Button>
              <div>
                <h2 className="text-2xl font-bold">Available {selectedBrand} Vehicles</h2>
                <p className="text-muted-foreground">Choose a vehicle for your booking</p>
              </div>
            </div>

            {vehiclesLoading ? (
              <div className="text-center py-8">Loading vehicles...</div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableVehicles.map((vehicle) => (
                  <Card
                    key={vehicle.id}
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
                    onClick={() => handleVehicleSelect(vehicle.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <img
                          src={getBrandLogo(vehicle.brand)}
                          alt={vehicle.brand}
                          className="h-8 w-8 object-contain"
                        />
                        <div>
                          <h3 className="font-semibold">{vehicle.model}</h3>
                          <p className="text-sm text-muted-foreground">{vehicle.year}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">License:</span>
                          <span className="text-sm font-medium">{vehicle.regNo}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Fuel:</span>
                          <span className="text-sm">{vehicle.fuelType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Location:</span>
                          <span className="text-sm">{vehicle.location}</span>
                        </div>
                      </div>

                      {/* Status Badge with dynamic color */}
                      <Badge
                        className={`mt-4 ${
                          vehicle.status === "Available"
                            ? "bg-green-500 text-white"
                            : vehicle.status === "In Use"
                            ? "bg-blue-500 text-white"
                            : "bg-red-500 text-white"
                        }`}
                      >
                        {vehicle.status}
                      </Badge>
                    </CardContent>
                  </Card>

                ))}
              </div>
            )}

            {!vehiclesLoading && availableVehicles.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No {selectedBrand} vehicles available at the moment.</p>
              </div>
            )}
          </div>
        );

      case 'details':
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => setCurrentStep('vehicle')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Vehicles
              </Button>
              <div>
                <h2 className="text-2xl font-bold">Booking Details</h2>
                <p className="text-muted-foreground">Complete your reservation</p>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Selected Vehicle Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Selected Vehicle</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedVehicleData && (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <Car className="h-8 w-8 text-primary" />
                        <div>
                          <h3 className="font-semibold text-lg">
                            {selectedVehicleData.brand} {selectedVehicleData.model}
                          </h3>
                          <p className="text-muted-foreground">{selectedVehicleData.year}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">License Plate:</span>
                          <p className="font-medium">{selectedVehicleData.regNo}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Fuel Type:</span>
                          <p className="font-medium">{selectedVehicleData.fuelType}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Color:</span>
                          <p className="font-medium">{selectedVehicleData.color}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Location:</span>
                          <p className="font-medium">{selectedVehicleData.location}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Booking Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Booking Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleBookingSubmit} className="space-y-4">
                    {/* Start Date & Time */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Start Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !startDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={startDate}
                              onSelect={(date) => {
                                setStartDate(date);
                                // If selected date is today and start time is in the past, clear start time
                                if (date) {
                                  const today = new Date();
                                  today.setHours(0, 0, 0, 0);
                                  const selectedDate = new Date(date);
                                  selectedDate.setHours(0, 0, 0, 0);
                                  
                                  if (selectedDate.getTime() === today.getTime() && startTime) {
                                    const [hours, minutes] = startTime.split(':').map(Number);
                                    const selectedDateTime = new Date(date);
                                    selectedDateTime.setHours(hours, minutes);
                                    const now = new Date();
                                    
                                    if (selectedDateTime < now) {
                                      setStartTime('');
                                      toast({
                                        title: "Invalid Time",
                                        description: "Start time cannot be in the past. Please select a future time.",
                                        variant: "destructive",
                                      });
                                    }
                                  }
                                  
                                  // If end date is before start date, reset end date
                                  if (endDate && endDate < date) {
                                    setEndDate(undefined);
                                    setEndTime('');
                                  }
                                }
                              }}
                              disabled={(date) => {
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                date.setHours(0, 0, 0, 0);
                                return date < today;
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="startTime">Start Time</Label>
                        <Input
                          id="startTime"
                          type="time"
                          value={startTime}
                          onChange={(e) => {
                            const time = e.target.value;
                            setStartTime(time);
                            
                            // Validate if date is today - time must be in future
                            if (startDate && time) {
                              const today = new Date();
                              today.setHours(0, 0, 0, 0);
                              const selectedDate = new Date(startDate);
                              selectedDate.setHours(0, 0, 0, 0);
                              
                              if (selectedDate.getTime() === today.getTime()) {
                                const [hours, minutes] = time.split(':').map(Number);
                                const selectedDateTime = new Date(startDate);
                                selectedDateTime.setHours(hours, minutes);
                                const now = new Date();
                                
                                if (selectedDateTime < now) {
                                  toast({
                                    title: "Invalid Time",
                                    description: "Start time cannot be in the past. Please select a future time.",
                                    variant: "destructive",
                                  });
                                  setStartTime('');
                                  return;
                                }
                              }
                            }
                          }}
                          required
                        />
                      </div>
                    </div>

                    {/* End Date & Time */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>End Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !endDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={endDate}
                              onSelect={(date) => {
                                setEndDate(date);
                                
                                // If date is same as start date and end time is before start time, validate
                                if (date && startDate && startTime && endTime) {
                                  const startDateTime = new Date(startDate);
                                  const [startHours, startMinutes] = startTime.split(':').map(Number);
                                  startDateTime.setHours(startHours, startMinutes);
                                  
                                  const endDateTime = new Date(date);
                                  const [endHours, endMinutes] = endTime.split(':').map(Number);
                                  endDateTime.setHours(endHours, endMinutes);
                                  
                                  if (endDateTime <= startDateTime) {
                                    toast({
                                      title: "Invalid Time Range",
                                      description: "End date and time must be after start date and time.",
                                      variant: "destructive",
                                    });
                                  }
                                }
                              }}
                              disabled={(date) => {
                                if (!startDate) {
                                  const today = new Date();
                                  today.setHours(0, 0, 0, 0);
                                  date.setHours(0, 0, 0, 0);
                                  return date < today;
                                }
                                const startDateOnly = new Date(startDate);
                                startDateOnly.setHours(0, 0, 0, 0);
                                date.setHours(0, 0, 0, 0);
                                return date < startDateOnly;
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="endTime">End Time</Label>
                        <Input
                          id="endTime"
                          type="time"
                          value={endTime}
                          onChange={(e) => {
                            const time = e.target.value;
                            setEndTime(time);
                            
                            // Validate end time is after start time
                            if (startDate && startTime && endDate && time) {
                              const startDateTime = new Date(startDate);
                              const [startHours, startMinutes] = startTime.split(':').map(Number);
                              startDateTime.setHours(startHours, startMinutes);
                              
                              const endDateTime = new Date(endDate);
                              const [endHours, endMinutes] = time.split(':').map(Number);
                              endDateTime.setHours(endHours, endMinutes);
                              
                              if (endDateTime <= startDateTime) {
                                toast({
                                  title: "Invalid Time Range",
                                  description: "End time must be after start time. Please select a valid time range.",
                                  variant: "destructive",
                                });
                                setEndTime('');
                                return;
                              }
                              
                              // Check minimum duration (1 hour)
                              const durationInMs = endDateTime.getTime() - startDateTime.getTime();
                              const durationInHours = durationInMs / (1000 * 60 * 60);
                              if (durationInHours < 1) {
                                toast({
                                  title: "Invalid Duration",
                                  description: "Booking duration must be at least 1 hour.",
                                  variant: "destructive",
                                });
                              }
                            }
                          }}
                          required
                        />
                      </div>
                    </div>

                    {/* Training Courses */}
                    <div className="space-y-2">
                      <Label htmlFor="trainingCourse">Training Course</Label>
                      <Select 
                        value={selectedCourse} 
                        onValueChange={(value) => {
                          setSelectedCourse(value);
                          if (value !== 'other') {
                            setOtherCourse('');
                          }
                        }}
                        required={!otherCourse}
                      >
                        <SelectTrigger id="trainingCourse">
                          <SelectValue placeholder="Select training course" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableCourses.map((course, index) => (
                            <SelectItem key={index} value={course}>
                              {course}
                            </SelectItem>
                          ))}
                          <SelectItem value="other">Other (Please specify)</SelectItem>
                        </SelectContent>
                      </Select>
                      {selectedCourse === 'other' && (
                        <Input
                          placeholder="Specify the training course..."
                          value={otherCourse}
                          onChange={(e) => setOtherCourse(e.target.value)}
                          required
                          className="mt-2"
                        />
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Additional Notes</Label>
                      <Textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Any special requirements or notes..."
                        rows={3}
                      />
                    </div>

                    <Button type="submit" className="w-full btn-skoda">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      Submit Booking Request
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'confirmation':
        return (
          <div className="space-y-6 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto mb-4">
                <CalendarIcon className="h-8 w-8 text-success-foreground" />
              </div>
              
              <h2 className="text-2xl font-bold mb-2">Booking Submitted!</h2>
              <p className="text-muted-foreground mb-6">
                Your vehicle booking request has been submitted successfully and is pending approval.
              </p>

              <div className="space-y-4">
                <Button onClick={() => navigate('/trainer')} className="w-full">
                  Return to Dashboard
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setCurrentStep('brand');
                    setSelectedBrand('');
                    setSelectedVehicle('');
                    setStartDate(undefined);
                    setStartTime('');
                    setEndDate(undefined);
                    setEndTime('');
                    setSelectedCourse('');
                    setOtherCourse('');
                    setNotes('');
                  }}
                  className="w-full"
                >
                  Book Another Vehicle
                </Button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center space-x-2 mb-8">
        {['brand', 'vehicle', 'details', 'confirmation'].map((step, index) => (
          <div key={step} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep === step 
                ? 'bg-primary text-primary-foreground' 
                : index < ['brand', 'vehicle', 'details', 'confirmation'].indexOf(currentStep)
                  ? 'bg-success text-success-foreground'
                  : 'bg-muted text-muted-foreground'
            }`}>
              {index + 1}
            </div>
            {index < 3 && (
              <div className={`w-12 h-0.5 mx-2 ${
                index < ['brand', 'vehicle', 'details', 'confirmation'].indexOf(currentStep)
                  ? 'bg-success'
                  : 'bg-muted'
              }`} />
            )}
          </div>
        ))}
      </div>

      {renderStepContent()}
    </div>
  );
}