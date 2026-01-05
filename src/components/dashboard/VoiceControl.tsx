import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Mic, MicOff, Volume2, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { useVoiceControl } from '@/hooks/useVoiceControl';
import { cn } from '@/lib/utils';

interface VoiceControlProps {
  onToggleControl: (controlType: string, isActive: boolean) => void;
  onSetValue: (controlType: string, value: number) => void;
  onNavigate: (tab: string) => void;
}

export const VoiceControl: React.FC<VoiceControlProps> = ({
  onToggleControl,
  onSetValue,
  onNavigate,
}) => {
  const [showCommands, setShowCommands] = useState(false);
  
  const {
    isListening,
    isSupported,
    transcript,
    toggleListening,
    availableCommands,
  } = useVoiceControl({ onToggleControl, onSetValue, onNavigate });

  const commandCategories = [
    {
      name: 'Navigation',
      commands: availableCommands.filter(c => 
        c.command.includes('go to') || c.command.includes('show')
      ),
    },
    {
      name: 'Irrigation',
      commands: availableCommands.filter(c => 
        c.command.includes('irrigation') || c.command.includes('water')
      ),
    },
    {
      name: 'Lighting',
      commands: availableCommands.filter(c => 
        c.command.includes('light')
      ),
    },
    {
      name: 'Climate Control',
      commands: availableCommands.filter(c => 
        c.command.includes('heating') || 
        c.command.includes('cooling') || 
        c.command.includes('ventilation') ||
        c.command.includes('fan') ||
        c.command.includes('misting')
      ),
    },
  ];

  if (!isSupported) {
    return (
      <Card className="border-warning/50 bg-warning/10">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 text-warning">
            <AlertCircle className="w-5 h-5" />
            <div>
              <p className="font-medium">Voice Control Not Available</p>
              <p className="text-sm text-muted-foreground">
                Your browser doesn't support speech recognition. Try Chrome or Edge.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "transition-all duration-300",
      isListening && "ring-2 ring-primary ring-offset-2 ring-offset-background"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Volume2 className="w-5 h-5" />
            Voice Control
          </CardTitle>
          <Badge variant={isListening ? "default" : "secondary"}>
            {isListening ? "Listening" : "Ready"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Control Button */}
        <div className="flex flex-col items-center gap-4">
          <Button
            size="lg"
            variant={isListening ? "destructive" : "default"}
            className={cn(
              "w-20 h-20 rounded-full transition-all duration-300",
              isListening && "animate-pulse shadow-lg shadow-primary/50"
            )}
            onClick={toggleListening}
          >
            {isListening ? (
              <MicOff className="w-8 h-8" />
            ) : (
              <Mic className="w-8 h-8" />
            )}
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            {isListening 
              ? "Speak your command now..." 
              : "Tap to start voice control"}
          </p>
        </div>

        {/* Last Transcript */}
        {transcript && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Last command:</p>
            <p className="font-medium">"{transcript}"</p>
          </div>
        )}

        {/* Available Commands */}
        <Collapsible open={showCommands} onOpenChange={setShowCommands}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between">
              <span>Available Commands</span>
              {showCommands ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <ScrollArea className="h-64 mt-2">
              <div className="space-y-4 pr-4">
                {commandCategories.map((category) => (
                  <div key={category.name}>
                    <h4 className="text-sm font-semibold mb-2 text-primary">
                      {category.name}
                    </h4>
                    <div className="space-y-1">
                      {category.commands.map((cmd, idx) => (
                        <div
                          key={idx}
                          className="text-sm p-2 bg-muted/50 rounded-md"
                        >
                          <span className="font-mono text-xs">
                            "{cmd.command}"
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                
                {/* Value Commands */}
                <div>
                  <h4 className="text-sm font-semibold mb-2 text-primary">
                    Set Values
                  </h4>
                  <div className="space-y-1">
                    <div className="text-sm p-2 bg-muted/50 rounded-md">
                      <span className="font-mono text-xs">
                        "set temperature to [15-35]"
                      </span>
                    </div>
                    <div className="text-sm p-2 bg-muted/50 rounded-md">
                      <span className="font-mono text-xs">
                        "set humidity to [30-90]"
                      </span>
                    </div>
                    <div className="text-sm p-2 bg-muted/50 rounded-md">
                      <span className="font-mono text-xs">
                        "set moisture to [20-90]"
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};
