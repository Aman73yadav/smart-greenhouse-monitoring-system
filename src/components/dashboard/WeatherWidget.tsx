import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Cloud, Droplets, Wind, RefreshCw, Loader2, ThermometerSun, AlertTriangle, Lightbulb } from 'lucide-react';

interface WeatherData {
  temperature: number;
  humidity: number;
  description: string;
  icon: string;
  windSpeed: number;
  cloudCover: number;
  forecast: ForecastDay[];
}

interface ForecastDay {
  date: string;
  tempMax: number;
  tempMin: number;
  humidity: number;
  description: string;
  icon: string;
}

interface WeatherRecommendation {
  type: 'warning' | 'info' | 'success';
  message: string;
  action: string;
}

export const WeatherWidget: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<WeatherRecommendation[]>([]);

  useEffect(() => {
    fetchWeather();
  }, []);

  const fetchWeather = async () => {
    setIsLoading(true);
    try {
      // Try to get user's location
      let coords = { latitude: 40.7128, longitude: -74.0060 }; // Default: NYC
      
      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
          });
          coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
        } catch (e) {
          console.log('Using default location');
        }
      }

      const { data, error } = await supabase.functions.invoke('weather-forecast', {
        body: coords
      });

      if (error) throw error;

      if (data.success) {
        setWeather(data.data);
        generateRecommendations(data.data);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error fetching weather:', error);
      toast({ title: "Weather unavailable", description: "Using cached data", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const generateRecommendations = (data: WeatherData) => {
    const recs: WeatherRecommendation[] = [];

    // Temperature-based recommendations
    if (data.temperature > 30) {
      recs.push({
        type: 'warning',
        message: 'High temperature expected',
        action: 'Increase ventilation and misting to prevent heat stress'
      });
    } else if (data.temperature < 10) {
      recs.push({
        type: 'warning',
        message: 'Cold weather approaching',
        action: 'Activate heating system and close vents'
      });
    }

    // Humidity-based recommendations
    if (data.humidity > 80) {
      recs.push({
        type: 'info',
        message: 'High outdoor humidity',
        action: 'Reduce irrigation and increase air circulation'
      });
    } else if (data.humidity < 40) {
      recs.push({
        type: 'info',
        message: 'Low humidity conditions',
        action: 'Increase misting frequency for leafy greens'
      });
    }

    // Cloud cover recommendations
    if (data.cloudCover > 70) {
      recs.push({
        type: 'info',
        message: 'Overcast conditions expected',
        action: 'Consider supplemental lighting for optimal growth'
      });
    }

    // Check forecast for upcoming weather
    const tomorrow = data.forecast[1];
    if (tomorrow) {
      if (tomorrow.tempMax - data.temperature > 10) {
        recs.push({
          type: 'warning',
          message: `Temperature rising to ${tomorrow.tempMax}°C tomorrow`,
          action: 'Prepare cooling systems in advance'
        });
      }
      if (tomorrow.humidity > 85) {
        recs.push({
          type: 'info',
          message: 'Rainy conditions expected tomorrow',
          action: 'Reduce watering schedule accordingly'
        });
      }
    }

    if (recs.length === 0) {
      recs.push({
        type: 'success',
        message: 'Weather conditions are optimal',
        action: 'Continue with normal greenhouse operations'
      });
    }

    setRecommendations(recs);
  };

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-primary" />
            <CardTitle className="text-base">Weather & Control Recommendations</CardTitle>
          </div>
          <Button size="sm" variant="ghost" onClick={fetchWeather} disabled={isLoading}>
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="h-[150px] flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : weather ? (
          <>
            {/* Current weather */}
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-4">
                <span className="text-4xl">{weather.icon}</span>
                <div>
                  <p className="text-3xl font-bold">{weather.temperature}°C</p>
                  <p className="text-sm text-muted-foreground">{weather.description}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Droplets className="w-3 h-3" />
                  <span>{weather.humidity}%</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Wind className="w-3 h-3" />
                  <span>{weather.windSpeed} km/h</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground col-span-2">
                  <Cloud className="w-3 h-3" />
                  <span>{weather.cloudCover}% clouds</span>
                </div>
              </div>
            </div>

            {/* 5-day forecast */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">7-Day Forecast</h4>
              <div className="grid grid-cols-7 gap-1">
                {weather.forecast.map((day, i) => (
                  <div key={i} className="text-center p-2 bg-muted/20 rounded-lg">
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </p>
                    <span className="text-lg">{day.icon}</span>
                    <div className="text-xs">
                      <span className="font-medium">{day.tempMax}°</span>
                      <span className="text-muted-foreground">/{day.tempMin}°</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-primary" />
                Greenhouse Recommendations
              </h4>
              <div className="space-y-2">
                {recommendations.map((rec, i) => (
                  <div 
                    key={i}
                    className={`p-3 rounded-lg border ${
                      rec.type === 'warning' 
                        ? 'bg-warning/5 border-warning/30' 
                        : rec.type === 'success'
                        ? 'bg-success/5 border-success/30'
                        : 'bg-muted/30 border-border'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {rec.type === 'warning' ? (
                        <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                      ) : rec.type === 'success' ? (
                        <ThermometerSun className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                      ) : (
                        <Lightbulb className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      )}
                      <div>
                        <p className="text-sm font-medium">{rec.message}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{rec.action}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="h-[150px] flex flex-col items-center justify-center text-center">
            <Cloud className="w-10 h-10 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">Unable to fetch weather data</p>
            <Button size="sm" variant="outline" onClick={fetchWeather} className="mt-2">
              Try Again
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
