import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface SensorReading {
  id: string;
  temperature: number | null;
  humidity: number | null;
  soil_moisture: number | null;
  light_level: number | null;
  co2_level: number | null;
  recorded_at: string;
  device_id: string | null;
}

interface RealtimeSensorData {
  temperature: number;
  humidity: number;
  moisture: number;
  light: number;
  co2: number;
  lastUpdated: Date | null;
}

export const useRealtimeSensors = () => {
  const { user } = useAuth();
  const [sensorData, setSensorData] = useState<RealtimeSensorData>({
    temperature: 24.5,
    humidity: 68,
    moisture: 72,
    light: 850,
    co2: 420,
    lastUpdated: null,
  });
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Fetch initial data
    const fetchLatestReadings = async () => {
      const { data, error } = await supabase
        .from('sensor_readings')
        .select('*')
        .eq('user_id', user.id)
        .order('recorded_at', { ascending: false })
        .limit(1);

      if (data && data.length > 0) {
        const reading = data[0];
        setSensorData({
          temperature: reading.temperature ?? 24.5,
          humidity: reading.humidity ?? 68,
          moisture: reading.soil_moisture ?? 72,
          light: reading.light_level ?? 850,
          co2: reading.co2_level ?? 420,
          lastUpdated: new Date(reading.recorded_at),
        });
      }
    };

    fetchLatestReadings();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('sensor-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'sensor_readings',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const reading = payload.new as SensorReading;
          setSensorData({
            temperature: reading.temperature ?? 24.5,
            humidity: reading.humidity ?? 68,
            moisture: reading.soil_moisture ?? 72,
            light: reading.light_level ?? 850,
            co2: reading.co2_level ?? 420,
            lastUpdated: new Date(reading.recorded_at),
          });
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return { sensorData, isConnected };
};
