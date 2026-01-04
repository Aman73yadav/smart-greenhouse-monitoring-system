import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Droplets, Cloud, Sun, Clock, Zap, Settings2, AlertTriangle, CheckCircle, Loader2, RefreshCw } from 'lucide-react';

interface WeatherData {
  temperature: number;
  humidity: number;
  description: string;
  forecast: { date: string; tempMax: number; humidity: number; description: string }[];
}

interface IrrigationSchedule {
  zone: string;
  baseMinutes: number;
  adjustedMinutes: number;
  startTime: string;
  isActive: boolean;
  lastWatered: Date | null;
  reason: string;
}

const ZONES = [
  { id: 'Zone A', name: 'Zone A - Tomatoes', plantType: 'tomato', baseDuration: 15 },
  { id: 'Zone B', name: 'Zone B - Leafy Greens', plantType: 'lettuce', baseDuration: 10 },
  { id: 'Zone C', name: 'Zone C - Peppers', plantType: 'pepper', baseDuration: 12 },
  { id: 'Zone D', name: 'Zone D - Strawberries', plantType: 'strawberry', baseDuration: 8 },
  { id: 'Zone E', name: 'Zone E - Root Vegetables', plantType: 'carrot', baseDuration: 20 },
];

export const SmartIrrigation: React.FC = () => {
  const [isAutoMode, setIsAutoMode] = useState(true);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [schedules, setSchedules] = useState<IrrigationSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [soilMoisture, setSoilMoisture] = useState(55);
  const [sensitivityLevel, setSensitivityLevel] = useState(50);

  const fetchWeather = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('weather-forecast', {
        body: { latitude: 40.7128, longitude: -74.0060 }
      });
      
      if (error) throw error;
      if (data.success) {
        setWeather(data.data);
      }
    } catch (error) {
      console.error('Error fetching weather:', error);
    }
  }, []);

  const calculateAdjustment = useCallback((zone: typeof ZONES[0], weatherData: WeatherData | null) => {
    let adjustment = 1.0;
    let reasons: string[] = [];

    if (!weatherData) {
      return { adjustment: 1.0, reason: 'No weather data available' };
    }

    // Temperature adjustment
    if (weatherData.temperature > 30) {
      adjustment += 0.3;
      reasons.push('High temperature (+30%)');
    } else if (weatherData.temperature > 25) {
      adjustment += 0.15;
      reasons.push('Warm conditions (+15%)');
    } else if (weatherData.temperature < 15) {
      adjustment -= 0.2;
      reasons.push('Cool weather (-20%)');
    }

    // Humidity adjustment
    if (weatherData.humidity > 80) {
      adjustment -= 0.25;
      reasons.push('High humidity (-25%)');
    } else if (weatherData.humidity < 40) {
      adjustment += 0.2;
      reasons.push('Low humidity (+20%)');
    }

    // Rain forecast adjustment
    const tomorrow = weatherData.forecast[1];
    if (tomorrow) {
      if (tomorrow.description.toLowerCase().includes('rain') || 
          tomorrow.description.toLowerCase().includes('shower')) {
        adjustment -= 0.4;
        reasons.push('Rain expected tomorrow (-40%)');
      }
    }

    // Soil moisture adjustment
    if (soilMoisture > 70) {
      adjustment -= 0.3;
      reasons.push('Soil moisture high (-30%)');
    } else if (soilMoisture < 40) {
      adjustment += 0.25;
      reasons.push('Soil moisture low (+25%)');
    }

    // Apply sensitivity
    const sensitivityFactor = sensitivityLevel / 50; // 0.5 to 1.5 range
    adjustment = 1 + (adjustment - 1) * sensitivityFactor;

    // Cap adjustments
    adjustment = Math.max(0.3, Math.min(1.8, adjustment));

    return {
      adjustment,
      reason: reasons.length > 0 ? reasons.join(', ') : 'Normal conditions'
    };
  }, [soilMoisture, sensitivityLevel]);

  const updateSchedules = useCallback(() => {
    const newSchedules = ZONES.map(zone => {
      const { adjustment, reason } = calculateAdjustment(zone, weather);
      return {
        zone: zone.id,
        baseMinutes: zone.baseDuration,
        adjustedMinutes: Math.round(zone.baseDuration * adjustment),
        startTime: zone.plantType === 'lettuce' ? '06:00' : '05:30',
        isActive: isAutoMode,
        lastWatered: null,
        reason
      };
    });
    setSchedules(newSchedules);
    setIsLoading(false);
  }, [weather, isAutoMode, calculateAdjustment]);

  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  useEffect(() => {
    if (weather) {
      updateSchedules();
    }
  }, [weather, isAutoMode, soilMoisture, sensitivityLevel, updateSchedules]);

  const handleManualWater = (zoneId: string) => {
    toast({
      title: "Irrigation Started",
      description: `Manual watering started for ${zoneId}`,
    });
    setSchedules(prev => prev.map(s => 
      s.zone === zoneId ? { ...s, lastWatered: new Date() } : s
    ));
  };

  const totalWaterSaved = schedules.reduce((acc, s) => {
    const saved = s.baseMinutes - s.adjustedMinutes;
    return acc + (saved > 0 ? saved : 0);
  }, 0);

  const totalWaterTime = schedules.reduce((acc, s) => acc + s.adjustedMinutes, 0);

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-moisture/10">
              <Droplets className="w-5 h-5 text-moisture" />
            </div>
            <div>
              <CardTitle className="text-lg">Smart Irrigation</CardTitle>
              <p className="text-sm text-muted-foreground">
                Weather-based automatic watering adjustment
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Switch
                id="auto-mode"
                checked={isAutoMode}
                onCheckedChange={setIsAutoMode}
              />
              <Label htmlFor="auto-mode" className="text-sm font-medium">
                {isAutoMode ? 'Auto' : 'Manual'}
              </Label>
            </div>
            <Button size="sm" variant="ghost" onClick={fetchWeather}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Weather-based status */}
        {weather && (
          <div className="p-4 rounded-lg bg-muted/30 border">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Cloud className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium">Current Conditions</span>
              </div>
              <Badge variant="outline">{weather.description}</Badge>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{weather.temperature}°C</p>
                <p className="text-xs text-muted-foreground">Temperature</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-humidity">{weather.humidity}%</p>
                <p className="text-xs text-muted-foreground">Humidity</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-moisture">{soilMoisture}%</p>
                <p className="text-xs text-muted-foreground">Soil Moisture</p>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-success/10 rounded-lg text-center">
            <p className="text-lg font-bold text-success">{totalWaterSaved} min</p>
            <p className="text-[10px] text-muted-foreground">Water Saved</p>
          </div>
          <div className="p-3 bg-moisture/10 rounded-lg text-center">
            <p className="text-lg font-bold text-moisture">{totalWaterTime} min</p>
            <p className="text-[10px] text-muted-foreground">Total Duration</p>
          </div>
          <div className="p-3 bg-primary/10 rounded-lg text-center">
            <p className="text-lg font-bold text-primary">{schedules.filter(s => s.adjustedMinutes < s.baseMinutes).length}</p>
            <p className="text-[10px] text-muted-foreground">Zones Reduced</p>
          </div>
        </div>

        {/* Settings */}
        <div className="space-y-4 p-4 rounded-lg border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <Settings2 className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Adjustment Settings</span>
          </div>
          <div className="space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <Label>Soil Moisture Override</Label>
                <span className="text-muted-foreground">{soilMoisture}%</span>
              </div>
              <Slider
                value={[soilMoisture]}
                onValueChange={([v]) => setSoilMoisture(v)}
                min={20}
                max={90}
                step={5}
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <Label>Sensitivity Level</Label>
                <span className="text-muted-foreground">{sensitivityLevel}%</span>
              </div>
              <Slider
                value={[sensitivityLevel]}
                onValueChange={([v]) => setSensitivityLevel(v)}
                min={20}
                max={100}
                step={10}
              />
            </div>
          </div>
        </div>

        {/* Zone schedules */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Zone Schedules
          </h4>
          {isLoading ? (
            <div className="h-[150px] flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <ScrollArea className="h-[250px]">
              <div className="space-y-2">
                {schedules.map((schedule) => {
                  const saved = schedule.baseMinutes - schedule.adjustedMinutes;
                  const isReduced = saved > 0;
                  const isIncreased = saved < 0;
                  
                  return (
                    <div 
                      key={schedule.zone}
                      className="p-3 rounded-lg border bg-card flex items-center justify-between gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{schedule.zone}</span>
                          {isReduced && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-success/10 text-success">
                              -{saved} min
                            </Badge>
                          )}
                          {isIncreased && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-warning/10 text-warning">
                              +{Math.abs(saved)} min
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {schedule.startTime}
                          </span>
                          <span className="flex items-center gap-1">
                            <Droplets className="w-3 h-3" />
                            {schedule.adjustedMinutes} min
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1 truncate">
                          {schedule.reason}
                        </p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleManualWater(schedule.zone)}
                        className="flex-shrink-0"
                      >
                        <Zap className="w-3 h-3 mr-1" />
                        Water
                      </Button>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Info notice */}
        <div className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg">
          <AlertTriangle className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            Schedules automatically adjust based on weather forecast, humidity, and soil moisture. Manual override is always available.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
