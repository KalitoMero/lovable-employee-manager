
import { useState, useEffect } from 'react';

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void] {
  // Check if we're running in Electron
  const isElectron = typeof window !== 'undefined' && window.electronAPI !== undefined;
  
  // Get from local storage then
  // parse stored json or return initialValue
  const readValue = async (): Promise<T> => {
    // Prevent build error on server
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      if (isElectron) {
        // Use Electron's storage for settings
        const settings = await window.electronAPI.loadSettings();
        
        if (key === 'employee-manager-notification-email') {
          // Return notification email
          return (settings.notificationEmail as unknown as T) || initialValue;
        } else if (key === 'employee-manager-email-settings') {
          // Return email settings
          return (settings.emailSettings as unknown as T) || initialValue;
        } else {
          // For other keys, use localStorage
          const item = window.localStorage.getItem(key);
          return item ? (JSON.parse(item) as T) : initialValue;
        }
      } else {
        // Use regular localStorage
        const item = window.localStorage.getItem(key);
        return item ? (JSON.parse(item) as T) : initialValue;
      }
    } catch (error) {
      console.warn(`Error reading storage key "${key}":`, error);
      return initialValue;
    }
  };

  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [initialized, setInitialized] = useState(false);

  // Load the value on initial render
  useEffect(() => {
    const init = async () => {
      const value = await readValue();
      setStoredValue(value);
      setInitialized(true);
    };
    
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to storage.
  const setValue = async (value: T) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      
      // Save to state
      setStoredValue(valueToStore);
      
      // Save to storage
      if (typeof window !== 'undefined') {
        if (isElectron) {
          // For Electron storage
          if (key === 'employee-manager-notification-email') {
            // Save notification email
            await window.electronAPI.saveSettings({
              notificationEmail: valueToStore as string,
            });
          } else if (key === 'employee-manager-email-settings') {
            // Save email settings
            const currentSettings = await window.electronAPI.loadSettings();
            await window.electronAPI.saveSettings({
              ...currentSettings,
              emailSettings: valueToStore
            });
          } else {
            // For other keys, use localStorage
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
          }
        } else {
          // Use regular localStorage
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      }
    } catch (error) {
      console.warn(`Error setting storage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}
