import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WeatherResponse {
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

serve(async (req) => {
  console.log("weather-forecast function called");
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { latitude, longitude } = await req.json();
    
    // Default to a sample location if not provided
    const lat = latitude || 40.7128;
    const lon = longitude || -74.0060;
    
    console.log(`Fetching weather for lat: ${lat}, lon: ${lon}`);

    // Using Open-Meteo API (free, no API key required)
    const currentUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,cloud_cover&daily=temperature_2m_max,temperature_2m_min,relative_humidity_2m_mean,weather_code&timezone=auto&forecast_days=7`;
    
    const response = await fetch(currentUrl);
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Map weather codes to descriptions and icons
    const getWeatherInfo = (code: number) => {
      const weatherMap: Record<number, { description: string; icon: string }> = {
        0: { description: 'Clear sky', icon: '☀️' },
        1: { description: 'Mainly clear', icon: '🌤️' },
        2: { description: 'Partly cloudy', icon: '⛅' },
        3: { description: 'Overcast', icon: '☁️' },
        45: { description: 'Foggy', icon: '🌫️' },
        48: { description: 'Depositing rime fog', icon: '🌫️' },
        51: { description: 'Light drizzle', icon: '🌧️' },
        53: { description: 'Moderate drizzle', icon: '🌧️' },
        55: { description: 'Dense drizzle', icon: '🌧️' },
        61: { description: 'Slight rain', icon: '🌧️' },
        63: { description: 'Moderate rain', icon: '🌧️' },
        65: { description: 'Heavy rain', icon: '🌧️' },
        71: { description: 'Slight snow', icon: '🌨️' },
        73: { description: 'Moderate snow', icon: '🌨️' },
        75: { description: 'Heavy snow', icon: '🌨️' },
        77: { description: 'Snow grains', icon: '🌨️' },
        80: { description: 'Slight rain showers', icon: '🌦️' },
        81: { description: 'Moderate rain showers', icon: '🌦️' },
        82: { description: 'Violent rain showers', icon: '🌦️' },
        85: { description: 'Slight snow showers', icon: '🌨️' },
        86: { description: 'Heavy snow showers', icon: '🌨️' },
        95: { description: 'Thunderstorm', icon: '⛈️' },
        96: { description: 'Thunderstorm with hail', icon: '⛈️' },
        99: { description: 'Thunderstorm with heavy hail', icon: '⛈️' },
      };
      return weatherMap[code] || { description: 'Unknown', icon: '❓' };
    };

    const currentWeather = getWeatherInfo(data.current.weather_code);
    
    const forecast: ForecastDay[] = data.daily.time.map((date: string, i: number) => {
      const dayWeather = getWeatherInfo(data.daily.weather_code[i]);
      return {
        date,
        tempMax: Math.round(data.daily.temperature_2m_max[i]),
        tempMin: Math.round(data.daily.temperature_2m_min[i]),
        humidity: Math.round(data.daily.relative_humidity_2m_mean[i]),
        description: dayWeather.description,
        icon: dayWeather.icon,
      };
    });

    const weatherData: WeatherResponse = {
      temperature: Math.round(data.current.temperature_2m),
      humidity: Math.round(data.current.relative_humidity_2m),
      description: currentWeather.description,
      icon: currentWeather.icon,
      windSpeed: Math.round(data.current.wind_speed_10m),
      cloudCover: data.current.cloud_cover,
      forecast,
    };

    console.log("Weather data fetched successfully");

    return new Response(
      JSON.stringify({ success: true, data: weatherData }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in weather-forecast function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
