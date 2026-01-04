import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Bug, Upload, Loader2, Camera, Search, BookOpen, AlertTriangle, CheckCircle, Leaf } from 'lucide-react';

const PLANT_TYPES = ['Tomato', 'Lettuce', 'Pepper', 'Strawberry', 'Carrot', 'Cucumber', 'Eggplant', 'Other'];

const COMMON_DISEASES = [
  {
    name: 'Powdery Mildew',
    plants: ['Tomato', 'Cucumber', 'Pepper'],
    symptoms: 'White powdery spots on leaves and stems',
    cause: 'Fungal',
    treatment: 'Neem oil, baking soda spray, improve air circulation',
  },
  {
    name: 'Blight',
    plants: ['Tomato', 'Pepper'],
    symptoms: 'Dark spots on leaves, wilting, fruit rot',
    cause: 'Fungal/Bacterial',
    treatment: 'Remove infected parts, copper fungicide, avoid overhead watering',
  },
  {
    name: 'Root Rot',
    plants: ['All'],
    symptoms: 'Yellowing leaves, wilting, brown mushy roots',
    cause: 'Fungal (overwatering)',
    treatment: 'Reduce watering, improve drainage, hydrogen peroxide solution',
  },
  {
    name: 'Aphids',
    plants: ['All'],
    symptoms: 'Curled leaves, sticky residue, small green/black insects',
    cause: 'Pest',
    treatment: 'Insecticidal soap, neem oil, introduce ladybugs',
  },
  {
    name: 'Nitrogen Deficiency',
    plants: ['All'],
    symptoms: 'Yellowing of older leaves, stunted growth',
    cause: 'Nutritional',
    treatment: 'Apply balanced fertilizer, add compost',
  },
  {
    name: 'Mosaic Virus',
    plants: ['Tomato', 'Cucumber', 'Pepper'],
    symptoms: 'Mottled yellow/green leaves, distorted growth',
    cause: 'Viral',
    treatment: 'Remove infected plants, control aphids, sanitize tools',
  },
  {
    name: 'Gray Mold (Botrytis)',
    plants: ['Strawberry', 'Lettuce', 'Tomato'],
    symptoms: 'Gray fuzzy mold on fruits and leaves',
    cause: 'Fungal',
    treatment: 'Remove infected parts, improve ventilation, reduce humidity',
  },
  {
    name: 'Spider Mites',
    plants: ['All'],
    symptoms: 'Yellow speckling on leaves, fine webbing',
    cause: 'Pest',
    treatment: 'Spray with water, neem oil, introduce predatory mites',
  },
];

export const PlantDiseaseEncyclopedia: React.FC = () => {
  const [activeTab, setActiveTab] = useState('identify');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [plantType, setPlantType] = useState<string>('');
  const [diagnosis, setDiagnosis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({ title: "File too large", description: "Please select an image under 10MB", variant: "destructive" });
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string);
        setDiagnosis(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) {
      toast({ title: "No image", description: "Please select an image first", variant: "destructive" });
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('plant-disease-identify', {
        body: { 
          imageBase64: selectedImage,
          plantType: plantType || undefined
        }
      });

      if (error) throw error;

      if (data.success) {
        setDiagnosis(data.diagnosis);
        toast({ title: "Analysis Complete", description: "Disease identification finished" });
      } else {
        throw new Error(data.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
      toast({ 
        title: "Analysis Failed", 
        description: error instanceof Error ? error.message : "Unable to analyze image", 
        variant: "destructive" 
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const filteredDiseases = COMMON_DISEASES.filter(disease => 
    disease.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    disease.symptoms.toLowerCase().includes(searchQuery.toLowerCase()) ||
    disease.plants.some(p => p.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatDiagnosis = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <h4 key={i} className="font-bold text-foreground mt-3 mb-1">{line.replace(/\*\*/g, '')}</h4>;
      }
      if (line.includes('**')) {
        const parts = line.split(/\*\*(.+?)\*\*/g);
        return (
          <p key={i} className="text-sm text-muted-foreground my-1">
            {parts.map((part, j) => j % 2 === 1 ? <strong key={j} className="text-foreground">{part}</strong> : part)}
          </p>
        );
      }
      if (line.trim().startsWith('-') || line.trim().startsWith('•')) {
        return <li key={i} className="text-sm text-muted-foreground ml-4 list-disc">{line.replace(/^[\s\-•]+/, '')}</li>;
      }
      if (/^\d+\./.test(line.trim())) {
        return <li key={i} className="text-sm text-muted-foreground ml-4 list-decimal">{line.replace(/^\d+\.\s*/, '')}</li>;
      }
      if (line.trim()) {
        return <p key={i} className="text-sm text-muted-foreground my-1">{line}</p>;
      }
      return <div key={i} className="h-2" />;
    });
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-destructive/10">
            <Bug className="w-5 h-5 text-destructive" />
          </div>
          <div>
            <CardTitle className="text-lg">Plant Disease Encyclopedia</CardTitle>
            <p className="text-sm text-muted-foreground">
              Identify diseases with AI or browse common plant problems
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="identify" className="gap-2">
              <Camera className="w-4 h-4" />
              AI Identify
            </TabsTrigger>
            <TabsTrigger value="encyclopedia" className="gap-2">
              <BookOpen className="w-4 h-4" />
              Encyclopedia
            </TabsTrigger>
          </TabsList>

          <TabsContent value="identify" className="space-y-4">
            {/* Image upload area */}
            <div 
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                selectedImage ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              {selectedImage ? (
                <div className="space-y-3">
                  <img 
                    src={selectedImage} 
                    alt="Selected plant" 
                    className="max-h-48 mx-auto rounded-lg object-contain"
                  />
                  <p className="text-sm text-muted-foreground">Click to change image</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <Upload className="w-10 h-10 mx-auto text-muted-foreground" />
                  <div>
                    <p className="font-medium">Upload plant image</p>
                    <p className="text-sm text-muted-foreground">Click or drag & drop (max 10MB)</p>
                  </div>
                </div>
              )}
            </div>

            {/* Plant type selector */}
            <div className="space-y-2">
              <Label>Plant Type (optional)</Label>
              <Select value={plantType} onValueChange={setPlantType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select plant type for better accuracy" />
                </SelectTrigger>
                <SelectContent>
                  {PLANT_TYPES.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Analyze button */}
            <Button 
              onClick={handleAnalyze} 
              disabled={!selectedImage || isAnalyzing}
              className="w-full"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Identify Disease
                </>
              )}
            </Button>

            {/* Diagnosis results */}
            {diagnosis && (
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  Diagnosis Results
                </h4>
                <ScrollArea className="h-[300px] rounded-lg border p-4 bg-muted/20">
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    {formatDiagnosis(diagnosis)}
                  </div>
                </ScrollArea>
              </div>
            )}
          </TabsContent>

          <TabsContent value="encyclopedia" className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search diseases, symptoms, or plants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Disease list */}
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {filteredDiseases.map((disease, i) => (
                  <div key={i} className="p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold">{disease.name}</h4>
                      <Badge variant={
                        disease.cause === 'Pest' ? 'destructive' :
                        disease.cause === 'Fungal' || disease.cause === 'Fungal/Bacterial' ? 'secondary' :
                        disease.cause === 'Viral' ? 'outline' : 'default'
                      } className="text-xs">
                        {disease.cause}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex gap-1 flex-wrap">
                        {disease.plants.map((plant, j) => (
                          <Badge key={j} variant="outline" className="text-[10px] px-1.5 py-0">
                            <Leaf className="w-2.5 h-2.5 mr-0.5" />
                            {plant}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-muted-foreground">
                        <span className="font-medium text-foreground">Symptoms:</span> {disease.symptoms}
                      </p>
                      <p className="text-muted-foreground">
                        <span className="font-medium text-foreground">Treatment:</span> {disease.treatment}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
