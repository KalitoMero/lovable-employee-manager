
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
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
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
  
  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  return (
    <Card className={`overflow-hidden ${detailed ? 'h-full' : ''} relative group transition-all duration-300 hover:shadow-md ${detailed ? 'p-4' : ''}`}>
      <CardContent className={`${detailed ? 'p-6 flex flex-col items-center' : 'p-4 flex items-center'}`}>
        <Avatar className={`${detailed ? 'h-26 w-26' : 'h-10 w-10'} ${detailed ? 'mb-4' : 'mr-3'} flex-shrink-0 ${detailed ? 'border-[5px]' : 'border-[2px]'} border-primary/30`}>
          <AvatarImage 
            src={employee.imageUrl || '/placeholder.svg'} 
            alt={`Foto von ${employee.name}`}
            onError={(e) => {
              // Fallback for image errors
              (e.target as HTMLImageElement).src = '/placeholder.svg';
            }}
          />
          <AvatarFallback>{getInitials(employee.name)}</AvatarFallback>
        </Avatar>
        
        <div className={`${detailed ? 'text-center w-full' : 'flex-1 min-w-0'}`}>
          <h3 className={`font-medium ${detailed ? 'text-xl mt-2' : ''} truncate`}>{employee.name}</h3>
          {showCostCenter && !detailed && (
            <p className="text-sm text-muted-foreground truncate">
              KST: {employee.costCenter}
            </p>
          )}
        </div>
        
        <div className={`flex ${detailed ? 'absolute top-2 right-2' : 'ml-2'}`}>
          {onUpdate && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditDialogOpen(true)}
              className="p-1 h-8 w-8"
            >
              <Edit className="h-4 w-4" />
              <span className="sr-only">Kostenstelle bearbeiten</span>
            </Button>
          )}
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="p-1 h-8 w-8 text-destructive hover:text-destructive">
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
