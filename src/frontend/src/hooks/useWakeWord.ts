import { useCallback, useEffect, useRef, useState } from "react";

interface UseWakeWordReturn {
  isListening: boolean;
  isTriggered: boolean;
  setIsTriggered: (v: boolean) => void;
  supported: boolean;
}

export function useWakeWord(enabled: boolean): UseWakeWordReturn {
  const SR =
    typeof window !== "undefined"
      ? (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition
      : null;
  const supported = !!SR;

  const [isListening, setIsListening] = useState(false);
  const [isTriggered, setIsTriggeredState] = useState(false);
  const recognitionRef = useRef<any>(null);
  const enabledRef = useRef(enabled);
  const triggeredRef = useRef(false);
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  const stopRecognition = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const startRecognition = useCallback(() => {
    if (!SR || !enabledRef.current || triggeredRef.current) return;

    // Clear any pending restart timer
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }

    try {
      const recognition = new SR();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "hi-IN";
      recognitionRef.current = recognition;

      recognition.onstart = () => setIsListening(true);

      recognition.onresult = (e: any) => {
        if (triggeredRef.current) return;
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const transcript = e.results[i][0].transcript.toLowerCase().trim();
          if (transcript.includes("suno om") || transcript.includes("sunnom")) {
            triggeredRef.current = true;
            setIsTriggeredState(true);
            try {
              recognition.stop();
            } catch {}
            return;
          }
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
        // Restart after brief delay on error
        if (!triggeredRef.current && enabledRef.current) {
          restartTimerRef.current = setTimeout(startRecognition, 2000);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        // Auto-restart unless triggered or disabled
        if (!triggeredRef.current && enabledRef.current) {
          restartTimerRef.current = setTimeout(startRecognition, 500);
        }
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  }, [SR]);

  const setIsTriggered = useCallback(
    (v: boolean) => {
      triggeredRef.current = v;
      setIsTriggeredState(v);
      if (!v) {
        // Overlay closed — restart wake word listening
        restartTimerRef.current = setTimeout(startRecognition, 800);
      }
    },
    [startRecognition],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: stable refs used via closures
  useEffect(() => {
    if (!supported) return;
    if (enabled && !triggeredRef.current) {
      startRecognition();
    } else if (!enabled) {
      stopRecognition();
    }
    return () => {
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
      stopRecognition();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, supported]);

  return { isListening, isTriggered, setIsTriggered, supported };
}
