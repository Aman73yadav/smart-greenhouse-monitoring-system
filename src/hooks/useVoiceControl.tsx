import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { useTextToSpeech } from './useTextToSpeech';

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
  feedback: string;
}

interface UseVoiceControlProps {
  onToggleControl: (controlType: string, isActive: boolean) => void;
  onSetValue: (controlType: string, value: number) => void;
  onNavigate: (tab: string) => void;
}

const WAKE_WORD = 'hey greenhouse';
const WAKE_WORD_TIMEOUT = 5000; // 5 seconds to give command after wake word

export const useVoiceControl = ({ onToggleControl, onSetValue, onNavigate }: UseVoiceControlProps) => {
  const [isListening, setIsListening] = useState(false);
  const [isContinuousMode, setIsContinuousMode] = useState(false);
  const [isWakeWordMode, setIsWakeWordMode] = useState(false);
  const [isAwake, setIsAwake] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const wakeWordRecognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const shouldRestartRef = useRef(false);
  const awakeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const { speak, setEnabled: setTtsEnabledInternal, isSupported: ttsSupported } = useTextToSpeech();

  // Check browser support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);
  }, []);

  // Sync TTS enabled state
  useEffect(() => {
    setTtsEnabledInternal(ttsEnabled);
  }, [ttsEnabled, setTtsEnabledInternal]);

  const announceStatus = useCallback((message: string, showToast: boolean = true) => {
    if (ttsEnabled && ttsSupported) {
      speak(message);
    }
    if (showToast) {
      toast.success(message);
    }
  }, [speak, ttsEnabled, ttsSupported]);

  const announceError = useCallback((message: string) => {
    if (ttsEnabled && ttsSupported) {
      speak(message);
    }
    toast.error(message);
  }, [speak, ttsEnabled, ttsSupported]);

  const commands: VoiceCommand[] = [
    // Navigation commands
    { command: 'go to dashboard', action: () => onNavigate('dashboard'), description: 'Navigate to dashboard', feedback: 'Opening dashboard' },
    { command: 'show dashboard', action: () => onNavigate('dashboard'), description: 'Navigate to dashboard', feedback: 'Opening dashboard' },
    { command: 'go to plants', action: () => onNavigate('plants'), description: 'Navigate to plants', feedback: 'Opening plants view' },
    { command: 'show plants', action: () => onNavigate('plants'), description: 'Navigate to plants', feedback: 'Opening plants view' },
    { command: 'go to controls', action: () => onNavigate('controls'), description: 'Navigate to controls', feedback: 'Opening controls' },
    { command: 'show controls', action: () => onNavigate('controls'), description: 'Navigate to controls', feedback: 'Opening controls' },
    { command: 'go to sensors', action: () => onNavigate('sensors'), description: 'Navigate to sensors', feedback: 'Opening sensors' },
    { command: 'show sensors', action: () => onNavigate('sensors'), description: 'Navigate to sensors', feedback: 'Opening sensors' },
    { command: 'go to analytics', action: () => onNavigate('analytics'), description: 'Navigate to analytics', feedback: 'Opening analytics' },
    { command: 'show analytics', action: () => onNavigate('analytics'), description: 'Navigate to analytics', feedback: 'Opening analytics' },
    { command: 'go to 3d view', action: () => onNavigate('3d-view'), description: 'Navigate to 3D view', feedback: 'Opening 3D greenhouse view' },
    { command: 'show greenhouse', action: () => onNavigate('3d-view'), description: 'Navigate to 3D view', feedback: 'Opening 3D greenhouse view' },
    
    // Irrigation commands
    { command: 'turn on irrigation', action: () => onToggleControl('irrigation', true), description: 'Turn on irrigation', feedback: 'Irrigation system activated' },
    { command: 'start irrigation', action: () => onToggleControl('irrigation', true), description: 'Start irrigation', feedback: 'Irrigation system activated' },
    { command: 'turn off irrigation', action: () => onToggleControl('irrigation', false), description: 'Turn off irrigation', feedback: 'Irrigation system deactivated' },
    { command: 'stop irrigation', action: () => onToggleControl('irrigation', false), description: 'Stop irrigation', feedback: 'Irrigation system deactivated' },
    { command: 'water the plants', action: () => onToggleControl('irrigation', true), description: 'Start irrigation', feedback: 'Watering the plants now' },
    
    // Lighting commands
    { command: 'turn on lights', action: () => onToggleControl('lighting', true), description: 'Turn on lights', feedback: 'Lights are now on' },
    { command: 'lights on', action: () => onToggleControl('lighting', true), description: 'Turn on lights', feedback: 'Lights are now on' },
    { command: 'turn off lights', action: () => onToggleControl('lighting', false), description: 'Turn off lights', feedback: 'Lights are now off' },
    { command: 'lights off', action: () => onToggleControl('lighting', false), description: 'Turn off lights', feedback: 'Lights are now off' },
    
    // Ventilation commands
    { command: 'turn on ventilation', action: () => onToggleControl('ventilation', true), description: 'Turn on ventilation', feedback: 'Ventilation system activated' },
    { command: 'start fan', action: () => onToggleControl('ventilation', true), description: 'Turn on ventilation', feedback: 'Fans are now running' },
    { command: 'turn off ventilation', action: () => onToggleControl('ventilation', false), description: 'Turn off ventilation', feedback: 'Ventilation system deactivated' },
    { command: 'stop fan', action: () => onToggleControl('ventilation', false), description: 'Stop ventilation', feedback: 'Fans stopped' },
    
    // Heating commands
    { command: 'turn on heating', action: () => onToggleControl('heating', true), description: 'Turn on heating', feedback: 'Heating system activated' },
    { command: 'start heating', action: () => onToggleControl('heating', true), description: 'Turn on heating', feedback: 'Heating system activated' },
    { command: 'turn off heating', action: () => onToggleControl('heating', false), description: 'Turn off heating', feedback: 'Heating system deactivated' },
    { command: 'stop heating', action: () => onToggleControl('heating', false), description: 'Stop heating', feedback: 'Heating system deactivated' },
    
    // Cooling commands
    { command: 'turn on cooling', action: () => onToggleControl('cooling', true), description: 'Turn on cooling', feedback: 'Cooling system activated' },
    { command: 'start cooling', action: () => onToggleControl('cooling', true), description: 'Turn on cooling', feedback: 'Cooling system activated' },
    { command: 'turn off cooling', action: () => onToggleControl('cooling', false), description: 'Turn off cooling', feedback: 'Cooling system deactivated' },
    { command: 'stop cooling', action: () => onToggleControl('cooling', false), description: 'Stop cooling', feedback: 'Cooling system deactivated' },
    
    // Misting commands
    { command: 'turn on misting', action: () => onToggleControl('misting', true), description: 'Turn on misting', feedback: 'Misting system activated' },
    { command: 'start misting', action: () => onToggleControl('misting', true), description: 'Turn on misting', feedback: 'Misting system activated' },
    { command: 'turn off misting', action: () => onToggleControl('misting', false), description: 'Turn off misting', feedback: 'Misting system deactivated' },
    { command: 'stop misting', action: () => onToggleControl('misting', false), description: 'Stop misting', feedback: 'Misting system deactivated' },
    
    // Temperature commands
    { command: 'set temperature to', action: () => {}, description: 'Set temperature (followed by number)', feedback: '' },
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
        announceStatus(`Temperature set to ${value} degrees`);
        return true;
      }
    }
    
    // Check for humidity value commands
    const humidityMatch = text.match(/set humidity to (\d+)/);
    if (humidityMatch) {
      const value = parseInt(humidityMatch[1], 10);
      if (value >= 30 && value <= 90) {
        onSetValue('misting', value);
        announceStatus(`Humidity target set to ${value} percent`);
        return true;
      }
    }
    
    // Check for moisture value commands
    const moistureMatch = text.match(/set moisture to (\d+)/);
    if (moistureMatch) {
      const value = parseInt(moistureMatch[1], 10);
      if (value >= 20 && value <= 90) {
        onSetValue('irrigation', value);
        announceStatus(`Soil moisture target set to ${value} percent`);
        return true;
      }
    }

    // Check for matching commands
    for (const cmd of commands) {
      if (text.includes(cmd.command)) {
        cmd.action();
        announceStatus(cmd.feedback);
        return true;
      }
    }
    
    // No command matched
    announceError(`Command not recognized: "${text}"`);
    return false;
  }, [commands, onSetValue, announceStatus, announceError]);

  // Wake word detection - runs continuously in background
  const startWakeWordDetection = useCallback(() => {
    if (!isSupported) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    wakeWordRecognitionRef.current = new SpeechRecognition();
    wakeWordRecognitionRef.current.continuous = true;
    wakeWordRecognitionRef.current.interimResults = true;
    wakeWordRecognitionRef.current.lang = 'en-US';

    wakeWordRecognitionRef.current.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i][0].transcript.toLowerCase();
        
        if (result.includes(WAKE_WORD) || result.includes('hey green house')) {
          setIsAwake(true);
          announceStatus("I'm listening", false);
          toast.info("Wake word detected! Say your command...");
          
          // Clear any existing timeout
          if (awakeTimeoutRef.current) {
            clearTimeout(awakeTimeoutRef.current);
          }
          
          // Set timeout to go back to sleep
          awakeTimeoutRef.current = setTimeout(() => {
            setIsAwake(false);
            toast.info("Going back to sleep. Say 'Hey Greenhouse' to wake me.");
          }, WAKE_WORD_TIMEOUT);
          
          // Check if there's a command after the wake word
          const afterWakeWord = result.split(WAKE_WORD)[1]?.trim() || 
                               result.split('hey green house')[1]?.trim();
          
          if (afterWakeWord && afterWakeWord.length > 3) {
            const commandExecuted = processCommand(afterWakeWord);
            if (commandExecuted) {
              // Reset timeout after successful command
              if (awakeTimeoutRef.current) {
                clearTimeout(awakeTimeoutRef.current);
              }
              awakeTimeoutRef.current = setTimeout(() => {
                setIsAwake(false);
              }, WAKE_WORD_TIMEOUT);
            }
          }
        } else if (isAwake && event.results[i].isFinal) {
          // Process command if we're awake and got a final result
          const commandExecuted = processCommand(result);
          if (commandExecuted) {
            // Reset timeout after successful command
            if (awakeTimeoutRef.current) {
              clearTimeout(awakeTimeoutRef.current);
            }
            awakeTimeoutRef.current = setTimeout(() => {
              setIsAwake(false);
            }, WAKE_WORD_TIMEOUT);
          }
        }
      }
    };

    wakeWordRecognitionRef.current.onerror = (event) => {
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        console.error('Wake word detection error:', event.error);
      }
    };

    wakeWordRecognitionRef.current.onend = () => {
      // Restart wake word detection if still in wake word mode
      if (isWakeWordMode) {
        setTimeout(() => {
          try {
            wakeWordRecognitionRef.current?.start();
          } catch (e) {
            console.error('Failed to restart wake word detection:', e);
          }
        }, 100);
      }
    };

    try {
      wakeWordRecognitionRef.current.start();
      setIsWakeWordMode(true);
      announceStatus("Wake word detection active. Say 'Hey Greenhouse' to start.", true);
    } catch (e) {
      console.error('Failed to start wake word detection:', e);
    }
  }, [isSupported, isWakeWordMode, isAwake, processCommand, announceStatus]);

  const stopWakeWordDetection = useCallback(() => {
    setIsWakeWordMode(false);
    setIsAwake(false);
    if (awakeTimeoutRef.current) {
      clearTimeout(awakeTimeoutRef.current);
    }
    if (wakeWordRecognitionRef.current) {
      wakeWordRecognitionRef.current.abort();
    }
    toast.info("Wake word detection disabled");
  }, []);

  const toggleWakeWordMode = useCallback(() => {
    if (isWakeWordMode) {
      stopWakeWordDetection();
    } else {
      startWakeWordDetection();
    }
  }, [isWakeWordMode, startWakeWordDetection, stopWakeWordDetection]);

  const startListening = useCallback((continuous: boolean = false) => {
    if (!isSupported) {
      announceError('Voice recognition is not supported in your browser');
      return;
    }

    shouldRestartRef.current = continuous;
    setIsContinuousMode(continuous);

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    recognitionRef.current.continuous = continuous;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onstart = () => {
      setIsListening(true);
      if (continuous) {
        announceStatus("Continuous listening mode active. Say 'stop listening' to disable.", true);
      } else {
        toast.info('Listening for voice command...');
      }
    };

    recognitionRef.current.onresult = (event) => {
      const lastResultIndex = event.results.length - 1;
      const result = event.results[lastResultIndex][0].transcript;
      
      // Check for stop command in continuous mode
      if (shouldRestartRef.current && result.toLowerCase().includes('stop listening')) {
        announceStatus('Continuous listening disabled');
        shouldRestartRef.current = false;
        setIsContinuousMode(false);
        recognitionRef.current?.stop();
        return;
      }
      
      processCommand(result);
    };

    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      
      if (event.error === 'no-speech') {
        if (shouldRestartRef.current) {
          return;
        }
        announceError('No speech detected. Please try again.');
      } else if (event.error === 'not-allowed') {
        announceError('Microphone access denied. Please enable microphone permissions.');
        shouldRestartRef.current = false;
        setIsContinuousMode(false);
      } else if (event.error !== 'aborted') {
        announceError(`Voice recognition error: ${event.error}`);
      }
      
      if (!shouldRestartRef.current) {
        setIsListening(false);
      }
    };

    recognitionRef.current.onend = () => {
      if (shouldRestartRef.current && isSupported) {
        try {
          const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
          recognitionRef.current = new SpeechRecognition();
          recognitionRef.current.continuous = true;
          recognitionRef.current.interimResults = false;
          recognitionRef.current.lang = 'en-US';
          
          recognitionRef.current.onresult = (event) => {
            const lastResultIndex = event.results.length - 1;
            const result = event.results[lastResultIndex][0].transcript;
            
            if (shouldRestartRef.current && result.toLowerCase().includes('stop listening')) {
              announceStatus('Continuous listening disabled');
              shouldRestartRef.current = false;
              setIsContinuousMode(false);
              recognitionRef.current?.stop();
              return;
            }
            
            processCommand(result);
          };
          
          recognitionRef.current.onerror = (event) => {
            if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
              shouldRestartRef.current = false;
              setIsContinuousMode(false);
              setIsListening(false);
            }
          };
          
          recognitionRef.current.onend = () => {
            if (shouldRestartRef.current) {
              setTimeout(() => {
                if (shouldRestartRef.current) {
                  recognitionRef.current?.start();
                }
              }, 100);
            } else {
              setIsListening(false);
            }
          };
          
          recognitionRef.current.start();
        } catch (e) {
          console.error('Failed to restart recognition:', e);
          shouldRestartRef.current = false;
          setIsContinuousMode(false);
          setIsListening(false);
        }
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current.start();
  }, [isSupported, processCommand, announceStatus, announceError]);

  const stopListening = useCallback(() => {
    shouldRestartRef.current = false;
    setIsContinuousMode(false);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening(false);
    }
  }, [isListening, startListening, stopListening]);

  const toggleContinuousMode = useCallback(() => {
    if (isContinuousMode) {
      stopListening();
    } else {
      startListening(true);
    }
  }, [isContinuousMode, startListening, stopListening]);

  const toggleTts = useCallback(() => {
    setTtsEnabled(prev => !prev);
    const newState = !ttsEnabled;
    toast.info(newState ? 'Voice feedback enabled' : 'Voice feedback disabled');
  }, [ttsEnabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (awakeTimeoutRef.current) {
        clearTimeout(awakeTimeoutRef.current);
      }
      if (wakeWordRecognitionRef.current) {
        wakeWordRecognitionRef.current.abort();
      }
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  return {
    isListening,
    isContinuousMode,
    isWakeWordMode,
    isAwake,
    isSupported,
    transcript,
    ttsEnabled,
    ttsSupported,
    startListening,
    stopListening,
    toggleListening,
    toggleContinuousMode,
    toggleWakeWordMode,
    toggleTts,
    availableCommands: commands.map(c => ({ command: c.command, description: c.description })),
  };
};

