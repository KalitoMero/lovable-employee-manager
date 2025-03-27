
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';
import { EmailSettings } from '@/types';

interface EmailSettingsFormProps {
  emailSettings: EmailSettings;
  updateGfEmail: (index: number, email: string) => void;
  updateDepartmentEmail: (index: number, email: string, costCenter: string) => void;
  removeDepartmentEmail: (index: number) => void;
  availableCostCenters: string[];
}

const EmailSettingsForm: React.FC<EmailSettingsFormProps> = ({
  emailSettings,
  updateGfEmail,
  updateDepartmentEmail,
  removeDepartmentEmail,
  availableCostCenters,
}) => {
  // Function to handle adding a new department email
  const handleAddDepartmentEmail = () => {
    const nextIndex = emailSettings.departmentEmails.length;
    updateDepartmentEmail(nextIndex, '', availableCostCenters[0] || '');
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Email-Einstellungen</h1>
      
      {/* GF Emails Section */}
      <Card>
        <CardHeader>
          <CardTitle>GF</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {emailSettings.gf.map((email, index) => (
              <div key={`gf-${index}`} className="grid gap-2">
                <Label htmlFor={`gf-email-${index}`}>E-Mail {index + 1}</Label>
                <Input
                  id={`gf-email-${index}`}
                  type="email"
                  value={email}
                  onChange={(e) => updateGfEmail(index, e.target.value)}
                  placeholder="email@beispiel.de"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Department Emails Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Abteilungsleiter E-Mails</CardTitle>
          <Button onClick={handleAddDepartmentEmail} variant="outline" disabled={emailSettings.departmentEmails.length >= 10}>
            Hinzufügen
          </Button>
        </CardHeader>
        <CardContent>
          {emailSettings.departmentEmails.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Keine Abteilungsleiter E-Mails vorhanden. Klicken Sie auf Hinzufügen.
            </p>
          ) : (
            <div className="space-y-4">
              {emailSettings.departmentEmails.map((item, index) => (
                <div key={`dept-${index}`} className="grid grid-cols-[1fr_auto_auto] gap-4 items-end">
                  <div className="grid gap-2">
                    <Label htmlFor={`dept-email-${index}`}>E-Mail</Label>
                    <Input
                      id={`dept-email-${index}`}
                      type="email"
                      value={item.email}
                      onChange={(e) => updateDepartmentEmail(index, e.target.value, item.costCenter)}
                      placeholder="abteilungsleiter@beispiel.de"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor={`dept-kst-${index}`}>KST</Label>
                    <Select
                      value={item.costCenter}
                      onValueChange={(value) => updateDepartmentEmail(index, item.email, value)}
                    >
                      <SelectTrigger id={`dept-kst-${index}`} className="w-[110px]">
                        <SelectValue placeholder="Wählen..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCostCenters.map((cc) => (
                          <SelectItem key={cc} value={cc}>
                            {cc}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeDepartmentEmail(index)}
                    className="mb-0.5"
                  >
                    <Trash className="h-5 w-5 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="bg-muted p-4 rounded-lg">
        <p className="text-sm">
          Bei Geburtstagen von Mitarbeitern werden E-Mails an alle eingetragenen GF-Adressen 
          sowie an den entsprechenden Abteilungsleiter (KST) gesendet.
        </p>
      </div>
    </div>
  );
};

export default EmailSettingsForm;
