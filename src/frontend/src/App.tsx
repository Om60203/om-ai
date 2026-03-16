import { Toaster } from "@/components/ui/sonner";
import { useEffect, useState } from "react";
import { LoginModal, SignupModal } from "./components/AuthModals";
import { SunoOmOverlay } from "./components/SunoOmOverlay";
import { useWakeWord } from "./hooks/useWakeWord";
import { AdminLogin } from "./pages/AdminLogin";
import { AdminPanel } from "./pages/AdminPanel";
import { ChatPage } from "./pages/ChatPage";
import { LandingPage } from "./pages/LandingPage";
import { VoiceModePage } from "./pages/VoiceModePage";

type View = "landing" | "chat" | "admin-login" | "admin-panel" | "voice-mode";

const GUEST_SESSION_KEY = "om_guest_session_id";

function getOrCreateGuestSessionId(): string {
  let id = localStorage.getItem(GUEST_SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(GUEST_SESSION_KEY, id);
  }
  return id;
}

export default function App() {
  const [view, setView] = useState<View>("landing");
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [guestSessionId, setGuestSessionId] = useState("");

  // Wake word only active on chat page, not on landing/login/signup/admin pages
  const wakeWordEnabled = view === "chat";
  const { isTriggered, setIsTriggered } = useWakeWord(wakeWordEnabled);

  useEffect(() => {
    setGuestSessionId(getOrCreateGuestSessionId());
  }, []);

  const handleLoginSuccess = () => {
    setShowLogin(false);
    setIsGuest(false);
    setView("chat");
  };
  const handleSignupSuccess = () => {
    setShowSignup(false);
    setIsGuest(false);
    setView("chat");
  };
  const handleAdminSuccess = () => {
    setView("admin-panel");
  };
  const handleLogout = () => {
    setIsGuest(false);
    setView("landing");
  };
  const handleGuestContinue = () => {
    setIsGuest(true);
    setView("chat");
  };
  const handleGuestSignUp = () => {
    setShowSignup(true);
  };

  const toggleTheme = () => {
    setIsDark((d) => !d);
    document.documentElement.classList.toggle("light");
  };

  return (
    <div className={isDark ? "" : "light"}>
      {view === "landing" && (
        <LandingPage
          onLogin={() => setShowLogin(true)}
          onSignup={() => setShowSignup(true)}
          onAdminLogin={() => setView("admin-login")}
          onGuestContinue={handleGuestContinue}
        />
      )}
      {view === "chat" && (
        <ChatPage
          onLogout={handleLogout}
          isDark={isDark}
          onToggleTheme={toggleTheme}
          isGuest={isGuest}
          guestSessionId={guestSessionId}
          onSignUp={handleGuestSignUp}
          onVoiceMode={() => setView("voice-mode")}
        />
      )}
      {view === "admin-login" && (
        <AdminLogin
          onSuccess={handleAdminSuccess}
          onBack={() => setView("landing")}
        />
      )}
      {view === "admin-panel" && <AdminPanel onLogout={handleLogout} />}
      {view === "voice-mode" && (
        <VoiceModePage onBack={() => setView("chat")} />
      )}

      <LoginModal
        open={showLogin}
        onClose={() => setShowLogin(false)}
        onSuccess={handleLoginSuccess}
        onSwitchToSignup={() => {
          setShowLogin(false);
          setShowSignup(true);
        }}
      />
      <SignupModal
        open={showSignup}
        onClose={() => setShowSignup(false)}
        onSuccess={handleSignupSuccess}
        onSwitchToLogin={() => {
          setShowSignup(false);
          setShowLogin(true);
        }}
      />

      {/* Small bottom overlay when "Suno Om" is detected -- no visible button anywhere */}
      {isTriggered && <SunoOmOverlay onClose={() => setIsTriggered(false)} />}

      <Toaster position="top-right" />
    </div>
  );
}
