import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

interface AlertThresholds {
  temperature: { min: number; max: number };
  humidity: { min: number; max: number };
  moisture: { min: number; max: number };
  light: { min: number; max: number };
  co2: { min: number; max: number };
}

interface SensorData {
  temperature: number;
  humidity: number;
  moisture: number;
  light: number;
  co2: number;
}

interface SensorAlert {
  id: string;
  type: keyof SensorData;
  severity: 'warning' | 'critical';
  message: string;
  value: number;
  threshold: number;
  timestamp: Date;
  isRead: boolean;
}

const DEFAULT_THRESHOLDS: AlertThresholds = {
  temperature: { min: 15, max: 35 },
  humidity: { min: 40, max: 85 },
  moisture: { min: 30, max: 90 },
  light: { min: 200, max: 1500 },
  co2: { min: 300, max: 1500 },
};

const ALERT_MESSAGES: Record<string, Record<string, string>> = {
  temperature: {
    low: '🥶 Temperature too low! Plants may freeze.',
    high: '🔥 Temperature too high! Risk of heat stress.',
    critical_low: '🚨 CRITICAL: Freezing temperature detected!',
    critical_high: '🚨 CRITICAL: Extreme heat detected!',
  },
  humidity: {
    low: '💨 Humidity too low! Plants may dehydrate.',
    high: '💧 Humidity too high! Risk of mold growth.',
    critical_low: '🚨 CRITICAL: Very low humidity!',
    critical_high: '🚨 CRITICAL: Condensation risk!',
  },
  moisture: {
    low: '🌵 Soil moisture too low! Plants need water.',
    high: '🌊 Soil moisture too high! Risk of root rot.',
    critical_low: '🚨 CRITICAL: Drought conditions!',
    critical_high: '🚨 CRITICAL: Waterlogging detected!',
  },
  light: {
    low: '🌑 Light levels too low for optimal growth.',
    high: '☀️ Light intensity too high! Risk of leaf burn.',
    critical_low: '🚨 CRITICAL: Insufficient light!',
    critical_high: '🚨 CRITICAL: Light stress detected!',
  },
  co2: {
    low: '💨 CO2 levels too low for photosynthesis.',
    high: '💨 CO2 levels elevated.',
    critical_low: '🚨 CRITICAL: CO2 deficiency!',
    critical_high: '🚨 CRITICAL: High CO2 levels!',
  },
};

export const useSensorAlerts = (
  sensorData: SensorData,
  thresholds: AlertThresholds = DEFAULT_THRESHOLDS,
  enabled: boolean = true
) => {
  const [alerts, setAlerts] = useState<SensorAlert[]>([]);
  const [hasPermission, setHasPermission] = useState(false);
  const [lastAlertTimes, setLastAlertTimes] = useState<Record<string, number>>({});

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      setHasPermission(true);
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      const granted = permission === 'granted';
      setHasPermission(granted);
      return granted;
    }

    return false;
  }, []);

  // Send push notification
  const sendNotification = useCallback((title: string, body: string, icon?: string) => {
    if (hasPermission && 'Notification' in window) {
      new Notification(title, {
        body,
        icon: icon || '/favicon.ico',
        tag: 'greenhouse-alert',
        requireInteraction: true,
      });
    }
  }, [hasPermission]);

  // Check sensor values and create alerts
  const checkThresholds = useCallback(() => {
    if (!enabled) return;

    const now = Date.now();
    const COOLDOWN = 60000; // 1 minute cooldown between same type alerts
    const newAlerts: SensorAlert[] = [];

    const checkValue = (
      type: keyof SensorData,
      value: number,
      thresholdConfig: { min: number; max: number }
    ) => {
      const lastAlertTime = lastAlertTimes[type] || 0;
      if (now - lastAlertTime < COOLDOWN) return;

      const criticalBuffer = type === 'temperature' ? 5 : type === 'moisture' ? 15 : 10;
      
      let severity: 'warning' | 'critical' | null = null;
      let direction: 'low' | 'high' | null = null;

      if (value < thresholdConfig.min - criticalBuffer) {
        severity = 'critical';
        direction = 'low';
      } else if (value < thresholdConfig.min) {
        severity = 'warning';
        direction = 'low';
      } else if (value > thresholdConfig.max + criticalBuffer) {
        severity = 'critical';
        direction = 'high';
      } else if (value > thresholdConfig.max) {
        severity = 'warning';
        direction = 'high';
      }

      if (severity && direction) {
        const messageKey = severity === 'critical' ? `critical_${direction}` : direction;
        const message = ALERT_MESSAGES[type]?.[messageKey] || `${type} is out of range`;
        
        const alert: SensorAlert = {
          id: `${type}-${now}`,
          type,
          severity,
          message,
          value,
          threshold: direction === 'low' ? thresholdConfig.min : thresholdConfig.max,
          timestamp: new Date(),
          isRead: false,
        };

        newAlerts.push(alert);

        // Show toast notification
        toast({
          title: severity === 'critical' ? '🚨 Critical Alert!' : '⚠️ Warning',
          description: message,
          variant: severity === 'critical' ? 'destructive' : 'default',
          duration: severity === 'critical' ? 10000 : 5000,
        });

        // Send push notification for critical alerts
        if (severity === 'critical') {
          sendNotification(
            'Greenhouse Alert!',
            `${message} Current: ${value}${getUnit(type)}`,
          );
        }

        // Update last alert time
        setLastAlertTimes(prev => ({ ...prev, [type]: now }));
      }
    };

    // Check all sensor types
    checkValue('temperature', sensorData.temperature, thresholds.temperature);
    checkValue('humidity', sensorData.humidity, thresholds.humidity);
    checkValue('moisture', sensorData.moisture, thresholds.moisture);
    checkValue('light', sensorData.light, thresholds.light);
    checkValue('co2', sensorData.co2, thresholds.co2);

    if (newAlerts.length > 0) {
      setAlerts(prev => [...newAlerts, ...prev].slice(0, 50)); // Keep last 50 alerts
    }
  }, [sensorData, thresholds, enabled, lastAlertTimes, sendNotification]);

  // Get unit for sensor type
  const getUnit = (type: keyof SensorData): string => {
    const units: Record<keyof SensorData, string> = {
      temperature: '°C',
      humidity: '%',
      moisture: '%',
      light: ' lux',
      co2: ' ppm',
    };
    return units[type];
  };

  // Check thresholds when sensor data changes
  useEffect(() => {
    checkThresholds();
  }, [sensorData, checkThresholds]);

  // Request permission on mount
  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  // Dismiss alert
  const dismissAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(a => 
      a.id === alertId ? { ...a, isRead: true } : a
    ));
  }, []);

  // Clear all alerts
  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  // Get unread alerts count
  const unreadCount = alerts.filter(a => !a.isRead).length;

  return {
    alerts,
    unreadCount,
    hasPermission,
    requestPermission,
    dismissAlert,
    clearAlerts,
    checkThresholds,
  };
};

export type { SensorAlert, AlertThresholds, SensorData };
