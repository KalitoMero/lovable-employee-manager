
import React from 'react';
import { Employee } from '@/types';
import EmployeeCard from './EmployeeCard';
import AddEmployeeForm from './AddEmployeeForm';

interface EmployeeListProps {
  employees: Employee[];
  onAddEmployee: (name: string, costCenter: string, imageUrl: string) => void;
  onDeleteEmployee: (id: string) => void;
  isLoading?: boolean;
}

const EmployeeList: React.FC<EmployeeListProps> = ({
  employees,
  onAddEmployee,
  onDeleteEmployee,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-center animate-pulse">
          <p className="text-muted-foreground">Loading employees...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Employee List</h2>
        <AddEmployeeForm onSubmit={onAddEmployee} />
      </div>

      <div className="space-y-2">
        {employees.length === 0 ? (
          <div className="text-center py-12 bg-accent/50 rounded-lg animate-fade-in">
            <p className="text-muted-foreground">No employees found</p>
            <p className="text-sm text-muted-foreground mt-2">
              Add your first employee to get started
            </p>
          </div>
        ) : (
          employees.map((employee, index) => (
            <div key={employee.id} className="animate-slide-in" style={{ animationDelay: `${index * 0.05}s` }}>
              <EmployeeCard
                employee={employee}
                onDelete={onDeleteEmployee}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EmployeeList;
