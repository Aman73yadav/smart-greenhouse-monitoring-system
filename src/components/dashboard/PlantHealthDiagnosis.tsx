import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Camera, 
  Upload, 
  Loader2, 
  AlertTriangle, 
  CheckCircle2, 
  Bug, 
  Droplets, 
  Sun,
  Thermometer,
  Leaf,
  XCircle,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DiagnosisResult {
  overallHealth: 'healthy' | 'mild_issues' | 'moderate_issues' | 'severe_issues';
  healthScore: number;
  primaryDiagnosis: string;
  confidence: number;
  issues: {
    type: 'disease' | 'pest' | 'nutrient' | 'environmental' | 'watering';
    name: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
    symptoms: string[];
    treatment: string[];
  }[];
  recommendations: {
    priority: 'immediate' | 'soon' | 'routine';
    action: string;
    details: string;
  }[];
  preventiveMeasures: string[];
}

const getHealthColor = (health: string) => {
  switch (health) {
    case 'healthy': return 'text-success';
    case 'mild_issues': return 'text-primary';
    case 'moderate_issues': return 'text-warning';
    case 'severe_issues': return 'text-destructive';
    default: return 'text-muted-foreground';
  }
};

const getIssueIcon = (type: string) => {
  switch (type) {
    case 'disease': return <Bug className="w-4 h-4" />;
    case 'pest': return <Bug className="w-4 h-4" />;
    case 'nutrient': return <Leaf className="w-4 h-4" />;
    case 'environmental': return <Thermometer className="w-4 h-4" />;
    case 'watering': return <Droplets className="w-4 h-4" />;
    default: return <AlertTriangle className="w-4 h-4" />;
  }
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'low': return 'bg-success/20 text-success border-success/30';
    case 'medium': return 'bg-warning/20 text-warning border-warning/30';
    case 'high': return 'bg-destructive/20 text-destructive border-destructive/30';
    default: return 'bg-muted';
  }
};

export const PlantHealthDiagnosis: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image under 10MB",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        setDiagnosis(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzePlant = async () => {
    if (!selectedImage) {
      toast({
        title: "No image selected",
        description: "Please upload a plant image first",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('plant-health-diagnosis', {
        body: { imageBase64: selectedImage }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setDiagnosis(data);
      toast({
        title: "Analysis Complete",
        description: "AI has analyzed your plant's health",
      });
    } catch (error) {
      console.error('Error analyzing plant:', error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze plant image",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetAnalysis = () => {
    setSelectedImage(null);
    setDiagnosis(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-primary" />
          AI Plant Health Diagnosis
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Upload a photo of your plant for AI-powered disease and health analysis
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Image Upload Area */}
        <div className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
          
          {!selectedImage ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="font-medium">Click to upload plant image</p>
              <p className="text-sm text-muted-foreground mt-1">
                JPG, PNG or WebP (max 10MB)
              </p>
            </div>
          ) : (
            <div className="relative">
              <img 
                src={selectedImage} 
                alt="Selected plant" 
                className="w-full h-64 object-cover rounded-xl"
              />
              <div className="absolute top-2 right-2 flex gap-2">
                <Button 
                  size="sm" 
                  variant="secondary"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Change
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={resetAnalysis}
                >
                  <XCircle className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {selectedImage && !diagnosis && (
            <Button 
              onClick={analyzePlant} 
              disabled={isLoading} 
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing Plant...
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4 mr-2" />
                  Analyze Plant Health
                </>
              )}
            </Button>
          )}
        </div>

        {/* Diagnosis Results */}
        {diagnosis && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Health Score */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Overall Health</p>
                <p className={cn("text-2xl font-bold capitalize", getHealthColor(diagnosis.overallHealth))}>
                  {diagnosis.overallHealth.replace('_', ' ')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Health Score</p>
                <p className="text-3xl font-bold text-primary">{diagnosis.healthScore}%</p>
              </div>
            </div>
            
            <Progress value={diagnosis.healthScore} className="h-3" />

            {/* Primary Diagnosis */}
            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
              <div className="flex items-start gap-3">
                {diagnosis.overallHealth === 'healthy' ? (
                  <CheckCircle2 className="w-5 h-5 text-success mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
                )}
                <div>
                  <p className="font-semibold">{diagnosis.primaryDiagnosis}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Confidence: {diagnosis.confidence}%
                  </p>
                </div>
              </div>
            </div>

            {/* Detected Issues */}
            {diagnosis.issues.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <Bug className="w-4 h-4" />
                  Detected Issues
                </h4>
                {diagnosis.issues.map((issue, i) => (
                  <div key={i} className={cn("p-4 rounded-lg border", getSeverityColor(issue.severity))}>
                    <div className="flex items-start gap-3">
                      {getIssueIcon(issue.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold">{issue.name}</p>
                          <Badge variant="outline" className="text-xs capitalize">
                            {issue.type}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className={cn("text-xs capitalize", getSeverityColor(issue.severity))}
                          >
                            {issue.severity} severity
                          </Badge>
                        </div>
                        <p className="text-sm mb-2">{issue.description}</p>
                        
                        {issue.symptoms.length > 0 && (
                          <div className="mb-2">
                            <p className="text-xs font-medium mb-1">Symptoms:</p>
                            <ul className="text-xs text-muted-foreground list-disc list-inside">
                              {issue.symptoms.map((s, j) => (
                                <li key={j}>{s}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {issue.treatment.length > 0 && (
                          <div>
                            <p className="text-xs font-medium mb-1">Treatment:</p>
                            <ul className="text-xs list-disc list-inside">
                              {issue.treatment.map((t, j) => (
                                <li key={j} className="text-primary">{t}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Recommendations */}
            {diagnosis.recommendations.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <Leaf className="w-4 h-4" />
                  Recommendations
                </h4>
                {diagnosis.recommendations.map((rec, i) => (
                  <div key={i} className="p-3 rounded-lg bg-muted/50 border border-border">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-sm">{rec.action}</p>
                        <p className="text-xs text-muted-foreground mt-1">{rec.details}</p>
                      </div>
                      <Badge 
                        variant={
                          rec.priority === 'immediate' ? 'destructive' : 
                          rec.priority === 'soon' ? 'default' : 'secondary'
                        }
                        className="capitalize shrink-0"
                      >
                        {rec.priority}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Preventive Measures */}
            {diagnosis.preventiveMeasures.length > 0 && (
              <div className="p-4 bg-success/10 rounded-lg border border-success/20">
                <h4 className="font-semibold text-sm flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  Preventive Measures
                </h4>
                <ul className="text-sm space-y-1">
                  {diagnosis.preventiveMeasures.map((measure, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-success">•</span>
                      {measure}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* New Analysis Button */}
            <Button 
              onClick={resetAnalysis} 
              variant="outline" 
              className="w-full"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Analyze Another Plant
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};