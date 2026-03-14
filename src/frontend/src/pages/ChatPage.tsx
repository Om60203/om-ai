import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bot,
  Check,
  Copy,
  Headphones,
  Loader2,
  LogOut,
  Menu,
  MessageSquare,
  Mic,
  MicOff,
  Moon,
  Plus,
  Send,
  Sun,
  User,
  UserPlus,
  Volume2,
  VolumeX,
  X,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Conversation, Message } from "../backend.d";
import { RobotMascot } from "../components/RobotMascot";
import { useActor } from "../hooks/useActor";
import { getDeepSeekResponse } from "../utils/deepseekAPI";
import { getMockResponse } from "../utils/mockAI";

interface ChatPageProps {
  onLogout: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  isGuest?: boolean;
  guestSessionId?: string;
  onSignUp?: () => void;
  onVoiceMode?: () => void;
}

interface LocalMessage {
  id: string;
  role: string;
  content: string;
  conversationId?: bigint;
}

function renderContent(content: string) {
  const parts = content.split(/(```[\s\S]*?```)/g);
  return parts.map((part, i) => {
    const key = `part-${i}`;
    if (part.startsWith("```") && part.endsWith("```")) {
      const lines = part.slice(3, -3).split("\n");
      const lang = lines[0].trim() || "code";
      const code = lines.slice(1).join("\n");
      return (
        <div key={key} className="code-block">
          <div className="code-header">
            <span>{lang}</span>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(code);
                toast.success("Copied!");
              }}
              className="flex items-center gap-1 hover:opacity-80 transition-opacity"
            >
              <Copy size={12} /> Copy
            </button>
          </div>
          <pre>
            <code>{code}</code>
          </pre>
        </div>
      );
    }
    const formatted = part.split(/(\*\*[^*]+\*\*)/g).map((seg, j) => {
      const segKey = `seg-${i}-${j}`;
      if (seg.startsWith("**") && seg.endsWith("**"))
        return <strong key={segKey}>{seg.slice(2, -2)}</strong>;
      return (
        <span key={segKey} style={{ whiteSpace: "pre-wrap" }}>
          {seg}
        </span>
      );
    });
    return <span key={key}>{formatted}</span>;
  });
}

function MessageBubble({
  message,
  voiceLang,
  ttsEnabled,
}: {
  message: Message | LocalMessage;
  voiceLang: string;
  ttsEnabled: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [message.content]);

  const handleSpeak = useCallback(() => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(message.content);
    utter.lang = voiceLang;
    utter.rate = 0.95;
    window.speechSynthesis.speak(utter);
  }, [message.content, voiceLang]);

  return (
    <div
      className={`flex gap-2 md:gap-3 ${
        isUser ? "flex-row-reverse" : "flex-row"
      } group`}
    >
      <div
        className="w-7 h-7 md:w-8 md:h-8 rounded-xl flex items-center justify-center shrink-0 mt-1"
        style={{
          background: isUser ? "oklch(0.65 0.22 185)" : "oklch(0.14 0.04 220)",
          border: isUser ? "none" : "1px solid oklch(0.3 0.1 185)",
        }}
      >
        {isUser ? (
          <User size={12} style={{ color: "oklch(0.1 0.02 220)" }} />
        ) : (
          <Bot size={12} style={{ color: "oklch(0.65 0.22 185)" }} />
        )}
      </div>
      <div
        className="max-w-[85%] md:max-w-[75%] rounded-2xl px-3 md:px-4 py-2.5 md:py-3 text-sm leading-relaxed relative"
        style={{
          background: isUser ? "oklch(0.65 0.22 185)" : "oklch(0.11 0.03 220)",
          color: isUser ? "oklch(0.1 0.02 220)" : "oklch(0.88 0.05 185)",
          border: isUser ? "none" : "1px solid oklch(0.2 0.06 185)",
          borderTopRightRadius: isUser ? "4px" : "16px",
          borderTopLeftRadius: isUser ? "16px" : "4px",
          wordBreak: "break-word",
          overflowWrap: "break-word",
        }}
      >
        <div className="message-content">{renderContent(message.content)}</div>
        <div className="absolute -bottom-7 right-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
          {!isUser && ttsEnabled && (
            <button
              type="button"
              onClick={handleSpeak}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              title="Read aloud"
              data-ocid="chat.secondary_button"
            >
              <Volume2 size={11} />
            </button>
          )}
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            {copied ? <Check size={11} /> : <Copy size={11} />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div
        className="w-7 h-7 md:w-8 md:h-8 rounded-xl flex items-center justify-center shrink-0"
        style={{
          background: "oklch(0.14 0.04 220)",
          border: "1px solid oklch(0.3 0.1 185)",
        }}
      >
        <Bot size={12} style={{ color: "oklch(0.65 0.22 185)" }} />
      </div>
      <div
        className="rounded-2xl px-4 py-3 flex items-center gap-1.5"
        style={{
          background: "oklch(0.11 0.03 220)",
          border: "1px solid oklch(0.2 0.06 185)",
          borderTopLeftRadius: "4px",
        }}
      >
        <span
          className="typing-dot w-1.5 h-1.5 rounded-full"
          style={{ background: "oklch(0.65 0.22 185)" }}
        />
        <span
          className="typing-dot w-1.5 h-1.5 rounded-full"
          style={{ background: "oklch(0.65 0.22 185)" }}
        />
        <span
          className="typing-dot w-1.5 h-1.5 rounded-full"
          style={{ background: "oklch(0.65 0.22 185)" }}
        />
      </div>
    </div>
  );
}

export function ChatPage({
  onLogout,
  isDark,
  onToggleTheme,
  isGuest = false,
  guestSessionId = "",
  onSignUp,
  onVoiceMode,
}: ChatPageProps) {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();
  const [activeConvId, setActiveConvId] = useState<bigint | null>(null);
  const [input, setInput] = useState("");
  const [model, setModel] = useState("om-2-pro");
  const [isTyping, setIsTyping] = useState(false);
  const [nudgeDismissed, setNudgeDismissed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [usingRealAI, setUsingRealAI] = useState(false);
  // Voice state
  const [isRecording, setIsRecording] = useState(false);
  const [voiceLang, setVoiceLang] = useState<"hi-IN" | "en-US">("en-US");
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  // Local optimistic messages
  const [localMessages, setLocalMessages] = useState<LocalMessage[]>([]);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const activeConvIdRef = useRef<bigint | null>(null);

  const actorReady = !!actor && !isFetching;

  const { data: conversations = [], isLoading: convsLoading } = useQuery<
    Conversation[]
  >({
    queryKey: isGuest
      ? ["guest-conversations", guestSessionId]
      : ["conversations"],
    queryFn: async () => {
      if (!actor) return [];
      if (isGuest) {
        if (!guestSessionId) return [];
        return (actor as any).getGuestConversations(guestSessionId);
      }
      return actor.getConversations();
    },
    enabled: actorReady && (!isGuest || !!guestSessionId),
  });

  const { data: backendMessages = [], isLoading: msgsLoading } = useQuery<
    Message[]
  >({
    queryKey: isGuest
      ? ["guest-messages", guestSessionId, activeConvId?.toString()]
      : ["messages", activeConvId?.toString()],
    queryFn: async () => {
      if (!actor || !activeConvId) return [];
      if (isGuest) {
        return (actor as any).getGuestMessages(guestSessionId, activeConvId);
      }
      return actor.getMessages(activeConvId);
    },
    enabled: actorReady && !!activeConvId && (!isGuest || !!guestSessionId),
  });

  // Merge backend messages with local optimistic ones
  const messages: (Message | LocalMessage)[] =
    backendMessages.length > 0 ? backendMessages : localMessages;

  // Clear local messages once backend messages are available
  useEffect(() => {
    if (backendMessages.length > 0 && localMessages.length > 0) {
      setLocalMessages([]);
    }
  }, [backendMessages.length, localMessages.length]);

  useEffect(() => {
    if (conversations.length > 0 && !activeConvId) {
      setActiveConvId(conversations[0].id);
    }
  }, [conversations, activeConvId]);

  // Clear local messages when switching conversation
  useEffect(() => {
    if (activeConvIdRef.current !== activeConvId) {
      activeConvIdRef.current = activeConvId;
      setLocalMessages([]);
    }
  });

  // Auto-scroll to bottom whenever messages or typing state changes
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, []);

  const msgCount = messages.length;
  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on message change
  useEffect(() => {
    // Small delay to ensure DOM is updated before scrolling
    const timer = setTimeout(scrollToBottom, 50);
    return () => clearTimeout(timer);
  }, [msgCount, isTyping, scrollToBottom]);

  const createConvMutation = useMutation({
    mutationFn: async (title: string) => {
      if (!actor) throw new Error("No actor");
      if (isGuest) {
        return (actor as any).createGuestConversation(guestSessionId, title);
      }
      return actor.createConversation(title);
    },
    onSuccess: () => {
      if (isGuest) {
        queryClient.invalidateQueries({
          queryKey: ["guest-conversations", guestSessionId],
        });
      } else {
        queryClient.invalidateQueries({ queryKey: ["conversations"] });
      }
    },
  });

  const sendMsgMutation = useMutation({
    mutationFn: async ({
      convId,
      content,
      role,
    }: { convId: bigint; content: string; role: string }) => {
      if (!actor) throw new Error("No actor");
      if (isGuest) {
        return (actor as any).sendGuestMessage(
          guestSessionId,
          convId,
          content,
          role,
        );
      }
      return actor.sendMessage(convId, content, role);
    },
    onSuccess: () => {
      const msgKey = isGuest
        ? ["guest-messages", guestSessionId, activeConvId?.toString()]
        : ["messages", activeConvId?.toString()];
      queryClient.invalidateQueries({ queryKey: msgKey });
    },
  });

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isTyping) return;

    let convId = activeConvId;
    if (!convId) {
      try {
        const title = text.length > 40 ? `${text.substring(0, 40)}...` : text;
        const conv = await createConvMutation.mutateAsync(title);
        convId = conv.id;
        setActiveConvId(conv.id);
      } catch {
        const fallbackId = BigInt(Date.now());
        convId = fallbackId;
        setActiveConvId(fallbackId);
      }
    }

    if (!convId) return;

    setInput("");
    setIsTyping(true);

    // Show user message immediately
    const userLocalMsg: LocalMessage = {
      id: `local-user-${Date.now()}`,
      role: "user",
      content: text,
    };
    setLocalMessages((prev) => [...prev, userLocalMsg]);

    // Save user message to backend (fire-and-forget)
    sendMsgMutation
      .mutateAsync({ convId, content: text, role: "user" })
      .catch(() => {});

    // Try DeepSeek API first, fall back to mock AI
    let aiResponse: string;
    try {
      const deepseekResult = await getDeepSeekResponse(text, actor);
      if (deepseekResult) {
        aiResponse = deepseekResult;
        setUsingRealAI(true);
      } else {
        aiResponse = getMockResponse(text);
        setUsingRealAI(false);
      }
    } catch {
      aiResponse = getMockResponse(text);
      setUsingRealAI(false);
    }

    // Show AI response
    const aiLocalMsg: LocalMessage = {
      id: `local-ai-${Date.now()}`,
      role: "assistant",
      content: aiResponse,
    };
    setLocalMessages((prev) => [...prev, aiLocalMsg]);
    setIsTyping(false);

    // TTS auto-play
    if (ttsEnabled && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(aiResponse);
      utter.lang = voiceLang;
      utter.rate = 0.95;
      utter.onstart = () => setIsSpeaking(true);
      utter.onend = () => setIsSpeaking(false);
      utter.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utter);
    }

    // Save AI response to backend (fire-and-forget)
    sendMsgMutation
      .mutateAsync({ convId, content: aiResponse, role: "assistant" })
      .catch(() => {});
  }, [
    input,
    activeConvId,
    isTyping,
    actor,
    createConvMutation,
    sendMsgMutation,
    ttsEnabled,
    voiceLang,
  ]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = useCallback(async () => {
    try {
      const title = `Chat ${new Date().toLocaleTimeString()}`;
      const conv = await createConvMutation.mutateAsync(title);
      setActiveConvId(conv.id);
      setLocalMessages([]);
      setSidebarOpen(false);
    } catch {
      const fallbackId = BigInt(Date.now());
      setActiveConvId(fallbackId);
      setLocalMessages([]);
      setSidebarOpen(false);
    }
  }, [createConvMutation]);

  const handleMicToggle = useCallback(() => {
    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      toast.error("Voice not supported on this browser");
      return;
    }

    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = voiceLang;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };
    recognition.onerror = () => {
      setIsRecording(false);
      toast.error("Voice recognition error. Try again.");
    };
    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  }, [isRecording, voiceLang]);

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  const activeConv = conversations.find((c) => c.id === activeConvId);

  const SidebarContent = (
    <>
      <div
        className="px-4 py-4 flex items-center justify-between shrink-0"
        style={{ borderBottom: "1px solid oklch(0.12 0.03 220)" }}
      >
        <span
          className="font-display font-bold text-xl"
          style={{ color: "oklch(0.88 0.15 185)" }}
        >
          Om<span style={{ color: "oklch(0.65 0.22 185)" }}>.ai</span>
        </span>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleNewChat}
            size="sm"
            className="h-8 w-8 p-0 rounded-lg"
            style={{
              background: "oklch(0.65 0.22 185)",
              color: "oklch(0.1 0.02 220)",
            }}
            disabled={createConvMutation.isPending}
            data-ocid="chat.primary_button"
          >
            {createConvMutation.isPending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Plus size={14} />
            )}
          </Button>
          <button
            type="button"
            onClick={closeSidebar}
            className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background: "oklch(0.12 0.03 220)",
              color: "oklch(0.55 0.08 185)",
            }}
            data-ocid="chat.close_button"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      <ScrollArea className="flex-1 px-2 py-2">
        {convsLoading ? (
          <div className="space-y-1.5 px-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-10 w-full rounded-lg" />
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="px-4 py-8 text-center" data-ocid="chat.empty_state">
            <MessageSquare size={32} className="mx-auto mb-2 opacity-20" />
            <p className="text-xs text-muted-foreground">
              No chats yet. Start a new one!
            </p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {conversations.map((conv, idx) => (
              <button
                type="button"
                key={conv.id.toString()}
                onClick={() => {
                  setActiveConvId(conv.id);
                  setSidebarOpen(false);
                }}
                className="w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all"
                style={{
                  background:
                    activeConvId === conv.id
                      ? "oklch(0.13 0.04 185)"
                      : "transparent",
                  color:
                    activeConvId === conv.id
                      ? "oklch(0.85 0.1 185)"
                      : "oklch(0.6 0.05 220)",
                  border:
                    activeConvId === conv.id
                      ? "1px solid oklch(0.22 0.07 185)"
                      : "1px solid transparent",
                }}
                data-ocid={`chat.item.${idx + 1}`}
              >
                <div className="truncate font-medium">{conv.title}</div>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>

      <div
        className="px-4 py-3 shrink-0"
        style={{ borderTop: "1px solid oklch(0.12 0.03 220)" }}
      >
        {isGuest ? (
          <Button
            onClick={onSignUp}
            variant="ghost"
            size="sm"
            className="w-full gap-2 justify-start text-sm font-medium"
            style={{ color: "oklch(0.65 0.22 185)" }}
            data-ocid="chat.secondary_button"
          >
            <UserPlus size={14} /> Sign Up to Save
          </Button>
        ) : (
          <Button
            onClick={onLogout}
            variant="ghost"
            size="sm"
            className="w-full gap-2 text-muted-foreground hover:text-foreground justify-start"
            data-ocid="chat.secondary_button"
          >
            <LogOut size={14} /> Sign Out
          </Button>
        )}
      </div>
    </>
  );

  return (
    <div
      className="flex overflow-hidden"
      style={{
        background: "oklch(0.06 0.02 220)",
        height: "100dvh",
      }}
    >
      {/* Desktop Sidebar */}
      <aside
        className="hidden md:flex w-64 shrink-0 flex-col"
        style={{
          background: "oklch(0.07 0.025 220)",
          borderRight: "1px solid oklch(0.14 0.04 220)",
        }}
      >
        {SidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          role="presentation"
          className="fixed inset-0 z-50 md:hidden"
          onClick={closeSidebar}
          onKeyDown={(e) => e.key === "Escape" && closeSidebar()}
          style={{ background: "oklch(0 0 0 / 0.6)" }}
        >
          <aside
            className="sidebar-mobile-in absolute left-0 top-0 bottom-0 w-72 flex flex-col"
            style={{
              background: "oklch(0.07 0.025 220)",
              borderRight: "1px solid oklch(0.14 0.04 220)",
            }}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            {SidebarContent}
          </aside>
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header
          className="flex items-center justify-between px-3 md:px-6 py-3 shrink-0"
          style={{
            borderBottom: "1px solid oklch(0.12 0.04 220)",
            background: "oklch(0.07 0.025 220)",
          }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{
                background: "oklch(0.12 0.03 220)",
                border: "1px solid oklch(0.2 0.06 185)",
                color: "oklch(0.65 0.15 185)",
              }}
              data-ocid="chat.toggle"
            >
              <Menu size={16} />
            </button>

            <div
              className="hidden md:flex items-center shrink-0"
              style={{ width: 30, height: 39, overflow: "hidden" }}
            >
              <div
                style={{
                  transform: "scale(0.214)",
                  transformOrigin: "top left",
                  width: 140,
                  height: 180,
                }}
              >
                <RobotMascot isSpeaking={isSpeaking} />
              </div>
            </div>

            <h2
              className="font-medium text-xs md:text-sm truncate"
              style={{ color: "oklch(0.75 0.06 185)" }}
            >
              {activeConv ? activeConv.title : "New Conversation"}
            </h2>
          </div>

          <div className="flex items-center gap-1.5 md:gap-3 shrink-0">
            {/* Real AI indicator */}
            {usingRealAI && (
              <div
                className="hidden md:flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold"
                style={{
                  background: "oklch(0.15 0.08 145)",
                  border: "1px solid oklch(0.3 0.12 145)",
                  color: "oklch(0.7 0.18 145)",
                }}
              >
                <Zap size={10} /> Live AI
              </div>
            )}

            <button
              type="button"
              onClick={() =>
                setVoiceLang((l) => (l === "en-US" ? "hi-IN" : "en-US"))
              }
              className="h-7 px-2 rounded-lg text-xs font-semibold transition-colors"
              style={{
                background: "oklch(0.12 0.03 220)",
                border: "1px solid oklch(0.2 0.06 185)",
                color: "oklch(0.65 0.22 185)",
              }}
              title="Toggle voice language"
              data-ocid="chat.toggle"
            >
              {voiceLang === "en-US" ? "EN" : "HI"}
            </button>

            <button
              type="button"
              onClick={() => {
                if (ttsEnabled) {
                  window.speechSynthesis?.cancel();
                  setIsSpeaking(false);
                }
                setTtsEnabled((v) => !v);
              }}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              style={{
                background: "oklch(0.12 0.03 220)",
                border: "1px solid oklch(0.2 0.06 185)",
                color: ttsEnabled
                  ? "oklch(0.65 0.22 185)"
                  : "oklch(0.45 0.05 220)",
              }}
              title={ttsEnabled ? "Mute voice" : "Unmute voice"}
              data-ocid="chat.toggle"
            >
              {ttsEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
            </button>

            <Select value={model} onValueChange={setModel}>
              <SelectTrigger
                className="h-8 w-28 md:w-32 text-xs"
                style={{
                  background: "oklch(0.12 0.03 220)",
                  border: "1px solid oklch(0.2 0.06 185)",
                  color: "oklch(0.7 0.1 185)",
                }}
                data-ocid="chat.select"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="om-1">Om-1</SelectItem>
                <SelectItem value="om-2-pro">Om-2 Pro</SelectItem>
              </SelectContent>
            </Select>

            <button
              type="button"
              onClick={onToggleTheme}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              style={{
                background: "oklch(0.12 0.03 220)",
                border: "1px solid oklch(0.2 0.06 185)",
                color: "oklch(0.65 0.15 185)",
              }}
              data-ocid="chat.toggle"
            >
              {isDark ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          </div>
        </header>

        {/* Guest sign-up nudge banner */}
        {isGuest && !nudgeDismissed && (
          <div
            className="flex items-center justify-between px-4 py-2.5 text-sm shrink-0"
            style={{
              background: "oklch(0.12 0.06 185)",
              borderBottom: "1px solid oklch(0.22 0.1 185)",
            }}
            data-ocid="chat.panel"
          >
            <span
              className="text-xs md:text-sm"
              style={{ color: "oklch(0.82 0.1 185)" }}
            >
              Chatting as Guest.{" "}
              <button
                type="button"
                onClick={onSignUp}
                className="underline underline-offset-2 font-semibold transition-opacity hover:opacity-80"
                style={{ color: "oklch(0.65 0.22 185)" }}
              >
                Sign up
              </button>{" "}
              to save history.
            </span>
            <button
              type="button"
              onClick={() => setNudgeDismissed(true)}
              className="ml-4 shrink-0 transition-opacity hover:opacity-70"
              style={{ color: "oklch(0.55 0.08 185)" }}
              data-ocid="chat.close_button"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Messages area - using regular div with overflow-y-auto for reliable scroll */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto px-3 md:px-8 py-4 md:py-6"
          style={{ scrollBehavior: "smooth" }}
        >
          <div className="max-w-3xl mx-auto space-y-5 md:space-y-6">
            {msgsLoading ? (
              <div className="space-y-4" data-ocid="chat.loading_state">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-xl" />
                ))}
              </div>
            ) : messages.length === 0 ? (
              <div
                className="flex flex-col items-center gap-4 py-8 md:py-12"
                data-ocid="chat.empty_state"
              >
                <div className="scale-75 md:scale-90 origin-top">
                  <RobotMascot isSpeaking={isSpeaking} />
                </div>
                <div className="text-center">
                  <h3
                    className="font-display font-semibold text-lg md:text-xl mb-2"
                    style={{ color: "oklch(0.85 0.08 185)" }}
                  >
                    How can I help you today?
                  </h3>
                  <p className="text-muted-foreground text-xs md:text-sm">
                    Ask me anything — coding, GK, science, math, or just chat!
                  </p>
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <MessageBubble
                  key={
                    "id" in msg ? msg.id.toString() : (msg as LocalMessage).id
                  }
                  message={msg}
                  voiceLang={voiceLang}
                  ttsEnabled={ttsEnabled}
                />
              ))
            )}
            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} style={{ height: 1 }} />
          </div>
        </div>

        <div
          className="px-3 md:px-8 py-3 md:py-4 shrink-0"
          style={{ borderTop: "1px solid oklch(0.12 0.04 220)" }}
        >
          <div className="max-w-3xl mx-auto">
            <div
              className="relative rounded-2xl overflow-hidden"
              style={{
                background: "oklch(0.10 0.03 220)",
                border: "1px solid oklch(0.22 0.08 185)",
              }}
            >
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Om anything... (Shift+Enter for new line)"
                className="resize-none border-0 bg-transparent px-3 md:px-4 py-3.5 pr-24 text-sm focus-visible:ring-0 min-h-[52px] max-h-[160px] md:max-h-[200px]"
                style={{ color: "oklch(0.88 0.05 185)", fontSize: "16px" }}
                rows={1}
                data-ocid="chat.textarea"
              />
              <div className="absolute right-2 bottom-2.5 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onVoiceMode?.()}
                  className="h-8 w-8 rounded-xl flex items-center justify-center transition-all"
                  style={{
                    background: "oklch(0.15 0.04 220)",
                    color: "oklch(0.65 0.22 185)",
                    border: "1px solid oklch(0.25 0.08 185)",
                  }}
                  title="Voice Mode - Doraemon AI"
                  data-ocid="chat.toggle"
                >
                  <Headphones size={14} />
                </button>
                <button
                  type="button"
                  onClick={handleMicToggle}
                  className={`h-8 w-8 rounded-xl flex items-center justify-center transition-all ${
                    isRecording ? "mic-recording" : ""
                  }`}
                  style={{
                    background: isRecording
                      ? "oklch(0.65 0.2 15)"
                      : "oklch(0.15 0.04 220)",
                    color: isRecording
                      ? "oklch(0.98 0.01 0)"
                      : "oklch(0.65 0.22 185)",
                    border: isRecording
                      ? "1px solid oklch(0.55 0.2 15)"
                      : "1px solid oklch(0.25 0.08 185)",
                  }}
                  title={isRecording ? "Stop recording" : "Start voice input"}
                  data-ocid="chat.toggle"
                >
                  {isRecording ? <MicOff size={14} /> : <Mic size={14} />}
                </button>

                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  size="sm"
                  className="h-8 w-8 p-0 rounded-xl"
                  style={{
                    background:
                      input.trim() && !isTyping
                        ? "oklch(0.65 0.22 185)"
                        : "oklch(0.15 0.04 220)",
                    color:
                      input.trim() && !isTyping
                        ? "oklch(0.1 0.02 220)"
                        : "oklch(0.35 0.05 220)",
                  }}
                  data-ocid="chat.submit_button"
                >
                  {isTyping ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Send size={14} />
                  )}
                </Button>
              </div>
            </div>
            <p className="text-center text-xs mt-2 text-muted-foreground">
              Om can make mistakes. Verify important information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
