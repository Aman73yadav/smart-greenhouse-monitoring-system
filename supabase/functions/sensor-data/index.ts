import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { device_id, readings } = await req.json();

    if (!device_id || !readings) {
      return new Response(
        JSON.stringify({ error: 'device_id and readings are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update device last seen
    const { error: deviceError } = await supabase
      .from('iot_devices')
      .update({ last_seen: new Date().toISOString(), status: 'online' })
      .eq('id', device_id);

    if (deviceError) {
      console.error('Error updating device:', deviceError);
    }

    // Get device info to find user_id
    const { data: device } = await supabase
      .from('iot_devices')
      .select('user_id')
      .eq('id', device_id)
      .single();

    if (!device) {
      return new Response(
        JSON.stringify({ error: 'Device not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert sensor reading
    const { error: readingError } = await supabase
      .from('sensor_readings')
      .insert({
        user_id: device.user_id,
        device_id: device_id,
        temperature: readings.temperature,
        humidity: readings.humidity,
        soil_moisture: readings.soil_moisture,
        light_level: readings.light_level,
        co2_level: readings.co2_level,
      });

    if (readingError) {
      console.error('Error inserting reading:', readingError);
      return new Response(
        JSON.stringify({ error: 'Failed to store reading' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Sensor data received from device ${device_id}`);

    return new Response(
      JSON.stringify({ success: true, message: 'Sensor data recorded' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in sensor-data function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
