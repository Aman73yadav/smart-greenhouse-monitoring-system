import React from 'react';
import { cn } from '@/lib/utils';

interface AudioWaveformProps {
  levels: number[];
  isActive: boolean;
  className?: string;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({
  levels,
  isActive,
  className,
}) => {
  return (
    <div 
      className={cn(
        "flex items-center justify-center gap-0.5 h-8",
        className
      )}
    >
      {levels.map((level, index) => (
        <div
          key={index}
          className={cn(
            "w-1 rounded-full transition-all duration-75",
            isActive ? "bg-primary" : "bg-muted-foreground/30"
          )}
          style={{
            height: isActive 
              ? `${Math.max(4, level * 28)}px` 
              : '4px',
            transform: isActive ? 'scaleY(1)' : 'scaleY(0.5)',
            transition: 'height 75ms ease-out, transform 75ms ease-out',
          }}
        />
      ))}
    </div>
  );
};
