import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Code2, Eye, Download, ArrowLeft, Loader2, ExternalLink } from "lucide-react";

interface Published {
  id: string;
  slug: string;
  title: string;
  html: string;
  source_url: string | null;
  view_count: number;
  created_at: string;
}

const NexusPublic = () => {
  const { slug } = useParams<{ slug: string }>();
  const [item, setItem] = useState<Published | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"preview" | "code">("preview");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    (async () => {
      if (!slug) return;
      setLoading(true);
      const { data } = await supabase.from("nexus_published").select("*").eq("slug", slug).maybeSingle();
      setItem((data as any) ?? null);
      setLoading(false);
      if (data) {
        // best-effort view count bump
        supabase.from("nexus_published").update({ view_count: ((data as any).view_count || 0) + 1 }).eq("id", (data as any).id).then(() => {});
        document.title = `${(data as any).title} — ABD'I Nexus`;
      }
    })();
  }, [slug]);

  useEffect(() => {
    if (tab === "preview" && item && iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc) { doc.open(); doc.write(item.html); doc.close(); }
    }
  }, [tab, item]);

  const download = () => {
    if (!item) return;
    const blob = new Blob([item.html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${item.slug}.html`; a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading published artifact…
      </div>
    );
  }
  if (!item) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center gap-3">
        <div className="text-2xl font-semibold">Not found</div>
        <p className="text-muted-foreground text-sm">This Nexus artifact may have been deleted or the link is wrong.</p>
        <Link to="/nexus" className="btn-gradient inline-flex items-center gap-2"><ArrowLeft className="w-4 h-4" /> Back to Nexus</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border/40 bg-gradient-to-r from-primary/10 via-secondary/10 to-transparent">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate">{item.title}</div>
              <div className="text-[11px] text-muted-foreground font-mono">ABD'I Nexus · {item.view_count.toLocaleString()} views</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-md overflow-hidden border border-border/40">
              <button onClick={() => setTab("preview")} className={`px-3 py-1.5 text-xs flex items-center gap-1 ${tab === "preview" ? "bg-primary text-primary-foreground" : "bg-muted/30"}`}>
                <Eye className="w-3.5 h-3.5" /> Preview
              </button>
              <button onClick={() => setTab("code")} className={`px-3 py-1.5 text-xs flex items-center gap-1 ${tab === "code" ? "bg-primary text-primary-foreground" : "bg-muted/30"}`}>
                <Code2 className="w-3.5 h-3.5" /> Code
              </button>
            </div>
            <button onClick={download} className="btn-outline text-xs inline-flex items-center gap-1">
              <Download className="w-3.5 h-3.5" /> Download
            </button>
            <Link to="/nexus" className="btn-ghost text-xs hidden sm:inline-flex items-center gap-1">
              <ExternalLink className="w-3.5 h-3.5" /> Open Nexus
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {tab === "preview" ? (
          <iframe ref={iframeRef} sandbox="allow-scripts allow-same-origin allow-forms allow-popups" className="w-full h-[calc(100vh-58px)] border-0 bg-white" title={item.title} />
        ) : (
          <pre className="m-0 p-4 overflow-auto bg-[#0d1117] text-[#e6edf3] text-xs leading-relaxed font-mono whitespace-pre-wrap break-words h-[calc(100vh-58px)]">{item.html}</pre>
        )}
      </main>
    </div>
  );
};

export default NexusPublic;
