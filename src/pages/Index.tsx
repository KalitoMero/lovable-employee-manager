
import React from 'react';
import { useEmployees } from '@/hooks/useEmployees';
import EmployeeList from '@/components/EmployeeList';
import Navigation from '@/components/Navigation';
import EmailNotificationSettings from '@/components/EmailNotificationSettings';

const Index: React.FC = () => {
  const {
    employees,
    loading,
    addEmployee,
    deleteEmployee,
    updateEmployee,
    sortField,
    sortDirection,
    setSorting,
  } = useEmployees();

  const handleAddEmployee = (name: string, costCenter: string, imageUrl: string, entryDate?: string, birthDate?: string) => {
    addEmployee({ name, costCenter, imageUrl, entryDate, birthDate });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      <main className="flex-1 container py-8 px-4 md:px-6 animate-fade-in">
        <EmailNotificationSettings />
        
        <EmployeeList
          employees={employees}
          onAddEmployee={handleAddEmployee}
          onDeleteEmployee={deleteEmployee}
          onUpdateEmployee={updateEmployee}
          isLoading={loading}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={setSorting}
        />
      </main>
    </div>
  );
};

export default Index;
