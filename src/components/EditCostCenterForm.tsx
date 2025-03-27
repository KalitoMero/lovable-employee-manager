
import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Employee } from '@/types';

const formSchema = z.object({
  costCenter: z.string()
    .length(3, 'Kostenstelle muss genau 3 Zeichen lang sein')
    .regex(/^\d{3}$/, 'Kostenstelle muss aus 3 Ziffern bestehen'),
});

type FormValues = z.infer<typeof formSchema>;

interface EditCostCenterFormProps {
  employee: Employee;
  onUpdate: (id: string, data: Partial<Employee>) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const EditCostCenterForm: React.FC<EditCostCenterFormProps> = ({ 
  employee, 
  onUpdate,
  open,
  onOpenChange
}) => {
  const [internalOpen, setInternalOpen] = React.useState(false);
  
  // Use controlled or uncontrolled state based on props
  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      costCenter: employee.costCenter,
    },
  });

  const onSubmit = async (values: FormValues) => {
    onUpdate(employee.id, { costCenter: values.costCenter });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Kostenstelle bearbeiten</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="costCenter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kostenstelle</FormLabel>
                  <FormControl>
                    <Input placeholder="z.B. 123" {...field} maxLength={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Abbrechen
              </Button>
              <Button type="submit">Speichern</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditCostCenterForm;
