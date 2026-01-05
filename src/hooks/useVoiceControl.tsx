import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';

// TypeScript declarations for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: SpeechRecognitionInstance, ev: Event) => void) | null;
  onend: ((this: SpeechRecognitionInstance, ev: Event) => void) | null;
  onresult: ((this: SpeechRecognitionInstance, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: SpeechRecognitionInstance, ev: SpeechRecognitionErrorEvent) => void) | null;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance;
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor;
    webkitSpeechRecognition: SpeechRecognitionConstructor;
  }
}

interface VoiceCommand {
  command: string;
  action: () => void;
  description: string;
}

interface UseVoiceControlProps {
  onToggleControl: (controlType: string, isActive: boolean) => void;
  onSetValue: (controlType: string, value: number) => void;
  onNavigate: (tab: string) => void;
}

export const useVoiceControl = ({ onToggleControl, onSetValue, onNavigate }: UseVoiceControlProps) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  // Check browser support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);
  }, []);

  const commands: VoiceCommand[] = [
    // Navigation commands
    { command: 'go to dashboard', action: () => onNavigate('dashboard'), description: 'Navigate to dashboard' },
    { command: 'show dashboard', action: () => onNavigate('dashboard'), description: 'Navigate to dashboard' },
    { command: 'go to plants', action: () => onNavigate('plants'), description: 'Navigate to plants' },
    { command: 'show plants', action: () => onNavigate('plants'), description: 'Navigate to plants' },
    { command: 'go to controls', action: () => onNavigate('controls'), description: 'Navigate to controls' },
    { command: 'show controls', action: () => onNavigate('controls'), description: 'Navigate to controls' },
    { command: 'go to sensors', action: () => onNavigate('sensors'), description: 'Navigate to sensors' },
    { command: 'show sensors', action: () => onNavigate('sensors'), description: 'Navigate to sensors' },
    { command: 'go to analytics', action: () => onNavigate('analytics'), description: 'Navigate to analytics' },
    { command: 'show analytics', action: () => onNavigate('analytics'), description: 'Navigate to analytics' },
    { command: 'go to 3d view', action: () => onNavigate('3d-view'), description: 'Navigate to 3D view' },
    { command: 'show greenhouse', action: () => onNavigate('3d-view'), description: 'Navigate to 3D view' },
    
    // Irrigation commands
    { command: 'turn on irrigation', action: () => onToggleControl('irrigation', true), description: 'Turn on irrigation' },
    { command: 'start irrigation', action: () => onToggleControl('irrigation', true), description: 'Start irrigation' },
    { command: 'turn off irrigation', action: () => onToggleControl('irrigation', false), description: 'Turn off irrigation' },
    { command: 'stop irrigation', action: () => onToggleControl('irrigation', false), description: 'Stop irrigation' },
    { command: 'water the plants', action: () => onToggleControl('irrigation', true), description: 'Start irrigation' },
    
    // Lighting commands
    { command: 'turn on lights', action: () => onToggleControl('lighting', true), description: 'Turn on lights' },
    { command: 'lights on', action: () => onToggleControl('lighting', true), description: 'Turn on lights' },
    { command: 'turn off lights', action: () => onToggleControl('lighting', false), description: 'Turn off lights' },
    { command: 'lights off', action: () => onToggleControl('lighting', false), description: 'Turn off lights' },
    
    // Ventilation commands
    { command: 'turn on ventilation', action: () => onToggleControl('ventilation', true), description: 'Turn on ventilation' },
    { command: 'start fan', action: () => onToggleControl('ventilation', true), description: 'Turn on ventilation' },
    { command: 'turn off ventilation', action: () => onToggleControl('ventilation', false), description: 'Turn off ventilation' },
    { command: 'stop fan', action: () => onToggleControl('ventilation', false), description: 'Stop ventilation' },
    
    // Heating commands
    { command: 'turn on heating', action: () => onToggleControl('heating', true), description: 'Turn on heating' },
    { command: 'start heating', action: () => onToggleControl('heating', true), description: 'Turn on heating' },
    { command: 'turn off heating', action: () => onToggleControl('heating', false), description: 'Turn off heating' },
    { command: 'stop heating', action: () => onToggleControl('heating', false), description: 'Stop heating' },
    
    // Cooling commands
    { command: 'turn on cooling', action: () => onToggleControl('cooling', true), description: 'Turn on cooling' },
    { command: 'start cooling', action: () => onToggleControl('cooling', true), description: 'Turn on cooling' },
    { command: 'turn off cooling', action: () => onToggleControl('cooling', false), description: 'Turn off cooling' },
    { command: 'stop cooling', action: () => onToggleControl('cooling', false), description: 'Stop cooling' },
    
    // Misting commands
    { command: 'turn on misting', action: () => onToggleControl('misting', true), description: 'Turn on misting' },
    { command: 'start misting', action: () => onToggleControl('misting', true), description: 'Turn on misting' },
    { command: 'turn off misting', action: () => onToggleControl('misting', false), description: 'Turn off misting' },
    { command: 'stop misting', action: () => onToggleControl('misting', false), description: 'Stop misting' },
    
    // Temperature commands
    { command: 'set temperature to', action: () => {}, description: 'Set temperature (followed by number)' },
  ];

  const processCommand = useCallback((spokenText: string) => {
    const text = spokenText.toLowerCase().trim();
    setTranscript(text);
    
    // Check for temperature value commands
    const tempMatch = text.match(/set temperature to (\d+)/);
    if (tempMatch) {
      const value = parseInt(tempMatch[1], 10);
      if (value >= 15 && value <= 35) {
        onSetValue('heating', value);
        toast.success(`Temperature set to ${value}°C`);
        return;
      }
    }
    
    // Check for humidity value commands
    const humidityMatch = text.match(/set humidity to (\d+)/);
    if (humidityMatch) {
      const value = parseInt(humidityMatch[1], 10);
      if (value >= 30 && value <= 90) {
        onSetValue('misting', value);
        toast.success(`Humidity target set to ${value}%`);
        return;
      }
    }
    
    // Check for moisture value commands
    const moistureMatch = text.match(/set moisture to (\d+)/);
    if (moistureMatch) {
      const value = parseInt(moistureMatch[1], 10);
      if (value >= 20 && value <= 90) {
        onSetValue('irrigation', value);
        toast.success(`Soil moisture target set to ${value}%`);
        return;
      }
    }

    // Check for matching commands
    for (const cmd of commands) {
      if (text.includes(cmd.command)) {
        cmd.action();
        toast.success(`Command executed: ${cmd.description}`);
        return;
      }
    }
    
    // No command matched
    toast.error(`Command not recognized: "${text}"`);
  }, [commands, onSetValue]);

  const startListening = useCallback(() => {
    if (!isSupported) {
      toast.error('Voice recognition is not supported in your browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onstart = () => {
      setIsListening(true);
      toast.info('Listening for voice commands...');
    };

    recognitionRef.current.onresult = (event) => {
      const result = event.results[0][0].transcript;
      processCommand(result);
    };

    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      if (event.error === 'no-speech') {
        toast.error('No speech detected. Please try again.');
      } else if (event.error === 'not-allowed') {
        toast.error('Microphone access denied. Please enable microphone permissions.');
      } else {
        toast.error(`Voice recognition error: ${event.error}`);
      }
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current.start();
  }, [isSupported, processCommand]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return {
    isListening,
    isSupported,
    transcript,
    startListening,
    stopListening,
    toggleListening,
    availableCommands: commands.map(c => ({ command: c.command, description: c.description })),
  };
};

