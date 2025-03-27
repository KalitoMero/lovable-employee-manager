
import { useState, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { EmailSettings, DepartmentEmail } from '@/types';
import { useEmployees } from './useEmployees';

const EMPTY_GF_EMAILS = ['', '', '', '', ''];
const DEFAULT_EMAIL_SETTINGS: EmailSettings = {
  gf: EMPTY_GF_EMAILS,
  departmentEmails: [],
};

export function useEmailSettings() {
  const [emailSettings, setEmailSettings] = useLocalStorage<EmailSettings>(
    'employee-manager-email-settings',
    DEFAULT_EMAIL_SETTINGS
  );
  const { getCostCenters } = useEmployees();
  const costCenters = getCostCenters();

  // Update GF emails
  const updateGfEmail = (index: number, email: string) => {
    if (index < 0 || index >= 5) return;
    
    const updatedGf = [...emailSettings.gf];
    updatedGf[index] = email;
    
    setEmailSettings({
      ...emailSettings,
      gf: updatedGf,
    });
  };

  // Add or update department email
  const updateDepartmentEmail = (index: number, email: string, costCenter: string) => {
    const updatedDepartmentEmails = [...emailSettings.departmentEmails];
    
    if (index >= 0 && index < updatedDepartmentEmails.length) {
      // Update existing
      updatedDepartmentEmails[index] = { email, costCenter };
    } else if (index === updatedDepartmentEmails.length) {
      // Add new
      updatedDepartmentEmails.push({ email, costCenter });
    }
    
    setEmailSettings({
      ...emailSettings,
      departmentEmails: updatedDepartmentEmails,
    });
  };

  // Remove department email
  const removeDepartmentEmail = (index: number) => {
    if (index < 0 || index >= emailSettings.departmentEmails.length) return;
    
    const updatedDepartmentEmails = emailSettings.departmentEmails.filter((_, i) => i !== index);
    
    setEmailSettings({
      ...emailSettings,
      departmentEmails: updatedDepartmentEmails,
    });
  };

  // Get emails for notification based on employee's cost center
  const getNotificationEmails = (employeeCostCenter: string): string[] => {
    // Get all GF emails that are not empty
    const gfEmails = emailSettings.gf.filter(email => email.trim() !== '');
    
    // Get department-specific emails for the employee's cost center
    const departmentEmail = emailSettings.departmentEmails
      .find(item => item.costCenter === employeeCostCenter)?.email;
    
    // Combine all emails, adding the department email if it exists
    return departmentEmail ? [...gfEmails, departmentEmail] : gfEmails;
  };

  return {
    emailSettings,
    updateGfEmail,
    updateDepartmentEmail,
    removeDepartmentEmail,
    getNotificationEmails,
    availableCostCenters: costCenters,
  };
}
