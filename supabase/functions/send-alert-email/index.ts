import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AlertEmailRequest {
  email: string;
  alertType: string;
  severity: 'warning' | 'critical';
  message: string;
  currentValue: number;
  threshold: number;
  unit: string;
  timestamp: string;
}

const getSeverityColor = (severity: string) => {
  return severity === 'critical' ? '#dc2626' : '#f59e0b';
};

const getSeverityEmoji = (severity: string) => {
  return severity === 'critical' ? '🚨' : '⚠️';
};

const handler = async (req: Request): Promise<Response> => {
  console.log("send-alert-email function called");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, alertType, severity, message, currentValue, threshold, unit, timestamp }: AlertEmailRequest = await req.json();
    
    console.log(`Sending ${severity} alert email for ${alertType} to ${email}`);

    const severityColor = getSeverityColor(severity);
    const severityEmoji = getSeverityEmoji(severity);
    const formattedTime = new Date(timestamp).toLocaleString();

    const emailResponse = await resend.emails.send({
      from: "Greenhouse Alerts <onboarding@resend.dev>",
      to: [email],
      subject: `${severityEmoji} ${severity.toUpperCase()}: ${alertType} Alert - Greenhouse Monitor`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">🌱 Greenhouse Monitor</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Smart Agriculture Alert System</p>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <div style="background-color: ${severityColor}15; border-left: 4px solid ${severityColor}; padding: 15px; border-radius: 0 8px 8px 0; margin-bottom: 20px;">
                <h2 style="color: ${severityColor}; margin: 0 0 5px 0; font-size: 18px;">
                  ${severityEmoji} ${severity.toUpperCase()} Alert: ${alertType}
                </h2>
                <p style="color: #374151; margin: 0; font-size: 16px;">${message}</p>
              </div>
              
              <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <h3 style="color: #111827; margin: 0 0 15px 0; font-size: 16px;">Sensor Reading Details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Current Value:</td>
                    <td style="padding: 8px 0; color: #111827; font-weight: 600; font-size: 14px; text-align: right;">${currentValue}${unit}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Threshold:</td>
                    <td style="padding: 8px 0; color: #111827; font-weight: 600; font-size: 14px; text-align: right;">${threshold}${unit}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Time Detected:</td>
                    <td style="padding: 8px 0; color: #111827; font-weight: 600; font-size: 14px; text-align: right;">${formattedTime}</td>
                  </tr>
                </table>
              </div>
              
              <div style="text-align: center; margin-top: 25px;">
                <p style="color: #6b7280; font-size: 14px; margin: 0;">
                  ${severity === 'critical' 
                    ? '⚡ Immediate action recommended! Check your greenhouse systems.' 
                    : '📋 Monitor the situation and take preventive measures if needed.'}
                </p>
              </div>
            </div>
            
            <div style="text-align: center; padding: 20px;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                This is an automated alert from your Greenhouse Monitoring System.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-alert-email function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
