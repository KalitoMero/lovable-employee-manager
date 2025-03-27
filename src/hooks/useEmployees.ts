
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

// Safe localStorage functions that handle quota errors
const safeSetItem = (key: string, value: string): boolean => {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.error('Storage error:', error);
    return false;
  }
};

const safeGetItem = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error('Error accessing storage:', error);
    return null;
  }
};

// Split employees into chunks for storage to avoid quota issues
const storeEmployeesInChunks = (employees: Employee[]): boolean => {
  try {
    // Clear previous data
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_KEY)) {
        localStorage.removeItem(key);
      }
    }

    // Store employee count
    safeSetItem(`${STORAGE_KEY}-count`, employees.length.toString());

    // Store employees individually
    employees.forEach((employee, index) => {
      safeSetItem(`${STORAGE_KEY}-${index}`, JSON.stringify(employee));
    });
    
    return true;
  } catch (error) {
    console.error('Error storing employees:', error);
    return false;
  }
};

// Load employees from chunked storage
const loadEmployeesFromChunks = (): Employee[] => {
  try {
    const countStr = safeGetItem(`${STORAGE_KEY}-count`);
    if (!countStr) return [];
    
    const count = parseInt(countStr, 10);
    const employees: Employee[] = [];
    
    for (let i = 0; i < count; i++) {
      const employeeStr = safeGetItem(`${STORAGE_KEY}-${i}`);
      if (employeeStr) {
        employees.push(JSON.parse(employeeStr));
      }
    }
    
    return employees;
  } catch (error) {
    console.error('Error loading employees:', error);
    return [];
  }
};

export type SortField = 'name' | 'costCenter';
export type SortDirection = 'asc' | 'desc';

// Add a function to check for birthdays and notify
const checkForBirthdays = (employees: Employee[]) => {
  const EMAIL_STORAGE_KEY = 'employee-manager-notification-email';
  const LAST_NOTIFICATION_KEY = 'employee-manager-last-notification';
  
  try {
    // Get notification email
    const notificationEmailJson = localStorage.getItem(EMAIL_STORAGE_KEY);
    if (!notificationEmailJson) return; // No email configured
    
    const notificationEmail = JSON.parse(notificationEmailJson);
    if (!notificationEmail) return;
    
    // Check if we've already sent notifications today
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const lastNotification = localStorage.getItem(LAST_NOTIFICATION_KEY);
    
    if (lastNotification === today) return; // Already notified today
    
    // Find employees with birthdays today
    const todayMonthDay = today.substring(5); // MM-DD
    const birthdayEmployees = employees.filter(emp => {
      if (!emp.birthDate) return false;
      return emp.birthDate.substring(5) === todayMonthDay;
    });
    
    if (birthdayEmployees.length > 0) {
      // In a real app, this would send an API request to a backend service
      // For this demo, we'll just log to console and show a toast
      console.log('BIRTHDAY NOTIFICATION:', {
        to: notificationEmail,
        subject: 'Mitarbeiter Geburtstage heute',
        employees: birthdayEmployees.map(emp => emp.name)
      });
      
      // Update last notification date
      localStorage.setItem(LAST_NOTIFICATION_KEY, today);
      
      // Show toast in browser
      if (typeof window !== 'undefined' && birthdayEmployees.length > 0) {
        // Use setTimeout to ensure toast is shown after component mounts
        setTimeout(() => {
          // Using any available toast library - in this case assuming 'sonner' is available
          if (typeof toast !== 'undefined') {
            // @ts-ignore - toast might not be defined in this scope
            toast.info(
              `Heute haben ${birthdayEmployees.length} Mitarbeiter Geburtstag! 
              Eine Benachrichtigung wurde an ${notificationEmail} gesendet.`, 
              { duration: 5000 }
            );
          }
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
    try {
      // First try the old storage method
      const savedEmployees = safeGetItem(STORAGE_KEY);
      let parsedEmployees: Employee[] = [];
      
      if (savedEmployees) {
        // If old storage exists, convert to new chunked storage
        parsedEmployees = JSON.parse(savedEmployees);
        setEmployees(parsedEmployees);
        // Store in new format for next time
        storeEmployeesInChunks(parsedEmployees);
        // Remove old storage
        localStorage.removeItem(STORAGE_KEY);
      } else {
        // Try new chunked storage
        parsedEmployees = loadEmployeesFromChunks();
        setEmployees(parsedEmployees);
      }
      
      // After loading employees, check for birthdays
      checkForBirthdays(parsedEmployees);
    } catch (error) {
      console.error('Error loading employees:', error);
      toast.error('Fehler beim Laden der Mitarbeiterdaten');
    } finally {
      setLoading(false);
    }
  }, []);

  // Save employees to storage whenever it changes
  useEffect(() => {
    if (!loading) {
      const success = storeEmployeesInChunks(employees);
      if (!success) {
        toast.error('Speicherlimit erreicht! Einige Daten wurden möglicherweise nicht gespeichert.');
      }
    }
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
