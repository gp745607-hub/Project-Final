import { useEffect, useRef, useCallback } from 'react';

interface UseScannerOptions {
  onScan: (codeBarre: string) => void;
  minLength?: number;
  maxDelay?: number;
  enabled?: boolean;
}

export function useScanner({
  onScan,
  minLength = 8,
  maxDelay = 40,
  enabled = true,
}: UseScannerOptions) {
  const bufferRef = useRef<string>('');
  const lastKeyTimeRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetBuffer = useCallback(() => {
    bufferRef.current = '';
    lastKeyTimeRef.current = 0;
  }, []);

  const processBuffer = useCallback(() => {
    const buffer = bufferRef.current.trim();
    
    if (buffer.length >= minLength) {
      onScan(buffer);
    }
    
    resetBuffer();
  }, [minLength, onScan, resetBuffer]);

  useEffect(() => {
    if (!enabled) {
      resetBuffer();
      return;
    }

    const handleKeyPress = (event: KeyboardEvent) => {
      const currentTime = Date.now();
      const timeDiff = currentTime - lastKeyTimeRef.current;

      if (event.target instanceof HTMLInputElement || 
          event.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (event.key === 'Enter') {
        if (bufferRef.current.length > 0) {
          processBuffer();
        }
        return;
      }

      if (event.key.length === 1) {
        if (lastKeyTimeRef.current > 0 && timeDiff > maxDelay) {
          resetBuffer();
        }

        bufferRef.current += event.key;
        lastKeyTimeRef.current = currentTime;

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          if (bufferRef.current.length >= minLength) {
            processBuffer();
          } else {
            resetBuffer();
          }
        }, maxDelay + 50);
      }
    };

    window.addEventListener('keypress', handleKeyPress);

    return () => {
      window.removeEventListener('keypress', handleKeyPress);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      resetBuffer();
    };
  }, [enabled, maxDelay, minLength, processBuffer, resetBuffer]);

  return {
    resetBuffer,
  };
}
