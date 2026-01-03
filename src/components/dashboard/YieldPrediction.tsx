import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, Calendar, Loader2, Leaf, Target, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

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

interface YieldPredictionProps {
  plants: PlantData[];
  sensorData: SensorData;
}

export const YieldPrediction: React.FC<YieldPredictionProps> = ({ plants, sensorData }) => {
  const [prediction, setPrediction] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<Date | null>(null);

  const generatePrediction = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('yield-prediction', {
        body: { plants, sensorData }
      });

      if (error) throw error;

      if (data.success) {
        setPrediction(data.prediction);
        setLastGenerated(new Date(data.generatedAt));
        toast({
          title: "Prediction Generated",
          description: `Analyzed ${data.plantCount} plants for yield forecast.`,
        });
      } else {
        throw new Error(data.error || 'Failed to generate prediction');
      }
    } catch (error) {
      console.error('Error generating prediction:', error);
      toast({
        title: "Prediction Failed",
        description: error instanceof Error ? error.message : "Unable to generate yield prediction",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrediction = (text: string) => {
    // Split by lines and format
    const lines = text.split('\n');
    return lines.map((line, i) => {
      // Headers (lines starting with # or containing :)
      if (line.startsWith('#')) {
        const level = line.match(/^#+/)?.[0].length || 1;
        const content = line.replace(/^#+\s*/, '');
        if (level === 1) {
          return <h3 key={i} className="text-lg font-bold text-primary mt-4 mb-2">{content}</h3>;
        } else if (level === 2) {
          return <h4 key={i} className="text-md font-semibold text-foreground mt-3 mb-1">{content}</h4>;
        }
        return <h5 key={i} className="text-sm font-medium text-muted-foreground mt-2">{content}</h5>;
      }
      
      // Bold text
      if (line.includes('**')) {
        const parts = line.split(/\*\*(.+?)\*\*/g);
        return (
          <p key={i} className="text-sm text-muted-foreground my-1">
            {parts.map((part, j) => 
              j % 2 === 1 ? <strong key={j} className="text-foreground">{part}</strong> : part
            )}
          </p>
        );
      }
      
      // List items
      if (line.trim().startsWith('-') || line.trim().startsWith('•')) {
        return (
          <li key={i} className="text-sm text-muted-foreground ml-4 my-0.5 list-disc">
            {line.replace(/^[\s\-•]+/, '')}
          </li>
        );
      }
      
      // Numbered items
      if (/^\d+\./.test(line.trim())) {
        return (
          <li key={i} className="text-sm text-muted-foreground ml-4 my-0.5 list-decimal">
            {line.replace(/^\d+\.\s*/, '')}
          </li>
        );
      }
      
      // Regular paragraphs
      if (line.trim()) {
        return <p key={i} className="text-sm text-muted-foreground my-1">{line}</p>;
      }
      
      return <div key={i} className="h-2" />;
    });
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">AI Yield Prediction</CardTitle>
              <p className="text-sm text-muted-foreground">
                Forecast harvest dates and expected yields
              </p>
            </div>
          </div>
          <Button 
            onClick={generatePrediction} 
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : prediction ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Prediction
              </>
            ) : (
              <>
                <Target className="w-4 h-4 mr-2" />
                Generate Prediction
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Current conditions summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="p-3 bg-primary/5 rounded-lg text-center">
            <p className="text-lg font-bold text-primary">{sensorData.temperature}°C</p>
            <p className="text-xs text-muted-foreground">Temperature</p>
          </div>
          <div className="p-3 bg-humidity/5 rounded-lg text-center">
            <p className="text-lg font-bold text-humidity">{sensorData.humidity}%</p>
            <p className="text-xs text-muted-foreground">Humidity</p>
          </div>
          <div className="p-3 bg-moisture/5 rounded-lg text-center">
            <p className="text-lg font-bold text-moisture">{sensorData.moisture}%</p>
            <p className="text-xs text-muted-foreground">Soil Moisture</p>
          </div>
          <div className="p-3 bg-light/5 rounded-lg text-center">
            <p className="text-lg font-bold text-light">{sensorData.light}</p>
            <p className="text-xs text-muted-foreground">Light (lux)</p>
          </div>
        </div>

        {/* Plants being analyzed */}
        <div className="flex items-center gap-2 mb-4">
          <Leaf className="w-4 h-4 text-success" />
          <span className="text-sm text-muted-foreground">
            Analyzing <strong className="text-foreground">{plants.length}</strong> plants
          </span>
          <div className="flex gap-1 flex-wrap">
            {[...new Set(plants.map(p => p.species))].slice(0, 4).map((species, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {species}
              </Badge>
            ))}
            {[...new Set(plants.map(p => p.species))].length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{[...new Set(plants.map(p => p.species))].length - 4} more
              </Badge>
            )}
          </div>
        </div>

        {/* Prediction results */}
        {prediction ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Generated {lastGenerated?.toLocaleString()}
                </span>
              </div>
            </div>
            <ScrollArea className="h-[350px] rounded-lg border border-border p-4 bg-muted/20">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                {formatPrediction(prediction)}
              </div>
            </ScrollArea>
          </div>
        ) : (
          <div className="h-[200px] flex flex-col items-center justify-center text-center p-6 border border-dashed border-border rounded-lg">
            <Target className="w-12 h-12 text-muted-foreground mb-3" />
            <p className="text-muted-foreground mb-1">No prediction yet</p>
            <p className="text-xs text-muted-foreground max-w-sm">
              Click "Generate Prediction" to get AI-powered yield forecasts and harvest date estimates for your plants.
            </p>
          </div>
        )}

        {/* Info notice */}
        <div className="mt-4 flex items-start gap-2 p-3 bg-muted/30 rounded-lg">
          <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            Predictions are based on current sensor data, plant growth stages, and agricultural best practices. Actual yields may vary based on care and environmental changes.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
