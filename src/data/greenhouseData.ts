import { Plant, SensorData, Zone, ControlSystem, IoTDevice, Alert, Schedule, HistoricalData, AnalyticsData } from '@/types/greenhouse';
import tomatoesImg from '@/assets/tomatoes.jpg';
import lettuceImg from '@/assets/lettuce.jpg';
import peppersImg from '@/assets/peppers.jpg';
import cucumbersImg from '@/assets/cucumbers.jpg';
import strawberriesImg from '@/assets/strawberries.jpg';
import carrotsImg from '@/assets/carrots.jpg';
import eggplantImg from '@/assets/eggplant.jpg';

export const zones: Zone[] = [
  { id: 'zone-1', name: 'Zone A - Tomatoes', color: '#ef4444', plants: 24, area: 50, status: 'active' },
  { id: 'zone-2', name: 'Zone B - Leafy Greens', color: '#22c55e', plants: 48, area: 40, status: 'active' },
  { id: 'zone-3', name: 'Zone C - Peppers', color: '#f59e0b', plants: 18, area: 35, status: 'active' },
  { id: 'zone-4', name: 'Zone D - Strawberries', color: '#ec4899', plants: 60, area: 45, status: 'active' },
  { id: 'zone-5', name: 'Zone E - Root Vegetables', color: '#8b5cf6', plants: 36, area: 30, status: 'maintenance' },
];

export const plants: Plant[] = [
  {
    id: 'plant-1',
    name: 'Cherry Tomatoes',
    type: 'vegetable',
    zone: 'Zone A',
    image: tomatoesImg,
    plantedDate: new Date('2024-10-15'),
    growthStage: 'fruiting',
    growthProgress: 75,
    health: 'excellent',
    waterNeeds: 'medium',
    lightNeeds: 'high',
  },
  {
    id: 'plant-2',
    name: 'Butter Lettuce',
    type: 'vegetable',
    zone: 'Zone B',
    image: lettuceImg,
    plantedDate: new Date('2024-11-20'),
    growthStage: 'vegetative',
    growthProgress: 45,
    health: 'good',
    waterNeeds: 'high',
    lightNeeds: 'medium',
  },
  {
    id: 'plant-3',
    name: 'Bell Peppers',
    type: 'vegetable',
    zone: 'Zone C',
    image: peppersImg,
    plantedDate: new Date('2024-10-01'),
    growthStage: 'flowering',
    growthProgress: 60,
    health: 'excellent',
    waterNeeds: 'medium',
    lightNeeds: 'high',
  },
  {
    id: 'plant-4',
    name: 'Cucumbers',
    type: 'vegetable',
    zone: 'Zone A',
    image: cucumbersImg,
    plantedDate: new Date('2024-11-05'),
    growthStage: 'vegetative',
    growthProgress: 35,
    health: 'good',
    waterNeeds: 'high',
    lightNeeds: 'high',
  },
  {
    id: 'plant-5',
    name: 'Strawberries',
    type: 'fruit',
    zone: 'Zone D',
    image: strawberriesImg,
    plantedDate: new Date('2024-09-15'),
    growthStage: 'fruiting',
    growthProgress: 85,
    health: 'excellent',
    waterNeeds: 'medium',
    lightNeeds: 'high',
  },
  {
    id: 'plant-6',
    name: 'Carrots',
    type: 'vegetable',
    zone: 'Zone E',
    image: carrotsImg,
    plantedDate: new Date('2024-10-25'),
    growthStage: 'vegetative',
    growthProgress: 55,
    health: 'fair',
    waterNeeds: 'low',
    lightNeeds: 'medium',
  },
  {
    id: 'plant-7',
    name: 'Eggplant',
    type: 'vegetable',
    zone: 'Zone C',
    image: eggplantImg,
    plantedDate: new Date('2024-10-10'),
    growthStage: 'flowering',
    growthProgress: 50,
    health: 'good',
    waterNeeds: 'medium',
    lightNeeds: 'high',
  },
];

export const sensorData: SensorData[] = [
  { id: 'sensor-1', type: 'temperature', value: 24.5, unit: '°C', zone: 'Zone A', timestamp: new Date(), status: 'normal', minThreshold: 18, maxThreshold: 30 },
  { id: 'sensor-2', type: 'humidity', value: 68, unit: '%', zone: 'Zone A', timestamp: new Date(), status: 'normal', minThreshold: 50, maxThreshold: 80 },
  { id: 'sensor-3', type: 'moisture', value: 72, unit: '%', zone: 'Zone A', timestamp: new Date(), status: 'normal', minThreshold: 40, maxThreshold: 85 },
  { id: 'sensor-4', type: 'light', value: 850, unit: 'lux', zone: 'Zone A', timestamp: new Date(), status: 'normal', minThreshold: 400, maxThreshold: 1200 },
  { id: 'sensor-5', type: 'temperature', value: 22.8, unit: '°C', zone: 'Zone B', timestamp: new Date(), status: 'normal', minThreshold: 18, maxThreshold: 28 },
  { id: 'sensor-6', type: 'humidity', value: 75, unit: '%', zone: 'Zone B', timestamp: new Date(), status: 'normal', minThreshold: 60, maxThreshold: 85 },
  { id: 'sensor-7', type: 'temperature', value: 31.2, unit: '°C', zone: 'Zone C', timestamp: new Date(), status: 'warning', minThreshold: 20, maxThreshold: 30 },
  { id: 'sensor-8', type: 'moisture', value: 38, unit: '%', zone: 'Zone D', timestamp: new Date(), status: 'critical', minThreshold: 45, maxThreshold: 80 },
];

export const controlSystems: ControlSystem[] = [
  { id: 'ctrl-1', name: 'Main Irrigation', type: 'irrigation', zone: 'All Zones', isActive: true, mode: 'auto', targetValue: 70, currentValue: 68 },
  { id: 'ctrl-2', name: 'Ventilation Fan A', type: 'ventilation', zone: 'Zone A', isActive: true, mode: 'auto', targetValue: 25, currentValue: 24.5 },
  { id: 'ctrl-3', name: 'LED Grow Lights', type: 'lighting', zone: 'All Zones', isActive: true, mode: 'auto', targetValue: 800, currentValue: 850 },
  { id: 'ctrl-4', name: 'Heating System', type: 'heating', zone: 'All Zones', isActive: false, mode: 'manual', targetValue: 20 },
  { id: 'ctrl-5', name: 'Cooling System', type: 'cooling', zone: 'Zone C', isActive: true, mode: 'auto', targetValue: 26, currentValue: 31.2 },
  { id: 'ctrl-6', name: 'Misting System', type: 'misting', zone: 'Zone B', isActive: true, mode: 'auto', targetValue: 75, currentValue: 72 },
];

export const iotDevices: IoTDevice[] = [
  { id: 'dev-1', deviceId: 'GH-TEMP-001', name: 'Temperature Sensor A1', type: 'sensor', zone: 'Zone A', status: 'online', batteryLevel: 87, signalStrength: 95, firmwareVersion: '2.1.4', lastSeen: new Date() },
  { id: 'dev-2', deviceId: 'GH-HUM-001', name: 'Humidity Sensor A1', type: 'sensor', zone: 'Zone A', status: 'online', batteryLevel: 92, signalStrength: 88, firmwareVersion: '2.1.4', lastSeen: new Date() },
  { id: 'dev-3', deviceId: 'GH-MOIST-001', name: 'Soil Moisture Sensor A1', type: 'sensor', zone: 'Zone A', status: 'online', batteryLevel: 45, signalStrength: 92, firmwareVersion: '2.0.8', lastSeen: new Date() },
  { id: 'dev-4', deviceId: 'GH-VALVE-001', name: 'Irrigation Valve A1', type: 'actuator', zone: 'Zone A', status: 'online', signalStrength: 90, firmwareVersion: '1.5.2', lastSeen: new Date() },
  { id: 'dev-5', deviceId: 'GH-TEMP-002', name: 'Temperature Sensor B1', type: 'sensor', zone: 'Zone B', status: 'online', batteryLevel: 78, signalStrength: 85, firmwareVersion: '2.1.4', lastSeen: new Date() },
  { id: 'dev-6', deviceId: 'GH-CTRL-001', name: 'Zone Controller A', type: 'controller', zone: 'Zone A', status: 'online', signalStrength: 98, firmwareVersion: '3.2.1', lastSeen: new Date() },
  { id: 'dev-7', deviceId: 'GH-TEMP-003', name: 'Temperature Sensor C1', type: 'sensor', zone: 'Zone C', status: 'error', batteryLevel: 12, signalStrength: 45, firmwareVersion: '2.0.8', lastSeen: new Date(Date.now() - 3600000) },
  { id: 'dev-8', deviceId: 'GH-LIGHT-001', name: 'Light Sensor D1', type: 'sensor', zone: 'Zone D', status: 'offline', batteryLevel: 0, signalStrength: 0, firmwareVersion: '2.1.0', lastSeen: new Date(Date.now() - 86400000) },
];

export const alerts: Alert[] = [
  { id: 'alert-1', type: 'critical', message: 'Soil moisture critically low in Zone D', sensorId: 'sensor-8', zone: 'Zone D', timestamp: new Date(), isRead: false, threshold: { type: 'below', value: 45, actual: 38 } },
  { id: 'alert-2', type: 'warning', message: 'Temperature exceeds optimal range in Zone C', sensorId: 'sensor-7', zone: 'Zone C', timestamp: new Date(Date.now() - 1800000), isRead: false, threshold: { type: 'above', value: 30, actual: 31.2 } },
  { id: 'alert-3', type: 'warning', message: 'Device battery low: Temperature Sensor C1', zone: 'Zone C', timestamp: new Date(Date.now() - 3600000), isRead: true },
  { id: 'alert-4', type: 'info', message: 'Scheduled irrigation completed for Zone B', zone: 'Zone B', timestamp: new Date(Date.now() - 7200000), isRead: true },
];

export const schedules: Schedule[] = [
  { id: 'sched-1', controlId: 'ctrl-1', zoneName: 'Zone A', startTime: '06:00', endTime: '06:30', days: ['Mon', 'Wed', 'Fri'], isActive: true, type: 'irrigation' },
  { id: 'sched-2', controlId: 'ctrl-1', zoneName: 'Zone B', startTime: '07:00', endTime: '07:45', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], isActive: true, type: 'irrigation' },
  { id: 'sched-3', controlId: 'ctrl-3', zoneName: 'All Zones', startTime: '05:00', endTime: '20:00', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], isActive: true, type: 'lighting' },
  { id: 'sched-4', controlId: 'ctrl-2', zoneName: 'Zone A', startTime: '12:00', endTime: '14:00', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], isActive: true, type: 'ventilation' },
  { id: 'sched-5', controlId: 'ctrl-1', zoneName: 'Zone D', startTime: '18:00', endTime: '18:20', days: ['Tue', 'Thu', 'Sat'], isActive: false, type: 'irrigation' },
];

// Generate historical data for the past 24 hours
export const generateHistoricalData = (): HistoricalData[] => {
  const data: HistoricalData[] = [];
  const now = new Date();
  
  for (let i = 24; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 3600000);
    data.push({
      timestamp,
      temperature: 22 + Math.sin(i / 4) * 5 + Math.random() * 2,
      humidity: 65 + Math.cos(i / 6) * 15 + Math.random() * 5,
      moisture: 60 + Math.sin(i / 8) * 20 + Math.random() * 5,
      light: i >= 5 && i <= 20 ? 600 + Math.random() * 400 : 50 + Math.random() * 50,
    });
  }
  
  return data;
};

// Generate analytics data for the past 7 days
export const generateAnalyticsData = (): AnalyticsData[] => {
  const data: AnalyticsData[] = [];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  for (let i = 0; i < 7; i++) {
    data.push({
      date: days[i],
      yield: 45 + Math.random() * 30,
      waterUsage: 120 + Math.random() * 60,
      energyUsage: 85 + Math.random() * 40,
      plantHealth: 75 + Math.random() * 20,
    });
  }
  
  return data;
};

export const growthStages = [
  { name: 'Seedling', week: 1, description: 'Seeds germinate and first leaves appear', color: '#a3e635' },
  { name: 'Early Vegetative', week: 3, description: 'Rapid leaf and stem growth', color: '#84cc16' },
  { name: 'Late Vegetative', week: 6, description: 'Plant reaches full size', color: '#65a30d' },
  { name: 'Flowering', week: 9, description: 'Flowers begin to develop', color: '#facc15' },
  { name: 'Early Fruiting', week: 12, description: 'Fruits start to form', color: '#fb923c' },
  { name: 'Harvest Ready', week: 16, description: 'Produce ready for harvest', color: '#ef4444' },
];
