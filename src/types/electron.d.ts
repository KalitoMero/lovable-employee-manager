
interface Window {
  electronAPI?: {
    loadEmployees: () => Promise<import('./index').Employee[]>;
    saveEmployees: (employees: import('./index').Employee[]) => Promise<boolean>;
    loadSettings: () => Promise<{ 
      notificationEmail: string | null;
      lastNotification?: string;
      emailSettings?: import('./index').EmailSettings;
    }>;
    saveSettings: (settings: { 
      notificationEmail: string | null;
      lastNotification?: string;
      emailSettings?: import('./index').EmailSettings;
    }) => Promise<boolean>;
    checkBirthdays: () => Promise<boolean>; // Add this line
  }
}
