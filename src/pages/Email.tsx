
import React from 'react';
import { useEmailSettings } from '@/hooks/useEmailSettings';
import Navigation from '@/components/Navigation';
import EmailSettingsForm from '@/components/EmailSettingsForm';

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
        <EmailSettingsForm
          emailSettings={emailSettings}
          updateGfEmail={updateGfEmail}
          updateDepartmentEmail={updateDepartmentEmail}
          removeDepartmentEmail={removeDepartmentEmail}
          availableCostCenters={availableCostCenters}
        />
      </main>
    </div>
  );
};

export default Email;
