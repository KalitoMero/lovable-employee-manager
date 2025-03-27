
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

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  // Load employees from storage
  useEffect(() => {
    try {
      // First try the old storage method
      const savedEmployees = safeGetItem(STORAGE_KEY);
      
      if (savedEmployees) {
        // If old storage exists, convert to new chunked storage
        const parsedEmployees = JSON.parse(savedEmployees);
        setEmployees(parsedEmployees);
        // Store in new format for next time
        storeEmployeesInChunks(parsedEmployees);
        // Remove old storage
        localStorage.removeItem(STORAGE_KEY);
      } else {
        // Try new chunked storage
        const loadedEmployees = loadEmployeesFromChunks();
        setEmployees(loadedEmployees);
      }
    } catch (error) {
      console.error('Error loading employees:', error);
      toast.error('Failed to load employee data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Save employees to storage whenever it changes
  useEffect(() => {
    if (!loading) {
      const success = storeEmployeesInChunks(employees);
      if (!success) {
        toast.error('Storage limit reached! Some data may not be saved.');
      }
    }
  }, [employees, loading]);

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
      toast.success(`${employee.name} added successfully`);
      return newEmployee;
    } catch (error) {
      console.error('Error adding employee:', error);
      toast.error('Failed to add employee');
      throw error;
    }
  };

  // Delete an employee
  const deleteEmployee = (id: string) => {
    const employeeToDelete = employees.find(emp => emp.id === id);
    setEmployees((prev) => prev.filter((employee) => employee.id !== id));
    
    if (employeeToDelete) {
      toast.success(`${employeeToDelete.name} removed`);
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
      toast.success('Employee updated');
    } catch (error) {
      console.error('Error updating employee:', error);
      toast.error('Failed to update employee');
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

  return {
    employees,
    loading,
    addEmployee,
    deleteEmployee,
    updateEmployee,
    getCostCenters,
    getEmployeesByCostCenter,
  };
}
