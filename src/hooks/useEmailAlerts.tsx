import { useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AlertData {
  alertType: string;
  severity: 'warning' | 'critical';
  message: string;
  currentValue: number;
  threshold: number;
  unit: string;
}

export const useEmailAlerts = () => {
  const [isSending, setIsSending] = useState(false);
  const [emailEnabled, setEmailEnabled] = useState(() => {
    const stored = localStorage.getItem('greenhouse-email-alerts');
    return stored ? JSON.parse(stored) : { enabled: false, email: '' };
  });

  const updateEmailSettings = useCallback((enabled: boolean, email: string) => {
    const settings = { enabled, email };
    localStorage.setItem('greenhouse-email-alerts', JSON.stringify(settings));
    setEmailEnabled(settings);
    
    if (enabled && email) {
      toast({
        title: "Email Alerts Enabled",
        description: `Critical alerts will be sent to ${email}`,
      });
    }
  }, []);

  const sendAlertEmail = useCallback(async (alertData: AlertData) => {
    if (!emailEnabled.enabled || !emailEnabled.email) {
      return false;
    }

    // Only send emails for critical alerts
    if (alertData.severity !== 'critical') {
      return false;
    }

    setIsSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-alert-email', {
        body: {
          email: emailEnabled.email,
          alertType: alertData.alertType,
          severity: alertData.severity,
          message: alertData.message,
          currentValue: alertData.currentValue,
          threshold: alertData.threshold,
          unit: alertData.unit,
          timestamp: new Date().toISOString(),
        }
      });

      if (error) throw error;

      if (data.success) {
        console.log('Alert email sent successfully');
        return true;
      } else {
        throw new Error(data.error || 'Failed to send email');
      }
    } catch (error) {
      console.error('Failed to send alert email:', error);
      toast({
        title: "Email Alert Failed",
        description: "Could not send email notification. Check console for details.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSending(false);
    }
  }, [emailEnabled]);

  return {
    emailEnabled: emailEnabled.enabled,
    emailAddress: emailEnabled.email,
    isSending,
    updateEmailSettings,
    sendAlertEmail,
  };
};
