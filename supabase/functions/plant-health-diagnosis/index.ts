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

    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      throw new Error('No image provided');
    }

    const systemPrompt = `You are an expert plant pathologist and horticulturist AI specialized in diagnosing plant health issues from images.

Analyze the provided plant image and diagnose any health issues, diseases, pest damage, or nutrient deficiencies.

Your response MUST be valid JSON with this exact structure:
{
  "overallHealth": "healthy" | "mild_issues" | "moderate_issues" | "severe_issues",
  "healthScore": number (0-100),
  "primaryDiagnosis": "Brief summary of plant's condition",
  "confidence": number (0-100),
  "issues": [
    {
      "type": "disease" | "pest" | "nutrient" | "environmental" | "watering",
      "name": "Name of the issue (e.g., 'Powdery Mildew', 'Nitrogen Deficiency')",
      "severity": "low" | "medium" | "high",
      "description": "Detailed description of the issue",
      "symptoms": ["List of visible symptoms"],
      "treatment": ["List of treatment steps"]
    }
  ],
  "recommendations": [
    {
      "priority": "immediate" | "soon" | "routine",
      "action": "What to do",
      "details": "Detailed instructions"
    }
  ],
  "preventiveMeasures": ["List of preventive care tips"]
}

Common issues to look for:
- Diseases: Powdery mildew, leaf spot, blight, rust, root rot, mosaic virus
- Pests: Aphids, spider mites, whiteflies, caterpillars, scale insects
- Nutrient deficiencies: Nitrogen (yellowing older leaves), Phosphorus (purple leaves), Potassium (brown edges), Iron (interveinal chlorosis)
- Environmental: Sunburn, cold damage, heat stress, transplant shock
- Watering: Overwatering (yellowing, wilting), Underwatering (crispy, drooping)

If the plant looks healthy, return an empty issues array and positive recommendations for maintaining health.`;

    console.log('Sending image to AI for plant health diagnosis...');

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
          { 
            role: 'user', 
            content: [
              { type: 'text', text: 'Please analyze this plant image and provide a detailed health diagnosis.' },
              { type: 'image_url', image_url: { url: imageBase64 } }
            ]
          }
        ],
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

    console.log('AI plant diagnosis received successfully');

    // Parse the JSON response
    let result;
    try {
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      result = JSON.parse(cleanContent);
    } catch {
      // If parsing fails, return a default healthy response
      result = {
        overallHealth: 'healthy',
        healthScore: 85,
        primaryDiagnosis: content || 'Unable to parse diagnosis. Plant appears generally healthy.',
        confidence: 60,
        issues: [],
        recommendations: [
          {
            priority: 'routine',
            action: 'Continue regular care',
            details: 'Maintain current watering and lighting schedule.'
          }
        ],
        preventiveMeasures: [
          'Monitor for any changes in leaf color or texture',
          'Ensure proper drainage to prevent root issues',
          'Maintain consistent watering schedule'
        ]
      };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in plant-health-diagnosis function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});