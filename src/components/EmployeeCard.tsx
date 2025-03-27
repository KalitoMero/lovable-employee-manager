
import React from 'react';
import { Trash } from 'lucide-react';
import { Employee } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface EmployeeCardProps {
  employee: Employee;
  onDelete: (id: string) => void;
  showCostCenter?: boolean;
  detailed?: boolean;
}

const EmployeeCard: React.FC<EmployeeCardProps> = ({
  employee,
  onDelete,
  showCostCenter = true,
  detailed = false,
}) => {
  return (
    <Card className={`w-full overflow-hidden employee-card-hover ${detailed ? 'glass-card' : ''}`}>
      <CardContent className={`p-0 ${detailed ? 'relative' : ''}`}>
        {detailed ? (
          <div className="flex flex-col items-center p-6 animate-fade-up">
            <div className="w-32 h-32 rounded-full overflow-hidden mb-4 border-2 border-white/70 shadow-subtle">
              <img
                src={employee.imageUrl || '/placeholder.svg'}
                alt={employee.name}
                className="w-full h-full object-cover transform transition-transform duration-700 hover:scale-110"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.svg';
                }}
              />
            </div>
            <h3 className="text-xl font-medium mt-2">{employee.name}</h3>
            {showCostCenter && (
              <div className="bg-secondary/70 backdrop-blur-xs px-3 py-1 rounded-full text-sm text-muted-foreground my-2">
                Cost Center: {employee.costCenter}
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              onClick={() => onDelete(employee.id)}
            >
              <Trash size={18} />
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-border">
                <img
                  src={employee.imageUrl || '/placeholder.svg'}
                  alt={employee.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
              </div>
              <div>
                <h3 className="font-medium">{employee.name}</h3>
                {showCostCenter && (
                  <p className="text-sm text-muted-foreground">
                    {employee.costCenter}
                  </p>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              onClick={() => onDelete(employee.id)}
            >
              <Trash size={16} />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EmployeeCard;
