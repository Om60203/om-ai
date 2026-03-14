import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { useState } from "react";

interface AdminLoginProps {
  onSuccess: () => void;
  onBack: () => void;
}

export function AdminLogin({ onSuccess, onBack }: AdminLoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    await new Promise((r) => setTimeout(r, 600));
    if (username === "omawasthi07122006" && password === "7122006") {
      onSuccess();
    } else {
      setError("Invalid admin credentials.");
    }
    setLoading(false);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative grid-bg"
      style={{ background: "oklch(0.06 0.02 220)" }}
    >
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, oklch(0.5 0.15 30 / 0.1) 0%, transparent 70%)",
        }}
      />
      <div className="relative z-10 w-full max-w-md px-6">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-sm mb-8 transition-colors"
          style={{ color: "oklch(0.5 0.08 220)" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color =
              "oklch(0.75 0.18 185)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color =
              "oklch(0.5 0.08 220)";
          }}
          data-ocid="admin-login.secondary_button"
        >
          <ArrowLeft size={16} /> Back to Home
        </button>
        <div
          className="rounded-2xl p-8"
          style={{
            background: "oklch(0.09 0.03 220)",
            border: "1px solid oklch(0.25 0.08 30)",
          }}
        >
          <div className="flex flex-col items-center gap-3 mb-8">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{
                background: "oklch(0.15 0.05 30)",
                border: "1px solid oklch(0.3 0.1 30)",
              }}
            >
              <ShieldCheck size={28} style={{ color: "oklch(0.7 0.22 30)" }} />
            </div>
            <div className="text-center">
              <h1
                className="text-2xl font-display font-bold"
                style={{ color: "oklch(0.9 0.08 30)" }}
              >
                Admin Access
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Restricted area — authorized personnel only
              </p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-username">Admin Username</Label>
              <Input
                id="admin-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter admin username"
                required
                className="bg-muted border-border"
                data-ocid="admin-login.input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-password">Admin Password</Label>
              <div className="relative">
                <Input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  required
                  className="bg-muted border-border pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            {error && (
              <p
                className="text-sm text-destructive"
                data-ocid="admin-login.error_state"
              >
                {error}
              </p>
            )}
            <Button
              type="submit"
              className="w-full h-11 font-semibold"
              disabled={loading}
              style={{
                background: "oklch(0.6 0.18 30)",
                color: "oklch(0.98 0.01 30)",
              }}
              data-ocid="admin-login.submit_button"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Verifying..." : "Access Admin Panel"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
