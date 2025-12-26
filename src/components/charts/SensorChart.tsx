import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { format } from 'date-fns';
import { HistoricalData } from '@/types/greenhouse';

interface SensorChartProps {
  data: HistoricalData[];
  type: 'temperature' | 'humidity' | 'moisture' | 'light' | 'all';
}

const chartColors = {
  temperature: 'hsl(0, 85%, 60%)',
  humidity: 'hsl(200, 85%, 55%)',
  moisture: 'hsl(175, 70%, 45%)',
  light: 'hsl(45, 95%, 60%)',
};

export const SensorChart: React.FC<SensorChartProps> = ({ data, type }) => {
  const formattedData = useMemo(() => {
    return data.map(d => ({
      ...d,
      time: format(d.timestamp, 'HH:mm'),
      temperature: Number(d.temperature.toFixed(1)),
      humidity: Number(d.humidity.toFixed(1)),
      moisture: Number(d.moisture.toFixed(1)),
      light: Number(d.light.toFixed(0)),
    }));
  }, [data]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card p-3 text-sm">
          <p className="font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
              {entry.name === 'temperature' ? '°C' : 
               entry.name === 'light' ? ' lux' : '%'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (type === 'all') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(160, 15%, 20%)" />
          <XAxis 
            dataKey="time" 
            stroke="hsl(140, 15%, 60%)"
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            yAxisId="temp" 
            orientation="left"
            stroke={chartColors.temperature}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            yAxisId="percent" 
            orientation="right"
            stroke={chartColors.humidity}
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            yAxisId="temp"
            type="monotone"
            dataKey="temperature"
            stroke={chartColors.temperature}
            strokeWidth={2}
            dot={false}
            name="Temperature (°C)"
          />
          <Line
            yAxisId="percent"
            type="monotone"
            dataKey="humidity"
            stroke={chartColors.humidity}
            strokeWidth={2}
            dot={false}
            name="Humidity (%)"
          />
          <Line
            yAxisId="percent"
            type="monotone"
            dataKey="moisture"
            stroke={chartColors.moisture}
            strokeWidth={2}
            dot={false}
            name="Moisture (%)"
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  const color = chartColors[type];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={formattedData}>
        <defs>
          <linearGradient id={`gradient-${type}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(160, 15%, 20%)" />
        <XAxis 
          dataKey="time" 
          stroke="hsl(140, 15%, 60%)"
          tick={{ fontSize: 12 }}
        />
        <YAxis 
          stroke="hsl(140, 15%, 60%)"
          tick={{ fontSize: 12 }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey={type}
          stroke={color}
          strokeWidth={2}
          fill={`url(#gradient-${type})`}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};
