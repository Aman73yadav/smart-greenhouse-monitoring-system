import React from 'react';
import { Alert as AlertType } from '@/types/greenhouse';
import { AlertTriangle, AlertCircle, Info, X, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface AlertCardProps {
  alert: AlertType;
  onDismiss: (id: string) => void;
}

const alertConfig = {
  critical: {
    icon: AlertTriangle,
    bgColor: 'bg-destructive/10',
    borderColor: 'border-destructive/30',
    textColor: 'text-destructive',
  },
  warning: {
    icon: AlertCircle,
    bgColor: 'bg-warning/10',
    borderColor: 'border-warning/30',
    textColor: 'text-warning',
  },
  info: {
    icon: Info,
    bgColor: 'bg-info/10',
    borderColor: 'border-info/30',
    textColor: 'text-info',
  },
};

export const AlertCard: React.FC<AlertCardProps> = ({ alert, onDismiss }) => {
  const config = alertConfig[alert.type];
  const Icon = config.icon;

  return (
    <div className={cn(
      "glass-card p-4 border-l-4",
      config.borderColor,
      !alert.isRead && config.bgColor
    )}>
      <div className="flex items-start gap-3">
        <div className={cn("p-2 rounded-lg", config.bgColor)}>
          <Icon className={cn("w-4 h-4", config.textColor)} />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className={cn("font-medium", !alert.isRead && "text-foreground")}>
            {alert.message}
          </p>
          
          {alert.threshold && (
            <p className="text-sm text-muted-foreground mt-1">
              Threshold: {alert.threshold.type === 'above' ? '>' : '<'} {alert.threshold.value}, 
              Actual: {alert.threshold.actual.toFixed(1)}
            </p>
          )}
          
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{formatDistanceToNow(alert.timestamp, { addSuffix: true })}</span>
            {alert.zone && (
              <>
                <span>•</span>
                <span>{alert.zone}</span>
              </>
            )}
          </div>
        </div>

        <button
          onClick={() => onDismiss(alert.id)}
          className="p-1 rounded hover:bg-muted transition-colors"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
};
