import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, User, LogIn, UserPlus, KeyRound } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Auth = () => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (mode === 'forgot') {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      setLoading(false);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({
          title: "Check your email!",
          description: "We've sent a password reset link to " + email,
        });
        setMode('login');
      }
      return;
    }

    const { error } = mode === 'login'
      ? await signIn(email, password)
      : await signUp(email, password, fullName);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: mode === 'login' ? "Welcome back!" : "Account created!" });
      navigate("/");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="glass-card p-8 w-full max-w-md relative z-10 animate-fade-in">
        <Link to="/" className="font-display text-2xl font-bold gradient-text block text-center mb-8">
          ABD"I
        </Link>

        <h1 className="font-display text-xl font-bold text-center mb-6 flex items-center justify-center gap-2">
          {mode === 'login' && <><LogIn className="w-5 h-5" /> Sign In</>}
          {mode === 'signup' && <><UserPlus className="w-5 h-5" /> Create Account</>}
          {mode === 'forgot' && <><KeyRound className="w-5 h-5" /> Reset Password</>}
        </h1>

        {mode === 'forgot' && (
          <p className="text-sm text-muted-foreground text-center mb-6">
            Enter your email and we'll send you a reset link.
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input-glass pl-10"
                  placeholder="Your name"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-glass pl-10"
                placeholder="your@email.com"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">Password</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-xs text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="input-glass pl-10"
                  placeholder="••••••••"
                />
              </div>
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-gradient w-full flex items-center justify-center gap-2">
            {loading ? "Please wait..." : mode === 'login' ? <><LogIn className="w-4 h-4" /> Sign In</>
              : mode === 'signup' ? <><UserPlus className="w-4 h-4" /> Sign Up</>
              : <><KeyRound className="w-4 h-4" /> Send Reset Link</>}
          </button>
        </form>

        <div className="text-center mt-6 text-muted-foreground text-sm space-y-2">
          {mode === 'login' && (
            <p>
              Don't have an account?{" "}
              <button onClick={() => setMode('signup')} className="text-primary hover:underline">Sign Up</button>
            </p>
          )}
          {mode === 'signup' && (
            <p>
              Already have an account?{" "}
              <button onClick={() => setMode('login')} className="text-primary hover:underline">Sign In</button>
            </p>
          )}
          {mode === 'forgot' && (
            <p>
              Remember your password?{" "}
              <button onClick={() => setMode('login')} className="text-primary hover:underline">Back to Sign In</button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
