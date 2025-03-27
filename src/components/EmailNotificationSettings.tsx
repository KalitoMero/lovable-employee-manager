
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Mail } from 'lucide-react';
import { toast } from 'sonner';
import { useLocalStorage } from '@/hooks/useLocalStorage';

const EMAIL_STORAGE_KEY = 'employee-manager-notification-email';

const EmailNotificationSettings: React.FC = () => {
  const [email, setEmail] = useLocalStorage<string>(EMAIL_STORAGE_KEY, '');
  const [tempEmail, setTempEmail] = useState(email);
  const [isEditing, setIsEditing] = useState(false);

  const handleSaveEmail = () => {
    // Simple email validation
    if (!tempEmail) {
      toast.error('Bitte geben Sie eine E-Mail-Adresse ein');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(tempEmail)) {
      toast.error('Bitte geben Sie eine gültige E-Mail-Adresse ein');
      return;
    }

    setEmail(tempEmail);
    setIsEditing(false);
    toast.success('E-Mail-Adresse gespeichert');
  };

  return (
    <div className="bg-card rounded-lg p-4 mb-6 shadow-sm border">
      <div className="flex items-center gap-2 mb-2">
        <Mail className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-medium">Geburtstags-Benachrichtigungen</h3>
      </div>
      
      {isEditing ? (
        <div className="space-y-2">
          <Label htmlFor="notification-email">E-Mail für Geburtstags-Benachrichtigungen</Label>
          <div className="flex gap-2">
            <Input
              id="notification-email"
              type="email"
              value={tempEmail}
              onChange={(e) => setTempEmail(e.target.value)}
              placeholder="ihre@email.de"
              className="flex-1"
            />
            <Button onClick={handleSaveEmail}>Speichern</Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setTempEmail(email);
                setIsEditing(false);
              }}
            >
              Abbrechen
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            An diese E-Mail-Adresse werden Benachrichtigungen über Mitarbeitergeburtstage gesendet.
          </p>
        </div>
      ) : (
        <div>
          {email ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium mb-1">Benachrichtigungen an:</p>
                <p className="text-base">{email}</p>
              </div>
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                Ändern
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Keine E-Mail-Adresse konfiguriert
              </p>
              <Button onClick={() => setIsEditing(true)}>
                E-Mail einrichten
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EmailNotificationSettings;
