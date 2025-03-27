
import React from 'react';
import { Employee } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import EditCostCenterForm from './EditCostCenterForm';

interface EmployeeCardProps {
  employee: Employee;
  onDelete: (id: string) => void;
  onUpdate?: (id: string, data: Partial<Employee>) => void;
  showCostCenter?: boolean;
  detailed?: boolean;
}

const EmployeeCard: React.FC<EmployeeCardProps> = ({
  employee,
  onDelete,
  onUpdate,
  showCostCenter = true,
  detailed = false,
}) => {
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  
  return (
    <Card className={`overflow-hidden ${detailed ? 'h-full' : ''} relative group transition-all duration-300 hover:shadow-md`}>
      <div className="relative w-full h-48">
        <img
          src={employee.imageUrl || '/placeholder.svg'}
          alt={`Foto von ${employee.name}`}
          className="object-cover w-full h-full"
          onError={(e) => {
            // Fallback für fehlerhafte Bilder
            (e.target as HTMLImageElement).src = '/placeholder.svg';
          }}
        />
        
        <div className="absolute bottom-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onUpdate && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setEditDialogOpen(true)}
            >
              <Edit className="h-4 w-4" />
              <span className="sr-only">Kostenstelle bearbeiten</span>
            </Button>
          )}
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Mitarbeiter löschen</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Mitarbeiter löschen</AlertDialogTitle>
                <AlertDialogDescription>
                  Möchten Sie {employee.name} wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(employee.id)}>
                  Löschen
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-medium truncate">{employee.name}</h3>
        {showCostCenter && (
          <p className="text-sm text-muted-foreground">
            KST: {employee.costCenter}
          </p>
        )}
        {detailed && (
          <div className="mt-2 space-y-1">
            <p className="text-sm">KST: {employee.costCenter}</p>
            {/* Weitere Details könnten hier angezeigt werden */}
          </div>
        )}
      </CardContent>
      
      {/* Edit Dialog */}
      {onUpdate && (
        <EditCostCenterForm
          employee={employee}
          onUpdate={onUpdate}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
        />
      )}
    </Card>
  );
};

export default EmployeeCard;
