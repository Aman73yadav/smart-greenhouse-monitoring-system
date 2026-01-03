import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Mail, Check, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface EmailAlertSettingsProps {
  emailEnabled: boolean;
  emailAddress: string;
  onUpdateSettings: (enabled: boolean, email: string) => void;
}

export const EmailAlertSettings: React.FC<EmailAlertSettingsProps> = ({
  emailEnabled,
  emailAddress,
  onUpdateSettings,
}) => {
  const [email, setEmail] = useState(emailAddress);
  const [enabled, setEnabled] = useState(emailEnabled);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (enabled && !email) {
      toast({
        title: "Email Required",
        description: "Please enter an email address to enable notifications.",
        variant: "destructive",
      });
      return;
    }

    if (enabled && !email.includes('@')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    onUpdateSettings(enabled, email);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Mail className="w-4 h-4 text-primary" />
          Email Alert Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="email-alerts" className="text-sm font-medium">
              Email Notifications
            </Label>
            <p className="text-xs text-muted-foreground">
              Receive emails for critical sensor alerts
            </p>
          </div>
          <Switch
            id="email-alerts"
            checked={enabled}
            onCheckedChange={setEnabled}
          />
        </div>

        {enabled && (
          <div className="space-y-2">
            <Label htmlFor="email-input" className="text-sm">
              Email Address
            </Label>
            <Input
              id="email-input"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <AlertTriangle className="w-3 h-3" />
            Only critical alerts trigger emails
          </div>
          <Button size="sm" onClick={handleSave}>
            {saved ? (
              <>
                <Check className="w-4 h-4 mr-1" />
                Saved
              </>
            ) : (
              'Save Settings'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
