import { X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useActor } from "../hooks/useActor";
import { getDeepSeekResponse } from "../utils/deepseekAPI";
import { getMockResponse } from "../utils/mockAI";
import { handleSpecialCommand } from "../utils/voiceCommands";

type OverlayVoiceState = "idle" | "listening" | "processing" | "speaking";

interface FloatingVoiceOverlayProps {
  onClose: () => void;
}

const STATUS: Record<OverlayVoiceState, string> = {
  idle: "Bol rahe ho...",
  listening: "Sun raha hoon... 👂",
  processing: "Soch raha hoon... 🤔",
  speaking: "Bol raha hoon... 🗣️",
};

const CLOSE_PHRASES = [
  "band karo",
  "close",
  "bye om",
  "theek hai band karo",
  "band kar",
  "ruk jao",
  "stop",
  "exit",
];

export function FloatingVoiceOverlay({ onClose }: FloatingVoiceOverlayProps) {
  const { actor } = useActor();
  const [voiceState, setVoiceState] = useState<OverlayVoiceState>("idle");
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [lang, _setLang] = useState<"en-US" | "hi-IN">("hi-IN");
  const recognitionRef = useRef<any>(null);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const voiceStateRef = useRef<OverlayVoiceState>("idle");
  const isClosingRef = useRef(false);

  // Sync state to ref for closures
  useEffect(() => {
    voiceStateRef.current = voiceState;
  }, [voiceState]);

  // Load TTS voices — load immediately, on event, and with a 500ms retry
  useEffect(() => {
    if (!window.speechSynthesis) return;
    const load = () => {
      const v = window.speechSynthesis.getVoices();
      if (v.length > 0) voicesRef.current = v;
    };
    load();
    window.speechSynthesis.onvoiceschanged = load;
    // Retry in case voices weren't ready yet (Android Chrome)
    const t = setTimeout(load, 500);
    return () => {
      clearTimeout(t);
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const speakText = useCallback(
    (text: string, afterDone?: () => void) => {
      if (!window.speechSynthesis) {
        afterDone?.();
        return;
      }
      window.speechSynthesis.cancel();

      const doSpeak = () => {
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = lang;
        const voices = voicesRef.current;
        const isHindi = lang === "hi-IN";
        const exact = voices.find((v) => v.lang === lang);
        const partial = voices.find((v) =>
          v.lang.toLowerCase().startsWith(isHindi ? "hi" : "en"),
        );
        if (exact || partial) utter.voice = exact || partial || null;
        // Proceed even without a specific voice — browser default is fine
        utter.pitch = isHindi ? 1.0 : 1.3;
        utter.rate = isHindi ? 0.82 : 1.0;
        setVoiceState("speaking");
        utter.onend = () => {
          setVoiceState("idle");
          afterDone?.();
        };
        utter.onerror = () => {
          setVoiceState("idle");
          afterDone?.();
        };
        // resume() fixes stuck speechSynthesis on Android Chrome
        window.speechSynthesis.resume();
        window.speechSynthesis.speak(utter);
      };

      // If voices not loaded yet, wait and retry
      if (voicesRef.current.length === 0) {
        setTimeout(() => {
          const v = window.speechSynthesis.getVoices();
          if (v.length > 0) voicesRef.current = v;
          doSpeak();
        }, 200);
      } else {
        // Give voices 200ms to settle on Android
        setTimeout(doSpeak, 200);
      }
    },
    [lang],
  );

  const processText = useCallback(
    async (text: string) => {
      if (isClosingRef.current) return;

      // Check close phrases
      const lower = text.toLowerCase().trim();
      if (CLOSE_PHRASES.some((p) => lower.includes(p))) {
        speakText("Theek hai, band kar raha hoon. Alvida!", () => onClose());
        return;
      }

      setVoiceState("processing");
      const specialReply = handleSpecialCommand(text, lang);
      if (specialReply) {
        setResponse(specialReply);
        speakText(specialReply, () => startListening());
        return;
      }

      try {
        const prompt = `You are Om.ai, a helpful AI assistant. Answer helpfully and concisely in ${
          lang === "hi-IN" ? "Hindi" : "English"
        }. User says: ${text}`;
        const aiReply =
          (await getDeepSeekResponse(prompt, actor)) || getMockResponse(text);
        const reply =
          aiReply ||
          (lang === "hi-IN"
            ? "Maafi chahta hoon, kuch problem aayi."
            : "Sorry, I encountered an issue.");
        setResponse(reply);
        speakText(reply, () => startListening());
      } catch {
        const fallback =
          lang === "hi-IN"
            ? "Kuch error aa gayi, dobara try karein."
            : "An error occurred.";
        setResponse(fallback);
        speakText(fallback, () => startListening());
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [actor, lang, speakText, onClose],
  );

  const startListening = useCallback(() => {
    if (isClosingRef.current) return;
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SR) return;

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }

    const recognition = new SR();
    recognition.lang = lang;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    recognition.onstart = () => setVoiceState("listening");
    recognition.onresult = (e: any) => {
      const t = e.results[0][0].transcript;
      setTranscript(t);
      recognition.stop();
      processText(t);
    };
    recognition.onerror = () => setVoiceState("idle");
    recognition.onend = () => {
      if (voiceStateRef.current === "listening") setVoiceState("idle");
    };
    recognition.start();
  }, [lang, processText]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally runs once on mount
  useEffect(() => {
    const greeting =
      lang === "hi-IN"
        ? "Haan, main sun raha hoon. Kya chahiye?"
        : "Yes, I'm listening. How can I help?";
    // Delay greeting to give browser voices time to initialize (Android Chrome fix)
    const t = setTimeout(() => {
      if (!isClosingRef.current) {
        speakText(greeting, () => startListening());
      }
    }, 300);

    return () => {
      clearTimeout(t);
      isClosingRef.current = true;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClose = () => {
    isClosingRef.current = true;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    onClose();
  };

  const isListening = voiceState === "listening";
  const isSpeaking = voiceState === "speaking";
  const isProcessing = voiceState === "processing";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "oklch(0.04 0.02 220 / 0.92)",
        backdropFilter: "blur(16px)",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      {/* Ambient glow orbs */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 500,
            height: 500,
            borderRadius: "50%",
            top: -150,
            left: -150,
            background: "oklch(0.5 0.18 185)",
            opacity: 0.07,
            filter: "blur(80px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 400,
            height: 400,
            borderRadius: "50%",
            bottom: -100,
            right: -100,
            background: "oklch(0.45 0.15 240)",
            opacity: 0.07,
            filter: "blur(80px)",
          }}
        />
      </div>

      {/* Close button */}
      <button
        type="button"
        onClick={handleClose}
        data-ocid="voice_overlay.close_button"
        aria-label="Close voice overlay"
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          width: 40,
          height: 40,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "oklch(0.14 0.04 220 / 0.8)",
          border: "1.5px solid oklch(0.3 0.08 220 / 0.5)",
          color: "oklch(0.7 0.1 220)",
          cursor: "pointer",
          backdropFilter: "blur(8px)",
          transition: "all 0.2s",
          zIndex: 10,
        }}
      >
        <X size={18} />
      </button>

      {/* Activated badge */}
      <div
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 14px",
          borderRadius: 50,
          background: "oklch(0.18 0.08 145 / 0.8)",
          border: "1px solid oklch(0.55 0.2 145 / 0.5)",
          color: "oklch(0.75 0.2 145)",
          fontSize: "0.7rem",
          fontWeight: 700,
          letterSpacing: "0.04em",
          backdropFilter: "blur(8px)",
        }}
      >
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "oklch(0.65 0.22 145)",
            animation: "fvoLivePulse 1.2s ease-in-out infinite",
          }}
        />
        SUNO OM · ACTIVE
      </div>

      {/* Character + rings */}
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 24,
        }}
      >
        {/* Pulse rings when listening */}
        {isListening &&
          [180, 220, 260].map((size, i) => (
            <div
              key={size}
              style={{
                position: "absolute",
                width: size,
                height: size,
                borderRadius: "50%",
                border: `2px solid oklch(0.55 0.2 185 / ${0.6 - i * 0.15})`,
                animation: `fvoPulseRing 2s ease-out ${i * 0.5}s infinite`,
                pointerEvents: "none",
              }}
            />
          ))}
        {/* Speak glow */}
        {isSpeaking && (
          <div
            style={{
              position: "absolute",
              width: 200,
              height: 200,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, oklch(0.65 0.22 185 / 0.2) 0%, transparent 70%)",
              animation: "fvoGlowPulse 0.8s ease-in-out infinite",
              pointerEvents: "none",
            }}
          />
        )}

        {/* Character image */}
        <img
          src="/assets/generated/doraemon-char-transparent.dim_400x400.png"
          alt="Om.ai Voice Assistant"
          style={{
            width: 180,
            height: 180,
            objectFit: "contain",
            filter: "drop-shadow(0 0 30px oklch(0.55 0.2 185 / 0.4))",
            animation: isListening
              ? "fvoListenBounce 0.8s ease-in-out infinite"
              : isSpeaking
                ? "fvoSpeakWobble 0.4s ease-in-out infinite"
                : isProcessing
                  ? "fvoProcessGlow 1.2s ease-in-out infinite"
                  : "fvoFloat 3s ease-in-out infinite",
            position: "relative",
            zIndex: 2,
          }}
          draggable={false}
        />

        {/* Waveform bars when speaking */}
        {isSpeaking && (
          <div
            style={{
              position: "absolute",
              bottom: -28,
              display: "flex",
              alignItems: "center",
              gap: 4,
              height: 24,
            }}
          >
            {[0, 0.08, 0.16, 0.24, 0.32, 0.4, 0.48].map((delay) => (
              <div
                key={delay}
                style={{
                  width: 5,
                  background: "oklch(0.65 0.22 185)",
                  borderRadius: 3,
                  animation: `fvoWaveBar 0.6s ease-in-out ${delay}s infinite alternate`,
                  minHeight: 5,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Status text */}
      <p
        style={{
          fontSize: "1rem",
          fontWeight: 500,
          color: "oklch(0.78 0.12 185)",
          textAlign: "center",
          marginBottom: 24,
          letterSpacing: "0.01em",
          minHeight: "1.5em",
        }}
      >
        {STATUS[voiceState]}
      </p>

      {/* Transcript bubbles */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          width: "100%",
          maxWidth: 420,
          padding: "0 24px",
          maxHeight: 180,
          overflowY: "auto",
        }}
      >
        {transcript && (
          <div
            style={{
              alignSelf: "flex-end",
              background: "oklch(0.65 0.22 185 / 0.12)",
              border: "1px solid oklch(0.55 0.18 185 / 0.35)",
              borderRadius: "16px 16px 4px 16px",
              padding: "10px 14px",
              maxWidth: "85%",
            }}
          >
            <span
              style={{
                display: "block",
                fontSize: "0.6rem",
                fontWeight: 700,
                color: "oklch(0.55 0.18 185)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: 4,
              }}
            >
              Aap
            </span>
            <p
              style={{
                fontSize: "0.88rem",
                color: "oklch(0.88 0.05 185)",
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              {transcript}
            </p>
          </div>
        )}
        {response && (
          <div
            style={{
              alignSelf: "flex-start",
              background: "oklch(0.12 0.04 220 / 0.7)",
              border: "1px solid oklch(0.25 0.08 185 / 0.4)",
              borderRadius: "16px 16px 16px 4px",
              padding: "10px 14px",
              maxWidth: "85%",
            }}
          >
            <span
              style={{
                display: "block",
                fontSize: "0.6rem",
                fontWeight: 700,
                color: "oklch(0.45 0.15 185)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: 4,
              }}
            >
              Om.ai
            </span>
            <p
              style={{
                fontSize: "0.88rem",
                color: "oklch(0.88 0.05 185)",
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              {response}
            </p>
          </div>
        )}
      </div>

      {/* Hint text */}
      <p
        style={{
          position: "absolute",
          bottom: 24,
          fontSize: "0.72rem",
          color: "oklch(0.45 0.08 220)",
          textAlign: "center",
          padding: "0 24px",
        }}
      >
        "Band karo" bolein ya ✕ press karein band karne ke liye
      </p>

      <style>{`
        @keyframes fvoFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        @keyframes fvoListenBounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes fvoSpeakWobble {
          0%, 100% { transform: rotate(-1deg) scale(1); }
          50% { transform: rotate(1deg) scale(1.02); }
        }
        @keyframes fvoProcessGlow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        @keyframes fvoPulseRing {
          0% { transform: scale(0.9); opacity: 1; }
          100% { transform: scale(1.35); opacity: 0; }
        }
        @keyframes fvoGlowPulse {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.12); }
        }
        @keyframes fvoWaveBar {
          from { height: 5px; }
          to { height: 22px; }
        }
        @keyframes fvoLivePulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
