
import React from 'react';
import { useEmployees } from '@/hooks/useEmployees';
import DepartmentView from '@/components/DepartmentView';
import Navigation from '@/components/Navigation';

const Departments: React.FC = () => {
  const {
    loading,
    deleteEmployee,
    updateEmployee,
    getCostCenters,
    getEmployeesByCostCenter,
  } = useEmployees();

  const costCenters = getCostCenters();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      <main className="flex-1 container py-8 px-4 md:px-6 animate-fade-in">
        <DepartmentView
          costCenters={costCenters}
          getEmployeesByDepartment={getEmployeesByCostCenter}
          onDeleteEmployee={deleteEmployee}
          onUpdateEmployee={updateEmployee}
          isLoading={loading}
        />
      </main>
    </div>
  );
};

export default Departments;
