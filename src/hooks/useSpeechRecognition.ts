import { useState, useEffect, useRef, useCallback } from 'react';

// Browser Web Speech API type definitions
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: ((this: SpeechRecognitionInstance, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognitionInstance, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognitionInstance, ev: SpeechRecognitionErrorEvent) => any) | null;
  onend: ((this: SpeechRecognitionInstance, ev: Event) => any) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  }
}

interface UseSpeechRecognitionOptions {
  onTranscriptChange?: (text: string) => void;
  onError?: (errorMessage: string) => void;
  continuous?: boolean;
  lang?: string;
}

export function useSpeechRecognition({
  onTranscriptChange,
  onError,
  continuous = true,
  lang = 'en-US',
}: UseSpeechRecognitionOptions = {}) {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const isExplicitStopRef = useRef<boolean>(false);

  const isSupported = typeof window !== 'undefined' && Boolean(
    window.SpeechRecognition || window.webkitSpeechRecognition
  );

  const stopListening = useCallback(() => {
    isExplicitStopRef.current = true;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        // Safe ignore if already stopped
      }
    }
    setIsListening(false);
  }, []);

  const startListening = useCallback(() => {
    if (!isSupported) {
      const msg = 'Speech recognition is not supported in this browser environment.';
      setError(msg);
      onError?.(msg);
      return;
    }

    // Abort any existing instance
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
    }

    const SpeechRecognitionConstructor =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionConstructor) {
      return;
    }

    try {
      const recognition = new SpeechRecognitionConstructor();
      recognition.continuous = continuous;
      recognition.interimResults = false;
      recognition.lang = lang;

      isExplicitStopRef.current = false;
      setError(null);

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalChunk = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const result = event.results[i];
          if (result.isFinal) {
            finalChunk += result[0].transcript;
          }
        }

        if (finalChunk.trim()) {
          onTranscriptChange?.(finalChunk);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        // Handle common benign events
        if (event.error === 'no-speech') {
          // User paused speaking; do not abort unless continuous is false
          return;
        }
        if (event.error === 'aborted') {
          return;
        }

        const friendlyError =
          event.error === 'not-allowed'
            ? 'Microphone permission was denied. Please allow microphone access.'
            : `Speech recognition error: ${event.error}`;

        setError(friendlyError);
        onError?.(friendlyError);
        setIsListening(false);
      };

      recognition.onend = () => {
        // If stopped automatically while still expected to listen (e.g. timeout on quiet), restart if continuous
        if (continuous && !isExplicitStopRef.current) {
          try {
            recognition.start();
            return;
          } catch (e) {
            // Restart failed, gracefully exit
          }
        }
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      const msg = err.message || 'Failed to initialize microphone.';
      setError(msg);
      onError?.(msg);
      setIsListening(false);
    }
  }, [isSupported, continuous, lang, onTranscriptChange, onError]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      isExplicitStopRef.current = true;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
    };
  }, []);

  return {
    isListening,
    isSupported,
    error,
    startListening,
    stopListening,
  };
}
