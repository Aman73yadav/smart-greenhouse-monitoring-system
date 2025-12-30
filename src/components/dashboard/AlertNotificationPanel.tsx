import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, BellOff, X, Trash2, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { SensorAlert } from '@/hooks/useSensorAlerts';

interface AlertNotificationPanelProps {
  alerts: SensorAlert[];
  unreadCount: number;
  hasPermission: boolean;
  onRequestPermission: () => void;
  onDismiss: (id: string) => void;
  onClearAll: () => void;
}

const sensorIcons: Record<string, string> = {
  temperature: '🌡️',
  humidity: '💧',
  moisture: '🌊',
  light: '☀️',
  co2: '💨',
};

const sensorUnits: Record<string, string> = {
  temperature: '°C',
  humidity: '%',
  moisture: '%',
  light: ' lux',
  co2: ' ppm',
};

export const AlertNotificationPanel: React.FC<AlertNotificationPanelProps> = ({
  alerts,
  unreadCount,
  hasPermission,
  onRequestPermission,
  onDismiss,
  onClearAll,
}) => {
  const unreadAlerts = alerts.filter(a => !a.isRead);
  const readAlerts = alerts.filter(a => a.isRead);

  return (
    <Card className="glass-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          Alert Notifications
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-2">
              {unreadCount}
            </Badge>
          )}
        </CardTitle>
        <div className="flex gap-2">
          {!hasPermission && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRequestPermission}
              className="gap-1"
            >
              <BellOff className="w-3 h-3" />
              Enable Push
            </Button>
          )}
          {alerts.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAll}
              className="gap-1 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="w-3 h-3" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <CheckCircle className="w-12 h-12 mb-3 text-success/50" />
            <p className="text-sm font-medium">All Clear!</p>
            <p className="text-xs">No active alerts at the moment.</p>
          </div>
        ) : (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-2">
              {/* Unread alerts first */}
              {unreadAlerts.map((alert) => (
                <AlertItem
                  key={alert.id}
                  alert={alert}
                  onDismiss={onDismiss}
                />
              ))}
              
              {/* Divider if we have both read and unread */}
              {unreadAlerts.length > 0 && readAlerts.length > 0 && (
                <div className="flex items-center gap-2 py-2">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted-foreground">Earlier</span>
                  <div className="flex-1 h-px bg-border" />
                </div>
              )}
              
              {/* Read alerts */}
              {readAlerts.map((alert) => (
                <AlertItem
                  key={alert.id}
                  alert={alert}
                  onDismiss={onDismiss}
                />
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Permission status */}
        <div className="mt-4 pt-3 border-t flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {hasPermission ? (
              <>
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                Push notifications enabled
              </>
            ) : (
              <>
                <div className="w-2 h-2 rounded-full bg-warning" />
                Push notifications disabled
              </>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {alerts.length} total alerts
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

const AlertItem: React.FC<{
  alert: SensorAlert;
  onDismiss: (id: string) => void;
}> = ({ alert, onDismiss }) => {
  const Icon = alert.severity === 'critical' ? AlertCircle : AlertTriangle;
  const unit = sensorUnits[alert.type] || '';
  
  return (
    <div
      className={cn(
        "relative p-3 rounded-lg border transition-all",
        alert.isRead 
          ? "bg-muted/30 border-border/50 opacity-70" 
          : alert.severity === 'critical'
            ? "bg-destructive/10 border-destructive/30 animate-pulse"
            : "bg-warning/10 border-warning/30",
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
          alert.severity === 'critical' 
            ? "bg-destructive/20 text-destructive" 
            : "bg-warning/20 text-warning"
        )}>
          <Icon className="w-4 h-4" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{sensorIcons[alert.type]}</span>
            <span className="font-medium capitalize text-sm">{alert.type}</span>
            <Badge
              variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}
              className="text-xs"
            >
              {alert.severity}
            </Badge>
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-2">
            {alert.message}
          </p>
          
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            <span>
              Current: <strong className="text-foreground">{alert.value}{unit}</strong>
            </span>
            <span>
              Threshold: <strong className="text-foreground">{alert.threshold}{unit}</strong>
            </span>
            <span>{format(alert.timestamp, 'HH:mm:ss')}</span>
          </div>
        </div>
        
        {!alert.isRead && (
          <Button
            variant="ghost"
            size="icon"
            className="flex-shrink-0 h-6 w-6"
            onClick={() => onDismiss(alert.id)}
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>
    </div>
  );
};
