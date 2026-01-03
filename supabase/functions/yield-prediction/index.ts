import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PlantData {
  name: string;
  species: string;
  plantedDate: string;
  currentGrowthStage: number;
  healthStatus: string;
  zone?: string;
}

interface SensorData {
  temperature: number;
  humidity: number;
  moisture: number;
  light: number;
}

interface PredictionRequest {
  plants: PlantData[];
  sensorData: SensorData;
}

serve(async (req) => {
  console.log("yield-prediction function called");
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { plants, sensorData }: PredictionRequest = await req.json();
    
    console.log(`Generating yield predictions for ${plants.length} plants`);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const plantSummary = plants.map(p => 
      `${p.name} (${p.species}): planted ${p.plantedDate}, stage ${p.currentGrowthStage}/10, health: ${p.healthStatus}`
    ).join('\n');

    const prompt = `You are an expert agricultural AI analyzing greenhouse data to predict crop yields and harvest dates.

Current Environmental Conditions:
- Temperature: ${sensorData.temperature}°C
- Humidity: ${sensorData.humidity}%
- Soil Moisture: ${sensorData.moisture}%
- Light Level: ${sensorData.light} lux

Plants to analyze:
${plantSummary}

For each plant type in this greenhouse, provide:
1. Estimated days until harvest
2. Expected yield (in kg or number of fruits/vegetables)
3. Confidence level (high/medium/low)
4. Key factors affecting the prediction
5. Recommendations to optimize yield

Format your response as a clear, structured analysis with specific numbers and actionable insights. Be realistic about expected yields for home/small greenhouse growing.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { 
            role: "system", 
            content: "You are an expert agricultural scientist specializing in greenhouse crop management and yield prediction. Provide accurate, practical predictions based on plant growth stages, environmental conditions, and best practices in controlled environment agriculture." 
          },
          { role: "user", content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const prediction = data.choices?.[0]?.message?.content;

    if (!prediction) {
      throw new Error("No prediction received from AI");
    }

    console.log("Yield prediction generated successfully");

    return new Response(
      JSON.stringify({ 
        success: true, 
        prediction,
        generatedAt: new Date().toISOString(),
        plantCount: plants.length
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in yield-prediction function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
