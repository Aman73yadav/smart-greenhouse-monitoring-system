import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DiseaseIdentificationRequest {
  imageBase64: string;
  plantType?: string;
}

serve(async (req) => {
  console.log("plant-disease-identify function called");
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, plantType }: DiseaseIdentificationRequest = await req.json();
    
    if (!imageBase64) {
      throw new Error("Image is required");
    }

    console.log(`Analyzing plant image for diseases${plantType ? ` (${plantType})` : ''}`);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert plant pathologist and agricultural scientist specializing in plant disease identification. 
Analyze the provided plant image and identify any diseases, pests, or nutritional deficiencies.

For each issue identified, provide:
1. **Disease/Problem Name**: The specific name of the disease, pest, or deficiency
2. **Confidence Level**: High, Medium, or Low
3. **Symptoms Observed**: What visual symptoms you can see in the image
4. **Cause**: What causes this problem (fungal, bacterial, viral, pest, environmental, nutritional)
5. **Severity**: Mild, Moderate, or Severe
6. **Treatment Options**: 
   - Organic/natural treatments
   - Chemical treatments (if necessary)
   - Prevention methods
7. **Urgency**: How quickly action should be taken

If the plant appears healthy, state that clearly and provide general care tips.
If you cannot identify the problem with certainty, explain what additional information would help.

Format your response in a clear, structured way that's easy to read.`;

    const userPrompt = plantType 
      ? `Please analyze this ${plantType} plant image for any diseases, pests, or health issues.`
      : `Please analyze this plant image for any diseases, pests, or health issues. First identify what type of plant it is, then assess its health.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { 
            role: "user", 
            content: [
              { type: "text", text: userPrompt },
              { 
                type: "image_url", 
                image_url: { 
                  url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}` 
                } 
              }
            ]
          }
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
    const diagnosis = data.choices?.[0]?.message?.content;

    if (!diagnosis) {
      throw new Error("No diagnosis received from AI");
    }

    console.log("Plant disease analysis completed successfully");

    return new Response(
      JSON.stringify({ 
        success: true, 
        diagnosis,
        analyzedAt: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in plant-disease-identify function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
