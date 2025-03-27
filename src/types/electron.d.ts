
interface Window {
  electronAPI?: {
    loadEmployees: () => Promise<import('./index').Employee[]>;
    saveEmployees: (employees: import('./index').Employee[]) => Promise<boolean>;
    loadSettings: () => Promise<{ 
      notificationEmail: string | null;
      lastNotification?: string;
    }>;
    saveSettings: (settings: { 
      notificationEmail: string | null;
      lastNotification?: string;
    }) => Promise<boolean>;
  }
}
