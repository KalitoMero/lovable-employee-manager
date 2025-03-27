
import { useState, useEffect } from 'react';
import { Employee } from '@/types';
import { toast } from 'sonner';

const STORAGE_KEY = 'employee-manager-data';

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  // Load employees from localStorage
  useEffect(() => {
    try {
      const savedEmployees = localStorage.getItem(STORAGE_KEY);
      if (savedEmployees) {
        setEmployees(JSON.parse(savedEmployees));
      }
    } catch (error) {
      console.error('Error loading employees:', error);
      toast.error('Failed to load employee data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Save employees to localStorage whenever it changes
  useEffect(() => {
    if (!loading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
    }
  }, [employees, loading]);

  // Add a new employee
  const addEmployee = (employee: Omit<Employee, 'id'>) => {
    const newEmployee = {
      ...employee,
      id: crypto.randomUUID(),
    };
    
    setEmployees((prev) => [...prev, newEmployee]);
    toast.success(`${employee.name} added successfully`);
    return newEmployee;
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
  const updateEmployee = (id: string, data: Partial<Omit<Employee, 'id'>>) => {
    setEmployees((prev) =>
      prev.map((employee) =>
        employee.id === id ? { ...employee, ...data } : employee
      )
    );
    toast.success('Employee updated');
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
