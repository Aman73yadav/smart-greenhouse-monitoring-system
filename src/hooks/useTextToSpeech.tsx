import { useCallback, useRef } from 'react';

export const useTextToSpeech = () => {
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const isEnabledRef = useRef(true);

  // Initialize speech synthesis
  if (typeof window !== 'undefined' && !synthRef.current) {
    synthRef.current = window.speechSynthesis;
  }

  const speak = useCallback((text: string, priority: boolean = false) => {
    if (!synthRef.current || !isEnabledRef.current) return;

    // Cancel current speech if priority
    if (priority) {
      synthRef.current.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 0.8;
    
    // Try to find a natural-sounding voice
    const voices = synthRef.current.getVoices();
    const preferredVoice = voices.find(
      voice => voice.lang.startsWith('en') && voice.name.includes('Natural')
    ) || voices.find(
      voice => voice.lang.startsWith('en-US')
    ) || voices[0];
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    synthRef.current.speak(utterance);
  }, []);

  const cancel = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
  }, []);

  const setEnabled = useCallback((enabled: boolean) => {
    isEnabledRef.current = enabled;
    if (!enabled && synthRef.current) {
      synthRef.current.cancel();
    }
  }, []);

  return {
    speak,
    cancel,
    setEnabled,
    isSupported: typeof window !== 'undefined' && 'speechSynthesis' in window,
  };
};
