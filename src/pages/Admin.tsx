import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Shield, Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useSite } from "@/contexts/SiteContext";

const Admin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { settings } = useSite();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      toast({
        title: "Welcome, Admin!",
        description: "Login successful. Redirecting to dashboard...",
      });
      navigate("/dashboard");
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Back link */}
      <Link 
        to="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors z-10"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to {settings.navLabels.home}</span>
      </Link>

      {/* Login Card */}
      <div className="w-full max-w-md px-4 relative z-10">
        <div className="glass-card p-8 opacity-0 animate-fade-in">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="icon-gradient w-fit mx-auto mb-4 glow-effect">
              <Shield className="w-12 h-12 text-primary" />
            </div>
            <h1 className="font-display text-3xl font-bold gradient-text mb-2">
              Admin Portal
            </h1>
            <p className="text-muted-foreground">
              Sign in to manage {settings.institutionName}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@abdi.com"
                  className="input-glass pl-12"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-glass pl-12 pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-gradient w-full flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <span className="animate-pulse">Signing in...</span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              Demo mode - Any credentials will work
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
