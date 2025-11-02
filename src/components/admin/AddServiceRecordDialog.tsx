import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface AddServiceRecordDialogProps {
  children: React.ReactNode;
  onAdd?: (serviceData: {
    vehicleRegNo: string;
    costIncurred: number;
    serviceType: string;
    description: string;
    serviceDate: Date;
  }) => void;
  vehicles?: Array<{ vehicleRegNo: string; name: string; brand: string; model: string }>;
  adminLocation?: string;
}

export default function AddServiceRecordDialog({ children, onAdd, vehicles = [], adminLocation }: AddServiceRecordDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    vehicleRegNo: '',
    serviceType: '',
    serviceDate: new Date(),
    costIncurred: '',
    description: '',
    partsReplaced: '',
    nextServiceDate: undefined as Date | undefined,
    serviceProvider: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.vehicleRegNo || !formData.serviceType || !formData.costIncurred || !formData.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Check if vehicle exists
    const vehicleExists = vehicles.some(v => v.vehicleRegNo === formData.vehicleRegNo);
    if (!vehicleExists) {
      toast({
        title: "Vehicle Not Found",
        description: `Vehicle with registration ${formData.vehicleRegNo} not found. Please add the vehicle first.`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const cost = parseFloat(formData.costIncurred) || 0;
      
      if (onAdd) {
        onAdd({
          vehicleRegNo: formData.vehicleRegNo,
          costIncurred: cost,
          serviceType: formData.serviceType,
          description: formData.description + (formData.partsReplaced ? `\nParts Replaced: ${formData.partsReplaced}` : ''),
          serviceDate: formData.serviceDate,
        });
      }

      // Reset form
      setFormData({
        vehicleRegNo: '',
        serviceType: '',
        serviceDate: new Date(),
        costIncurred: '',
        description: '',
        partsReplaced: '',
        nextServiceDate: undefined,
        serviceProvider: '',
      });
      
      setOpen(false);
      
      toast({
        title: "Service Record Added",
        description: `Service record for ${formData.vehicleRegNo} has been added successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add service record. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Get unique vehicle registration numbers for autocomplete
  const vehicleRegNos = [...new Set(vehicles.map(v => v.vehicleRegNo))].filter(Boolean);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Service Record</DialogTitle>
          <DialogDescription>
            Record maintenance or service details for a vehicle
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="space-y-2">
                <Label htmlFor="vehicleRegNo">Vehicle Registration No *</Label>
                <Select
                  value={formData.vehicleRegNo}
                  onValueChange={(value) => setFormData({ ...formData, vehicleRegNo: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicleRegNos.map(regNo => {
                      const vehicle = vehicles.find(v => v.vehicleRegNo === regNo);
                      return (
                        <SelectItem key={regNo} value={regNo}>
                          {regNo} - {vehicle?.brand} {vehicle?.model}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                {vehicleRegNos.length === 0 && (
                  <p className="text-xs text-muted-foreground">No vehicles found for your location. Please add vehicles first.</p>
                )}
                {adminLocation && (
                  <p className="text-xs text-muted-foreground">Only vehicles from {adminLocation} location are shown.</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="serviceType">Service Type *</Label>
              <Select
                value={formData.serviceType}
                onValueChange={(value) => setFormData({ ...formData, serviceType: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select service type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="routine">Routine Maintenance</SelectItem>
                  <SelectItem value="repair">Repair</SelectItem>
                  <SelectItem value="inspection">Inspection</SelectItem>
                  <SelectItem value="parts-replacement">Parts Replacement</SelectItem>
                  <SelectItem value="diagnostics">Diagnostics</SelectItem>
                  <SelectItem value="breakdown">Breakdown Service</SelectItem>
                  <SelectItem value="battery">Battery Replacement</SelectItem>
                  <SelectItem value="insurance">Insurance Renewal</SelectItem>
                  <SelectItem value="puc">PUC Renewal</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Service Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.serviceDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.serviceDate ? format(formData.serviceDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.serviceDate}
                    onSelect={(date) => date && setFormData({ ...formData, serviceDate: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="serviceProvider">Service Provider</Label>
              <Input
                id="serviceProvider"
                value={formData.serviceProvider}
                onChange={(e) => setFormData({ ...formData, serviceProvider: e.target.value })}
                placeholder="Workshop/Provider name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="costIncurred">Cost Incurred (₹) *</Label>
            <Input
              id="costIncurred"
              type="number"
              step="0.01"
              value={formData.costIncurred}
              onChange={(e) => setFormData({ ...formData, costIncurred: e.target.value })}
              placeholder="0.00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="partsReplaced">Parts Replaced</Label>
            <Input
              id="partsReplaced"
              value={formData.partsReplaced}
              onChange={(e) => setFormData({ ...formData, partsReplaced: e.target.value })}
              placeholder="e.g., Brake pads, Oil filter, Battery"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Service Description/Remarks *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed description of service performed..."
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Next Service Date (Optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.nextServiceDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.nextServiceDate ? format(formData.nextServiceDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.nextServiceDate}
                  onSelect={(date) => setFormData({ ...formData, nextServiceDate: date })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-gradient-primary hover:bg-primary-hover">
              {loading ? "Adding..." : "Add Service Record"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
