import React, { useState, useMemo } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { SensorCard } from '@/components/dashboard/SensorCard';
import { PlantCard } from '@/components/dashboard/PlantCard';
import { ControlCard } from '@/components/dashboard/ControlCard';
import { AlertCard } from '@/components/dashboard/AlertCard';
import { AIPlantAdvisor } from '@/components/dashboard/AIPlantAdvisor';
import { SensorChart } from '@/components/charts/SensorChart';
import { Greenhouse3D } from '@/components/3d/Greenhouse3D';
import { VirtualField3D } from '@/components/3d/VirtualField3D';
import { PlantGrowth3D } from '@/components/3d/PlantGrowth3D';
import { EnhancedPlantGrowth3D } from '@/components/3d/EnhancedPlantGrowth3D';
import { ScheduleCalendar } from '@/components/dashboard/ScheduleCalendar';
import { PlantGrowthTimeline } from '@/components/dashboard/PlantGrowthTimeline';
import { ReportGenerator } from '@/components/dashboard/ReportGenerator';
import { AlertNotificationPanel } from '@/components/dashboard/AlertNotificationPanel';
import { useRealtimeSensors } from '@/hooks/useRealtimeSensors';
import { useSensorAlerts } from '@/hooks/useSensorAlerts';
import {
  sensorData as staticSensorData, 
  plants, 
  controlSystems, 
  alerts as initialAlerts,
  zones,
  schedules,
  iotDevices,
  generateHistoricalData,
  generateAnalyticsData,
  growthStages 
} from '@/data/greenhouseData';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Play, Pause, RotateCcw, Download, Wifi, WifiOff, Battery, Signal, Radio } from 'lucide-react';
import greenhouseHero from '@/assets/greenhouse-hero.jpg';
import { cn } from '@/lib/utils';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [controls, setControls] = useState(controlSystems);
  const [alertsList, setAlertsList] = useState(initialAlerts);
  const [growthWeek, setGrowthWeek] = useState(8);
  const [isSimulating, setIsSimulating] = useState(false);
  
  // Real-time sensor data
  const { sensorData: realtimeSensorData, isConnected } = useRealtimeSensors();
  
  // Sensor alerts
  const { alerts: sensorAlerts, unreadCount, hasPermission, requestPermission, dismissAlert, clearAlerts } = useSensorAlerts(realtimeSensorData);

  const historicalData = useMemo(() => generateHistoricalData(), []);
  const analyticsData = useMemo(() => generateAnalyticsData(), []);

  const handleControlToggle = (id: string, isActive: boolean) => {
    setControls(prev => prev.map(c => c.id === id ? { ...c, isActive } : c));
  };

  const handleControlValueChange = (id: string, value: number) => {
    setControls(prev => prev.map(c => c.id === id ? { ...c, targetValue: value } : c));
  };

  const handleAlertDismiss = (id: string) => {
    setAlertsList(prev => prev.map(a => a.id === id ? { ...a, isRead: true } : a));
  };

  const startGrowthSimulation = () => {
    setIsSimulating(true);
    const interval = setInterval(() => {
      setGrowthWeek(prev => {
        if (prev >= 16) {
          clearInterval(interval);
          setIsSimulating(false);
          return 1;
        }
        return prev + 1;
      });
    }, 3000);
  };

  const getPageTitle = () => {
    const titles: Record<string, string> = {
      'dashboard': 'Dashboard',
      '3d-view': '3D Greenhouse',
      'plants': 'Plant Management',
      'sensors': 'Sensor Monitoring',
      'controls': 'Control Systems',
      'schedules': 'Schedules',
      'analytics': 'Analytics',
      'devices': 'IoT Devices',
    };
    return titles[activeTab] || 'Dashboard';
  };

  // Merge static sensor data with real-time values
  const currentSensors = useMemo(() => {
    return staticSensorData.slice(0, 4).map(sensor => {
      if (sensor.type === 'temperature') {
        return { ...sensor, value: realtimeSensorData.temperature };
      }
      if (sensor.type === 'humidity') {
        return { ...sensor, value: realtimeSensorData.humidity };
      }
      if (sensor.type === 'moisture') {
        return { ...sensor, value: realtimeSensorData.moisture };
      }
      if (sensor.type === 'light') {
        return { ...sensor, value: realtimeSensorData.light };
      }
      return sensor;
    });
  }, [realtimeSensorData]);

  const avgTemp = realtimeSensorData.temperature;
  const avgHumidity = realtimeSensorData.humidity;
  const avgMoisture = realtimeSensorData.moisture;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 lg:ml-0 overflow-hidden">
        <Header title={getPageTitle()} />
        
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-80px)]">
          {activeTab === 'dashboard' && (
            <>
              {/* Hero Section */}
              <div className="relative h-48 md:h-64 rounded-2xl overflow-hidden">
                <img src={greenhouseHero} alt="Greenhouse" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
                <div className="absolute inset-0 p-6 flex flex-col justify-center">
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">Welcome Back!</h1>
                  <p className="text-muted-foreground max-w-md">Your greenhouse is thriving. 186 plants across 5 zones.</p>
                </div>
              </div>

              {/* Alerts */}
              {alertsList.filter(a => !a.isRead).length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold">Active Alerts</h3>
                  {alertsList.filter(a => !a.isRead).map(alert => (
                    <AlertCard key={alert.id} alert={alert} onDismiss={handleAlertDismiss} />
                  ))}
                </div>
              )}

              {/* Sensors Grid */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Live Sensor Data</h3>
                  <div className="flex items-center gap-2">
                    <Radio className={cn("w-4 h-4", isConnected ? "text-success animate-pulse" : "text-muted-foreground")} />
                    <span className="text-xs text-muted-foreground">
                      {isConnected ? 'Real-time connected' : 'Using cached data'}
                    </span>
                    {realtimeSensorData.lastUpdated && (
                      <span className="text-xs text-muted-foreground">
                        • Updated {new Date(realtimeSensorData.lastUpdated).toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {currentSensors.map(sensor => (
                    <SensorCard key={sensor.id} sensor={sensor} />
                  ))}
                </div>
              </div>

              {/* Charts */}
              <div className="chart-container">
                <h3 className="font-semibold mb-4">24-Hour Trends</h3>
                <div className="h-[250px]">
                  <SensorChart data={historicalData} type="all" />
                </div>
              </div>

              {/* Plants Preview */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">Recent Plants</h3>
                  <Button variant="ghost" onClick={() => setActiveTab('plants')}>View All</Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {plants.slice(0, 4).map(plant => (
                    <PlantCard key={plant.id} plant={plant} />
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === '3d-view' && (
            <div className="space-y-6">
              <Tabs defaultValue="greenhouse" className="w-full">
                <TabsList className="grid w-full max-w-xl grid-cols-3">
                  <TabsTrigger value="greenhouse">3D Greenhouse</TabsTrigger>
                  <TabsTrigger value="growth">Plant Growth</TabsTrigger>
                  <TabsTrigger value="field">Virtual Field</TabsTrigger>
                </TabsList>

                <TabsContent value="greenhouse" className="space-y-4">
                  <div className="glass-card p-4">
                    <div className="flex flex-wrap gap-4 items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold">Growth Simulation</h3>
                        <p className="text-sm text-muted-foreground">Week {growthWeek} of 16 • {growthStages.find(s => s.week <= growthWeek)?.name}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant={isSimulating ? "destructive" : "default"} onClick={isSimulating ? () => setIsSimulating(false) : startGrowthSimulation}>
                          {isSimulating ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
                          {isSimulating ? 'Pause' : 'Simulate'}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setGrowthWeek(1)}>
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="h-[500px] rounded-xl overflow-hidden bg-card">
                      <Greenhouse3D growthWeek={growthWeek} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 text-center">Drag to rotate • Scroll to zoom</p>
                  </div>
                </TabsContent>

                <TabsContent value="growth" className="space-y-6">
                  {/* Plant Growth Timeline */}
                  <PlantGrowthTimeline />
                  
                  {/* Enhanced 3D Plant Growth */}
                  <EnhancedPlantGrowth3D />
                  
                  {/* 3D Plant Growth Visualizations */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(['tomato', 'strawberry', 'pepper', 'carrot'] as const).map((plantType) => (
                      <div key={plantType} className="glass-card p-4">
                        <h3 className="font-semibold capitalize mb-2">{plantType} 3D Growth</h3>
                        <div className="h-[350px] rounded-xl overflow-hidden bg-card">
                          <PlantGrowth3D plantType={plantType} currentWeek={growthWeek} maxWeeks={16} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground text-center">Week-by-week growth visualization • Use simulation controls above</p>
                </TabsContent>

                <TabsContent value="field" className="space-y-4">
                  <div className="glass-card p-4">
                    <h3 className="font-semibold mb-4">Virtual Field with Environmental Effects</h3>
                    <div className="h-[500px] rounded-xl overflow-hidden bg-card">
                      <VirtualField3D temperature={avgTemp} humidity={avgHumidity} moisture={avgMoisture} />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* AI Advisor */}
              <AIPlantAdvisor sensorData={{ temperature: avgTemp, humidity: avgHumidity, moisture: avgMoisture, light: 800 }} />
            </div>
          )}

          {activeTab === 'plants' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {plants.map(plant => (
                <PlantCard key={plant.id} plant={plant} />
              ))}
            </div>
          )}

          {activeTab === 'sensors' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {staticSensorData.map(sensor => (
                  <SensorCard key={sensor.id} sensor={sensor} />
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {['temperature', 'humidity', 'moisture', 'light'].map(type => (
                  <div key={type} className="chart-container">
                    <h3 className="font-semibold mb-4 capitalize">{type} History</h3>
                    <div className="h-[220px]">
                      <SensorChart data={historicalData} type={type as any} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'controls' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {controls.map(control => (
                <ControlCard key={control.id} control={control} onToggle={handleControlToggle} onValueChange={handleControlValueChange} />
              ))}
            </div>
          )}

          {activeTab === 'schedules' && (
            <ScheduleCalendar />
          )}

          {activeTab === 'devices' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {iotDevices.map(device => (
                <div key={device.id} className="glass-card p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      {device.status === 'online' ? <Wifi className="w-4 h-4 text-success" /> : <WifiOff className="w-4 h-4 text-destructive" />}
                      <span className={cn("status-dot", device.status === 'online' ? 'bg-success' : device.status === 'error' ? 'bg-warning' : 'bg-destructive')} />
                    </div>
                    <span className="text-xs text-muted-foreground">{device.deviceId}</span>
                  </div>
                  <h4 className="font-semibold">{device.name}</h4>
                  <p className="text-sm text-muted-foreground mb-3">{device.zone}</p>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    {device.batteryLevel !== undefined && (
                      <div className="flex items-center gap-1">
                        <Battery className="w-3 h-3" />
                        <span>{device.batteryLevel}%</span>
                      </div>
                    )}
                    {device.signalStrength !== undefined && (
                      <div className="flex items-center gap-1">
                        <Signal className="w-3 h-3" />
                        <span>{device.signalStrength}%</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="glass-card p-6">
                <h3 className="font-semibold mb-4">Weekly Analytics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-primary/10 rounded-lg">
                    <p className="text-2xl font-bold text-primary">186</p>
                    <p className="text-sm text-muted-foreground">Total Plants</p>
                  </div>
                  <div className="text-center p-4 bg-success/10 rounded-lg">
                    <p className="text-2xl font-bold text-success">92%</p>
                    <p className="text-sm text-muted-foreground">Health Rate</p>
                  </div>
                  <div className="text-center p-4 bg-humidity/10 rounded-lg">
                    <p className="text-2xl font-bold text-humidity">847L</p>
                    <p className="text-sm text-muted-foreground">Water Used</p>
                  </div>
                  <div className="text-center p-4 bg-warning/10 rounded-lg">
                    <p className="text-2xl font-bold text-warning">124kWh</p>
                    <p className="text-sm text-muted-foreground">Energy Used</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ReportGenerator 
                  plants={plants} 
                  sensorData={staticSensorData} 
                  schedules={schedules.map(s => ({ ...s, zone: s.zoneName, type: s.type }))}
                  analyticsData={analyticsData}
                />
                <AlertNotificationPanel 
                  alerts={sensorAlerts}
                  unreadCount={unreadCount}
                  hasPermission={hasPermission}
                  onRequestPermission={requestPermission}
                  onDismiss={dismissAlert}
                  onClearAll={clearAlerts}
                />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
