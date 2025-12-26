import React from 'react';
import { ControlSystem } from '@/types/greenhouse';
import { 
  Droplets, 
  Wind, 
  Lightbulb, 
  Flame, 
  Snowflake, 
  CloudFog,
  Power,
  Settings
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface ControlCardProps {
  control: ControlSystem;
  onToggle: (id: string, isActive: boolean) => void;
  onValueChange: (id: string, value: number) => void;
}

const controlConfig = {
  irrigation: {
    icon: Droplets,
    color: 'text-humidity',
    bgColor: 'bg-humidity/10',
    unit: '%',
  },
  ventilation: {
    icon: Wind,
    color: 'text-muted-foreground',
    bgColor: 'bg-muted',
    unit: '°C',
  },
  lighting: {
    icon: Lightbulb,
    color: 'text-light',
    bgColor: 'bg-light/10',
    unit: 'lux',
  },
  heating: {
    icon: Flame,
    color: 'text-temperature',
    bgColor: 'bg-temperature/10',
    unit: '°C',
  },
  cooling: {
    icon: Snowflake,
    color: 'text-info',
    bgColor: 'bg-info/10',
    unit: '°C',
  },
  misting: {
    icon: CloudFog,
    color: 'text-moisture',
    bgColor: 'bg-moisture/10',
    unit: '%',
  },
};

export const ControlCard: React.FC<ControlCardProps> = ({ 
  control, 
  onToggle, 
  onValueChange 
}) => {
  const config = controlConfig[control.type];
  const Icon = config.icon;

  return (
    <div className={cn(
      "glass-card p-5 transition-all duration-300",
      control.isActive && "glow-primary border-primary/30"
    )}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn("p-3 rounded-xl", config.bgColor)}>
            <Icon className={cn("w-6 h-6", control.isActive ? config.color : 'text-muted-foreground')} />
          </div>
          <div>
            <h3 className="font-semibold">{control.name}</h3>
            <p className="text-sm text-muted-foreground">{control.zone}</p>
          </div>
        </div>
        
        <Switch
          checked={control.isActive}
          onCheckedChange={(checked) => onToggle(control.id, checked)}
        />
      </div>

      {control.isActive && control.targetValue !== undefined && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Target</span>
            <span className={cn("font-mono text-lg", config.color)}>
              {control.targetValue}{config.unit}
            </span>
          </div>

          <Slider
            value={[control.targetValue]}
            onValueChange={(value) => onValueChange(control.id, value[0])}
            max={control.type === 'lighting' ? 1200 : 100}
            min={control.type === 'lighting' ? 0 : 0}
            step={control.type === 'lighting' ? 50 : 1}
            className="w-full"
          />

          {control.currentValue !== undefined && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Current</span>
              <span className="font-mono">
                {control.currentValue.toFixed(1)}{config.unit}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 pt-2 border-t border-border">
            <div className={cn(
              "px-2 py-1 rounded text-xs font-medium",
              control.mode === 'auto' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
            )}>
              {control.mode.toUpperCase()}
            </div>
            {control.mode === 'auto' && (
              <span className="text-xs text-muted-foreground">AI-controlled</span>
            )}
          </div>
        </div>
      )}

      {!control.isActive && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Power className="w-4 h-4" />
          <span className="text-sm">System Off</span>
        </div>
      )}
    </div>
  );
};
