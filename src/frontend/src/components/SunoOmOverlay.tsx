import { MicOff, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useActor } from "../hooks/useActor";
import { getDeepSeekResponse } from "../utils/deepseekAPI";
import { getMockResponse } from "../utils/mockAI";
import { handleSpecialCommand } from "../utils/voiceCommands";

type State = "greeting" | "listening" | "processing" | "speaking" | "done";

const CLOSE_PHRASES = [
  "band karo",
  "close",
  "bye om",
  "band kar",
  "ruk jao",
  "stop",
  "exit",
  "theek hai",
  "shukriya",
];

const WAVE_DELAYS = [0, 0.07, 0.14, 0.21, 0.28, 0.35, 0.42, 0.49, 0.56, 0.63];
const STATIC_BARS = [3, 6, 4, 8, 5, 7, 4, 6, 3, 5];

interface SunoOmOverlayProps {
  onClose: () => void;
  messages?: Array<{ role: string; content: string; id?: string }>;
}

export function SunoOmOverlay({ onClose, messages }: SunoOmOverlayProps) {
  const { actor } = useActor();
  const [state, setState] = useState<State>("greeting");
  const [statusText, setStatusText] = useState("Haan Om, activated!");
  const recognitionRef = useRef<any>(null);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const isClosingRef = useRef(false);
  const stateRef = useRef<State>("greeting");

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

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

  const speakText = useCallback((text: string, afterDone?: () => void) => {
    if (!window.speechSynthesis) {
      afterDone?.();
      return;
    }
    window.speechSynthesis.cancel();

    const doSpeak = () => {
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = "hi-IN";
      const voices = voicesRef.current;
      const voice =
        voices.find((v) => v.lang === "hi-IN") ||
        voices.find((v) => v.lang.startsWith("hi"));
      if (voice) utter.voice = voice;
      utter.pitch = 1.0;
      utter.rate = 0.88;
      setState("speaking");
      utter.onend = () => {
        setState("listening");
        afterDone?.();
      };
      utter.onerror = () => {
        setState("listening");
        afterDone?.();
      };
      window.speechSynthesis.resume();
      window.speechSynthesis.speak(utter);
    };

    if (voicesRef.current.length === 0) {
      setTimeout(() => {
        const v = window.speechSynthesis.getVoices();
        if (v.length > 0) voicesRef.current = v;
        doSpeak();
      }, 200);
    } else {
      setTimeout(doSpeak, 200);
    }
  }, []);

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
    recognition.lang = "hi-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setState("listening");
      setStatusText("Sun raha hoon... bolo");
    };

    recognition.onresult = (e: any) => {
      const t = e.results[0][0].transcript;
      recognition.stop();
      processCommand(t);
    };

    recognition.onerror = () => {
      if (!isClosingRef.current) {
        setState("listening");
        setStatusText("Samajh nahi aaya, dobara bolein");
        setTimeout(startListening, 1200);
      }
    };

    recognition.onend = () => {
      if (stateRef.current === "listening" && !isClosingRef.current) {
        setTimeout(startListening, 600);
      }
    };

    recognition.start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const processCommand = useCallback(
    async (text: string) => {
      if (isClosingRef.current) return;
      const lower = text.toLowerCase().trim();

      if (CLOSE_PHRASES.some((p) => lower.includes(p))) {
        setStatusText("Theek hai, band kar raha hoon");
        setState("done");
        speakText("Theek hai, alvida!", () => {
          if (!isClosingRef.current) onClose();
        });
        return;
      }

      // Screenshot command
      if (
        lower.includes("screenshot lo") ||
        lower.includes("screen shot") ||
        lower === "screenshot" ||
        lower.includes("screenshot lena")
      ) {
        setState("processing");
        setStatusText("Screenshot le raha hoon...");
        window.print();
        const reply = "Browser ka print/screenshot dialog khul gaya!";
        setStatusText(reply);
        speakText(reply, () => {
          if (!isClosingRef.current) {
            setStatusText("Aur koi kaam?");
            startListening();
          }
        });
        return;
      }

      // Copy all text command
      if (
        lower.includes("copy all text") ||
        lower.includes("saara text copy") ||
        lower.includes("sab copy karo") ||
        lower.includes("copy karo") ||
        lower.includes("copy text")
      ) {
        setState("processing");
        setStatusText("Conversation copy kar raha hoon...");
        if (messages && messages.length > 0) {
          const formatted = messages
            .map((m) => `${m.role === "user" ? "User" : "AI"}: ${m.content}`)
            .join("\n\n");
          try {
            await navigator.clipboard.writeText(formatted);
            const reply = "Saara conversation copy ho gaya clipboard mein!";
            setStatusText(reply);
            speakText(reply, () => {
              if (!isClosingRef.current) {
                setStatusText("Aur koi kaam?");
                startListening();
              }
            });
          } catch {
            const reply = "Copy nahi ho saka, please manually try karein.";
            setStatusText(reply);
            speakText(reply, () => {
              if (!isClosingRef.current) startListening();
            });
          }
        } else {
          const reply = "Abhi koi conversation nahi hai copy karne ke liye.";
          setStatusText(reply);
          speakText(reply, () => {
            if (!isClosingRef.current) startListening();
          });
        }
        return;
      }

      setState("processing");
      setStatusText("Soch raha hoon...");

      const specialReply = handleSpecialCommand(text, "hi-IN");
      if (specialReply) {
        setStatusText(
          specialReply.slice(0, 60) + (specialReply.length > 60 ? "..." : ""),
        );
        speakText(specialReply, () => {
          if (!isClosingRef.current) {
            setStatusText("Aur koi kaam?");
            startListening();
          }
        });
        return;
      }

      try {
        const prompt = `You are Om.ai, answer concisely in Hindi. User says: ${text}`;
        const aiReply =
          (await getDeepSeekResponse(prompt, actor)) || getMockResponse(text);
        const reply = aiReply || "Maafi chahta hoon, samajh nahi aaya.";
        const shortReply =
          reply.slice(0, 120) + (reply.length > 120 ? "..." : "");
        setStatusText(shortReply);
        speakText(reply, () => {
          if (!isClosingRef.current) {
            setStatusText("Aur koi kaam?");
            startListening();
          }
        });
      } catch {
        const fallback = "Kuch error aa gayi, dobara try karein.";
        speakText(fallback, () => {
          if (!isClosingRef.current) startListening();
        });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [actor, speakText, onClose, startListening, messages],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional
  useEffect(() => {
    const greeting = "Haan Om, activated! Bolo kya karna hai.";
    setStatusText("Haan Om, activated!");
    const t = setTimeout(() => {
      if (!isClosingRef.current) {
        speakText(greeting, () => {
          if (!isClosingRef.current) startListening();
        });
      }
    }, 300);
    return () => {
      clearTimeout(t);
      isClosingRef.current = true;
      try {
        recognitionRef.current?.stop();
      } catch {}
      window.speechSynthesis?.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClose = () => {
    isClosingRef.current = true;
    try {
      recognitionRef.current?.stop();
    } catch {}
    window.speechSynthesis?.cancel();
    onClose();
  };

  const isListening = state === "listening";
  const isSpeaking = state === "speaking";
  const isProcessing = state === "processing";

  return (
    <div
      data-ocid="suno_om.panel"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 300,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        padding: "0 16px 16px",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          borderRadius: 24,
          background: "oklch(0.08 0.03 220 / 0.97)",
          border: "1.5px solid oklch(0.25 0.1 185 / 0.7)",
          boxShadow:
            "0 -4px 40px oklch(0.55 0.2 185 / 0.18), 0 8px 32px oklch(0 0 0 / 0.5)",
          backdropFilter: "blur(20px)",
          padding: "16px 18px",
          pointerEvents: "all",
          animation: "sunoSlideUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        {/* Header row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: isListening
                  ? "oklch(0.65 0.22 145)"
                  : isSpeaking
                    ? "oklch(0.65 0.22 185)"
                    : isProcessing
                      ? "oklch(0.65 0.22 60)"
                      : "oklch(0.5 0.1 220)",
                animation:
                  isListening || isSpeaking
                    ? "sunoLiveDot 1s ease-in-out infinite"
                    : "none",
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: "0.7rem",
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "oklch(0.65 0.22 185)",
              }}
            >
              Om &middot;{" "}
              {isListening
                ? "Sun Raha Hoon"
                : isSpeaking
                  ? "Bol Raha Hoon"
                  : isProcessing
                    ? "Soch Raha Hoon"
                    : "Active"}
            </span>
          </div>
          <button
            type="button"
            onClick={handleClose}
            data-ocid="suno_om.close_button"
            aria-label="Close Om assistant"
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "oklch(0.14 0.04 220)",
              border: "1px solid oklch(0.25 0.06 220)",
              color: "oklch(0.55 0.08 220)",
              cursor: "pointer",
            }}
          >
            <X size={13} />
          </button>
        </div>

        {/* Status text */}
        <p
          style={{
            fontSize: "0.92rem",
            fontWeight: 500,
            color: "oklch(0.88 0.08 185)",
            margin: "0 0 14px",
            lineHeight: 1.5,
            minHeight: "1.4em",
          }}
        >
          {statusText}
        </p>

        {/* Mic + waveform row */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: isListening
                ? "oklch(0.18 0.08 145 / 0.8)"
                : isSpeaking
                  ? "oklch(0.18 0.08 185 / 0.8)"
                  : "oklch(0.14 0.04 220)",
              border: isListening
                ? "2px solid oklch(0.55 0.22 145 / 0.7)"
                : isSpeaking
                  ? "2px solid oklch(0.55 0.18 185 / 0.7)"
                  : "2px solid oklch(0.22 0.06 220)",
              color: isListening
                ? "oklch(0.7 0.22 145)"
                : isSpeaking
                  ? "oklch(0.7 0.18 185)"
                  : "oklch(0.5 0.08 220)",
              animation: isListening
                ? "sunoMicPulse 1.2s ease-in-out infinite"
                : "none",
              flexShrink: 0,
            }}
          >
            {isListening ? (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
                role="img"
                aria-label="Microphone active"
              >
                <title>Microphone active</title>
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2H3v2a9 9 0 0 0 8 8.94V23h2v-2.06A9 9 0 0 0 21 12v-2h-2z" />
              </svg>
            ) : (
              <MicOff size={15} />
            )}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 3,
              height: 28,
              flex: 1,
            }}
          >
            {isListening || isSpeaking ? (
              WAVE_DELAYS.map((delay) => (
                <div
                  key={delay}
                  style={{
                    width: 3,
                    borderRadius: 2,
                    background: isListening
                      ? "oklch(0.55 0.22 145)"
                      : "oklch(0.55 0.18 185)",
                    animation: `sunoWave 0.7s ease-in-out ${delay}s infinite alternate`,
                    minHeight: 4,
                  }}
                />
              ))
            ) : (
              <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
                {STATIC_BARS.map((h, idx) => (
                  <div
                    key={`bar-${idx}-${h}`}
                    style={{
                      width: 3,
                      height: h,
                      borderRadius: 2,
                      background: "oklch(0.28 0.06 220)",
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          <span
            style={{
              fontSize: "0.65rem",
              color: "oklch(0.4 0.06 220)",
              whiteSpace: "nowrap",
            }}
          >
            &quot;band karo&quot; to close
          </span>
        </div>
      </div>

      <style>{`
        @keyframes sunoSlideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes sunoLiveDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.7); }
        }
        @keyframes sunoMicPulse {
          0%, 100% { box-shadow: 0 0 0 0 oklch(0.55 0.22 145 / 0.5); }
          50% { box-shadow: 0 0 0 8px oklch(0.55 0.22 145 / 0); }
        }
        @keyframes sunoWave {
          from { height: 4px; }
          to { height: 24px; }
        }
      `}</style>
    </div>
  );
}
