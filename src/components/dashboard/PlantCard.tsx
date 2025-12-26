import React from 'react';
import { Plant } from '@/types/greenhouse';
import { Droplets, Sun, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlantCardProps {
  plant: Plant;
  onClick?: () => void;
}

const healthColors = {
  excellent: 'text-success',
  good: 'text-primary',
  fair: 'text-warning',
  poor: 'text-destructive',
};

const stageColors = {
  seedling: 'bg-accent/20 text-accent',
  vegetative: 'bg-primary/20 text-primary',
  flowering: 'bg-warning/20 text-warning',
  fruiting: 'bg-secondary/20 text-secondary',
  harvest: 'bg-destructive/20 text-destructive',
};

export const PlantCard: React.FC<PlantCardProps> = ({ plant, onClick }) => {
  return (
    <div className="plant-card" onClick={onClick}>
      <div className="relative overflow-hidden">
        <img
          src={plant.image}
          alt={plant.name}
          className="plant-card-image"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
        <div className="absolute top-3 right-3">
          <span className={cn("zone-badge", stageColors[plant.growthStage])}>
            {plant.growthStage}
          </span>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-lg">{plant.name}</h3>
          <p className="text-sm text-muted-foreground">{plant.zone}</p>
        </div>

        {/* Growth Progress */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Growth Progress</span>
            <span className="font-medium">{plant.growthProgress}%</span>
          </div>
          <div className="threshold-bar">
            <div
              className="threshold-fill bg-primary"
              style={{ width: `${plant.growthProgress}%` }}
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-1">
            <Droplets className="w-4 h-4 text-humidity" />
            <span className="text-xs capitalize">{plant.waterNeeds}</span>
          </div>
          <div className="flex items-center gap-1">
            <Sun className="w-4 h-4 text-light" />
            <span className="text-xs capitalize">{plant.lightNeeds}</span>
          </div>
          <div className="flex items-center gap-1">
            <Heart className={cn("w-4 h-4", healthColors[plant.health])} />
            <span className="text-xs capitalize">{plant.health}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
