import { ArrowLeft, Globe, Mic, MicOff } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useActor } from "../hooks/useActor";
import { getDeepSeekResponse } from "../utils/deepseekAPI";
import { getMockResponse } from "../utils/mockAI";

type VoiceState = "idle" | "listening" | "processing" | "speaking";

interface VoiceModePageProps {
  onBack: () => void;
}

const STATUS_TEXT: Record<VoiceState, { en: string; hi: string }> = {
  idle: { en: "Tap mic to talk", hi: "Mic tap karein baat karne ke liye" },
  listening: { en: "Listening...", hi: "Sun raha hoon..." },
  processing: { en: "Thinking...", hi: "Soch raha hoon..." },
  speaking: { en: "Speaking...", hi: "Bol raha hoon..." },
};

function handleSpecialCommand(
  text: string,
  lang: "en-US" | "hi-IN",
): string | null {
  const lower = text.toLowerCase();
  const isHindi = lang === "hi-IN";
  if (lower.includes("youtube") || lower.includes("you tube")) {
    window.open("https://www.youtube.com", "_blank");
    return isHindi
      ? "YouTube naya tab mein khul gaya!"
      : "YouTube opened in a new tab!";
  }
  if (lower.includes("screenshot") || lower.includes("screen shot")) {
    return isHindi
      ? "Sorry, screenshot lena web app se possible nahi hai."
      : "Sorry, I cannot take screenshots from a web app.";
  }
  if (
    lower.includes("phone off") ||
    lower.includes("band karo") ||
    lower.includes("switch off") ||
    lower.includes("phone band")
  ) {
    return isHindi
      ? "Sorry, phone band karna web app se possible nahi hai."
      : "Sorry, I cannot turn off your phone from a web app.";
  }
  return null;
}

export function VoiceModePage({ onBack }: VoiceModePageProps) {
  const { actor } = useActor();
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [lang, setLang] = useState<"en-US" | "hi-IN">("en-US");
  const [userTranscript, setUserTranscript] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speakText = useCallback(
    (text: string) => {
      if (!window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = lang;
      utter.rate = 0.95;
      utter.pitch = 1.1;
      synthRef.current = utter;
      setVoiceState("speaking");
      utter.onend = () => setVoiceState("idle");
      utter.onerror = () => setVoiceState("idle");
      window.speechSynthesis.speak(utter);
    },
    [lang],
  );

  const processText = useCallback(
    async (text: string) => {
      setVoiceState("processing");
      // Check special commands first
      const specialReply = handleSpecialCommand(text, lang);
      if (specialReply) {
        setAiResponse(specialReply);
        speakText(specialReply);
        return;
      }
      // Get AI response
      try {
        const aiReply =
          (await getDeepSeekResponse(text, actor)) ||
          (await getMockResponse(text));
        const reply =
          aiReply ||
          (lang === "hi-IN"
            ? "Maafi chahta hoon, kuch problem aayi."
            : "Sorry, I encountered an issue.");
        setAiResponse(reply);
        speakText(reply);
      } catch {
        const fallback =
          lang === "hi-IN"
            ? "Kuch error aa gayi, dobara try karein."
            : "An error occurred, please try again.";
        setAiResponse(fallback);
        speakText(fallback);
      }
    },
    [actor, lang, speakText],
  );

  const startListening = useCallback(() => {
    if (
      !("webkitSpeechRecognition" in window) &&
      !("SpeechRecognition" in window)
    ) {
      alert("Speech recognition not supported in this browser.");
      return;
    }
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    const recognition = new SR();
    recognition.lang = lang;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    recognition.onstart = () => setVoiceState("listening");
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setUserTranscript(transcript);
      recognition.stop();
      processText(transcript);
    };
    recognition.onerror = () => {
      setVoiceState("idle");
    };
    recognition.onend = () => {
      if (voiceState === "listening") setVoiceState("idle");
    };

    recognition.start();
  }, [lang, processText, voiceState]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setVoiceState("idle");
  }, []);

  const handleMicClick = useCallback(() => {
    if (voiceState === "idle") {
      startListening();
    } else {
      stopListening();
    }
  }, [voiceState, startListening, stopListening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, []);

  const statusText =
    lang === "hi-IN" ? STATUS_TEXT[voiceState].hi : STATUS_TEXT[voiceState].en;
  const isListening = voiceState === "listening";
  const isSpeaking = voiceState === "speaking";
  const isProcessing = voiceState === "processing";

  return (
    <div className="voice-mode-page">
      {/* Background ambient circles */}
      <div className="ambient-bg">
        <div className="ambient-circle ambient-circle-1" />
        <div className="ambient-circle ambient-circle-2" />
        <div className="ambient-circle ambient-circle-3" />
      </div>

      {/* Header */}
      <header className="voice-header">
        <button
          type="button"
          onClick={onBack}
          className="voice-back-btn"
          data-ocid="voice.button"
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="voice-title">Om.ai</h1>
        <button
          type="button"
          onClick={() => setLang((l) => (l === "en-US" ? "hi-IN" : "en-US"))}
          className="voice-lang-btn"
          data-ocid="voice.toggle"
          aria-label="Toggle language"
        >
          <Globe size={14} />
          <span>{lang === "en-US" ? "EN" : "HI"}</span>
        </button>
      </header>

      {/* Main character area */}
      <main className="voice-main">
        {/* Character container with state-based animations */}
        <div
          className={`character-container ${
            isListening
              ? "listening"
              : isSpeaking
                ? "speaking"
                : isProcessing
                  ? "processing"
                  : "idle"
          }`}
        >
          {/* Pulse rings for listening state */}
          {isListening && (
            <>
              <div className="pulse-ring pulse-ring-1" />
              <div className="pulse-ring pulse-ring-2" />
              <div className="pulse-ring pulse-ring-3" />
            </>
          )}

          {/* Glow backdrop for speaking */}
          {isSpeaking && <div className="speak-glow" />}

          {/* The character */}
          <img
            src="/assets/generated/doraemon-character-transparent.dim_400x400.png"
            alt="Om.ai Voice Assistant"
            className="character-img"
            draggable={false}
          />

          {/* Speaking waveform bars */}
          {isSpeaking && (
            <div className="waveform-bars">
              <div className="waveform-bar" style={{ animationDelay: "0s" }} />
              <div
                className="waveform-bar"
                style={{ animationDelay: "0.08s" }}
              />
              <div
                className="waveform-bar"
                style={{ animationDelay: "0.16s" }}
              />
              <div
                className="waveform-bar"
                style={{ animationDelay: "0.24s" }}
              />
              <div
                className="waveform-bar"
                style={{ animationDelay: "0.32s" }}
              />
              <div
                className="waveform-bar"
                style={{ animationDelay: "0.40s" }}
              />
              <div
                className="waveform-bar"
                style={{ animationDelay: "0.48s" }}
              />
            </div>
          )}
        </div>

        {/* Status text */}
        <p className="voice-status" data-ocid="voice.section">
          {statusText}
        </p>

        {/* Transcript bubbles */}
        <div className="transcript-area">
          {userTranscript && (
            <div className="transcript-bubble user-bubble">
              <span className="bubble-label">
                {lang === "hi-IN" ? "Aap" : "You"}
              </span>
              <p>{userTranscript}</p>
            </div>
          )}
          {aiResponse && (
            <div className="transcript-bubble ai-bubble">
              <span className="bubble-label">Om.ai</span>
              <p>{aiResponse}</p>
            </div>
          )}
        </div>
      </main>

      {/* Mic button */}
      <div className="voice-footer">
        <button
          type="button"
          onClick={handleMicClick}
          className={`mic-btn ${
            isListening
              ? "mic-listening"
              : voiceState !== "idle"
                ? "mic-busy"
                : ""
          }`}
          data-ocid="voice.primary_button"
          aria-label={isListening ? "Stop listening" : "Start listening"}
        >
          {isListening ? <MicOff size={28} /> : <Mic size={28} />}
        </button>
        <p className="mic-hint">
          {lang === "hi-IN"
            ? isListening
              ? "Bol rahe hain..."
              : "Mic dabao baat karne ke liye"
            : isListening
              ? "Listening — tap to stop"
              : "Press to speak"}
        </p>
      </div>

      {/* Inline styles for voice mode page */}
      <style>{`
        .voice-mode-page {
          position: fixed;
          inset: 0;
          background: linear-gradient(
            135deg,
            oklch(0.05 0.02 220) 0%,
            oklch(0.08 0.04 185) 50%,
            oklch(0.06 0.03 200) 100%
          );
          display: flex;
          flex-direction: column;
          align-items: center;
          overflow: hidden;
          font-family: 'Plus Jakarta Sans', sans-serif;
          z-index: 100;
        }

        /* Ambient background decoration */
        .ambient-bg {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
        }
        .ambient-circle {
          position: absolute;
          border-radius: 50%;
          opacity: 0.06;
          filter: blur(60px);
        }
        .ambient-circle-1 {
          width: 400px; height: 400px;
          top: -100px; left: -100px;
          background: oklch(0.65 0.22 185);
        }
        .ambient-circle-2 {
          width: 350px; height: 350px;
          bottom: -80px; right: -80px;
          background: oklch(0.55 0.2 200);
        }
        .ambient-circle-3 {
          width: 250px; height: 250px;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          background: oklch(0.7 0.15 170);
        }

        /* Header */
        .voice-header {
          position: relative;
          z-index: 10;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          padding-top: max(16px, env(safe-area-inset-top));
        }
        .voice-back-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px; height: 40px;
          border-radius: 50%;
          background: oklch(0.12 0.04 220 / 0.8);
          border: 1px solid oklch(0.3 0.1 185 / 0.4);
          color: oklch(0.75 0.15 185);
          cursor: pointer;
          transition: all 0.2s;
          backdrop-filter: blur(8px);
        }
        .voice-back-btn:hover {
          background: oklch(0.18 0.06 220);
          color: oklch(0.9 0.18 185);
        }
        .voice-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: oklch(0.88 0.08 185);
          letter-spacing: -0.02em;
        }
        .voice-lang-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 8px 14px;
          border-radius: 20px;
          background: oklch(0.12 0.04 220 / 0.8);
          border: 1px solid oklch(0.3 0.1 185 / 0.5);
          color: oklch(0.75 0.15 185);
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          backdrop-filter: blur(8px);
        }
        .voice-lang-btn:hover {
          border-color: oklch(0.55 0.18 185);
          color: oklch(0.9 0.2 185);
        }

        /* Main content */
        .voice-main {
          flex: 1;
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          gap: 24px;
          padding: 0 20px;
        }

        /* Character */
        .character-container {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .character-img {
          width: 280px;
          height: 280px;
          object-fit: contain;
          filter: drop-shadow(0 0 20px oklch(0.55 0.2 185 / 0.3));
          transition: transform 0.3s ease;
        }
        @media (max-width: 480px) {
          .character-img { width: 200px; height: 200px; }
        }

        /* Idle float animation */
        .character-container.idle .character-img {
          animation: float 3s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }

        /* Listening bounce */
        .character-container.listening .character-img {
          animation: listenBounce 0.8s ease-in-out infinite;
        }
        @keyframes listenBounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.04); }
        }

        /* Speaking wobble */
        .character-container.speaking .character-img {
          animation: speakWobble 0.4s ease-in-out infinite;
        }
        @keyframes speakWobble {
          0%, 100% { transform: rotate(-1deg) scale(1); }
          50% { transform: rotate(1deg) scale(1.02); }
        }

        /* Processing pulse */
        .character-container.processing .character-img {
          animation: processGlow 1.2s ease-in-out infinite;
          filter: drop-shadow(0 0 30px oklch(0.65 0.22 185 / 0.6));
        }
        @keyframes processGlow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.75; }
        }

        /* Pulse rings (listening) */
        .pulse-ring {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          border: 2px solid oklch(0.65 0.22 185 / 0.6);
          animation: pulseRing 2s ease-out infinite;
          pointer-events: none;
        }
        .pulse-ring-1 { width: 320px; height: 320px; animation-delay: 0s; }
        .pulse-ring-2 { width: 380px; height: 380px; animation-delay: 0.5s; border-color: oklch(0.55 0.18 185 / 0.4); }
        .pulse-ring-3 { width: 440px; height: 440px; animation-delay: 1s; border-color: oklch(0.5 0.15 185 / 0.25); }
        @media (max-width: 480px) {
          .pulse-ring-1 { width: 240px; height: 240px; }
          .pulse-ring-2 { width: 290px; height: 290px; }
          .pulse-ring-3 { width: 340px; height: 340px; }
        }
        @keyframes pulseRing {
          0% { transform: translate(-50%, -50%) scale(0.9); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(1.3); opacity: 0; }
        }

        /* Speaking glow backdrop */
        .speak-glow {
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          width: 300px; height: 300px;
          border-radius: 50%;
          background: radial-gradient(circle, oklch(0.65 0.22 185 / 0.15) 0%, transparent 70%);
          animation: glowPulse 0.8s ease-in-out infinite;
          pointer-events: none;
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.7; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
        }

        /* Waveform bars */
        .waveform-bars {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          margin-top: 16px;
          height: 32px;
        }
        .waveform-bar {
          width: 5px;
          background: oklch(0.65 0.22 185);
          border-radius: 3px;
          animation: waveBar 0.6s ease-in-out infinite alternate;
          min-height: 6px;
        }
        @keyframes waveBar {
          from { height: 6px; }
          to { height: 28px; }
        }

        /* Status text */
        .voice-status {
          font-size: 1.1rem;
          font-weight: 500;
          color: oklch(0.75 0.12 185);
          text-align: center;
          letter-spacing: 0.01em;
          min-height: 1.5em;
        }

        /* Transcript area */
        .transcript-area {
          display: flex;
          flex-direction: column;
          gap: 10px;
          width: 100%;
          max-width: 420px;
        }
        .transcript-bubble {
          padding: 10px 16px;
          border-radius: 16px;
          backdrop-filter: blur(12px);
          max-width: 90%;
        }
        .transcript-bubble p {
          font-size: 0.9rem;
          line-height: 1.5;
          margin: 0;
          color: oklch(0.88 0.05 185);
        }
        .bubble-label {
          font-size: 0.68rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          display: block;
          margin-bottom: 4px;
        }
        .user-bubble {
          align-self: flex-end;
          background: oklch(0.65 0.22 185 / 0.15);
          border: 1px solid oklch(0.55 0.18 185 / 0.4);
          border-bottom-right-radius: 4px;
        }
        .user-bubble .bubble-label { color: oklch(0.65 0.22 185); }
        .ai-bubble {
          align-self: flex-start;
          background: oklch(0.12 0.04 220 / 0.7);
          border: 1px solid oklch(0.25 0.08 185 / 0.5);
          border-bottom-left-radius: 4px;
        }
        .ai-bubble .bubble-label { color: oklch(0.55 0.18 185); }

        /* Footer / Mic */
        .voice-footer {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 24px 20px;
          padding-bottom: max(24px, env(safe-area-inset-bottom));
        }
        .mic-btn {
          width: 72px; height: 72px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border: 2px solid oklch(0.45 0.15 185);
          background: oklch(0.14 0.05 220);
          color: oklch(0.65 0.22 185);
          transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 0 0 0 oklch(0.65 0.22 185 / 0.3);
        }
        .mic-btn:hover {
          transform: scale(1.08);
          background: oklch(0.18 0.07 220);
          border-color: oklch(0.6 0.2 185);
        }
        .mic-btn.mic-listening {
          background: oklch(0.3 0.15 15);
          border-color: oklch(0.55 0.2 15);
          color: oklch(0.9 0.1 15);
          animation: micPulse 1.2s ease-in-out infinite;
        }
        .mic-btn.mic-busy {
          opacity: 0.6;
          cursor: not-allowed;
        }
        @keyframes micPulse {
          0%, 100% { box-shadow: 0 0 0 0 oklch(0.55 0.2 15 / 0.4); }
          50% { box-shadow: 0 0 0 16px oklch(0.55 0.2 15 / 0); }
        }
        .mic-hint {
          font-size: 0.78rem;
          color: oklch(0.5 0.08 185);
          text-align: center;
          letter-spacing: 0.01em;
        }
      `}</style>
    </div>
  );
}
