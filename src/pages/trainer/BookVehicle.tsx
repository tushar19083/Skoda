import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Car, Calendar, Clock, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useVehicles } from '@/hooks/useVehicles';
import { useBookings } from '@/hooks/useBookings';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ACADEMY_LOCATIONS, LOCATION_OPTIONS, LOCATION_DETAILS, AcademyLocation } from '@/constants/locations';
import SkodaLogo from '@/assets/skodalogo.png';
import VWLogo from '@/assets/vw.png';
import AudiLogo from '@/assets/audi.png';



type BookingStep = 'location' | 'brand' | 'vehicle' | 'details' | 'confirmation';

export function BookVehicle() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { vehicles, isLoading: vehiclesLoading } = useVehicles();
  const { createBooking } = useBookings();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState<BookingStep>('location');
  const [selectedLocation, setSelectedLocation] = useState<AcademyLocation | ''>('');
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [bookingForm, setBookingForm] = useState({
    startDate: '',
    endDate: '',
    purpose: '',
    notes: ''
  });

  const availableVehicles = vehicles.filter(
    v => v.brand === selectedBrand && v.status === 'Available' && v.location === selectedLocation
  );

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

    try {
      await createBooking({
        vehicleId: selectedVehicle,
        trainerId: user.id,
        trainerName: user.name,
        startDate: bookingForm.startDate,
        endDate: bookingForm.endDate,
        purpose: bookingForm.purpose,
        requestedLocation: selectedLocation as AcademyLocation,
        status: 'pending',
        notes: bookingForm.notes,
      });

      setCurrentStep('confirmation');
    } catch (error) {
      console.error('Booking failed:', error);
    }
  };

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
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Choose Brand</h2>
              <p className="text-muted-foreground">Select the vehicle brand for your training session</p>
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
                      {vehicles.filter(v => v.brand === brand && v.status === 'Available').length} available
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
                          <span className="text-sm">Mileage:</span>
                          <span className="text-sm">{vehicle.mileage.toLocaleString()} km</span>
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
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="startDate">Start Date & Time</Label>
                        <Input
                          id="startDate"
                          type="datetime-local"
                          value={bookingForm.startDate}
                          onChange={(e) => setBookingForm(prev => ({ ...prev, startDate: e.target.value }))}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="endDate">End Date & Time</Label>
                        <Input
                          id="endDate"
                          type="datetime-local"
                          value={bookingForm.endDate}
                          onChange={(e) => setBookingForm(prev => ({ ...prev, endDate: e.target.value }))}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="purpose">Purpose</Label>
                      <Input
                        id="purpose"
                        value={bookingForm.purpose}
                        onChange={(e) => setBookingForm(prev => ({ ...prev, purpose: e.target.value }))}
                        placeholder="e.g., Advanced Driving Training, Safety Course"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Additional Notes</Label>
                      <Textarea
                        id="notes"
                        value={bookingForm.notes}
                        onChange={(e) => setBookingForm(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Any special requirements or notes..."
                        rows={3}
                      />
                    </div>

                    <Button type="submit" className="w-full btn-skoda">
                      <Calendar className="h-4 w-4 mr-2" />
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
                <Calendar className="h-8 w-8 text-success-foreground" />
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
                    setBookingForm({
                      startDate: '',
                      endDate: '',
                      purpose: '',
                      notes: ''
                    });
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