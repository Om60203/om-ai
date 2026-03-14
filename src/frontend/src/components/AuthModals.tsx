import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onSwitchToSignup: () => void;
}

export function LoginModal({
  open,
  onClose,
  onSuccess,
  onSwitchToSignup,
}: LoginModalProps) {
  const { actor } = useActor();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor) {
      setError(
        "App abhi connect ho rahi hai, thoda wait karo aur dobara try karo.",
      );
      return;
    }
    setLoading(true);
    setError("");
    try {
      const ok = await actor.login(username, password);
      if (ok) {
        toast.success("Welcome back!");
        onSuccess();
      } else {
        setError("Username ya password galat hai. Dobara check karo.");
      }
    } catch {
      setError("Login fail hua. Thodi der baad try karo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-md"
        style={{
          background: "oklch(0.09 0.03 220)",
          border: "1px solid oklch(0.25 0.08 185)",
        }}
        data-ocid="login.dialog"
      >
        <DialogHeader>
          <DialogTitle
            className="text-2xl font-display text-center"
            style={{ color: "oklch(0.85 0.1 185)" }}
          >
            Welcome Back
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="login-username">Username</Label>
            <Input
              id="login-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Apna username daalo"
              required
              data-ocid="login.input"
              className="bg-muted border-border"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="login-password">Password</Label>
            <div className="relative">
              <Input
                id="login-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Apna password daalo"
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
              className="text-sm"
              style={{ color: "oklch(0.65 0.22 25)" }}
              data-ocid="login.error_state"
            >
              {error}
            </p>
          )}
          <Button
            type="submit"
            className="w-full font-semibold"
            disabled={loading}
            style={{
              background: "oklch(0.65 0.22 185)",
              color: "oklch(0.1 0.02 220)",
            }}
            data-ocid="login.submit_button"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Signing in..." : "Sign In"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Account nahi hai?{" "}
            <button
              type="button"
              onClick={onSwitchToSignup}
              className="font-medium hover:underline"
              style={{ color: "oklch(0.7 0.2 185)" }}
              data-ocid="login.link"
            >
              Sign Up karo
            </button>
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface SignupModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}

export function SignupModal({
  open,
  onClose,
  onSuccess,
  onSwitchToLogin,
}: SignupModalProps) {
  const { actor } = useActor();
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 4) {
      setError("Password kam se kam 4 characters ka hona chahiye.");
      return;
    }
    if (!actor) {
      setError(
        "App abhi connect ho rahi hai, thoda wait karo aur dobara try karo.",
      );
      return;
    }
    setLoading(true);
    setError("");
    try {
      const ok = await actor.signUp(username, password, email, displayName);
      if (ok) {
        toast.success("Account ban gaya! Om.ai mein welcome hai");
        onSuccess();
      } else {
        setError(
          "Yeh username already le liya gaya hai. Dusra username try karo.",
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("already taken")) {
        setError(
          "Yeh username already le liya gaya hai. Dusra username try karo.",
        );
      } else {
        setError("Sign up fail hua. Please dobara try karo.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-md"
        style={{
          background: "oklch(0.09 0.03 220)",
          border: "1px solid oklch(0.25 0.08 185)",
        }}
        data-ocid="signup.dialog"
      >
        <DialogHeader>
          <DialogTitle
            className="text-2xl font-display text-center"
            style={{ color: "oklch(0.85 0.1 185)" }}
          >
            Create Account
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 mt-2">
          <div className="space-y-2">
            <Label htmlFor="signup-name">Apna Naam</Label>
            <Input
              id="signup-name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Jaise: Om Awasthi"
              required
              className="bg-muted border-border"
              data-ocid="signup.input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-username">
              Username{" "}
              <span className="text-muted-foreground text-xs">
                (login ke liye use hoga)
              </span>
            </Label>
            <Input
              id="signup-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Jaise: om123"
              required
              className="bg-muted border-border"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-email">
              Email{" "}
              <span className="text-muted-foreground text-xs">
                (koi bhi, real nahi chahiye)
              </span>
            </Label>
            <Input
              id="signup-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Jaise: om@gmail.com"
              required
              className="bg-muted border-border"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-password">Password</Label>
            <div className="relative">
              <Input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Koi bhi password (min 4 characters)"
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
            <p className="text-xs text-muted-foreground">
              Sirf 4+ characters chahiye -- jaise: om12, 1234, abcd
            </p>
          </div>
          {error && (
            <p
              className="text-sm"
              style={{ color: "oklch(0.65 0.22 25)" }}
              data-ocid="signup.error_state"
            >
              {error}
            </p>
          )}
          <Button
            type="submit"
            className="w-full font-semibold"
            disabled={loading}
            style={{
              background: "oklch(0.65 0.22 185)",
              color: "oklch(0.1 0.02 220)",
            }}
            data-ocid="signup.submit_button"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Account ban raha hai..." : "Account Banao"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Pehle se account hai?{" "}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="font-medium hover:underline"
              style={{ color: "oklch(0.7 0.2 185)" }}
              data-ocid="signup.link"
            >
              Login karo
            </button>
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
