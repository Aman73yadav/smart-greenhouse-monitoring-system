import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, AlertTriangle, CheckCircle2, Info, Loader2, Droplets, Thermometer, Sun, Bug } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SensorData {
  temperature: number;
  humidity: number;
  moisture: number;
  light: number;
  co2?: number;
}

interface PlantData {
  name: string;
  species: string;
  category: string;
  growthWeek?: number;
  health?: string;
}

interface Recommendation {
  category: string;
  priority: string;
  title: string;
  description: string;
  impact: string;
}

interface Alert {
  type: string;
  title: string;
  message: string;
  action: string;
}

interface AdvisorResponse {
  overallHealth: string;
  healthScore: number;
  summary: string;
  recommendations: Recommendation[];
  alerts: Alert[];
  weeklyForecast?: string;
  optimalConditions?: {
    temperature: { min: number; max: number; current: string };
    humidity: { min: number; max: number; current: string };
    soilMoisture: { min: number; max: number; current: string };
  };
}

interface AIPlantAdvisorProps {
  sensorData: SensorData;
  plantData?: PlantData;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'watering': return <Droplets className="w-4 h-4" />;
    case 'temperature': return <Thermometer className="w-4 h-4" />;
    case 'lighting': return <Sun className="w-4 h-4" />;
    case 'pest': return <Bug className="w-4 h-4" />;
    default: return <Info className="w-4 h-4" />;
  }
};

const getAlertIcon = (type: string) => {
  switch (type) {
    case 'critical': return <AlertTriangle className="w-4 h-4 text-destructive" />;
    case 'warning': return <AlertTriangle className="w-4 h-4 text-warning" />;
    default: return <Info className="w-4 h-4 text-primary" />;
  }
};

const getHealthColor = (health: string) => {
  switch (health) {
    case 'excellent': return 'text-success';
    case 'good': return 'text-primary';
    case 'fair': return 'text-warning';
    case 'poor': return 'text-destructive';
    default: return 'text-muted-foreground';
  }
};

export const AIPlantAdvisor: React.FC<AIPlantAdvisorProps> = ({ sensorData, plantData }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [advice, setAdvice] = useState<AdvisorResponse | null>(null);
  const { toast } = useToast();

  const getAdvice = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('plant-advisor', {
        body: { sensorData, plantData }
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setAdvice(data);
      toast({
        title: "Analysis Complete",
        description: "AI has analyzed your greenhouse conditions",
      });
    } catch (error) {
      console.error('Error getting advice:', error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to get AI recommendations",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          AI Plant Health Advisor
        </CardTitle>
        <Button onClick={getAdvice} disabled={isLoading} size="sm">
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Get Analysis
            </>
          )}
        </Button>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!advice && !isLoading && (
          <div className="text-center py-8 text-muted-foreground">
            <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Click "Get Analysis" to receive AI-powered recommendations</p>
            <p className="text-sm mt-2">Based on current sensor readings and plant data</p>
          </div>
        )}

        {advice && (
          <div className="space-y-6">
            {/* Health Score */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Overall Health</p>
                <p className={cn("text-2xl font-bold capitalize", getHealthColor(advice.overallHealth))}>
                  {advice.overallHealth}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Health Score</p>
                <p className="text-3xl font-bold text-primary">{advice.healthScore}</p>
              </div>
            </div>
            
            <Progress value={advice.healthScore} className="h-2" />

            {/* Summary */}
            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                <p className="text-sm">{advice.summary}</p>
              </div>
            </div>

            {/* Alerts */}
            {advice.alerts && advice.alerts.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Active Alerts</h4>
                {advice.alerts.map((alert, i) => (
                  <div key={i} className={cn(
                    "p-3 rounded-lg border",
                    alert.type === 'critical' ? 'bg-destructive/10 border-destructive/30' :
                    alert.type === 'warning' ? 'bg-warning/10 border-warning/30' :
                    'bg-primary/10 border-primary/30'
                  )}>
                    <div className="flex items-start gap-2">
                      {getAlertIcon(alert.type)}
                      <div>
                        <p className="font-medium text-sm">{alert.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{alert.message}</p>
                        <p className="text-xs font-medium mt-2 text-primary">→ {alert.action}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Recommendations */}
            {advice.recommendations && advice.recommendations.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Recommendations</h4>
                {advice.recommendations.map((rec, i) => (
                  <div key={i} className="p-3 rounded-lg bg-muted/50 border border-border">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        {getCategoryIcon(rec.category)}
                        <div>
                          <p className="font-medium text-sm">{rec.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{rec.description}</p>
                          {rec.impact && (
                            <p className="text-xs text-success mt-2">Expected: {rec.impact}</p>
                          )}
                        </div>
                      </div>
                      <Badge variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'default' : 'secondary'}>
                        {rec.priority}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Weekly Forecast */}
            {advice.weeklyForecast && (
              <div className="p-4 bg-muted/30 rounded-lg">
                <h4 className="font-semibold text-sm mb-2">7-Day Forecast</h4>
                <p className="text-sm text-muted-foreground">{advice.weeklyForecast}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
