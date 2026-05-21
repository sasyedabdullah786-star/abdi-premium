import { useState } from "react";
import { Loader2, X, Globe, Download, Copy, Check, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onClose: () => void;
  html: string;
  defaultTitle?: string;
}

function slugify(s: string) {
  return s.toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50) || "artifact";
}

const PublishDialog = ({ open, onClose, html, defaultTitle }: Props) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [title, setTitle] = useState(defaultTitle || "Untitled artifact");
  const [publishing, setPublishing] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const download = () => {
    const blob = new Blob([html], { type: "text/html" });
    const u = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = u; a.download = `${slugify(title)}.html`; a.click();
    URL.revokeObjectURL(u);
  };

  const publish = async () => {
    if (!user) {
      toast({ title: "Sign in required", description: "Log in to publish a public link.", variant: "destructive" });
      return;
    }
    setPublishing(true);
    try {
      const slug = `${slugify(title)}-${Math.random().toString(36).slice(2, 7)}`;
      const { data, error } = await supabase
        .from("nexus_published")
        .insert({ slug, title: title || "Untitled", html, created_by: user.id })
        .select()
        .single();
      if (error) throw error;
      const link = `${window.location.origin}/nexus/p/${(data as any).slug}`;
      setPublishedUrl(link);
      toast({ title: "Published", description: "Your artifact is live." });
    } catch (e: any) {
      toast({ title: "Publish failed", description: e?.message || "Try again.", variant: "destructive" });
    } finally {
      setPublishing(false);
    }
  };

  const copyLink = async () => {
    if (!publishedUrl) return;
    await navigator.clipboard.writeText(publishedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md glass-card rounded-2xl border border-border/50 p-5 shadow-2xl">
        <button onClick={onClose} className="absolute top-3 right-3 p-1.5 rounded-md hover:bg-muted/50 text-muted-foreground">
          <X className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Globe className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <div className="text-sm font-semibold">Publish artifact</div>
            <div className="text-[11px] text-muted-foreground">Share a public link or download the code</div>
          </div>
        </div>

        {!publishedUrl ? (
          <>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="input-glass text-sm w-full mb-4" />
            <div className="flex flex-col sm:flex-row gap-2">
              <button onClick={publish} disabled={publishing} className="btn-gradient flex-1 inline-flex items-center justify-center gap-2 disabled:opacity-50">
                {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                Publish shareable link
              </button>
              <button onClick={download} className="btn-outline inline-flex items-center justify-center gap-2">
                <Download className="w-4 h-4" /> Download .html
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-3">Public links are read-only and viewable by anyone with the URL.</p>
          </>
        ) : (
          <>
            <div className="rounded-lg border border-success/40 bg-success/5 p-3 mb-3">
              <div className="text-[10px] uppercase tracking-wider text-success mb-1">Live</div>
              <div className="text-xs font-mono break-all">{publishedUrl}</div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button onClick={copyLink} className="btn-gradient flex-1 inline-flex items-center justify-center gap-2">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied" : "Copy link"}
              </button>
              <a href={publishedUrl} target="_blank" rel="noreferrer" className="btn-outline inline-flex items-center justify-center gap-2">
                <ExternalLink className="w-4 h-4" /> Open
              </a>
              <button onClick={download} className="btn-outline inline-flex items-center justify-center gap-2">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PublishDialog;
