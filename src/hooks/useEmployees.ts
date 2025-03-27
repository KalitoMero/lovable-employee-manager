
import { useState, useEffect } from 'react';
import { Employee } from '@/types';
import { toast } from 'sonner';

const STORAGE_KEY = 'employee-manager-data';

// Function to compress image before storage
const compressImage = async (base64Image: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Image;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Calculate new dimensions (reduce size by 50%)
      const maxWidth = 400;
      const maxHeight = 400;
      let width = img.width;
      let height = img.height;
      
      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw resized image to canvas
      ctx?.drawImage(img, 0, 0, width, height);
      
      // Get compressed image as JPEG with reduced quality
      const compressedImage = canvas.toDataURL('image/jpeg', 0.7);
      resolve(compressedImage);
    };
  });
};

// Check if we're running in Electron
const isElectron = window.electronAPI !== undefined;

export type SortField = 'name' | 'costCenter';
export type SortDirection = 'asc' | 'desc';

// Add a function to check for birthdays and notify
const checkForBirthdays = async (employees: Employee[]) => {
  const EMAIL_STORAGE_KEY = 'employee-manager-notification-email';
  
  try {
    let notificationEmail;
    
    // Get notification email based on environment
    if (isElectron) {
      // Get from Electron
      const settings = await window.electronAPI.loadSettings();
      notificationEmail = settings.notificationEmail;
    } else {
      // Get from localStorage
      const notificationEmailJson = localStorage.getItem(EMAIL_STORAGE_KEY);
      if (notificationEmailJson) {
        notificationEmail = JSON.parse(notificationEmailJson);
      }
    }
    
    if (!notificationEmail) return; // No email configured
    
    // Check if we've already sent notifications today
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const LAST_NOTIFICATION_KEY = 'employee-manager-last-notification';
    let lastNotification;
    
    if (isElectron) {
      const settings = await window.electronAPI.loadSettings();
      lastNotification = settings.lastNotification;
    } else {
      lastNotification = localStorage.getItem(LAST_NOTIFICATION_KEY);
    }
    
    if (lastNotification === today) return; // Already notified today
    
    // Find employees with birthdays today
    const todayMonthDay = today.substring(5); // MM-DD
    const birthdayEmployees = employees.filter(emp => {
      if (!emp.birthDate) return false;
      return emp.birthDate.substring(5) === todayMonthDay;
    });
    
    if (birthdayEmployees.length > 0) {
      console.log('BIRTHDAY NOTIFICATION:', {
        to: notificationEmail,
        subject: 'Mitarbeiter Geburtstage heute',
        employees: birthdayEmployees.map(emp => emp.name)
      });
      
      // Update last notification date
      if (isElectron) {
        await window.electronAPI.saveSettings({
          notificationEmail,
          lastNotification: today
        });
      } else {
        localStorage.setItem(LAST_NOTIFICATION_KEY, today);
      }
      
      // Show toast in browser
      if (birthdayEmployees.length > 0) {
        // Use setTimeout to ensure toast is shown after component mounts
        setTimeout(() => {
          toast.info(
            `Heute haben ${birthdayEmployees.length} Mitarbeiter Geburtstag! 
            Eine Benachrichtigung wurde an ${notificationEmail} gesendet.`, 
            { duration: 5000 }
          );
        }, 1000);
      }
    }
  } catch (error) {
    console.error('Error in birthday notification check:', error);
  }
};

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Load employees from storage
  useEffect(() => {
    const loadEmployeesData = async () => {
      try {
        let parsedEmployees: Employee[] = [];
        
        if (isElectron) {
          // Load from Electron's file system
          parsedEmployees = await window.electronAPI.loadEmployees();
        } else {
          // Try the old localStorage method
          const savedEmployees = localStorage.getItem(STORAGE_KEY);
          
          if (savedEmployees) {
            parsedEmployees = JSON.parse(savedEmployees);
          } else {
            // Try chunked storage in localStorage
            const countStr = localStorage.getItem(`${STORAGE_KEY}-count`);
            if (countStr) {
              const count = parseInt(countStr, 10);
              
              for (let i = 0; i < count; i++) {
                const employeeStr = localStorage.getItem(`${STORAGE_KEY}-${i}`);
                if (employeeStr) {
                  parsedEmployees.push(JSON.parse(employeeStr));
                }
              }
            }
          }
        }
        
        setEmployees(parsedEmployees);
        
        // After loading employees, check for birthdays
        checkForBirthdays(parsedEmployees);
      } catch (error) {
        console.error('Error loading employees:', error);
        toast.error('Fehler beim Laden der Mitarbeiterdaten');
      } finally {
        setLoading(false);
      }
    };
    
    loadEmployeesData();
  }, []);

  // Save employees to storage whenever it changes
  useEffect(() => {
    const saveEmployeesData = async () => {
      if (!loading) {
        try {
          if (isElectron) {
            // Save to Electron's file system
            await window.electronAPI.saveEmployees(employees);
          } else {
            // Try to save to localStorage in chunks
            // Clear previous data
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key && key.startsWith(STORAGE_KEY)) {
                localStorage.removeItem(key);
              }
            }
            
            // Store employee count
            localStorage.setItem(`${STORAGE_KEY}-count`, employees.length.toString());
            
            // Store employees individually
            employees.forEach((employee, index) => {
              localStorage.setItem(`${STORAGE_KEY}-${index}`, JSON.stringify(employee));
            });
          }
        } catch (error) {
          console.error('Error saving employees:', error);
          toast.error('Fehler beim Speichern der Mitarbeiterdaten');
        }
      }
    };
    
    saveEmployeesData();
  }, [employees, loading]);

  // Sort employees based on current sort field and direction
  const sortedEmployees = [...employees].sort((a, b) => {
    if (sortField === 'name') {
      return sortDirection === 'asc' 
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    } else {
      return sortDirection === 'asc'
        ? a.costCenter.localeCompare(b.costCenter)
        : b.costCenter.localeCompare(a.costCenter);
    }
  });

  // Add a new employee
  const addEmployee = async (employee: Omit<Employee, 'id'>) => {
    try {
      // Compress image before storage
      const compressedImageUrl = await compressImage(employee.imageUrl);
      
      const newEmployee = {
        ...employee,
        id: crypto.randomUUID(),
        imageUrl: compressedImageUrl
      };
      
      setEmployees((prev) => [...prev, newEmployee]);
      toast.success(`${employee.name} erfolgreich hinzugefügt`);
      return newEmployee;
    } catch (error) {
      console.error('Error adding employee:', error);
      toast.error('Fehler beim Hinzufügen des Mitarbeiters');
      throw error;
    }
  };

  // Delete an employee
  const deleteEmployee = (id: string) => {
    const employeeToDelete = employees.find(emp => emp.id === id);
    setEmployees((prev) => prev.filter((employee) => employee.id !== id));
    
    if (employeeToDelete) {
      toast.success(`${employeeToDelete.name} entfernt`);
    }
  };

  // Update an employee
  const updateEmployee = async (id: string, data: Partial<Omit<Employee, 'id'>>) => {
    try {
      let processedData = { ...data };
      
      // If imageUrl is being updated, compress it
      if (data.imageUrl) {
        processedData.imageUrl = await compressImage(data.imageUrl);
      }
      
      setEmployees((prev) =>
        prev.map((employee) =>
          employee.id === id ? { ...employee, ...processedData } : employee
        )
      );
      toast.success('Mitarbeiter aktualisiert');
    } catch (error) {
      console.error('Error updating employee:', error);
      toast.error('Fehler beim Aktualisieren des Mitarbeiters');
    }
  };

  // Get all unique cost centers
  const getCostCenters = (): string[] => {
    const costCenters = new Set(employees.map((employee) => employee.costCenter));
    return Array.from(costCenters).sort();
  };

  // Get employees by cost center
  const getEmployeesByCostCenter = (costCenter: string): Employee[] => {
    return employees.filter((employee) => employee.costCenter === costCenter);
  };

  // Set sort field and direction
  const setSorting = (field: SortField) => {
    if (field === sortField) {
      // Toggle direction if clicking on the same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Default to ascending order when changing fields
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return {
    employees: sortedEmployees,
    loading,
    addEmployee,
    deleteEmployee,
    updateEmployee,
    getCostCenters,
    getEmployeesByCostCenter,
    sortField,
    sortDirection,
    setSorting,
  };
}
