import { useState, useEffect, useRef, useCallback } from 'react';

interface AudioVisualizerData {
  levels: number[];
  averageLevel: number;
}

export const useAudioVisualizer = (isActive: boolean, barCount: number = 5) => {
  const [visualizerData, setVisualizerData] = useState<AudioVisualizerData>({
    levels: Array(barCount).fill(0),
    averageLevel: 0,
  });
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  const startVisualizer = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      dataArrayRef.current = dataArray;

      const updateLevels = () => {
        if (!analyserRef.current || !dataArrayRef.current) return;

        analyserRef.current.getByteFrequencyData(dataArrayRef.current as any);

        // Divide frequency data into bar groups
        const segmentSize = Math.floor(dataArrayRef.current.length / barCount);
        const levels: number[] = [];
        let total = 0;

        for (let i = 0; i < barCount; i++) {
          const start = i * segmentSize;
          const end = start + segmentSize;
          let sum = 0;
          for (let j = start; j < end; j++) {
            sum += dataArrayRef.current[j];
          }
          const avg = sum / segmentSize;
          const normalized = avg / 255; // Normalize to 0-1
          levels.push(normalized);
          total += normalized;
        }

        setVisualizerData({
          levels,
          averageLevel: total / barCount,
        });

        animationFrameRef.current = requestAnimationFrame(updateLevels);
      };

      updateLevels();
    } catch (error) {
      console.error('Failed to start audio visualizer:', error);
    }
  }, [barCount]);

  const stopVisualizer = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    analyserRef.current = null;
    dataArrayRef.current = null;

    setVisualizerData({
      levels: Array(barCount).fill(0),
      averageLevel: 0,
    });
  }, [barCount]);

  useEffect(() => {
    if (isActive) {
      startVisualizer();
    } else {
      stopVisualizer();
    }

    return () => {
      stopVisualizer();
    };
  }, [isActive, startVisualizer, stopVisualizer]);

  return visualizerData;
};
