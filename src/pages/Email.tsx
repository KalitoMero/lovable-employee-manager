
import React from 'react';
import { useEmailSettings } from '@/hooks/useEmailSettings';
import Navigation from '@/components/Navigation';
import EmailSettingsForm from '@/components/EmailSettingsForm';
import BirthdayCheckButton from '@/components/BirthdayCheckButton';
import { Toaster } from 'sonner';

const Email: React.FC = () => {
  const {
    emailSettings,
    updateGfEmail,
    updateDepartmentEmail,
    removeDepartmentEmail,
    availableCostCenters,
  } = useEmailSettings();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      <main className="flex-1 container py-8 px-4 md:px-6 animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Email-Einstellungen</h1>
          <BirthdayCheckButton />
        </div>
        
        <EmailSettingsForm
          emailSettings={emailSettings}
          updateGfEmail={updateGfEmail}
          updateDepartmentEmail={updateDepartmentEmail}
          removeDepartmentEmail={removeDepartmentEmail}
          availableCostCenters={availableCostCenters}
        />
      </main>
      <Toaster />
    </div>
  );
};

export default Email;
