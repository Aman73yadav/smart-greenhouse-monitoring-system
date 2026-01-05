import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Mic, MicOff, X, ChevronUp } from 'lucide-react';
import { useVoiceControl } from '@/hooks/useVoiceControl';
import { cn } from '@/lib/utils';

interface FloatingVoiceButtonProps {
  onToggleControl: (controlType: string, isActive: boolean) => void;
  onSetValue: (controlType: string, value: number) => void;
  onNavigate: (tab: string) => void;
}

export const FloatingVoiceButton: React.FC<FloatingVoiceButtonProps> = ({
  onToggleControl,
  onSetValue,
  onNavigate,
}) => {
  const [showHelp, setShowHelp] = useState(false);
  
  const {
    isListening,
    isSupported,
    transcript,
    toggleListening,
    availableCommands,
  } = useVoiceControl({ onToggleControl, onSetValue, onNavigate });

  if (!isSupported) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {/* Transcript bubble */}
      {transcript && isListening && (
        <div className="bg-popover text-popover-foreground border rounded-lg px-3 py-2 shadow-lg max-w-xs animate-in fade-in slide-in-from-bottom-2">
          <p className="text-sm font-medium">"{transcript}"</p>
        </div>
      )}

      {/* Help popover */}
      <Popover open={showHelp} onOpenChange={setShowHelp}>
        <PopoverTrigger asChild>
          <Button
            size="icon"
            variant="outline"
            className={cn(
              "h-10 w-10 rounded-full shadow-lg bg-background",
              showHelp && "ring-2 ring-primary"
            )}
          >
            <ChevronUp className={cn("h-4 w-4 transition-transform", showHelp && "rotate-180")} />
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          side="top" 
          align="end" 
          className="w-72 bg-popover border shadow-xl z-50"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm">Voice Commands</h4>
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setShowHelp(false)}>
                <X className="h-3 w-3" />
              </Button>
            </div>
            <ScrollArea className="h-48">
              <div className="space-y-3 pr-3">
                <div>
                  <p className="text-xs font-medium text-primary mb-1">Navigation</p>
                  <p className="text-xs text-muted-foreground">"go to dashboard", "show plants"</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-primary mb-1">Controls</p>
                  <p className="text-xs text-muted-foreground">"turn on irrigation", "stop fan"</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-primary mb-1">Lighting</p>
                  <p className="text-xs text-muted-foreground">"lights on", "turn off lights"</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-primary mb-1">Climate</p>
                  <p className="text-xs text-muted-foreground">"start heating", "turn on cooling"</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-primary mb-1">Values</p>
                  <p className="text-xs text-muted-foreground">"set temperature to 25"</p>
                </div>
              </div>
            </ScrollArea>
          </div>
        </PopoverContent>
      </Popover>

      {/* Main mic button */}
      <Button
        size="lg"
        variant={isListening ? "destructive" : "default"}
        className={cn(
          "h-14 w-14 rounded-full shadow-xl transition-all duration-300",
          isListening && "animate-pulse shadow-primary/50 shadow-2xl scale-110"
        )}
        onClick={toggleListening}
      >
        {isListening ? (
          <MicOff className="h-6 w-6" />
        ) : (
          <Mic className="h-6 w-6" />
        )}
      </Button>

      {/* Listening indicator */}
      {isListening && (
        <div className="absolute -top-1 -right-1 h-4 w-4">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75" />
          <span className="relative inline-flex h-4 w-4 rounded-full bg-destructive" />
        </div>
      )}
    </div>
  );
};
