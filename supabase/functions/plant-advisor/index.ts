import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const { sensorData, plantData } = await req.json();

    const systemPrompt = `You are an expert greenhouse plant health advisor with deep knowledge of horticulture, plant biology, and smart greenhouse systems.

Analyze the provided sensor data and plant information to give personalized, actionable recommendations.

Your response should be structured as JSON with these fields:
{
  "overallHealth": "excellent" | "good" | "fair" | "poor",
  "healthScore": number (0-100),
  "summary": "Brief 1-2 sentence health summary",
  "alerts": [
    {
      "type": "warning" | "critical" | "info",
      "title": "Alert title",
      "message": "Detailed alert message",
      "action": "Recommended action"
    }
  ],
  "recommendations": [
    {
      "category": "watering" | "temperature" | "humidity" | "lighting" | "nutrients" | "pest",
      "priority": "high" | "medium" | "low",
      "title": "Recommendation title",
      "description": "Detailed recommendation",
      "impact": "Expected improvement"
    }
  ],
  "weeklyForecast": "Prediction for next 7 days based on current conditions",
  "optimalConditions": {
    "temperature": { "min": number, "max": number, "current": "status" },
    "humidity": { "min": number, "max": number, "current": "status" },
    "soilMoisture": { "min": number, "max": number, "current": "status" }
  }
}

Consider plant growth stages, seasonal factors, and interactions between different environmental parameters.`;

    const userMessage = `Current Greenhouse Conditions:

SENSOR DATA:
- Temperature: ${sensorData?.temperature || 24}°C
- Humidity: ${sensorData?.humidity || 65}%
- Soil Moisture: ${sensorData?.moisture || 60}%
- Light Level: ${sensorData?.light || 800} lux
- CO2 Level: ${sensorData?.co2 || 400} ppm

PLANT INFORMATION:
${plantData ? `
- Plant: ${plantData.name}
- Species: ${plantData.species}
- Growth Week: ${plantData.growthWeek || 'Unknown'}
- Category: ${plantData.category}
- Current Health: ${plantData.health || 'Unknown'}
` : 'General greenhouse assessment requested'}

Please analyze these conditions and provide detailed health assessment and recommendations.`;

    console.log('Sending request to AI gateway...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Usage limit reached. Please add credits.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI Gateway returned ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    console.log('AI response received successfully');

    // Try to parse as JSON, or wrap in a structure
    let result;
    try {
      // Remove markdown code blocks if present
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      result = JSON.parse(cleanContent);
    } catch {
      result = {
        overallHealth: 'good',
        healthScore: 75,
        summary: content,
        recommendations: [],
        alerts: []
      };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in plant-advisor function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
