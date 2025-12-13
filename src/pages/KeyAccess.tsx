import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Key, Unlock, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const KeyAccess = () => {
  const [key, setKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Simulate loading
    setTimeout(() => {
      const trimmedKey = key.trim().toUpperCase();

      switch (trimmedKey) {
        case "NT-ACCESS":
          toast({
            title: "Access Granted!",
            description: "Redirecting to Next Toppers...",
          });
          navigate("/nexttoppers");
          break;
        case "PA-ACCESS":
          toast({
            title: "Access Granted!",
            description: "Redirecting to Padhle Akshay...",
          });
          navigate("/padhleakshay");
          break;
        case "PW-ACCESS":
          toast({
            title: "Access Granted!",
            description: "Redirecting to Physics Wallah...",
          });
          navigate("/physicswallah");
          break;
        default:
          setError("Invalid access key. Please try again.");
          toast({
            title: "Access Denied",
            description: "The key you entered is invalid.",
            variant: "destructive",
          });
      }
      setIsLoading(false);
    }, 800);
  };

  return (
    <Layout showBack title="ABD&quot;I">
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-100px)]">
        <div className="w-full max-w-md">
          <div className="glass-card p-8 opacity-0 animate-fade-in">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="icon-gradient w-fit mx-auto mb-4">
                <Key className="w-12 h-12 text-primary" />
              </div>
              <h1 className="font-display text-3xl font-bold gradient-text mb-2">
                Key Access
              </h1>
              <p className="text-muted-foreground">
                Enter your access key to unlock premium content
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="key" className="block text-sm font-medium text-foreground mb-2">
                  Access Key
                </label>
                <input
                  type="text"
                  id="key"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder="Enter your access key..."
                  className="input-glass"
                  required
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-destructive text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !key.trim()}
                className="btn-gradient w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="animate-pulse">Verifying...</span>
                ) : (
                  <>
                    <Unlock className="w-5 h-5" />
                    Unlock Access
                  </>
                )}
              </button>
            </form>

            {/* Hints */}
            <div className="mt-8 pt-6 border-t border-border/50">
              <p className="text-xs text-muted-foreground text-center">
                Available keys: NT-ACCESS, PA-ACCESS, PW-ACCESS
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default KeyAccess;
