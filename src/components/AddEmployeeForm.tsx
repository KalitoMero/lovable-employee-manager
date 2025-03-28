
import React, { useState } from 'react';
import { Plus, Upload, X, Calendar, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AddEmployeeFormProps {
  onSubmit: (name: string, costCenter: string, imageUrl: string, entryDate?: string, birthDate?: string) => void;
}

const AddEmployeeForm: React.FC<AddEmployeeFormProps> = ({ onSubmit }) => {
  const [name, setName] = useState('');
  const [costCenter, setCostCenter] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [entryDate, setEntryDate] = useState<Date | undefined>(undefined);
  const [birthDate, setBirthDate] = useState<Date | undefined>(undefined);
  const [open, setOpen] = useState(false);
  
  // Year selection for birthdate
  const [yearView, setYearView] = useState(false);
  const [decadeView, setDecadeView] = useState(false);
  const [selectedDecade, setSelectedDecade] = useState<number | null>(null);
  const currentYear = new Date().getFullYear();
  
  // Generate decades for selection (from 1920 to current year)
  const decades = Array.from({ length: Math.ceil((currentYear - 1920) / 10) }, (_, i) => 1920 + i * 10);
  
  // Generate years for a specific decade
  const getYearsForDecade = (decade: number) => {
    return Array.from({ length: 10 }, (_, i) => decade + i);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check if the file is a JPEG
      if (file.type !== 'image/jpeg') {
        toast.error('Please upload a JPEG image');
        return;
      }
      
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const clearForm = () => {
    setName('');
    setCostCenter('');
    setImageFile(null);
    setImagePreview(null);
    setEntryDate(undefined);
    setBirthDate(undefined);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate cost center is exactly 3 digits
    if (!/^\d{3}$/.test(costCenter)) {
      toast.error('Cost center must be exactly 3 digits');
      return;
    }

    if (!name) {
      toast.error('Name is required');
      return;
    }

    if (!imageFile) {
      toast.error('Please upload an employee image');
      return;
    }

    // Convert image to base64 for storage
    const reader = new FileReader();
    reader.onloadend = () => {
      onSubmit(
        name, 
        costCenter, 
        reader.result as string,
        entryDate ? format(entryDate, 'yyyy-MM-dd') : undefined,
        birthDate ? format(birthDate, 'yyyy-MM-dd') : undefined
      );
      clearForm();
      setOpen(false);
    };
    reader.readAsDataURL(imageFile);
  };
  
  // Handle year selection
  const handleSelectYear = (year: number) => {
    const newDate = new Date(birthDate || new Date());
    newDate.setFullYear(year);
    setBirthDate(newDate);
    setYearView(false);
  };
  
  // Handle decade selection
  const handleSelectDecade = (decade: number) => {
    setSelectedDecade(decade);
    setDecadeView(false);
    setYearView(true);
  };
  
  // Toggle between decade/year view
  const toggleCalendarView = () => {
    if (yearView) {
      setYearView(false);
      setDecadeView(true);
    } else if (decadeView) {
      setDecadeView(false);
    } else {
      setYearView(true);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="animate-fade-in transition-all duration-300 hover:shadow-hover">
          <Plus className="mr-2 h-4 w-4" /> Add Employee
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Employee</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Employee Name"
              className="transition-all duration-300 focus:ring-2 focus:ring-primary/20"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="costCenter">Cost Center (3 digits)</Label>
            <Input
              id="costCenter"
              value={costCenter}
              onChange={(e) => {
                // Only allow digits and limit to 3 characters
                const value = e.target.value.replace(/\D/g, '').slice(0, 3);
                setCostCenter(value);
              }}
              placeholder="e.g. 210"
              maxLength={3}
              className="transition-all duration-300 focus:ring-2 focus:ring-primary/20"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="entryDate">Entry Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !entryDate && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {entryDate ? format(entryDate, 'PP') : <span>Select entry date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={entryDate}
                  onSelect={setEntryDate}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="birthDate">Birth Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !birthDate && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {birthDate ? format(birthDate, 'PP') : <span>Select birth date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                {decadeView ? (
                  <div className="p-3 pointer-events-auto">
                    <div className="flex justify-between items-center mb-4">
                      <Button variant="outline" size="sm" onClick={() => setDecadeView(false)}>
                        Back
                      </Button>
                      <h3 className="text-sm font-medium">Select Decade</h3>
                      <div className="w-12"></div> {/* Spacer for alignment */}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {decades.map((decade) => (
                        <Button
                          key={decade}
                          variant="outline"
                          size="sm"
                          onClick={() => handleSelectDecade(decade)}
                          className="h-10"
                        >
                          {decade}s
                        </Button>
                      ))}
                    </div>
                  </div>
                ) : yearView ? (
                  <div className="p-3 pointer-events-auto">
                    <div className="flex justify-between items-center mb-4">
                      <Button variant="outline" size="sm" onClick={() => setYearView(false)}>
                        Back
                      </Button>
                      <h3 className="text-sm font-medium">
                        {selectedDecade}s
                      </h3>
                      <Button variant="outline" size="sm" onClick={() => setDecadeView(true)}>
                        Decades
                      </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {selectedDecade &&
                        getYearsForDecade(selectedDecade).map((year) => (
                          <Button
                            key={year}
                            variant="outline"
                            size="sm"
                            onClick={() => handleSelectYear(year)}
                            className="h-10"
                          >
                            {year}
                          </Button>
                        ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-center p-2 bg-muted/40 border-b">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={toggleCalendarView}
                        className="flex items-center text-sm font-medium"
                      >
                        {birthDate ? format(birthDate, 'MMMM yyyy') : 'Select Year'}
                        <ChevronDown className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                    <CalendarComponent
                      mode="single"
                      selected={birthDate}
                      onSelect={setBirthDate}
                      initialFocus
                      className="p-3 pointer-events-auto"
                      disabled={(date) => date > new Date()}
                      captionLayout="dropdown-buttons"
                      fromYear={1920}
                      toYear={currentYear}
                    />
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="image">Employee Image (JPEG)</Label>
            <div className="flex items-center justify-center border-2 border-dashed border-input rounded-md p-4 transition-all hover:border-primary/50">
              {imagePreview ? (
                <div className="relative w-full h-48 flex items-center justify-center">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-full max-w-full rounded-md"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <label
                  htmlFor="image"
                  className="flex flex-col items-center justify-center w-full h-32 cursor-pointer"
                >
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">
                    Click to upload JPEG
                  </span>
                  <Input
                    id="image"
                    type="file"
                    accept="image/jpeg"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                clearForm();
                setOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit">Add Employee</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEmployeeForm;
