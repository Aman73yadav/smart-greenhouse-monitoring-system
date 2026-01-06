import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Mic, MicOff, X, ChevronUp, Radio, Volume2, VolumeX, Ear } from 'lucide-react';
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
    isContinuousMode,
    isWakeWordMode,
    isAwake,
    isSupported,
    transcript,
    ttsEnabled,
    ttsSupported,
    toggleListening,
    toggleContinuousMode,
    toggleWakeWordMode,
    toggleTts,
  } = useVoiceControl({ onToggleControl, onSetValue, onNavigate });

  if (!isSupported) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {/* Transcript bubble */}
      {transcript && (isListening || isAwake) && (
        <div className="bg-popover text-popover-foreground border rounded-lg px-3 py-2 shadow-lg max-w-xs animate-in fade-in slide-in-from-bottom-2">
          <p className="text-sm font-medium">"{transcript}"</p>
        </div>
      )}

      {/* Mode indicators */}
      <div className="flex flex-col items-end gap-1">
        {isWakeWordMode && (
          <div className={cn(
            "rounded-full px-3 py-1 text-xs font-medium flex items-center gap-1.5 shadow-lg animate-in fade-in slide-in-from-right-2",
            isAwake 
              ? "bg-primary text-primary-foreground" 
              : "bg-muted text-muted-foreground"
          )}>
            <Ear className={cn("h-3 w-3", isAwake && "animate-pulse")} />
            {isAwake ? "Listening..." : "Say 'Hey Greenhouse'"}
          </div>
        )}
        
        {isContinuousMode && !isWakeWordMode && (
          <div className="bg-primary text-primary-foreground rounded-full px-3 py-1 text-xs font-medium flex items-center gap-1.5 shadow-lg animate-in fade-in slide-in-from-right-2">
            <Radio className="h-3 w-3 animate-pulse" />
            Continuous Mode
          </div>
        )}
      </div>

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
          className="w-80 bg-popover border shadow-xl z-50"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm">Voice Control Settings</h4>
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setShowHelp(false)}>
                <X className="h-3 w-3" />
              </Button>
            </div>
            
            {/* Wake Word Mode Toggle */}
            <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="wake-word-mode" className="text-xs font-medium flex items-center gap-1.5">
                  <Ear className="h-3 w-3" />
                  Wake Word Mode
                </Label>
                <p className="text-xs text-muted-foreground">
                  Say "Hey Greenhouse" to activate
                </p>
              </div>
              <Switch
                id="wake-word-mode"
                checked={isWakeWordMode}
                onCheckedChange={toggleWakeWordMode}
              />
            </div>
            
            {/* Continuous Mode Toggle */}
            <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="continuous-mode" className="text-xs font-medium flex items-center gap-1.5">
                  <Radio className="h-3 w-3" />
                  Continuous Listening
                </Label>
                <p className="text-xs text-muted-foreground">
                  Stay active for multiple commands
                </p>
              </div>
              <Switch
                id="continuous-mode"
                checked={isContinuousMode}
                onCheckedChange={toggleContinuousMode}
                disabled={isWakeWordMode}
              />
            </div>

            {/* TTS Toggle */}
            {ttsSupported && (
              <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
                <div className="space-y-0.5">
                  <Label htmlFor="tts-mode" className="text-xs font-medium flex items-center gap-1.5">
                    {ttsEnabled ? <Volume2 className="h-3 w-3" /> : <VolumeX className="h-3 w-3" />}
                    Voice Feedback
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Announce status changes audibly
                  </p>
                </div>
                <Switch
                  id="tts-mode"
                  checked={ttsEnabled}
                  onCheckedChange={toggleTts}
                />
              </div>
            )}
            
            <ScrollArea className="h-32">
              <div className="space-y-2 pr-3">
                <p className="text-xs font-medium text-primary">Available Commands:</p>
                <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                  <span>"go to dashboard"</span>
                  <span>"turn on irrigation"</span>
                  <span>"lights on/off"</span>
                  <span>"start heating"</span>
                  <span>"set temperature to 25"</span>
                  <span>"show plants"</span>
                </div>
                {isWakeWordMode && (
                  <p className="text-xs text-primary mt-2">
                    Prefix with "Hey Greenhouse" or tap the button
                  </p>
                )}
                {isContinuousMode && (
                  <p className="text-xs text-destructive mt-2">
                    Say "stop listening" to disable
                  </p>
                )}
              </div>
            </ScrollArea>
          </div>
        </PopoverContent>
      </Popover>

      {/* Main mic button */}
      <Button
        size="lg"
        variant={isListening || isAwake ? (isContinuousMode || isWakeWordMode ? "default" : "destructive") : "default"}
        className={cn(
          "h-14 w-14 rounded-full shadow-xl transition-all duration-300",
          isListening && !isContinuousMode && !isWakeWordMode && "animate-pulse shadow-destructive/50 shadow-2xl scale-110",
          (isContinuousMode || isWakeWordMode) && "bg-primary shadow-primary/50 shadow-2xl",
          isAwake && "ring-4 ring-primary/50 scale-110"
        )}
        onClick={toggleListening}
      >
        {isListening || isAwake ? (
          <MicOff className="h-6 w-6" />
        ) : (
          <Mic className="h-6 w-6" />
        )}
      </Button>

      {/* Listening indicator */}
      {(isListening || isAwake) && (
        <div className="absolute -top-1 -right-1 h-4 w-4">
          <span className={cn(
            "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
            isContinuousMode || isWakeWordMode ? "bg-primary" : "bg-destructive"
          )} />
          <span className={cn(
            "relative inline-flex h-4 w-4 rounded-full",
            isContinuousMode || isWakeWordMode ? "bg-primary" : "bg-destructive"
          )} />
        </div>
      )}
    </div>
  );
};
