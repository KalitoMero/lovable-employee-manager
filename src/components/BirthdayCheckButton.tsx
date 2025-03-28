
import React from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Calendar } from 'lucide-react';

const BirthdayCheckButton: React.FC = () => {
  const isElectron = window.electronAPI !== undefined;
  
  const handleCheckBirthdays = async () => {
    try {
      if (isElectron) {
        await window.electronAPI.checkBirthdays();
        toast.success('Geburtstage wurden überprüft');
      } else {
        toast.error('Diese Funktion ist nur in der Desktop-App verfügbar');
      }
    } catch (error) {
      console.error('Error checking birthdays:', error);
      toast.error('Fehler bei der Geburtstags-Überprüfung');
    }
  };
  
  return (
    <Button 
      onClick={handleCheckBirthdays}
      variant="outline" 
      className="gap-2"
    >
      <Calendar className="h-4 w-4" />
      Geburtstage prüfen
    </Button>
  );
};

export default BirthdayCheckButton;
