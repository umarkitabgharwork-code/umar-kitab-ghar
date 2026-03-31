import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { getProfileRole } from "@/services/api";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [showModal, setShowModal] = useState(true);
  const [activeTab, setActiveTab] = useState("login");
  const [showPromo, setShowPromo] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // First visit popup
  useEffect(() => {
    if (!localStorage.getItem("promoShown")) {
      setShowPromo(true);
      localStorage.setItem("promoShown", "true");
    }
  }, []);

  const handleSignup = async () => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password;
    if (!trimmedEmail || !trimmedPassword || (activeTab === "signup" && trimmedPassword !== confirmPassword)) {
      toast({
        variant: "destructive",
        description: "All fields are required and passwords must match.",
      });
      return;
    }
    setIsSigningUp(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password: trimmedPassword,
      });
      if (error) {
        toast({
          variant: "destructive",
          description: error.message,
        });
        return;
      }
      toast({
        description: "Signup successful. Now login.",
      });
    } finally {
      setIsSigningUp(false);
    }
  };

  const handleLogin = async () => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password;
    if (!trimmedEmail || !trimmedPassword) {
      toast({
        variant: "destructive",
        description: "Email and password are required.",
      });
      return;
    }
    setIsLoggingIn(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: trimmedPassword,
      });
      if (error) {
        toast({
          variant: "destructive",
          description: error.message,
        });
        return;
      }
      const user = data.user;
      if (!user) {
        toast({
          variant: "destructive",
          description: "User not found.",
        });
        return;
      }
      const roleRes = await getProfileRole(user.id);
      if (!roleRes.success) {
        toast({
          variant: "destructive",
          description: "Error fetching role.",
        });
        return;
      }
      if (roleRes.data === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Modal UI
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      {/* First visit promo popup */}
      {showPromo && (
        <div className="fixed inset-0 flex items-center justify-center z-50 modal-blur">
          <div className="modal-bg p-8 max-w-md w-full relative">
            <button className="absolute top-3 right-3 gold-gradient rounded-full p-2" onClick={() => setShowPromo(false)}>
              ✕
            </button>
            <div className="premium-typography text-2xl mb-2">Unlock Exclusive Discounts</div>
            <div className="text-foreground mb-6">Create an account to receive special discounts and reward points.</div>
            <div className="flex gap-4">
              <button className="gold-gradient glossy px-6 py-2 rounded-lg font-semibold" onClick={() => { setShowPromo(false); setShowModal(true); setActiveTab("login"); }}>Login</button>
              <button className="gold-gradient glossy px-6 py-2 rounded-lg font-semibold" onClick={() => { setShowPromo(false); setShowModal(true); setActiveTab("signup"); }}>Create Account</button>
            </div>
          </div>
        </div>
      )}
      {/* Login/Signup Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 modal-blur">
          <div className="modal-bg p-8 max-w-md w-full relative">
            <button className="absolute top-3 right-3 gold-gradient rounded-full p-2" onClick={() => setShowModal(false)}>
              ✕
            </button>
            <div className="premium-typography text-2xl mb-6">Login to Your Account</div>
            <div className="flex mb-6 gap-2">
              <button className={"gold-gradient glossy px-4 py-2 rounded-lg font-semibold " + (activeTab === "login" ? "ring-2 ring-accent" : "")} onClick={() => setActiveTab("login")}>Login</button>
              <button className={"gold-gradient glossy px-4 py-2 rounded-lg font-semibold " + (activeTab === "signup" ? "ring-2 ring-accent" : "")} onClick={() => setActiveTab("signup")}>Signup</button>
            </div>
            <form onSubmit={e => { e.preventDefault(); activeTab === "login" ? handleLogin() : handleSignup(); }}>
              <input
                type="email"
                placeholder="Email"
                className="w-full mb-4 gold-border bg-background text-foreground px-4 py-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--gold-gradient] focus-visible:border-[--gold-gradient]"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={isLoggingIn || isSigningUp}
                autoComplete="email"
              />
              <div className="relative mb-4">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="w-full gold-border bg-background text-foreground px-4 py-3 pr-10 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--gold-gradient] focus-visible:border-[--gold-gradient]"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={isLoggingIn || isSigningUp}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {activeTab === "signup" && (
                <div className="relative mb-4">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm password"
                    className="w-full gold-border bg-background text-foreground px-4 py-3 pr-10 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--gold-gradient] focus-visible:border-[--gold-gradient]"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    disabled={isLoggingIn || isSigningUp}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              )}
              <button type="submit" className="gold-gradient glossy w-full py-3 rounded-lg font-semibold mt-2" disabled={isLoggingIn || isSigningUp}>
                {activeTab === "login" ? (isLoggingIn ? "Logging in..." : "Login") : (isSigningUp ? "Signing up..." : "Signup")}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}