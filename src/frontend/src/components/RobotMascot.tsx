import { useEffect, useState } from "react";

const MESSAGES = [
  "Hello! I'm Om, your AI assistant.",
  "Ask me anything — coding, knowledge, ideas!",
  "Ready to help you code, think, and create.",
  "Powered by intelligence, built for you.",
  "What shall we explore today?",
];

export function RobotMascot({ isSpeaking = false }: { isSpeaking?: boolean }) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setMessageIndex((i) => (i + 1) % MESSAGES.length);
        setVisible(true);
      }, 400);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center gap-6">
      <div
        className="relative px-5 py-3 rounded-2xl text-sm font-medium max-w-xs text-center"
        style={{
          background: "oklch(0.12 0.04 185)",
          border: "1px solid oklch(0.35 0.12 185)",
          color: "oklch(0.9 0.08 185)",
          opacity: visible ? 1 : 0,
          transition: "opacity 0.35s ease",
          minHeight: "48px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {MESSAGES[messageIndex]}
        <span
          className="absolute -bottom-3 left-1/2 -translate-x-1/2"
          style={{
            width: 0,
            height: 0,
            borderLeft: "10px solid transparent",
            borderRight: "10px solid transparent",
            borderTop: "12px solid oklch(0.35 0.12 185)",
          }}
        />
        <span
          className="absolute -bottom-[10px] left-1/2 -translate-x-1/2"
          style={{
            width: 0,
            height: 0,
            borderLeft: "8px solid transparent",
            borderRight: "8px solid transparent",
            borderTop: "10px solid oklch(0.12 0.04 185)",
          }}
        />
      </div>

      <div className="robot-float">
        <svg
          width="140"
          height="180"
          viewBox="0 0 140 180"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="Om AI robot mascot"
        >
          <title>Om AI robot mascot</title>
          <line
            x1="70"
            y1="10"
            x2="70"
            y2="28"
            stroke="oklch(0.55 0.18 185)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle
            cx="70"
            cy="7"
            r="5"
            fill={isSpeaking ? "oklch(0.9 0.28 185)" : "oklch(0.7 0.22 185)"}
            className={
              isSpeaking ? "antenna-pulse antenna-speaking" : "antenna-pulse"
            }
          />
          <rect
            x="28"
            y="28"
            width="84"
            height="66"
            rx="16"
            fill="oklch(0.14 0.04 220)"
            stroke="oklch(0.4 0.15 185)"
            strokeWidth="2"
          />
          <g className="robot-eye">
            <rect
              x="42"
              y="44"
              width="22"
              height="18"
              rx="4"
              fill="oklch(0.15 0.02 220)"
            />
            <rect
              x="45"
              y="47"
              width="16"
              height="12"
              rx="3"
              fill="oklch(0.75 0.25 185)"
            />
            <rect
              x="50"
              y="50"
              width="6"
              height="6"
              rx="1"
              fill="oklch(0.95 0.05 185)"
            />
          </g>
          <g className="robot-eye">
            <rect
              x="76"
              y="44"
              width="22"
              height="18"
              rx="4"
              fill="oklch(0.15 0.02 220)"
            />
            <rect
              x="79"
              y="47"
              width="16"
              height="12"
              rx="3"
              fill="oklch(0.75 0.25 185)"
            />
            <rect
              x="84"
              y="50"
              width="6"
              height="6"
              rx="1"
              fill="oklch(0.95 0.05 185)"
            />
          </g>
          <rect
            x="48"
            y="72"
            width="44"
            height="10"
            rx="5"
            fill="oklch(0.15 0.02 220)"
            stroke="oklch(0.35 0.12 185)"
            strokeWidth="1.5"
          />
          <g className={isSpeaking ? "mouth-wave" : ""}>
            <rect
              x="51"
              y="74.5"
              width="8"
              height="5"
              rx="1.5"
              fill="oklch(0.6 0.2 185)"
            />
            <rect
              x="62"
              y="74.5"
              width="8"
              height="5"
              rx="1.5"
              fill="oklch(0.6 0.2 185)"
            />
            <rect
              x="73"
              y="74.5"
              width="8"
              height="5"
              rx="1.5"
              fill="oklch(0.6 0.2 185)"
            />
            <rect
              x="84"
              y="74.5"
              width="4"
              height="5"
              rx="1.5"
              fill="oklch(0.6 0.2 185)"
            />
          </g>
          <rect
            x="58"
            y="94"
            width="24"
            height="10"
            rx="3"
            fill="oklch(0.18 0.04 220)"
            stroke="oklch(0.35 0.1 185)"
            strokeWidth="1.5"
          />
          <rect
            x="22"
            y="104"
            width="96"
            height="58"
            rx="14"
            fill="oklch(0.14 0.04 220)"
            stroke="oklch(0.4 0.15 185)"
            strokeWidth="2"
          />
          <rect
            x="36"
            y="116"
            width="68"
            height="34"
            rx="8"
            fill="oklch(0.10 0.03 220)"
            stroke="oklch(0.3 0.10 185)"
            strokeWidth="1.5"
          />
          <circle
            cx="50"
            cy="128"
            r="5"
            fill="oklch(0.65 0.25 185)"
            opacity="0.9"
          />
          <circle
            cx="70"
            cy="128"
            r="5"
            fill="oklch(0.65 0.2 120)"
            opacity="0.8"
          />
          <circle
            cx="90"
            cy="128"
            r="5"
            fill="oklch(0.7 0.22 30)"
            opacity="0.8"
          />
          <rect
            x="44"
            y="138"
            width="52"
            height="6"
            rx="3"
            fill="oklch(0.2 0.05 185)"
          />
          <rect
            x="44"
            y="138"
            width="32"
            height="6"
            rx="3"
            fill="oklch(0.55 0.18 185)"
          />
          <rect
            x="2"
            y="108"
            width="18"
            height="46"
            rx="9"
            fill="oklch(0.14 0.04 220)"
            stroke="oklch(0.35 0.12 185)"
            strokeWidth="2"
          />
          <rect
            x="120"
            y="108"
            width="18"
            height="46"
            rx="9"
            fill="oklch(0.14 0.04 220)"
            stroke="oklch(0.35 0.12 185)"
            strokeWidth="2"
          />
          <rect
            x="0"
            y="150"
            width="22"
            height="14"
            rx="7"
            fill="oklch(0.18 0.05 220)"
            stroke="oklch(0.35 0.12 185)"
            strokeWidth="1.5"
          />
          <rect
            x="118"
            y="150"
            width="22"
            height="14"
            rx="7"
            fill="oklch(0.18 0.05 220)"
            stroke="oklch(0.35 0.12 185)"
            strokeWidth="1.5"
          />
          <rect
            x="38"
            y="162"
            width="24"
            height="16"
            rx="6"
            fill="oklch(0.14 0.04 220)"
            stroke="oklch(0.35 0.12 185)"
            strokeWidth="2"
          />
          <rect
            x="78"
            y="162"
            width="24"
            height="16"
            rx="6"
            fill="oklch(0.14 0.04 220)"
            stroke="oklch(0.35 0.12 185)"
            strokeWidth="2"
          />
        </svg>
      </div>
    </div>
  );
}
