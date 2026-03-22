import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Play, Pause, RotateCcw, Square, Thermometer, Droplets, Sun, Wind, Activity, Zap, CircuitBoard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

type SimStatus = 'idle' | 'running' | 'paused' | 'stopped';

interface SimValues {
  temperature: number;
  humidity: number;
  soil_moisture: number;
  light_level: number;
  co2_level: number;
}

interface CircuitSimulatorProps {
  devices: { id: string; device_name: string }[];
}

export const CircuitSimulator: React.FC<CircuitSimulatorProps> = ({ devices }) => {
  const { user } = useAuth();
  const [status, setStatus] = useState<SimStatus>('idle');
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [tick, setTick] = useState(0);
  const [values, setValues] = useState<SimValues>({
    temperature: 25.0,
    humidity: 65.0,
    soil_moisture: 55.0,
    light_level: 800,
    co2_level: 400,
  });
  const [ledOn, setLedOn] = useState(false);
  const [sendCount, setSendCount] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const generateValues = useCallback((): SimValues => {
    const vary = (base: number, range: number) => +(base + (Math.random() - 0.5) * range).toFixed(1);
    return {
      temperature: vary(25 + Math.sin(tick * 0.3) * 5, 2),
      humidity: vary(65 + Math.cos(tick * 0.2) * 10, 5),
      soil_moisture: vary(55 + Math.sin(tick * 0.15) * 15, 3),
      light_level: Math.round(800 + Math.sin(tick * 0.1) * 300 + (Math.random() - 0.5) * 100),
      co2_level: Math.round(400 + Math.cos(tick * 0.25) * 80 + (Math.random() - 0.5) * 30),
    };
  }, [tick]);

  const sendData = useCallback(async (vals: SimValues) => {
    if (!selectedDevice) return;
    try {
      const { error } = await supabase.functions.invoke('sensor-data', {
        body: { device_id: selectedDevice, readings: vals },
      });
      if (error) throw error;
      setSendCount(c => c + 1);
    } catch (err) {
      console.error('Sim send error:', err);
    }
  }, [selectedDevice]);

  const startSimulation = () => {
    if (!selectedDevice) {
      toast.error('Select a device first');
      return;
    }
    setStatus('running');
    setSendCount(0);
    toast.success('Simulation started');
  };

  const pauseSimulation = () => {
    setStatus('paused');
    toast.info('Simulation paused');
  };

  const resumeSimulation = () => {
    setStatus('running');
    toast.info('Simulation resumed');
  };

  const stopSimulation = () => {
    setStatus('stopped');
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    toast.info('Simulation stopped');
  };

  const restartSimulation = () => {
    setTick(0);
    setSendCount(0);
    setValues({
      temperature: 25.0, humidity: 65.0, soil_moisture: 55.0,
      light_level: 800, co2_level: 400,
    });
    setStatus('running');
    toast.success('Simulation restarted');
  };

  useEffect(() => {
    if (status === 'running') {
      intervalRef.current = setInterval(() => {
        setTick(t => t + 1);
      }, 2000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [status]);

  useEffect(() => {
    if (status !== 'running') return;
    const newVals = generateValues();
    setValues(newVals);
    setLedOn(prev => !prev);
    sendData(newVals);
  }, [tick, status]);

  const statusColor: Record<SimStatus, string> = {
    idle: 'text-muted-foreground',
    running: 'text-success',
    paused: 'text-warning',
    stopped: 'text-destructive',
  };

  return (
    <Card className="glass-card overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CircuitBoard className="w-5 h-5 text-primary" />
            <CardTitle className="text-base">Arduino Circuit Simulator</CardTitle>
          </div>
          <Badge variant="outline" className={cn('capitalize', statusColor[status])}>
            {status === 'idle' ? 'Ready' : status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Device selector */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <Label className="text-xs text-muted-foreground mb-1 block">Target Device</Label>
            <Select value={selectedDevice} onValueChange={setSelectedDevice}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Select device to simulate..." />
              </SelectTrigger>
              <SelectContent>
                {devices.map(d => (
                  <SelectItem key={d.id} value={d.id}>{d.device_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {sendCount > 0 && (
            <Badge variant="secondary" className="text-xs whitespace-nowrap">
              {sendCount} readings sent
            </Badge>
          )}
        </div>

        {/* Circuit Diagram SVG */}
        <div className="relative bg-muted/30 rounded-xl p-2 border border-border/50 overflow-hidden">
          <svg viewBox="0 0 800 480" className="w-full h-auto" style={{ minHeight: 240 }}>
            {/* Background */}
            <rect width="800" height="480" fill="none" />

            {/* Arduino UNO Board */}
            <rect x="40" y="100" width="220" height="300" rx="8" fill="hsl(var(--primary)/0.15)" stroke="hsl(var(--primary))" strokeWidth="2" />
            <rect x="50" y="110" width="200" height="280" rx="4" fill="hsl(var(--primary)/0.08)" />
            {/* Arduino chip */}
            <rect x="100" y="220" width="80" height="50" rx="3" fill="hsl(var(--foreground)/0.15)" stroke="hsl(var(--foreground)/0.3)" strokeWidth="1" />
            <text x="140" y="250" textAnchor="middle" fontSize="10" fill="hsl(var(--foreground)/0.6)" fontFamily="monospace">ATmega328</text>
            {/* USB port */}
            <rect x="42" y="160" width="30" height="50" rx="3" fill="hsl(var(--muted-foreground)/0.3)" stroke="hsl(var(--muted-foreground)/0.5)" strokeWidth="1" />
            <text x="57" y="189" textAnchor="middle" fontSize="7" fill="hsl(var(--muted-foreground))">USB</text>
            {/* Power jack */}
            <rect x="42" y="330" width="25" height="30" rx="4" fill="hsl(var(--foreground)/0.2)" stroke="hsl(var(--foreground)/0.4)" strokeWidth="1" />
            {/* Arduino label */}
            <text x="150" y="140" textAnchor="middle" fontSize="16" fontWeight="bold" fill="hsl(var(--primary))" fontFamily="monospace">ARDUINO UNO</text>
            {/* Digital pins */}
            {[...Array(14)].map((_, i) => (
              <React.Fragment key={`dp${i}`}>
                <rect x={255} y={120 + i * 18} width={6} height={12} rx={1} fill="hsl(var(--foreground)/0.4)" />
                <text x={248} y={130 + i * 18} textAnchor="end" fontSize="6" fill="hsl(var(--muted-foreground))">{i}</text>
              </React.Fragment>
            ))}
            {/* Analog pins */}
            {['A0', 'A1', 'A2', 'A3', 'A4', 'A5'].map((label, i) => (
              <React.Fragment key={label}>
                <rect x={100 + i * 26} y={385} width={12} height={6} rx={1} fill="hsl(var(--foreground)/0.4)" />
                <text x={106 + i * 26} y={405} textAnchor="middle" fontSize="6" fill="hsl(var(--muted-foreground))">{label}</text>
              </React.Fragment>
            ))}
            {/* Power pins */}
            {['5V', 'GND', '3.3V'].map((label, i) => (
              <React.Fragment key={label}>
                <rect x={55 + i * 30} y={385} width={12} height={6} rx={1} fill={label === 'GND' ? 'hsl(var(--foreground)/0.6)' : 'hsl(var(--destructive)/0.6)'} />
                <text x={61 + i * 30} y={405} textAnchor="middle" fontSize="6" fill="hsl(var(--muted-foreground))">{label}</text>
              </React.Fragment>
            ))}

            {/* DHT22 Sensor */}
            <rect x="310" y="40" width="70" height="90" rx="5" fill="hsl(var(--card))" stroke="hsl(var(--primary))" strokeWidth="1.5" />
            <text x="345" y="65" textAnchor="middle" fontSize="10" fontWeight="bold" fill="hsl(var(--primary))">DHT22</text>
            <text x="345" y="80" textAnchor="middle" fontSize="8" fill="hsl(var(--muted-foreground))">Temp/Hum</text>
            {/* DHT22 pins */}
            <rect x="320" y="126" width="6" height="10" rx="1" fill="hsl(var(--destructive)/0.7)" />
            <rect x="335" y="126" width="6" height="10" rx="1" fill="hsl(var(--success)/0.7)" />
            <rect x="350" y="126" width="6" height="10" rx="1" fill="hsl(var(--foreground)/0.5)" />
            {/* DHT22 value display */}
            <text x="345" y="100" textAnchor="middle" fontSize="9" fill="hsl(var(--primary))" fontWeight="bold">
              {values.temperature.toFixed(1)}°C
            </text>
            <text x="345" y="115" textAnchor="middle" fontSize="8" fill="hsl(var(--accent-foreground))">
              {values.humidity.toFixed(0)}%
            </text>

            {/* Wire: DHT22 data -> D2 */}
            <path d="M338 136 L338 160 L261 160" fill="none" stroke="hsl(var(--success))" strokeWidth="1.5" strokeDasharray={status === 'running' ? '4 2' : 'none'} />
            {/* Wire: DHT22 VCC */}
            <path d="M323 136 L323 395 L67 395 L67 391" fill="none" stroke="hsl(var(--destructive))" strokeWidth="1.5" />
            {/* Wire: DHT22 GND */}
            <path d="M353 136 L353 395 L85 395 L85 391" fill="none" stroke="hsl(var(--foreground)/0.5)" strokeWidth="1.5" />

            {/* Soil Moisture Sensor (MQ / Analog) */}
            <rect x="430" y="40" width="80" height="70" rx="5" fill="hsl(var(--card))" stroke="hsl(var(--accent-foreground))" strokeWidth="1.5" />
            <text x="470" y="62" textAnchor="middle" fontSize="9" fontWeight="bold" fill="hsl(var(--accent-foreground))">Soil Sensor</text>
            <text x="470" y="75" textAnchor="middle" fontSize="8" fill="hsl(var(--muted-foreground))">Moisture</text>
            <text x="470" y="95" textAnchor="middle" fontSize="9" fontWeight="bold" fill="hsl(var(--accent-foreground))">
              {values.soil_moisture.toFixed(0)}%
            </text>
            {/* Wire: Soil sensor -> A0 */}
            <path d="M470 110 L470 440 L106 440 L106 391" fill="none" stroke="hsl(var(--success))" strokeWidth="1.5" strokeDasharray={status === 'running' ? '4 2' : 'none'} />

            {/* Light Sensor (Potentiometer style) */}
            <rect x="540" y="140" width="70" height="70" rx="35" fill="hsl(var(--card))" stroke="hsl(var(--warning))" strokeWidth="1.5" />
            <circle cx="575" cy="175" r="18" fill="hsl(var(--warning)/0.15)" stroke="hsl(var(--warning))" strokeWidth="1" />
            <text x="575" y="165" textAnchor="middle" fontSize="8" fill="hsl(var(--warning))">LDR</text>
            <text x="575" y="180" textAnchor="middle" fontSize="9" fontWeight="bold" fill="hsl(var(--warning))">
              {values.light_level}
            </text>
            <text x="575" y="192" textAnchor="middle" fontSize="7" fill="hsl(var(--muted-foreground))">lux</text>
            {/* Wire: LDR -> A1 */}
            <path d="M575 210 L575 450 L132 450 L132 391" fill="none" stroke="hsl(var(--success))" strokeWidth="1.5" strokeDasharray={status === 'running' ? '4 2' : 'none'} />

            {/* MQ Gas Sensor (CO2) */}
            <rect x="540" y="250" width="80" height="70" rx="5" fill="hsl(var(--card))" stroke="hsl(var(--destructive))" strokeWidth="1.5" />
            <text x="580" y="272" textAnchor="middle" fontSize="9" fontWeight="bold" fill="hsl(var(--destructive))">MQ-135</text>
            <text x="580" y="287" textAnchor="middle" fontSize="8" fill="hsl(var(--muted-foreground))">Gas/CO2</text>
            <text x="580" y="305" textAnchor="middle" fontSize="9" fontWeight="bold" fill="hsl(var(--destructive))">
              {values.co2_level} ppm
            </text>
            {/* Wire: MQ -> A2 */}
            <path d="M540 300 L520 300 L520 460 L158 460 L158 391" fill="none" stroke="hsl(var(--success))" strokeWidth="1.5" strokeDasharray={status === 'running' ? '4 2' : 'none'} />

            {/* LED indicator */}
            <g>
              <ellipse cx="300" y="365" rx="8" ry="12" fill={ledOn && status === 'running' ? 'hsl(var(--destructive))' : 'hsl(var(--destructive)/0.2)'} stroke="hsl(var(--destructive)/0.6)" strokeWidth="1" />
              {ledOn && status === 'running' && (
                <ellipse cx="300" cy="365" rx="14" ry="18" fill="hsl(var(--destructive)/0.15)" />
              )}
              <text x="300" y="395" textAnchor="middle" fontSize="7" fill="hsl(var(--muted-foreground))">LED</text>
              {/* Wire: LED -> D13 */}
              <path d="M300 353 L300 340 L261 340" fill="none" stroke="hsl(var(--destructive)/0.7)" strokeWidth="1.5" />
            </g>

            {/* LCD Display */}
            <rect x="580" y="360" width="190" height="95" rx="6" fill="hsl(var(--card))" stroke="hsl(var(--primary))" strokeWidth="1.5" />
            <rect x="592" y="375" width="166" height="65" rx="3" fill="hsl(var(--success)/0.15)" stroke="hsl(var(--success)/0.3)" strokeWidth="1" />
            <text x="675" y="370" textAnchor="middle" fontSize="8" fill="hsl(var(--muted-foreground))">LCD 16x2 (I2C)</text>
            {/* LCD text lines */}
            <text x="600" y="400" fontSize="11" fontFamily="monospace" fill="hsl(var(--success))">
              T:{values.temperature.toFixed(1)}C H:{values.humidity.toFixed(0)}%
            </text>
            <text x="600" y="425" fontSize="11" fontFamily="monospace" fill="hsl(var(--success))">
              M:{values.soil_moisture.toFixed(0)}% L:{values.light_level}
            </text>
            {/* Wire: LCD SDA -> A4 */}
            <path d="M580 410 L520 410 L520 460 L184 460 L184 391" fill="none" stroke="hsl(var(--primary)/0.6)" strokeWidth="1.5" />
            {/* Wire: LCD SCL -> A5 */}
            <path d="M580 430 L510 430 L510 470 L210 470 L210 391" fill="none" stroke="hsl(var(--primary)/0.6)" strokeWidth="1.5" />

            {/* Active data pulse animation */}
            {status === 'running' && (
              <>
                <circle cx="338" cy="148" r="3" fill="hsl(var(--success))">
                  <animate attributeName="opacity" values="1;0;1" dur="1s" repeatCount="indefinite" />
                </circle>
                <circle cx="470" cy="110" r="3" fill="hsl(var(--success))">
                  <animate attributeName="opacity" values="1;0;1" dur="1.2s" repeatCount="indefinite" />
                </circle>
                <circle cx="575" cy="210" r="3" fill="hsl(var(--warning))">
                  <animate attributeName="opacity" values="1;0;1" dur="0.8s" repeatCount="indefinite" />
                </circle>
              </>
            )}
          </svg>
        </div>

        {/* Live Values Readout */}
        <div className="grid grid-cols-5 gap-2">
          {[
            { icon: Thermometer, label: 'Temp', value: `${values.temperature.toFixed(1)}°C`, color: 'text-destructive' },
            { icon: Droplets, label: 'Humidity', value: `${values.humidity.toFixed(0)}%`, color: 'text-primary' },
            { icon: Activity, label: 'Moisture', value: `${values.soil_moisture.toFixed(0)}%`, color: 'text-accent-foreground' },
            { icon: Sun, label: 'Light', value: `${values.light_level} lux`, color: 'text-warning' },
            { icon: Wind, label: 'CO₂', value: `${values.co2_level} ppm`, color: 'text-muted-foreground' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="text-center p-2 rounded-lg bg-muted/50 border border-border/30">
              <Icon className={cn('w-4 h-4 mx-auto mb-1', color)} />
              <p className="text-[10px] text-muted-foreground">{label}</p>
              <p className={cn('text-xs font-bold', color)}>{value}</p>
            </div>
          ))}
        </div>

        {/* Simulation Controls */}
        <div className="flex items-center gap-2 justify-center pt-2">
          {(status === 'idle' || status === 'stopped') && (
            <Button size="sm" onClick={startSimulation} className="gap-1.5">
              <Play className="w-4 h-4" /> Start Simulation
            </Button>
          )}
          {status === 'running' && (
            <>
              <Button size="sm" variant="outline" onClick={pauseSimulation} className="gap-1.5">
                <Pause className="w-4 h-4" /> Pause
              </Button>
              <Button size="sm" variant="destructive" onClick={stopSimulation} className="gap-1.5">
                <Square className="w-4 h-4" /> Stop
              </Button>
            </>
          )}
          {status === 'paused' && (
            <>
              <Button size="sm" onClick={resumeSimulation} className="gap-1.5">
                <Play className="w-4 h-4" /> Resume
              </Button>
              <Button size="sm" variant="destructive" onClick={stopSimulation} className="gap-1.5">
                <Square className="w-4 h-4" /> Stop
              </Button>
            </>
          )}
          {(status === 'running' || status === 'paused') && (
            <Button size="sm" variant="secondary" onClick={restartSimulation} className="gap-1.5">
              <RotateCcw className="w-4 h-4" /> Restart
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
