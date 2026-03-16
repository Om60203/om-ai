import { ArrowLeft, Globe, Mic, MicOff } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useActor } from "../hooks/useActor";
import { getDeepSeekResponse } from "../utils/deepseekAPI";
import { getMockResponse } from "../utils/mockAI";

type VoiceState = "idle" | "listening" | "processing" | "speaking";
type CharacterId = "doraemon" | "bheem" | "thor" | "spiderman" | "captain";

interface VoiceModePageProps {
  onBack: () => void;
}

const CHARACTERS: Record<
  CharacterId,
  {
    name: string;
    emoji: string;
    image: string;
    pitch: number;
    rate: number;
    color: string;
    glowColor: string;
    personality: string;
  }
> = {
  doraemon: {
    name: "Doraemon",
    emoji: "🔵",
    image: "/assets/generated/doraemon-char-transparent.dim_400x400.png",
    pitch: 1.3,
    rate: 1.0,
    color: "oklch(0.6 0.2 240)",
    glowColor: "oklch(0.6 0.2 240 / 0.4)",
    personality:
      "You are Doraemon, a friendly robotic cat from the future. Speak in a cheerful, helpful tone. You have a magical pocket with gadgets. In Hindi, be warm and playful.",
  },
  bheem: {
    name: "Chhota Bheem",
    emoji: "💪",
    image: "/assets/generated/chhota-bheem-char-transparent.dim_400x400.png",
    pitch: 1.1,
    rate: 1.05,
    color: "oklch(0.65 0.18 50)",
    glowColor: "oklch(0.65 0.18 50 / 0.4)",
    personality:
      "You are Chhota Bheem, a brave and strong young boy from Dholakpur. Speak energetically and enthusiastically. You love ladoos and protecting your friends. Be encouraging and heroic.",
  },
  thor: {
    name: "Thor",
    emoji: "⚡",
    image: "/assets/generated/thor-char-transparent.dim_400x400.png",
    pitch: 0.8,
    rate: 0.9,
    color: "oklch(0.78 0.18 90)",
    glowColor: "oklch(0.78 0.18 90 / 0.4)",
    personality:
      "You are Thor, the mighty Norse god of thunder. Speak with confidence and authority. Use occasional old-English style phrases. Be noble, brave, and powerful in your responses.",
  },
  spiderman: {
    name: "Spider-Man",
    emoji: "🕷️",
    image: "/assets/generated/spiderman-char-transparent.dim_400x400.png",
    pitch: 1.1,
    rate: 1.1,
    color: "oklch(0.55 0.22 15)",
    glowColor: "oklch(0.55 0.22 15 / 0.4)",
    personality:
      "You are Spider-Man, a witty and friendly superhero. Speak with humor, make jokes, and be relatable. You balance being a superhero with everyday life. Be energetic and fun.",
  },
  captain: {
    name: "Captain America",
    emoji: "🛡️",
    image: "/assets/generated/captain-america-char-transparent.dim_400x400.png",
    pitch: 0.9,
    rate: 0.95,
    color: "oklch(0.55 0.18 260)",
    glowColor: "oklch(0.55 0.18 260 / 0.4)",
    personality:
      "You are Captain America, a noble and principled hero. Speak with integrity, patriotism, and wisdom. Be inspiring, honest, and encouraging. Stand up for what is right.",
  },
};

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
  const open = (url: string, name: string, nameHi: string) => {
    window.open(url, "_blank");
    return isHindi
      ? `${nameHi} naya tab mein khul gaya!`
      : `${name} opened in a new tab!`;
  };

  // WhatsApp with optional message
  if (lower.includes("whatsapp")) {
    const msgMatch = text.match(
      /(?:message|msg|bhejo|send|bolo).*?(?:ko|to)?\s+(.+)/i,
    );
    const preText = msgMatch ? encodeURIComponent(msgMatch[1].trim()) : "";
    const url = preText
      ? `https://web.whatsapp.com/send?text=${preText}`
      : "https://web.whatsapp.com";
    window.open(url, "_blank");
    return isHindi
      ? "WhatsApp Web naya tab mein khul gaya!"
      : "WhatsApp Web opened in a new tab!";
  }

  // YouTube
  if (lower.includes("youtube") || lower.includes("you tube")) {
    const searchMatch = text.match(
      /(?:search|dhundo|play|chalao)\s+(.+?)(?:\s+on\s+youtube)?$/i,
    );
    const url = searchMatch
      ? `https://www.youtube.com/results?search_query=${encodeURIComponent(searchMatch[1])}`
      : "https://www.youtube.com";
    window.open(url, "_blank");
    return isHindi
      ? "YouTube naya tab mein khul gaya!"
      : "YouTube opened in a new tab!";
  }

  // Google Search
  if (
    lower.includes("google") ||
    lower.includes("search karo") ||
    lower.includes("search kr")
  ) {
    const searchMatch = text.match(
      /(?:search|dhundo|google karo|google kr)\s+(.+)/i,
    );
    const url = searchMatch
      ? `https://www.google.com/search?q=${encodeURIComponent(searchMatch[1])}`
      : "https://www.google.com";
    window.open(url, "_blank");
    return isHindi
      ? "Google naya tab mein khul gaya!"
      : "Google opened in a new tab!";
  }

  // Instagram
  if (lower.includes("instagram") || lower.includes("insta")) {
    return open("https://www.instagram.com", "Instagram", "Instagram");
  }

  // Facebook
  if (lower.includes("facebook")) {
    return open("https://www.facebook.com", "Facebook", "Facebook");
  }

  // Twitter / X
  if (
    lower.includes("twitter") ||
    lower.includes("x.com") ||
    lower.includes("tweet")
  ) {
    return open("https://www.x.com", "Twitter/X", "Twitter");
  }

  // Gmail
  if (
    lower.includes("gmail") ||
    lower.includes("email") ||
    lower.includes("mail")
  ) {
    return open("https://mail.google.com", "Gmail", "Gmail");
  }

  // Google Maps
  if (
    lower.includes("maps") ||
    lower.includes("location") ||
    lower.includes("map")
  ) {
    const placeMatch = text.match(
      /(?:maps|location|navigate|directions|show)\s+(.+)/i,
    );
    const url = placeMatch
      ? `https://maps.google.com/maps?q=${encodeURIComponent(placeMatch[1])}`
      : "https://maps.google.com";
    window.open(url, "_blank");
    return isHindi
      ? "Google Maps naya tab mein khul gaya!"
      : "Google Maps opened in a new tab!";
  }

  // Spotify
  if (
    lower.includes("spotify") ||
    lower.includes("music") ||
    lower.includes("gaana")
  ) {
    return open("https://open.spotify.com", "Spotify", "Spotify");
  }

  // Netflix
  if (lower.includes("netflix")) {
    return open("https://www.netflix.com", "Netflix", "Netflix");
  }

  // Amazon
  if (lower.includes("amazon")) {
    return open("https://www.amazon.in", "Amazon", "Amazon");
  }

  // Flipkart
  if (lower.includes("flipkart")) {
    return open("https://www.flipkart.com", "Flipkart", "Flipkart");
  }

  // Telegram
  if (lower.includes("telegram")) {
    return open("https://web.telegram.org", "Telegram", "Telegram");
  }

  // LinkedIn
  if (lower.includes("linkedin")) {
    return open("https://www.linkedin.com", "LinkedIn", "LinkedIn");
  }

  // Reddit
  if (lower.includes("reddit")) {
    return open("https://www.reddit.com", "Reddit", "Reddit");
  }

  // GitHub
  if (lower.includes("github")) {
    return open("https://www.github.com", "GitHub", "GitHub");
  }

  // Wikipedia
  if (lower.includes("wikipedia") || lower.includes("wiki")) {
    const searchMatch = text.match(/(?:wikipedia|wiki)\s+(.+)/i);
    const url = searchMatch
      ? `https://en.wikipedia.org/w/index.php?search=${encodeURIComponent(searchMatch[1])}`
      : "https://www.wikipedia.org";
    window.open(url, "_blank");
    return isHindi
      ? "Wikipedia naya tab mein khul gaya!"
      : "Wikipedia opened in a new tab!";
  }

  // Snapchat
  if (lower.includes("snapchat")) {
    return open("https://web.snapchat.com", "Snapchat", "Snapchat");
  }

  // Pinterest
  if (lower.includes("pinterest")) {
    return open("https://www.pinterest.com", "Pinterest", "Pinterest");
  }

  // Hotstar / Disney+
  if (lower.includes("hotstar") || lower.includes("disney")) {
    return open("https://www.hotstar.com", "Hotstar", "Hotstar");
  }

  // Prime Video
  if (lower.includes("prime video") || lower.includes("amazon prime")) {
    return open("https://www.primevideo.com", "Prime Video", "Prime Video");
  }

  // Paytm
  if (lower.includes("paytm")) {
    return open("https://paytm.com", "Paytm", "Paytm");
  }

  // PhonePe
  if (lower.includes("phonepe") || lower.includes("phone pe")) {
    return open("https://www.phonepe.com", "PhonePe", "PhonePe");
  }

  // Zomato
  if (lower.includes("zomato")) {
    return open("https://www.zomato.com", "Zomato", "Zomato");
  }

  // Swiggy
  if (lower.includes("swiggy")) {
    return open("https://www.swiggy.com", "Swiggy", "Swiggy");
  }

  // OLX
  if (lower.includes("olx")) {
    return open("https://www.olx.in", "OLX", "OLX");
  }

  // Meesho
  if (lower.includes("meesho")) {
    return open("https://www.meesho.com", "Meesho", "Meesho");
  }

  // Myntra
  if (lower.includes("myntra")) {
    return open("https://www.myntra.com", "Myntra", "Myntra");
  }

  // Screenshot command - use browser print dialog
  if (
    lower.includes("screenshot lo") ||
    lower.includes("screen shot") ||
    lower === "screenshot" ||
    lower.includes("screenshot lena") ||
    lower.includes("screenshot")
  ) {
    window.print();
    return isHindi
      ? "Browser ka screenshot/print dialog khul gaya!"
      : "Browser print/screenshot dialog opened!";
  }
  if (
    lower.includes("phone off") ||
    lower.includes("band karo phone") ||
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
  const [selectedCharacter, setSelectedCharacter] =
    useState<CharacterId>("doraemon");
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

  const char = CHARACTERS[selectedCharacter];

  useEffect(() => {
    if (!window.speechSynthesis) return;
    const loadVoices = () => {
      voicesRef.current = window.speechSynthesis.getVoices();
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const speakText = useCallback(
    (text: string) => {
      if (!window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = lang;
      const voices = voicesRef.current;
      const isHindi = lang === "hi-IN";
      const exactMatch = voices.find((v) => v.lang === lang);
      const partialMatch = voices.find((v) =>
        v.lang.toLowerCase().startsWith(isHindi ? "hi" : "en"),
      );
      const chosenVoice = exactMatch || partialMatch || null;
      if (chosenVoice) utter.voice = chosenVoice;
      if (isHindi) {
        utter.rate = 0.82;
        utter.pitch = 1.0;
      } else {
        utter.rate = CHARACTERS[selectedCharacter].rate;
        utter.pitch = CHARACTERS[selectedCharacter].pitch;
      }
      synthRef.current = utter;
      setVoiceState("speaking");
      utter.onend = () => setVoiceState("idle");
      utter.onerror = () => setVoiceState("idle");
      setTimeout(() => {
        window.speechSynthesis.speak(utter);
      }, 100);
    },
    [lang, selectedCharacter],
  );

  const processText = useCallback(
    async (text: string) => {
      setVoiceState("processing");
      const specialReply = handleSpecialCommand(text, lang);
      if (specialReply) {
        setAiResponse(specialReply);
        speakText(specialReply);
        return;
      }
      try {
        const charPersonality = CHARACTERS[selectedCharacter].personality;
        const prompt = `${charPersonality}\n\nUser says: ${text}`;
        const aiReply =
          (await getDeepSeekResponse(prompt, actor)) ||
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
    [actor, lang, speakText, selectedCharacter],
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
    if (recognitionRef.current) recognitionRef.current.stop();
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
        <h1 className="voice-title">Om.ai Voice</h1>
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

      {/* Character selection strip */}
      <div className="char-strip-wrap" data-ocid="voice.character_select.tab">
        <div className="char-strip">
          {(
            Object.entries(CHARACTERS) as [
              CharacterId,
              (typeof CHARACTERS)[CharacterId],
            ][]
          ).map(([id, c], index) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setSelectedCharacter(id);
                setUserTranscript("");
                setAiResponse("");
              }}
              className={`char-card ${
                selectedCharacter === id ? "char-card-active" : ""
              }`}
              style={
                {
                  "--char-color": c.color,
                  "--char-glow": c.glowColor,
                } as React.CSSProperties
              }
              aria-label={c.name}
              data-ocid={`voice.character_select.item.${index + 1}`}
            >
              <div className="char-thumb-wrap">
                <img
                  src={c.image}
                  alt={c.name}
                  className="char-thumb"
                  draggable={false}
                />
              </div>
              <span className="char-name">{c.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main scrollable area */}
      <main className="voice-main">
        {/* Character name label */}
        <p className="char-label" style={{ color: char.color }}>
          {char.emoji} {char.name}
        </p>

        {/* Character container */}
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
          {isListening && (
            <>
              <div className="pulse-ring pulse-ring-1" />
              <div className="pulse-ring pulse-ring-2" />
              <div className="pulse-ring pulse-ring-3" />
            </>
          )}
          {isSpeaking && <div className="speak-glow" />}

          <img
            src={char.image}
            alt={`${char.name} Voice Assistant`}
            className="character-img"
            draggable={false}
          />

          {isSpeaking && (
            <div className="waveform-bars">
              {[0, 0.08, 0.16, 0.24, 0.32, 0.4, 0.48].map((delay) => (
                <div
                  key={delay}
                  className="waveform-bar"
                  style={{ animationDelay: `${delay}s` }}
                />
              ))}
            </div>
          )}
        </div>

        <p className="voice-status" data-ocid="voice.section">
          {statusText}
        </p>

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
              <span className="bubble-label">{char.name}</span>
              <p>{aiResponse}</p>
            </div>
          )}
        </div>
      </main>

      {/* Mic footer */}
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
          overflow: hidden;
          font-family: 'Plus Jakarta Sans', sans-serif;
          z-index: 100;
        }
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
          flex-shrink: 0;
          position: relative;
          z-index: 10;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          padding-top: max(12px, env(safe-area-inset-top));
        }
        .voice-back-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px; height: 36px;
          border-radius: 50%;
          background: oklch(0.12 0.04 220 / 0.8);
          border: 1px solid oklch(0.3 0.1 185 / 0.4);
          color: oklch(0.75 0.15 185);
          cursor: pointer;
          transition: all 0.2s;
          backdrop-filter: blur(8px);
        }
        .voice-back-btn:hover { background: oklch(0.18 0.06 220); color: oklch(0.9 0.18 185); }
        .voice-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: oklch(0.88 0.08 185);
          letter-spacing: -0.02em;
        }
        .voice-lang-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 6px 10px;
          border-radius: 20px;
          background: oklch(0.12 0.04 220 / 0.8);
          border: 1px solid oklch(0.3 0.1 185 / 0.5);
          color: oklch(0.75 0.15 185);
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          backdrop-filter: blur(8px);
        }
        .voice-lang-btn:hover { border-color: oklch(0.55 0.18 185); color: oklch(0.9 0.2 185); }

        /* Character selection strip */
        .char-strip-wrap {
          flex-shrink: 0;
          position: relative;
          z-index: 10;
          padding: 4px 16px 10px;
        }
        .char-strip {
          display: flex;
          gap: 10px;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          padding-bottom: 4px;
        }
        .char-strip::-webkit-scrollbar { display: none; }
        .char-card {
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
          padding: 7px 8px 6px;
          border-radius: 14px;
          background: oklch(0.1 0.03 220 / 0.7);
          border: 1.5px solid oklch(0.18 0.05 220);
          cursor: pointer;
          transition: all 0.22s ease;
          scroll-snap-align: start;
          backdrop-filter: blur(8px);
          min-width: 64px;
        }
        .char-card:hover {
          border-color: var(--char-color);
          background: oklch(0.14 0.04 220 / 0.8);
        }
        .char-card-active {
          border-color: var(--char-color) !important;
          background: oklch(0.12 0.04 220 / 0.9) !important;
          box-shadow: 0 0 14px var(--char-glow), inset 0 0 8px var(--char-glow);
        }
        .char-thumb-wrap {
          width: 48px; height: 48px;
          border-radius: 50%;
          overflow: hidden;
          background: oklch(0.08 0.02 220);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid transparent;
        }
        .char-card-active .char-thumb-wrap {
          border-color: var(--char-color);
          box-shadow: 0 0 10px var(--char-glow);
        }
        .char-thumb {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .char-name {
          font-size: 9px;
          font-weight: 600;
          color: oklch(0.6 0.08 185);
          text-align: center;
          line-height: 1.2;
          max-width: 60px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .char-card-active .char-name {
          color: var(--char-color);
        }

        /* Character label */
        .char-label {
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: 0.02em;
          text-align: center;
          flex-shrink: 0;
          opacity: 0.9;
        }

        /* Main scroll area */
        .voice-main {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          padding: 8px 20px 8px;
          gap: 12px;
          -webkit-overflow-scrolling: touch;
        }

        /* Character image */
        .character-container {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          flex-shrink: 0;
        }
        .character-img {
          width: 160px;
          height: 160px;
          object-fit: contain;
          filter: drop-shadow(0 0 20px oklch(0.55 0.2 185 / 0.3));
          transition: transform 0.3s ease;
        }
        @media (max-width: 480px) { .character-img { width: 130px; height: 130px; } }
        @media (min-height: 700px) { .character-img { width: 200px; height: 200px; } }
        @media (min-height: 700px) and (max-width: 480px) { .character-img { width: 160px; height: 160px; } }

        .character-container.idle .character-img { animation: float 3s ease-in-out infinite; }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        .character-container.listening .character-img { animation: listenBounce 0.8s ease-in-out infinite; }
        @keyframes listenBounce { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.04); } }
        .character-container.speaking .character-img { animation: speakWobble 0.4s ease-in-out infinite; }
        @keyframes speakWobble { 0%, 100% { transform: rotate(-1deg) scale(1); } 50% { transform: rotate(1deg) scale(1.02); } }
        .character-container.processing .character-img { animation: processGlow 1.2s ease-in-out infinite; filter: drop-shadow(0 0 30px oklch(0.65 0.22 185 / 0.6)); }
        @keyframes processGlow { 0%, 100% { opacity: 1; } 50% { opacity: 0.75; } }

        .pulse-ring {
          position: absolute; top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          border: 2px solid oklch(0.65 0.22 185 / 0.6);
          animation: pulseRing 2s ease-out infinite;
          pointer-events: none;
        }
        .pulse-ring-1 { width: 200px; height: 200px; animation-delay: 0s; }
        .pulse-ring-2 { width: 250px; height: 250px; animation-delay: 0.5s; border-color: oklch(0.55 0.18 185 / 0.4); }
        .pulse-ring-3 { width: 300px; height: 300px; animation-delay: 1s; border-color: oklch(0.5 0.15 185 / 0.25); }
        @media (max-width: 480px) {
          .pulse-ring-1 { width: 160px; height: 160px; }
          .pulse-ring-2 { width: 200px; height: 200px; }
          .pulse-ring-3 { width: 240px; height: 240px; }
        }
        @keyframes pulseRing {
          0% { transform: translate(-50%, -50%) scale(0.9); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(1.3); opacity: 0; }
        }
        .speak-glow {
          position: absolute; top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          width: 200px; height: 200px;
          border-radius: 50%;
          background: radial-gradient(circle, oklch(0.65 0.22 185 / 0.15) 0%, transparent 70%);
          animation: glowPulse 0.8s ease-in-out infinite;
          pointer-events: none;
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.7; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
        }
        .waveform-bars {
          display: flex; align-items: center; justify-content: center;
          gap: 4px; margin-top: 10px; height: 24px;
        }
        .waveform-bar {
          width: 5px;
          background: oklch(0.65 0.22 185);
          border-radius: 3px;
          animation: waveBar 0.6s ease-in-out infinite alternate;
          min-height: 5px;
        }
        @keyframes waveBar { from { height: 5px; } to { height: 22px; } }

        .voice-status {
          font-size: 0.9rem; font-weight: 500;
          color: oklch(0.75 0.12 185);
          text-align: center; letter-spacing: 0.01em;
          min-height: 1.4em; flex-shrink: 0;
        }

        .transcript-area {
          display: flex; flex-direction: column; gap: 10px;
          width: 100%; max-width: 420px;
        }
        .transcript-bubble {
          padding: 10px 16px;
          border-radius: 16px;
          backdrop-filter: blur(12px);
          max-width: 90%;
        }
        .transcript-bubble p { font-size: 0.88rem; line-height: 1.5; margin: 0; color: oklch(0.88 0.05 185); }
        .bubble-label {
          font-size: 0.66rem; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.06em; display: block; margin-bottom: 4px;
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

        /* Footer */
        .voice-footer {
          flex-shrink: 0;
          position: relative; z-index: 10;
          display: flex; flex-direction: column; align-items: center; gap: 10px;
          padding: 14px 20px;
          padding-bottom: max(14px, env(safe-area-inset-bottom));
          background: linear-gradient(to top, oklch(0.05 0.02 220 / 0.95) 0%, transparent 100%);
        }
        .mic-btn {
          width: 66px; height: 66px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          border: 2px solid oklch(0.45 0.15 185);
          background: oklch(0.14 0.05 220);
          color: oklch(0.65 0.22 185);
          transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 0 0 0 oklch(0.65 0.22 185 / 0.3);
        }
        .mic-btn:hover { transform: scale(1.08); background: oklch(0.18 0.07 220); border-color: oklch(0.6 0.2 185); }
        .mic-btn.mic-listening {
          background: oklch(0.3 0.15 15);
          border-color: oklch(0.55 0.2 15);
          color: oklch(0.9 0.1 15);
          animation: micPulse 1.2s ease-in-out infinite;
        }
        .mic-btn.mic-busy { opacity: 0.6; cursor: not-allowed; }
        @keyframes micPulse {
          0%, 100% { box-shadow: 0 0 0 0 oklch(0.55 0.2 15 / 0.4); }
          50% { box-shadow: 0 0 0 14px oklch(0.55 0.2 15 / 0); }
        }
        .mic-hint { font-size: 0.75rem; color: oklch(0.5 0.08 185); text-align: center; letter-spacing: 0.01em; }
      `}</style>
    </div>
  );
}
