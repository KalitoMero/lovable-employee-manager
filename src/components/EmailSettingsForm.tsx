
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Trash, Check, Save } from 'lucide-react';
import { EmailSettings } from '@/types';
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  const [savedState, setSavedState] = useState<{[key: string]: boolean}>({});
  const [pendingGfEmails, setPendingGfEmails] = useState<string[]>([...emailSettings.gf]);
  const [pendingDeptEmails, setPendingDeptEmails] = useState<{email: string, costCenter: string}[]>(
    [...emailSettings.departmentEmails]
  );
  
  // Update pending states when props change
  useEffect(() => {
    setPendingGfEmails([...emailSettings.gf]);
    setPendingDeptEmails([...emailSettings.departmentEmails]);
  }, [emailSettings]);
  
  // Function to handle adding a new department email
  const handleAddDepartmentEmail = () => {
    const nextIndex = emailSettings.departmentEmails.length;
    updateDepartmentEmail(nextIndex, '', availableCostCenters[0] || '');
  };
  
  // Handle pending GF email changes
  const handlePendingGfEmailChange = (index: number, email: string) => {
    const updatedEmails = [...pendingGfEmails];
    updatedEmails[index] = email;
    setPendingGfEmails(updatedEmails);
  };
  
  // Handle GF email save with confirmation
  const handleGfEmailSave = (index: number) => {
    updateGfEmail(index, pendingGfEmails[index]);
    
    // Show saved confirmation
    const key = `gf-${index}`;
    setSavedState(prev => ({ ...prev, [key]: true }));
    
    // Hide confirmation after 3 seconds
    setTimeout(() => {
      setSavedState(prev => ({ ...prev, [key]: false }));
    }, 3000);
  };
  
  // Handle pending department email changes
  const handlePendingDeptEmailChange = (index: number, email: string) => {
    const updatedEmails = [...pendingDeptEmails];
    updatedEmails[index] = { ...updatedEmails[index], email };
    setPendingDeptEmails(updatedEmails);
  };
  
  // Handle pending department cost center changes
  const handlePendingDeptCostCenterChange = (index: number, costCenter: string) => {
    const updatedEmails = [...pendingDeptEmails];
    updatedEmails[index] = { ...updatedEmails[index], costCenter };
    setPendingDeptEmails(updatedEmails);
  };
  
  // Handle department email save with confirmation
  const handleDeptEmailSave = (index: number) => {
    const { email, costCenter } = pendingDeptEmails[index];
    updateDepartmentEmail(index, email, costCenter);
    
    // Show saved confirmation
    const key = `dept-${index}`;
    setSavedState(prev => ({ ...prev, [key]: true }));
    
    // Hide confirmation after 3 seconds
    setTimeout(() => {
      setSavedState(prev => ({ ...prev, [key]: false }));
    }, 3000);
  };

  // Helper function to check if email is valid
  const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email === '';
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
              <div key={`gf-${index}`} className="grid grid-cols-[1fr_auto_auto] gap-2 items-end">
                <div className="grid gap-2">
                  <Label htmlFor={`gf-email-${index}`}>E-Mail {index + 1}</Label>
                  <Input
                    id={`gf-email-${index}`}
                    type="email"
                    value={pendingGfEmails[index]}
                    onChange={(e) => handlePendingGfEmailChange(index, e.target.value)}
                    placeholder="email@beispiel.de"
                    className={!isValidEmail(pendingGfEmails[index]) && pendingGfEmails[index] !== '' 
                      ? "border-destructive" 
                      : ""}
                  />
                </div>
                
                <Button 
                  onClick={() => handleGfEmailSave(index)}
                  size="icon"
                  variant="outline"
                  disabled={!isValidEmail(pendingGfEmails[index]) || pendingGfEmails[index] === email}
                  className="mb-1"
                >
                  <Save className="h-4 w-4" />
                </Button>
                
                {savedState[`gf-${index}`] && (
                  <div className="mb-1 flex items-center justify-center h-9 w-9 bg-green-100 rounded-full">
                    <Check className="h-5 w-5 text-green-600" />
                  </div>
                )}
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
                <div key={`dept-${index}`} className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-3 items-end">
                  <div className="grid gap-2">
                    <Label htmlFor={`dept-email-${index}`}>E-Mail</Label>
                    <Input
                      id={`dept-email-${index}`}
                      type="email"
                      value={pendingDeptEmails[index]?.email || ''}
                      onChange={(e) => handlePendingDeptEmailChange(index, e.target.value)}
                      placeholder="abteilungsleiter@beispiel.de"
                      className={!isValidEmail(pendingDeptEmails[index]?.email || '') && pendingDeptEmails[index]?.email !== '' 
                        ? "border-destructive" 
                        : ""}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor={`dept-kst-${index}`}>KST</Label>
                    <Select
                      value={pendingDeptEmails[index]?.costCenter || ''}
                      onValueChange={(value) => handlePendingDeptCostCenterChange(index, value)}
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
                    onClick={() => handleDeptEmailSave(index)}
                    size="icon"
                    variant="outline"
                    disabled={
                      !isValidEmail(pendingDeptEmails[index]?.email || '') || 
                      (pendingDeptEmails[index]?.email === item.email && 
                       pendingDeptEmails[index]?.costCenter === item.costCenter)
                    }
                    className="mb-0.5"
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                  
                  {savedState[`dept-${index}`] && (
                    <div className="mb-0.5 flex items-center justify-center h-9 w-9 bg-green-100 rounded-full">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                  )}
                  
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
