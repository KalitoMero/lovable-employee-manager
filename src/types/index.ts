
export interface Employee {
  id: string;
  name: string;
  costCenter: string; // Always 3 digits
  imageUrl: string;
  entryDate?: string; // Date the employee joined
  birthDate?: string; // Employee's birth date
}
