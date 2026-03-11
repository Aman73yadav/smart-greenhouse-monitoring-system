import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Copy, Check, Trash2, Wifi, WifiOff, Battery, Signal, RefreshCw, Thermometer, Droplets, Sun, Wind } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RegisteredDevice {
  id: string;
  device_name: string;
  device_type: string;
  zone: string | null;
  status: string | null;
  battery_level: number | null;
  last_seen: string | null;
  firmware_version: string | null;
  created_at: string;
}

interface DeviceSensorReading {
  temperature: number | null;
  humidity: number | null;
  soil_moisture: number | null;
  light_level: number | null;
  co2_level: number | null;
  recorded_at: string;
}

export const IoTDeviceRegistration = () => {
  const { user } = useAuth();
  const [devices, setDevices] = useState<RegisteredDevice[]>([]);
  const [deviceReadings, setDeviceReadings] = useState<Record<string, DeviceSensorReading>>({});
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form state
  const [deviceName, setDeviceName] = useState('');
  const [deviceType, setDeviceType] = useState('');
  const [zone, setZone] = useState('');

  const fetchDevices = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('iot_devices')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to fetch devices');
    } else {
      setDevices(data || []);
      // Fetch latest readings for each device
      if (data && data.length > 0) {
        const deviceIds = data.map(d => d.id);
        const { data: readings } = await supabase
          .from('sensor_readings')
          .select('*')
          .eq('user_id', user.id)
          .in('device_id', deviceIds)
          .order('recorded_at', { ascending: false });

        if (readings) {
          const latestByDevice: Record<string, DeviceSensorReading> = {};
          readings.forEach(r => {
            if (r.device_id && !latestByDevice[r.device_id]) {
              latestByDevice[r.device_id] = {
                temperature: r.temperature,
                humidity: r.humidity,
                soil_moisture: r.soil_moisture,
                light_level: r.light_level,
                co2_level: r.co2_level,
                recorded_at: r.recorded_at,
              };
            }
          });
          setDeviceReadings(latestByDevice);
        }
      }
    }
  };

  useEffect(() => {
    fetchDevices();
  }, [user]);

  const handleRegister = async () => {
    if (!user) return;
    if (!deviceName || !deviceType || !zone) {
      toast.error('Please fill all fields');
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('iot_devices')
      .insert({
        user_id: user.id,
        device_name: deviceName,
        device_type: deviceType,
        zone,
        status: 'offline',
      })
      .select()
      .single();

    setLoading(false);

    if (error) {
      toast.error('Failed to register device');
    } else {
      toast.success('Device registered! Copy the UUID below to use in Wokwi.');
      setDevices(prev => [data, ...prev]);
      setDeviceName('');
      setDeviceType('');
      setZone('');
      setShowForm(false);
    }
  };

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    toast.success('Device UUID copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('iot_devices').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete device');
    } else {
      setDevices(prev => prev.filter(d => d.id !== id));
      toast.success('Device removed');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with register button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Registered IoT Devices</h3>
          <p className="text-sm text-muted-foreground">
            Register devices here and use their UUID in your Wokwi ESP32 sketch
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchDevices}>
            <RefreshCw className="w-4 h-4 mr-1" /> Refresh
          </Button>
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4 mr-1" /> Register Device
          </Button>
        </div>
      </div>

      {/* Registration form */}
      {showForm && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">New Device</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label htmlFor="device-name">Device Name</Label>
                <Input
                  id="device-name"
                  placeholder="e.g. ESP32 Sensor Node 1"
                  value={deviceName}
                  onChange={e => setDeviceName(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="device-type">Device Type</Label>
                <Select value={deviceType} onValueChange={setDeviceType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sensor">Sensor</SelectItem>
                    <SelectItem value="actuator">Actuator</SelectItem>
                    <SelectItem value="controller">Controller</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="zone">Zone</Label>
                <Select value={zone} onValueChange={setZone}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select zone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Zone A">Zone A</SelectItem>
                    <SelectItem value="Zone B">Zone B</SelectItem>
                    <SelectItem value="Zone C">Zone C</SelectItem>
                    <SelectItem value="Zone D">Zone D</SelectItem>
                    <SelectItem value="Zone E">Zone E</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button size="sm" onClick={handleRegister} disabled={loading}>
                {loading ? 'Registering...' : 'Register'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Device list */}
      {devices.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          <p>No devices registered yet. Click "Register Device" to add your first ESP32.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {devices.map(device => (
            <Card key={device.id} className="glass-card">
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    {device.status === 'online' ? (
                      <Wifi className="w-4 h-4 text-success" />
                    ) : (
                      <WifiOff className="w-4 h-4 text-destructive" />
                    )}
                    <Badge variant={device.status === 'online' ? 'default' : 'secondary'}>
                      {device.status || 'offline'}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive/60 hover:text-destructive"
                    onClick={() => handleDelete(device.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>

                <div>
                  <h4 className="font-semibold">{device.device_name}</h4>
                  <p className="text-sm text-muted-foreground">{device.zone} · {device.device_type}</p>
                </div>

                {/* UUID copy section */}
                <div className="bg-muted/50 rounded-md p-2">
                  <p className="text-xs text-muted-foreground mb-1">Device UUID (for Wokwi)</p>
                  <div className="flex items-center gap-2">
                    <code className="text-xs font-mono flex-1 truncate select-all">{device.id}</code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0"
                      onClick={() => handleCopy(device.id)}
                    >
                      {copiedId === device.id ? (
                        <Check className="w-3.5 h-3.5 text-success" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex gap-4 text-xs text-muted-foreground">
                  {device.battery_level !== null && (
                    <div className="flex items-center gap-1">
                      <Battery className="w-3 h-3" />
                      <span>{device.battery_level}%</span>
                    </div>
                  )}
                  {device.last_seen && (
                    <span>Last seen: {new Date(device.last_seen).toLocaleString()}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
