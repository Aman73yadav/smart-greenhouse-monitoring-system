-- Create profiles table for users
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create plants table
CREATE TABLE public.plants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  species TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('vegetable', 'fruit', 'herb')),
  planted_date DATE NOT NULL DEFAULT CURRENT_DATE,
  growth_stage INTEGER DEFAULT 1 CHECK (growth_stage >= 1 AND growth_stage <= 16),
  zone TEXT,
  health_status TEXT DEFAULT 'healthy' CHECK (health_status IN ('healthy', 'warning', 'critical')),
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create sensor_readings table
CREATE TABLE public.sensor_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  device_id UUID,
  temperature DECIMAL(5,2),
  humidity DECIMAL(5,2),
  soil_moisture DECIMAL(5,2),
  light_level DECIMAL(7,2),
  co2_level DECIMAL(7,2),
  recorded_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create iot_devices table
CREATE TABLE public.iot_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  device_name TEXT NOT NULL,
  device_type TEXT NOT NULL CHECK (device_type IN ('sensor', 'actuator', 'controller')),
  zone TEXT,
  status TEXT DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'error')),
  battery_level INTEGER CHECK (battery_level >= 0 AND battery_level <= 100),
  firmware_version TEXT,
  last_seen TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create schedules table
CREATE TABLE public.schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  schedule_type TEXT NOT NULL CHECK (schedule_type IN ('irrigation', 'lighting', 'ventilation', 'heating')),
  zone TEXT,
  start_time TIME NOT NULL,
  end_time TIME,
  days_of_week INTEGER[] DEFAULT ARRAY[1,2,3,4,5,6,7],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create control_settings table
CREATE TABLE public.control_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  target_temperature DECIMAL(5,2) DEFAULT 25.0,
  target_humidity DECIMAL(5,2) DEFAULT 65.0,
  target_soil_moisture DECIMAL(5,2) DEFAULT 60.0,
  irrigation_enabled BOOLEAN DEFAULT true,
  ventilation_enabled BOOLEAN DEFAULT true,
  lighting_enabled BOOLEAN DEFAULT true,
  heating_enabled BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensor_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iot_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.control_settings ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Plants policies
CREATE POLICY "Users can view own plants" ON public.plants FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own plants" ON public.plants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own plants" ON public.plants FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own plants" ON public.plants FOR DELETE USING (auth.uid() = user_id);

-- Sensor readings policies
CREATE POLICY "Users can view own readings" ON public.sensor_readings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own readings" ON public.sensor_readings FOR INSERT WITH CHECK (auth.uid() = user_id);

-- IoT devices policies
CREATE POLICY "Users can view own devices" ON public.iot_devices FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own devices" ON public.iot_devices FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own devices" ON public.iot_devices FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own devices" ON public.iot_devices FOR DELETE USING (auth.uid() = user_id);

-- Schedules policies
CREATE POLICY "Users can view own schedules" ON public.schedules FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own schedules" ON public.schedules FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own schedules" ON public.schedules FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own schedules" ON public.schedules FOR DELETE USING (auth.uid() = user_id);

-- Control settings policies
CREATE POLICY "Users can view own settings" ON public.control_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings" ON public.control_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON public.control_settings FOR UPDATE USING (auth.uid() = user_id);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (new.id, new.raw_user_meta_data ->> 'full_name');
  
  INSERT INTO public.control_settings (user_id)
  VALUES (new.id);
  
  RETURN new;
END;
$$;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_plants_updated_at BEFORE UPDATE ON public.plants FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_control_settings_updated_at BEFORE UPDATE ON public.control_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for sensor readings
ALTER PUBLICATION supabase_realtime ADD TABLE public.sensor_readings;