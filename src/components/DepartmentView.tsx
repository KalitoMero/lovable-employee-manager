
import React, { useState, useEffect } from 'react';
import { Employee } from '@/types';
import EmployeeCard from './EmployeeCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface DepartmentViewProps {
  costCenters: string[];
  getEmployeesByDepartment: (costCenter: string) => Employee[];
  onDeleteEmployee: (id: string) => void;
  onUpdateEmployee?: (id: string, data: Partial<Employee>) => void;
  isLoading?: boolean;
}

const DepartmentView: React.FC<DepartmentViewProps> = ({
  costCenters,
  getEmployeesByDepartment,
  onDeleteEmployee,
  onUpdateEmployee,
  isLoading = false,
}) => {
  const [activeTab, setActiveTab] = useState<string>(costCenters[0] || '');

  // Update active tab when cost centers change
  useEffect(() => {
    if (costCenters.length > 0 && !costCenters.includes(activeTab)) {
      setActiveTab(costCenters[0]);
    }
  }, [costCenters, activeTab]);

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-center animate-pulse">
          <p className="text-muted-foreground">Abteilungen werden geladen...</p>
        </div>
      </div>
    );
  }

  if (costCenters.length === 0) {
    return (
      <div className="text-center py-12 bg-accent/50 rounded-lg animate-fade-in">
        <p className="text-muted-foreground">Keine Abteilungen gefunden</p>
        <p className="text-sm text-muted-foreground mt-2">
          Fügen Sie Mitarbeiter mit Kostenstellen hinzu, um Abteilungen zu erstellen
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Abteilungsansicht</h2>
      
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="mb-8 bg-background border border-border/50 p-1 w-full flex overflow-x-auto">
          {costCenters.map((costCenter) => (
            <TabsTrigger
              key={costCenter}
              value={costCenter}
              className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow-subtle transition-all duration-300"
            >
              Abteilung {costCenter}
            </TabsTrigger>
          ))}
        </TabsList>

        {costCenters.map((costCenter) => (
          <TabsContent key={costCenter} value={costCenter} className="animate-fade-up">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {getEmployeesByDepartment(costCenter).map((employee) => (
                <div key={employee.id} className="animate-scale-in">
                  <EmployeeCard
                    employee={employee}
                    onDelete={onDeleteEmployee}
                    onUpdate={onUpdateEmployee}
                    showCostCenter={false}
                    detailed
                  />
                </div>
              ))}
              {getEmployeesByDepartment(costCenter).length === 0 && (
                <div className="col-span-full text-center py-8 bg-accent/50 rounded-lg">
                  <p className="text-muted-foreground">Keine Mitarbeiter in dieser Abteilung</p>
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default DepartmentView;
