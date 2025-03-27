
export interface Employee {
  id: string;
  name: string;
  costCenter: string; // Always 3 digits
  imageUrl: string;
  entryDate?: string; // Date the employee joined
  birthDate?: string; // Employee's birth date
}

export interface EmailSettings {
  gf: string[]; // Array of GF emails (5 fields)
  departmentEmails: DepartmentEmail[]; // Department specific emails
}

export interface DepartmentEmail {
  email: string;
  costCenter: string;
}

export interface AppSettings {
  notificationEmail: string; // Email for notifications (keeping for backward compatibility)
}
