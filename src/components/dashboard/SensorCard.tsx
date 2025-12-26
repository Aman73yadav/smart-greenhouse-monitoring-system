import React from 'react';
import { Thermometer, Droplets, CloudRain, Sun, Wind, Leaf } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SensorData } from '@/types/greenhouse';

interface SensorCardProps {
  sensor: SensorData;
}

const sensorConfig = {
  temperature: {
    icon: Thermometer,
    color: 'text-temperature',
    bgColor: 'bg-temperature/10',
    borderColor: 'border-temperature/30',
    label: 'Temperature',
  },
  humidity: {
    icon: Droplets,
    color: 'text-humidity',
    bgColor: 'bg-humidity/10',
    borderColor: 'border-humidity/30',
    label: 'Humidity',
  },
  moisture: {
    icon: CloudRain,
    color: 'text-moisture',
    bgColor: 'bg-moisture/10',
    borderColor: 'border-moisture/30',
    label: 'Soil Moisture',
  },
  light: {
    icon: Sun,
    color: 'text-light',
    bgColor: 'bg-light/10',
    borderColor: 'border-light/30',
    label: 'Light Level',
  },
  soil_ph: {
    icon: Leaf,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/30',
    label: 'Soil pH',
  },
  co2: {
    icon: Wind,
    color: 'text-secondary',
    bgColor: 'bg-secondary/10',
    borderColor: 'border-secondary/30',
    label: 'CO2 Level',
  },
};

export const SensorCard: React.FC<SensorCardProps> = ({ sensor }) => {
  const config = sensorConfig[sensor.type];
  const Icon = config.icon;
  
  const percentage = ((sensor.value - sensor.minThreshold) / (sensor.maxThreshold - sensor.minThreshold)) * 100;
  const clampedPercentage = Math.min(100, Math.max(0, percentage));

  const getStatusColor = () => {
    switch (sensor.status) {
      case 'critical':
        return 'bg-destructive';
      case 'warning':
        return 'bg-warning';
      default:
        return 'bg-success';
    }
  };

  return (
    <div className={cn("sensor-card", config.borderColor, "border-l-4")}>
      <div className="flex items-start justify-between mb-4">
        <div className={cn("p-2 rounded-lg", config.bgColor)}>
          <Icon className={cn("w-5 h-5", config.color)} />
        </div>
        <div className={cn("status-dot", getStatusColor())} />
      </div>

      <div className="space-y-1 mb-4">
        <p className="text-sm text-muted-foreground">{config.label}</p>
        <p className={cn("metric-value", config.color)}>
          {sensor.value.toFixed(1)}
          <span className="text-lg ml-1">{sensor.unit}</span>
        </p>
      </div>

      <div className="space-y-2">
        <div className="threshold-bar">
          <div
            className={cn("threshold-fill", {
              'bg-success': sensor.status === 'normal',
              'bg-warning': sensor.status === 'warning',
              'bg-destructive': sensor.status === 'critical',
            })}
            style={{ width: `${clampedPercentage}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{sensor.minThreshold}{sensor.unit}</span>
          <span className="text-foreground">{sensor.zone}</span>
          <span>{sensor.maxThreshold}{sensor.unit}</span>
        </div>
      </div>
    </div>
  );
};
