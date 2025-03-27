
import React from 'react';
import { Employee } from '@/types';
import EmployeeCard from './EmployeeCard';
import AddEmployeeForm from './AddEmployeeForm';
import { SortField, SortDirection } from '@/hooks/useEmployees';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface EmployeeListProps {
  employees: Employee[];
  onAddEmployee: (name: string, costCenter: string, imageUrl: string) => void;
  onDeleteEmployee: (id: string) => void;
  onUpdateEmployee?: (id: string, data: Partial<Employee>) => void;
  isLoading?: boolean;
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
}

const EmployeeList: React.FC<EmployeeListProps> = ({
  employees,
  onAddEmployee,
  onDeleteEmployee,
  onUpdateEmployee,
  isLoading = false,
  sortField,
  sortDirection,
  onSort,
}) => {
  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-center animate-pulse">
          <p className="text-muted-foreground">Mitarbeiter werden geladen...</p>
        </div>
      </div>
    );
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? 
      <ArrowUp className="h-4 w-4 ml-1" /> : 
      <ArrowDown className="h-4 w-4 ml-1" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Mitarbeiterliste</h2>
        <AddEmployeeForm onSubmit={onAddEmployee} />
      </div>

      {employees.length > 0 && (
        <div className="flex gap-4 mb-4">
          <button 
            onClick={() => onSort('name')}
            className="flex items-center text-sm font-medium hover:text-primary transition-colors"
          >
            Nach Name sortieren {getSortIcon('name')}
          </button>
          <button 
            onClick={() => onSort('costCenter')}
            className="flex items-center text-sm font-medium hover:text-primary transition-colors"
          >
            Nach Kostenstelle sortieren {getSortIcon('costCenter')}
          </button>
        </div>
      )}

      <div className="space-y-2">
        {employees.length === 0 ? (
          <div className="text-center py-12 bg-accent/50 rounded-lg animate-fade-in">
            <p className="text-muted-foreground">Keine Mitarbeiter gefunden</p>
            <p className="text-sm text-muted-foreground mt-2">
              Fügen Sie Ihren ersten Mitarbeiter hinzu, um zu beginnen
            </p>
          </div>
        ) : (
          employees.map((employee, index) => (
            <div key={employee.id} className="animate-slide-in" style={{ animationDelay: `${index * 0.05}s` }}>
              <EmployeeCard
                employee={employee}
                onDelete={onDeleteEmployee}
                onUpdate={onUpdateEmployee}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EmployeeList;
