import { Button } from "@/components/ui/button";
import { LogIn, ShieldCheck, UserCheck, UserPlus } from "lucide-react";
import { RobotMascot } from "../components/RobotMascot";

interface LandingPageProps {
  onLogin: () => void;
  onSignup: () => void;
  onAdminLogin: () => void;
  onGuestContinue: () => void;
}

export function LandingPage({
  onLogin,
  onSignup,
  onAdminLogin,
  onGuestContinue,
}: LandingPageProps) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden grid-bg"
      style={{ background: "oklch(0.06 0.02 220)" }}
    >
      {/* Ambient glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, oklch(0.65 0.22 185 / 0.08) 0%, transparent 70%)",
        }}
      />

      {/* Logo */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2">
        <span
          className="text-3xl font-display font-bold tracking-tight"
          style={{ color: "oklch(0.88 0.15 185)" }}
        >
          Om<span style={{ color: "oklch(0.65 0.22 185)" }}>.ai</span>
        </span>
      </div>

      {/* Main content */}
      <div
        className="relative z-10 flex flex-col items-center gap-8 px-6 text-center"
        style={{
          animation: "fadeSlideUp 0.5s ease forwards",
        }}
      >
        <RobotMascot />

        <div className="space-y-3">
          <h1
            className="text-5xl md:text-6xl font-display font-bold tracking-tight leading-none"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.95 0.05 185), oklch(0.7 0.22 185))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Your AI,
            <br />
            Your Way.
          </h1>
          <p className="text-lg text-muted-foreground max-w-sm">
            Code, create, and explore with Om — an intelligent assistant built
            for humans.
          </p>
        </div>

        {/* Button stack */}
        <div className="flex flex-col gap-3 w-full max-w-sm">
          {/* Login - primary */}
          <Button
            onClick={onLogin}
            className="w-full h-12 font-semibold gap-2 text-base transition-transform hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: "oklch(0.65 0.22 185)",
              color: "oklch(0.1 0.02 220)",
            }}
            data-ocid="landing.primary_button"
          >
            <LogIn size={18} /> Login
          </Button>

          {/* Sign Up - secondary outlined */}
          <Button
            onClick={onSignup}
            variant="outline"
            className="w-full h-12 font-semibold gap-2 text-base transition-transform hover:scale-[1.02] active:scale-[0.98]"
            style={{
              border: "1px solid oklch(0.35 0.12 185)",
              color: "oklch(0.75 0.18 185)",
              background: "transparent",
            }}
            data-ocid="landing.secondary_button"
          >
            <UserPlus size={18} /> Sign Up
          </Button>

          {/* Continue as Guest - emerald tint */}
          <Button
            onClick={onGuestContinue}
            variant="outline"
            className="w-full h-11 font-semibold gap-2 text-sm transition-transform hover:scale-[1.02] active:scale-[0.98]"
            style={{
              border: "1px solid oklch(0.38 0.12 150)",
              color: "oklch(0.7 0.18 150)",
              background: "oklch(0.10 0.025 150 / 0.4)",
            }}
            data-ocid="landing.guest.button"
          >
            <UserCheck size={16} /> Continue as Guest
          </Button>

          {/* Admin Login - subtle dark */}
          <Button
            onClick={onAdminLogin}
            variant="outline"
            className="w-full h-10 font-medium gap-2 text-xs transition-transform hover:scale-[1.02] active:scale-[0.98]"
            style={{
              border: "1px solid oklch(0.25 0.06 260)",
              color: "oklch(0.5 0.08 260)",
              background: "oklch(0.14 0.03 260)",
            }}
            data-ocid="landing.admin.button"
          >
            <ShieldCheck size={14} /> Admin Login
          </Button>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
        <span
          className="text-xs font-mono px-3 py-1 rounded-full"
          style={{
            background: "oklch(0.12 0.03 220)",
            border: "1px solid oklch(0.2 0.05 185)",
            color: "oklch(0.4 0.08 185)",
          }}
        >
          Om-2 Pro · v2.1.0
        </span>
      </div>
    </div>
  );
}
