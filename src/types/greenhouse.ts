// Types for the Greenhouse Management System

export interface Plant {
  id: string;
  name: string;
  type: 'vegetable' | 'fruit' | 'herb';
  zone: string;
  image: string;
  plantedDate: Date;
  harvestDate?: Date;
  growthStage: 'seedling' | 'vegetative' | 'flowering' | 'fruiting' | 'harvest';
  growthProgress: number; // 0-100
  health: 'excellent' | 'good' | 'fair' | 'poor';
  waterNeeds: 'low' | 'medium' | 'high';
  lightNeeds: 'low' | 'medium' | 'high';
}

export interface SensorData {
  id: string;
  type: 'temperature' | 'humidity' | 'moisture' | 'light' | 'soil_ph' | 'co2';
  value: number;
  unit: string;
  zone: string;
  timestamp: Date;
  status: 'normal' | 'warning' | 'critical';
  minThreshold: number;
  maxThreshold: number;
}

export interface Zone {
  id: string;
  name: string;
  color: string;
  plants: number;
  area: number; // square meters
  status: 'active' | 'inactive' | 'maintenance';
}

export interface ControlSystem {
  id: string;
  name: string;
  type: 'irrigation' | 'ventilation' | 'lighting' | 'heating' | 'cooling' | 'misting';
  zone: string;
  isActive: boolean;
  mode: 'auto' | 'manual';
  targetValue?: number;
  currentValue?: number;
  schedule?: Schedule[];
}

export interface Schedule {
  id: string;
  controlId: string;
  zoneName: string;
  startTime: string;
  endTime: string;
  days: string[];
  isActive: boolean;
  type: 'irrigation' | 'lighting' | 'ventilation';
}

export interface IoTDevice {
  id: string;
  deviceId: string;
  name: string;
  type: 'sensor' | 'actuator' | 'controller';
  zone: string;
  status: 'online' | 'offline' | 'error';
  batteryLevel?: number;
  signalStrength?: number;
  firmwareVersion: string;
  lastSeen: Date;
  ipAddress?: string;
}

export interface Alert {
  id: string;
  type: 'warning' | 'critical' | 'info';
  message: string;
  sensorId?: string;
  zone?: string;
  timestamp: Date;
  isRead: boolean;
  threshold?: {
    type: 'above' | 'below';
    value: number;
    actual: number;
  };
}

export interface HistoricalData {
  timestamp: Date;
  temperature: number;
  humidity: number;
  moisture: number;
  light: number;
}

export interface GrowthStage {
  name: string;
  week: number;
  description: string;
  color: string;
}

export interface AnalyticsData {
  date: string;
  yield: number;
  waterUsage: number;
  energyUsage: number;
  plantHealth: number;
}
