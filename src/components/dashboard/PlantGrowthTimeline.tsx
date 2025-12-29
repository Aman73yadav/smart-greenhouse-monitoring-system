import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Calendar, Sprout, Flower, Apple, ChevronLeft, ChevronRight, Droplets, Sun, Thermometer } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GrowthStage {
  week: number;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  height: string;
  tasks: string[];
  image: string;
}

interface PlantGrowthData {
  name: string;
  emoji: string;
  totalWeeks: number;
  stages: GrowthStage[];
}

const plantData: PlantGrowthData[] = [
  {
    name: 'Tomato',
    emoji: '🍅',
    totalWeeks: 12,
    stages: [
      { week: 1, name: 'Germination', description: 'Seeds absorb water and sprout', icon: Sprout, color: 'bg-lime-500', height: '0.5cm', tasks: ['Keep soil moist', 'Maintain 21-27°C', 'No direct sunlight'], image: '/placeholder.svg' },
      { week: 2, name: 'Seedling', description: 'First true leaves appear', icon: Sprout, color: 'bg-green-500', height: '3cm', tasks: ['Light watering', 'Partial sunlight', 'Thin seedlings'], image: '/placeholder.svg' },
      { week: 3, name: 'Early Growth', description: 'Root system developing', icon: Sprout, color: 'bg-green-600', height: '8cm', tasks: ['Regular watering', 'Full sunlight', 'Start fertilizing'], image: '/placeholder.svg' },
      { week: 4, name: 'Vegetative', description: 'Rapid leaf growth begins', icon: Sprout, color: 'bg-emerald-500', height: '15cm', tasks: ['Stake plants', 'Prune suckers', 'Deep watering'], image: '/placeholder.svg' },
      { week: 5, name: 'Strong Growth', description: 'Main stem thickens', icon: Sprout, color: 'bg-emerald-600', height: '25cm', tasks: ['Add support cages', 'Monitor for pests', 'Continue fertilizing'], image: '/placeholder.svg' },
      { week: 6, name: 'Pre-Flowering', description: 'Flower buds forming', icon: Flower, color: 'bg-yellow-500', height: '40cm', tasks: ['Reduce nitrogen', 'Increase phosphorus', 'Consistent watering'], image: '/placeholder.svg' },
      { week: 7, name: 'Flowering', description: 'Yellow flowers bloom', icon: Flower, color: 'bg-yellow-400', height: '55cm', tasks: ['Gentle shaking for pollination', 'Monitor temperature', 'Avoid overwatering'], image: '/placeholder.svg' },
      { week: 8, name: 'Fruit Set', description: 'Small green tomatoes appear', icon: Apple, color: 'bg-lime-400', height: '70cm', tasks: ['Support heavy branches', 'Regular feeding', 'Mulch soil'], image: '/placeholder.svg' },
      { week: 9, name: 'Fruit Development', description: 'Tomatoes growing larger', icon: Apple, color: 'bg-green-400', height: '85cm', tasks: ['Consistent watering', 'Remove lower leaves', 'Watch for blossom rot'], image: '/placeholder.svg' },
      { week: 10, name: 'Breaker Stage', description: 'Color begins to change', icon: Apple, color: 'bg-orange-400', height: '95cm', tasks: ['Reduce watering slightly', 'Stop fertilizing', 'Check for ripeness'], image: '/placeholder.svg' },
      { week: 11, name: 'Ripening', description: 'Tomatoes turning red', icon: Apple, color: 'bg-red-400', height: '100cm', tasks: ['Harvest pink ones to ripen indoors', 'Protect from sun scald', 'Regular picking'], image: '/placeholder.svg' },
      { week: 12, name: 'Harvest', description: 'Full red, ready to pick', icon: Apple, color: 'bg-red-500', height: '100cm+', tasks: ['Harvest when fully red', 'Store at room temperature', 'Save seeds for next season'], image: '/placeholder.svg' },
    ],
  },
  {
    name: 'Lettuce',
    emoji: '🥬',
    totalWeeks: 8,
    stages: [
      { week: 1, name: 'Germination', description: 'Tiny seeds sprout', icon: Sprout, color: 'bg-lime-400', height: '0.3cm', tasks: ['Keep soil moist', 'Cool temps 15-18°C', 'Light coverage'], image: '/placeholder.svg' },
      { week: 2, name: 'Cotyledon', description: 'First leaves emerge', icon: Sprout, color: 'bg-lime-500', height: '2cm', tasks: ['Light watering', 'Partial shade OK', 'Thin to 10cm apart'], image: '/placeholder.svg' },
      { week: 3, name: 'True Leaves', description: 'Real lettuce leaves appear', icon: Sprout, color: 'bg-green-400', height: '5cm', tasks: ['Regular watering', 'Light fertilizer', 'Mulch around plants'], image: '/placeholder.svg' },
      { week: 4, name: 'Rosette Formation', description: 'Leaves form rosette pattern', icon: Sprout, color: 'bg-green-500', height: '10cm', tasks: ['Consistent moisture', 'Shade in hot weather', 'Watch for slugs'], image: '/placeholder.svg' },
      { week: 5, name: 'Head Development', description: 'Center leaves tightening', icon: Sprout, color: 'bg-emerald-400', height: '15cm', tasks: ['Morning watering', 'Row covers if needed', 'Harvest outer leaves'], image: '/placeholder.svg' },
      { week: 6, name: 'Mature Growth', description: 'Full size leaves', icon: Sprout, color: 'bg-emerald-500', height: '20cm', tasks: ['Continue harvesting outer leaves', 'Maintain cool temps', 'Regular watering'], image: '/placeholder.svg' },
      { week: 7, name: 'Peak Harvest', description: 'Optimal harvesting time', icon: Apple, color: 'bg-green-600', height: '25cm', tasks: ['Harvest in morning', 'Cut 2cm above soil', 'Successive plantings'], image: '/placeholder.svg' },
      { week: 8, name: 'Final Harvest', description: 'Harvest before bolting', icon: Apple, color: 'bg-green-700', height: '30cm', tasks: ['Full harvest before bolting', 'Save seeds if bolted', 'Clear bed for next crop'], image: '/placeholder.svg' },
    ],
  },
  {
    name: 'Pepper',
    emoji: '🌶️',
    totalWeeks: 14,
    stages: [
      { week: 1, name: 'Germination', description: 'Slow germination begins', icon: Sprout, color: 'bg-lime-500', height: '0.5cm', tasks: ['Warm soil 27-32°C', 'Keep constantly moist', 'Bottom heat helps'], image: '/placeholder.svg' },
      { week: 2, name: 'Emergence', description: 'Seedlings break surface', icon: Sprout, color: 'bg-green-500', height: '2cm', tasks: ['Reduce heat slightly', 'Bright light 16hrs/day', 'Gentle watering'], image: '/placeholder.svg' },
      { week: 3, name: 'First Leaves', description: 'True leaves developing', icon: Sprout, color: 'bg-green-600', height: '5cm', tasks: ['Transplant to larger pots', 'Start fertilizing weekly', 'Harden off process'], image: '/placeholder.svg' },
      { week: 4, name: 'Vegetative I', description: 'Bushy growth starts', icon: Sprout, color: 'bg-emerald-500', height: '10cm', tasks: ['Pinch growing tip', 'Regular feeding', 'Full sun exposure'], image: '/placeholder.svg' },
      { week: 5, name: 'Vegetative II', description: 'Multiple branches form', icon: Sprout, color: 'bg-emerald-600', height: '18cm', tasks: ['Support if needed', 'Deep watering', 'Monitor for aphids'], image: '/placeholder.svg' },
      { week: 6, name: 'Pre-Bloom', description: 'Flower buds visible', icon: Flower, color: 'bg-yellow-400', height: '25cm', tasks: ['Increase potassium', 'Consistent watering', 'Protect from wind'], image: '/placeholder.svg' },
      { week: 7, name: 'First Flowers', description: 'White flowers open', icon: Flower, color: 'bg-white', height: '35cm', tasks: ['Hand pollinate if indoors', 'Avoid high nitrogen', 'Morning watering'], image: '/placeholder.svg' },
      { week: 8, name: 'Pollination', description: 'Flowers being pollinated', icon: Flower, color: 'bg-yellow-300', height: '45cm', tasks: ['Gentle plant shaking', 'Optimal temp 21-29°C', 'Remove first flowers optional'], image: '/placeholder.svg' },
      { week: 9, name: 'Fruit Set', description: 'Tiny peppers forming', icon: Apple, color: 'bg-lime-400', height: '55cm', tasks: ['Increase watering', 'Calcium supplements', 'Support branches'], image: '/placeholder.svg' },
      { week: 10, name: 'Fruit Growth', description: 'Peppers sizing up', icon: Apple, color: 'bg-green-400', height: '65cm', tasks: ['Regular feeding', 'Prune lower leaves', 'Stake heavy plants'], image: '/placeholder.svg' },
      { week: 11, name: 'Maturation', description: 'Peppers reaching full size', icon: Apple, color: 'bg-green-500', height: '70cm', tasks: ['Reduce watering slightly', 'Check firmness', 'Continue harvesting mature ones'], image: '/placeholder.svg' },
      { week: 12, name: 'Color Change', description: 'Green turning to final color', icon: Apple, color: 'bg-orange-400', height: '75cm', tasks: ['Leave on plant to color', 'Stop fertilizing', 'Monitor for ripeness'], image: '/placeholder.svg' },
      { week: 13, name: 'Ripening', description: 'Full color development', icon: Apple, color: 'bg-red-400', height: '80cm', tasks: ['Harvest colored peppers', 'More will ripen', 'Store properly'], image: '/placeholder.svg' },
      { week: 14, name: 'Peak Harvest', description: 'Maximum production', icon: Apple, color: 'bg-red-500', height: '80cm+', tasks: ['Regular harvesting promotes more', 'Save seeds from best', 'End of season cleanup'], image: '/placeholder.svg' },
    ],
  },
  {
    name: 'Strawberry',
    emoji: '🍓',
    totalWeeks: 10,
    stages: [
      { week: 1, name: 'Planting', description: 'Crown planted at soil level', icon: Sprout, color: 'bg-lime-500', height: '3cm', tasks: ['Plant crown at soil level', 'Water thoroughly', 'Mulch around plants'], image: '/placeholder.svg' },
      { week: 2, name: 'Root Development', description: 'Roots establishing', icon: Sprout, color: 'bg-green-500', height: '5cm', tasks: ['Keep soil moist', 'Remove flowers year 1', 'Light feeding'], image: '/placeholder.svg' },
      { week: 3, name: 'Leaf Growth', description: 'New leaves unfurling', icon: Sprout, color: 'bg-green-600', height: '8cm', tasks: ['Weed control', 'Consistent watering', 'Watch for runners'], image: '/placeholder.svg' },
      { week: 4, name: 'Runner Production', description: 'Runners extending', icon: Sprout, color: 'bg-emerald-500', height: '10cm', tasks: ['Pin runners or remove', 'Fertilize monthly', 'Mulch for moisture'], image: '/placeholder.svg' },
      { week: 5, name: 'Bud Formation', description: 'Flower buds appearing', icon: Flower, color: 'bg-pink-300', height: '12cm', tasks: ['Increase potassium', 'Protect from frost', 'Continue watering'], image: '/placeholder.svg' },
      { week: 6, name: 'Flowering', description: 'White flowers blooming', icon: Flower, color: 'bg-white', height: '15cm', tasks: ['Encourage pollinators', 'Morning watering only', 'Remove damaged flowers'], image: '/placeholder.svg' },
      { week: 7, name: 'Fruit Set', description: 'Green berries forming', icon: Apple, color: 'bg-lime-400', height: '15cm', tasks: ['Straw mulch under berries', 'Netting for birds', 'Regular watering'], image: '/placeholder.svg' },
      { week: 8, name: 'Fruit Development', description: 'Berries enlarging', icon: Apple, color: 'bg-green-400', height: '15cm', tasks: ['Keep berries off soil', 'Check daily for ripeness', 'Remove diseased fruit'], image: '/placeholder.svg' },
      { week: 9, name: 'Ripening', description: 'Berries turning pink/red', icon: Apple, color: 'bg-red-400', height: '15cm', tasks: ['Harvest when 3/4 red', 'Pick in morning', 'Handle gently'], image: '/placeholder.svg' },
      { week: 10, name: 'Peak Harvest', description: 'Full red, sweet berries', icon: Apple, color: 'bg-red-500', height: '15cm', tasks: ['Harvest daily', 'Eat fresh or preserve', 'Plan renovation'], image: '/placeholder.svg' },
    ],
  },
  {
    name: 'Carrot',
    emoji: '🥕',
    totalWeeks: 11,
    stages: [
      { week: 1, name: 'Germination', description: 'Slow germination 14-21 days', icon: Sprout, color: 'bg-lime-400', height: '0.5cm', tasks: ['Keep soil moist', 'Don\'t let crust form', 'Patience required'], image: '/placeholder.svg' },
      { week: 2, name: 'Emergence', description: 'Tiny grass-like shoots', icon: Sprout, color: 'bg-lime-500', height: '2cm', tasks: ['Continue moist soil', 'Thin to 2-3cm apart', 'Weed carefully'], image: '/placeholder.svg' },
      { week: 3, name: 'First True Leaves', description: 'Feathery leaves appear', icon: Sprout, color: 'bg-green-500', height: '5cm', tasks: ['Thin to 5cm apart', 'Light fertilizer', 'Consistent watering'], image: '/placeholder.svg' },
      { week: 4, name: 'Foliage Growth', description: 'Top growth accelerates', icon: Sprout, color: 'bg-green-600', height: '10cm', tasks: ['Deep watering', 'Mulch to retain moisture', 'Final thinning 7cm'], image: '/placeholder.svg' },
      { week: 5, name: 'Root Development Begins', description: 'Taproot starting to swell', icon: Sprout, color: 'bg-emerald-500', height: '15cm tops', tasks: ['Even watering critical', 'Don\'t disturb roots', 'Side dress with compost'], image: '/placeholder.svg' },
      { week: 6, name: 'Root Thickening', description: 'Carrot starting to form', icon: Sprout, color: 'bg-emerald-600', height: '20cm tops', tasks: ['Maintain moisture', 'Hill soil over crowns', 'Watch for carrot fly'], image: '/placeholder.svg' },
      { week: 7, name: 'Color Development', description: 'Orange color deepening', icon: Apple, color: 'bg-orange-400', height: '25cm tops', tasks: ['Cover exposed shoulders', 'Continue watering', 'Check progress gently'], image: '/placeholder.svg' },
      { week: 8, name: 'Sizing Up', description: 'Roots reaching harvest size', icon: Apple, color: 'bg-orange-500', height: '30cm tops', tasks: ['Begin test harvesting', 'Water day before harvest', 'Loosen soil first'], image: '/placeholder.svg' },
      { week: 9, name: 'Maturing', description: 'Full size development', icon: Apple, color: 'bg-orange-600', height: '35cm tops', tasks: ['Harvest largest first', 'Leave smaller to grow', 'Store in cool place'], image: '/placeholder.svg' },
      { week: 10, name: 'Harvest Ready', description: 'Optimal harvest time', icon: Apple, color: 'bg-orange-600', height: '35cm tops', tasks: ['Harvest before frost', 'Twist off tops', 'Store in sand'], image: '/placeholder.svg' },
      { week: 11, name: 'Extended Harvest', description: 'Can leave in ground', icon: Apple, color: 'bg-orange-700', height: '35cm+ tops', tasks: ['Mulch heavily', 'Harvest as needed', 'Sweetens after frost'], image: '/placeholder.svg' },
    ],
  },
  {
    name: 'Cucumber',
    emoji: '🥒',
    totalWeeks: 9,
    stages: [
      { week: 1, name: 'Germination', description: 'Quick germination 3-10 days', icon: Sprout, color: 'bg-lime-500', height: '1cm', tasks: ['Warm soil 21-35°C', 'Direct sow or transplant', 'Keep moist'], image: '/placeholder.svg' },
      { week: 2, name: 'Seedling', description: 'First true leaves emerge', icon: Sprout, color: 'bg-green-500', height: '5cm', tasks: ['Full sun', 'Begin training vines', 'Light feeding'], image: '/placeholder.svg' },
      { week: 3, name: 'Vine Growth', description: 'Rapid vine extension', icon: Sprout, color: 'bg-green-600', height: '20cm', tasks: ['Trellis support', 'Regular watering', 'Watch for beetles'], image: '/placeholder.svg' },
      { week: 4, name: 'Aggressive Growth', description: 'Vines growing rapidly', icon: Sprout, color: 'bg-emerald-500', height: '50cm', tasks: ['Train up trellis', 'Prune lateral shoots', 'Heavy watering'], image: '/placeholder.svg' },
      { week: 5, name: 'Pre-Flowering', description: 'Flower buds forming', icon: Flower, color: 'bg-yellow-400', height: '80cm', tasks: ['Increase feeding', 'Remove first flowers optional', 'Consistent moisture'], image: '/placeholder.svg' },
      { week: 6, name: 'Flowering', description: 'Male & female flowers', icon: Flower, color: 'bg-yellow-300', height: '120cm', tasks: ['Encourage pollinators', 'Hand pollinate if needed', 'Morning watering'], image: '/placeholder.svg' },
      { week: 7, name: 'Fruit Set', description: 'Baby cucumbers visible', icon: Apple, color: 'bg-lime-400', height: '150cm', tasks: ['Heavy watering now critical', 'Support developing fruit', 'Regular feeding'], image: '/placeholder.svg' },
      { week: 8, name: 'Rapid Growth', description: 'Cucumbers sizing quickly', icon: Apple, color: 'bg-green-500', height: '180cm', tasks: ['Harvest at 15-20cm', 'Pick daily', 'Don\'t let over-ripen'], image: '/placeholder.svg' },
      { week: 9, name: 'Peak Production', description: 'Maximum harvest period', icon: Apple, color: 'bg-green-600', height: '200cm+', tasks: ['Harvest every 1-2 days', 'Remove yellowing cucumbers', 'Continue watering'], image: '/placeholder.svg' },
    ],
  },
];

const GrowthVisualization: React.FC<{ stage: GrowthStage; plantName: string; weekNum: number; totalWeeks: number }> = ({ stage, plantName, weekNum, totalWeeks }) => {
  const progress = (weekNum / totalWeeks) * 100;
  const Icon = stage.icon;
  
  return (
    <div className="relative">
      {/* Growth visualization */}
      <div className="relative h-64 bg-gradient-to-b from-sky-200 to-sky-100 dark:from-sky-900 dark:to-sky-800 rounded-xl overflow-hidden mb-4">
        {/* Sun */}
        <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-yellow-400 shadow-lg shadow-yellow-400/50 animate-pulse" />
        
        {/* Ground */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-amber-800 to-amber-700 dark:from-amber-900 dark:to-amber-800" />
        
        {/* Soil layer */}
        <div className="absolute bottom-16 left-0 right-0 h-4 bg-amber-600 dark:bg-amber-700" />
        
        {/* Plant visualization based on growth */}
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
          {/* Plant height bar */}
          <div 
            className={cn("w-3 rounded-t-full transition-all duration-500", stage.color)}
            style={{ height: `${Math.min(150, progress * 1.5)}px` }}
          />
          {/* Leaves/Fruit indicator */}
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
            <Icon className={cn("w-8 h-8", stage.color.replace('bg-', 'text-'))} />
          </div>
          {progress > 60 && (
            <div className="absolute top-1/4 -left-6">
              <div className="w-6 h-3 rounded-full bg-green-500 transform -rotate-45" />
            </div>
          )}
          {progress > 60 && (
            <div className="absolute top-1/4 -right-6">
              <div className="w-6 h-3 rounded-full bg-green-500 transform rotate-45" />
            </div>
          )}
        </div>
        
        {/* Growth info overlay */}
        <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm rounded-lg p-3">
          <p className="text-sm font-semibold">{stage.name}</p>
          <p className="text-xs text-muted-foreground">Height: {stage.height}</p>
        </div>
      </div>
    </div>
  );
};

export const PlantGrowthTimeline: React.FC = () => {
  const [selectedPlant, setSelectedPlant] = useState(0);
  const [currentWeek, setCurrentWeek] = useState(1);
  
  const plant = plantData[selectedPlant];
  const stage = plant.stages[Math.min(currentWeek - 1, plant.stages.length - 1)];
  
  const handlePrevWeek = () => setCurrentWeek(prev => Math.max(1, prev - 1));
  const handleNextWeek = () => setCurrentWeek(prev => Math.min(plant.totalWeeks, prev + 1));
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sprout className="w-5 h-5 text-primary" />
            Plant Growth Timeline
          </CardTitle>
          <Badge variant="outline" className="gap-1">
            <Calendar className="w-3 h-3" />
            Week {currentWeek} of {plant.totalWeeks}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Plant selector */}
        <Tabs value={String(selectedPlant)} onValueChange={(v) => { setSelectedPlant(Number(v)); setCurrentWeek(1); }}>
          <TabsList className="grid grid-cols-6 w-full">
            {plantData.map((p, i) => (
              <TabsTrigger key={p.name} value={String(i)} className="text-xs">
                <span className="mr-1">{p.emoji}</span>
                <span className="hidden sm:inline">{p.name}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        
        {/* Week navigation */}
        <div className="flex items-center justify-between gap-4">
          <Button variant="outline" size="icon" onClick={handlePrevWeek} disabled={currentWeek === 1}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <Slider
              value={[currentWeek]}
              onValueChange={([v]) => setCurrentWeek(v)}
              min={1}
              max={plant.totalWeeks}
              step={1}
              className="w-full"
            />
          </div>
          <Button variant="outline" size="icon" onClick={handleNextWeek} disabled={currentWeek === plant.totalWeeks}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Growth visualization */}
        <GrowthVisualization stage={stage} plantName={plant.name} weekNum={currentWeek} totalWeeks={plant.totalWeeks} />
        
        {/* Stage info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className={cn("w-3 h-3 rounded-full", stage.color)} />
              <h4 className="font-semibold">{stage.name}</h4>
            </div>
            <p className="text-sm text-muted-foreground">{stage.description}</p>
            
            {/* Care requirements */}
            <div className="flex gap-3 pt-2">
              <div className="flex items-center gap-1 text-xs text-blue-500">
                <Droplets className="w-3 h-3" />
                <span>Regular</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-amber-500">
                <Sun className="w-3 h-3" />
                <span>Full Sun</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-red-500">
                <Thermometer className="w-3 h-3" />
                <span>18-27°C</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h5 className="text-sm font-medium">This Week's Tasks</h5>
            <ul className="space-y-1">
              {stage.tasks.map((task, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  {task}
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Weekly progress timeline */}
        <div className="pt-4 border-t">
          <h5 className="text-sm font-medium mb-3">Growth Progress</h5>
          <div className="flex gap-1 overflow-x-auto pb-2">
            {plant.stages.map((s, i) => (
              <button
                key={i}
                onClick={() => setCurrentWeek(s.week)}
                className={cn(
                  "flex-shrink-0 w-8 h-8 rounded-full text-xs font-medium transition-all",
                  currentWeek === s.week 
                    ? "ring-2 ring-primary ring-offset-2" 
                    : "",
                  s.week <= currentWeek ? s.color + " text-white" : "bg-muted text-muted-foreground"
                )}
              >
                {s.week}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
