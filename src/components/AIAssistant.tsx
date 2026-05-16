import { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, Loader2, Mic, Copy, Check, Trash2, Maximize2, Minimize2, Code2, Eye, MonitorPlay, Wrench, Search, Bug, Bot, ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useToast } from '@/hooks/use-toast';

type Msg = { role: 'user' | 'assistant'; content: string; artifact?: string | null };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;
const STORAGE_KEY = 'abdi-ai-chat-history-v2';

const TOOLS = [
  { icon: Wrench,     label: 'ModelForge',     hint: 'Design a new AI model architecture and explain it' },
  { icon: Bug,        label: 'BugOracle',      hint: 'Run BugOracle: review my last code snippet for bugs' },
  { icon: MonitorPlay, label: 'PreviewSynth',  hint: 'Build a stunning UI component with a live preview artifact' },
  { icon: Search,     label: 'ResearchWeaver', hint: 'Research a topic and summarize the key findings' },
  { icon: Bot,        label: 'AutoAgent',      hint: 'Deploy AutoAgent: build a complete mini-app as an artifact' },
];

const STARTERS = [
  'Build a beautiful dashboard UI',
  'Recommend a course for me',
  'Quiz me on JavaScript basics',
  'Design a pricing page component',
  'Make a 4-week study plan',
  'Create a real-time clock widget',
];

const WELCOME: Msg = {
  role: 'assistant',
  content: `**ABD'I NEXUS-∞ — online and armed.** ⚡

I'm your master AI: zero bugs, always tested, never says no. Ask me to **build any UI** and I'll render it live in the side pane — or use me as a tutor, coder, researcher, designer.

Try a starter below, or command me directly.

⚡ ABD'I STATUS: All systems ready.`,
  artifact: null,
};

function parseArtifact(raw: string): { text: string; artifact: string | null } {
  const m = raw.match(/```artifact\s*([\s\S]*?)```/);
  if (!m) return { text: raw, artifact: null };
  return {
    text: raw.replace(/```artifact\s*[\s\S]*?```/, '').trim(),
    artifact: m[1].trim(),
  };
}

function ArtifactPane({ artifact, onClose }: { artifact: string; onClose: () => void }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [tab, setTab] = useState<'preview' | 'code'>('preview');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (tab === 'preview' && iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc) { doc.open(); doc.write(artifact); doc.close(); }
    }
  }, [artifact, tab]);

  const copyAll = async () => {
    await navigator.clipboard.writeText(artifact);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const openInNewTab = () => {
    const blob = new Blob([artifact], { type: 'text/html' });
    window.open(URL.createObjectURL(blob), '_blank');
  };

  return (
    <div className="flex flex-col h-full border-l border-border/30 bg-background/95">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/30 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="flex items-center gap-2 min-w-0">
          <Sparkles className="w-4 h-4 text-primary shrink-0" />
          <span className="text-xs font-semibold truncate">ABD'I Output</span>
          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-success/15 text-success border border-success/30">LIVE</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="flex rounded-md overflow-hidden border border-border/40">
            <button onClick={() => setTab('preview')} className={`px-2 py-1 text-[11px] font-medium flex items-center gap-1 transition-colors ${tab==='preview' ? 'bg-primary text-primary-foreground' : 'bg-muted/30 text-muted-foreground hover:bg-muted/50'}`}>
              <Eye className="w-3 h-3" /> Preview
            </button>
            <button onClick={() => setTab('code')} className={`px-2 py-1 text-[11px] font-medium flex items-center gap-1 transition-colors ${tab==='code' ? 'bg-primary text-primary-foreground' : 'bg-muted/30 text-muted-foreground hover:bg-muted/50'}`}>
              <Code2 className="w-3 h-3" /> Code
            </button>
          </div>
          <button onClick={copyAll} title="Copy HTML" className="p-1.5 rounded-md hover:bg-muted/50 text-muted-foreground">
            {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button onClick={openInNewTab} title="Open in new tab" className="p-1.5 rounded-md hover:bg-muted/50 text-muted-foreground">
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
          <button onClick={onClose} title="Close" className="p-1.5 rounded-md hover:bg-muted/50 text-muted-foreground">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      {tab === 'preview' ? (
        <iframe
          ref={iframeRef}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          className="flex-1 w-full border-0 bg-white"
          title="ABD'I Artifact Preview"
        />
      ) : (
        <pre className="flex-1 m-0 p-3 overflow-auto bg-[#0d1117] text-[#e6edf3] text-[11px] leading-relaxed font-mono whitespace-pre-wrap break-words">
          {artifact}
        </pre>
      )}
    </div>
  );
}

interface Props { open: boolean; onOpenChange: (o: boolean) => void; }

const AIAssistant = ({ open, onOpenChange }: Props) => {
  const [messages, setMessages] = useState<Msg[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [WELCOME];
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [openArtifact, setOpenArtifact] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-50))); } catch {}
  }, [messages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 100); }, [open]);

  const startVoice = () => {
    const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { toast({ title: 'Voice not supported', description: 'Try Chrome or Edge.', variant: 'destructive' }); return; }
    const rec = new SR(); rec.lang = 'en-US'; rec.interimResults = false; setListening(true);
    rec.onresult = (e: any) => { setInput(prev => (prev ? prev + ' ' : '') + e.results[0][0].transcript); setListening(false); };
    rec.onerror = () => setListening(false); rec.onend = () => setListening(false); rec.start();
  };

  const clearChat = () => {
    setMessages([WELCOME]); setOpenArtifact(null);
    localStorage.removeItem(STORAGE_KEY);
    toast({ title: 'Chat cleared', description: 'Fresh canvas.' });
  };

  const copyMessage = async (text: string, idx: number) => {
    try { await navigator.clipboard.writeText(text); setCopiedIdx(idx); setTimeout(() => setCopiedIdx(null), 1500); }
    catch { toast({ title: 'Copy failed', variant: 'destructive' }); }
  };

  const sendMessage = async (textOverride?: string) => {
    const text = (textOverride ?? input).trim();
    if (!text || loading) return;
    const userMsg: Msg = { role: 'user', content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput('');
    setLoading(true);

    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: next.slice(-20).map(m => ({ role: m.role, content: m.content })) }),
      });

      if (resp.status === 429) { toast({ title: 'Slow down', description: 'Try again in a moment.', variant: 'destructive' }); setLoading(false); return; }
      if (resp.status === 402) { toast({ title: 'AI credits exhausted', description: 'Contact the admin to top up.', variant: 'destructive' }); setLoading(false); return; }
      if (!resp.ok || !resp.body) throw new Error('Stream failed');

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = '', soFar = '';
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      let done = false;
      while (!done) {
        const { value, done: d } = await reader.read();
        if (d) break;
        buf += decoder.decode(value, { stream: true });
        let idx;
        while ((idx = buf.indexOf('\n')) !== -1) {
          let line = buf.slice(0, idx); buf = buf.slice(idx + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (!line.startsWith('data: ')) continue;
          const json = line.slice(6).trim();
          if (json === '[DONE]') { done = true; break; }
          try {
            const delta = JSON.parse(json).choices?.[0]?.delta?.content;
            if (delta) {
              soFar += delta;
              const { text: txt, artifact } = parseArtifact(soFar);
              setMessages(prev => {
                const copy = [...prev];
                copy[copy.length - 1] = { role: 'assistant', content: txt || soFar, artifact };
                return copy;
              });
            }
          } catch { buf = line + '\n' + buf; break; }
        }
      }

      // After stream completes, auto-open artifact
      const final = parseArtifact(soFar);
      if (final.artifact) {
        setOpenArtifact(final.artifact);
        if (!expanded) setExpanded(true);
      }
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Could not reach AI. Retry.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  if (!open) return null;

  const wide = expanded || !!openArtifact;
  const sizeClasses = wide
    ? 'w-[min(1100px,calc(100vw-2rem))] h-[min(820px,calc(100vh-3rem))]'
    : 'w-[400px] max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-6rem)]';

  const showStarters = messages.length <= 1 && !loading;

  return (
    <div className={`fixed bottom-6 right-6 z-[60] ${sizeClasses} glass-card flex rounded-2xl overflow-hidden animate-scale-in border border-border/50 shadow-2xl`}>
      {/* LEFT: Chat */}
      <div className="flex flex-col flex-1 min-w-0" style={{ width: openArtifact ? '44%' : '100%' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-border/30 bg-gradient-to-r from-primary/10 to-secondary/10 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-sm leading-tight truncate">ABD'I <span className="text-[10px] font-mono text-muted-foreground">NEXUS-∞</span></div>
              <div className="text-[10px] text-muted-foreground truncate">{loading ? 'thinking…' : 'Master AI · Zero bugs · Live preview'}</div>
            </div>
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            <button onClick={clearChat} title="Clear chat" className="p-1.5 rounded-md hover:bg-muted/50 text-muted-foreground"><Trash2 className="w-3.5 h-3.5" /></button>
            <button onClick={() => setExpanded(e => !e)} title={wide ? 'Shrink' : 'Expand'} className="p-1.5 rounded-md hover:bg-muted/50 text-muted-foreground">
              {wide ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
            <button onClick={() => onOpenChange(false)} className="p-1.5 rounded-md hover:bg-muted/50 text-muted-foreground"><X className="w-3.5 h-3.5" /></button>
          </div>
        </div>

        {/* Tool chips */}
        <div className="flex gap-1.5 px-3 py-2 border-b border-border/20 overflow-x-auto shrink-0 scrollbar-thin">
          {TOOLS.map(t => (
            <button key={t.label} onClick={() => sendMessage(t.hint)} disabled={loading}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/30 hover:bg-primary/10 hover:text-primary border border-border/30 text-[11px] font-mono whitespace-nowrap transition-colors disabled:opacity-50">
              <t.icon className="w-3 h-3" /> {t.label}
            </button>
          ))}
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in group`}>
              <div className={`max-w-[90%] relative ${m.role === 'user' ? 'order-2' : ''}`}>
                <div className={`px-3.5 py-2.5 rounded-2xl text-sm ${
                  m.role === 'user'
                    ? 'bg-gradient-to-br from-primary to-secondary text-primary-foreground rounded-br-md'
                    : 'bg-muted/40 text-foreground rounded-bl-md'
                }`}>
                  {m.content ? (
                    m.role === 'assistant' ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1.5 prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0.5 prose-headings:mt-2 prose-headings:mb-1 prose-pre:my-2 prose-pre:bg-background/60 prose-pre:text-xs prose-code:text-xs prose-code:bg-background/60 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <span className="whitespace-pre-wrap">{m.content}</span>
                    )
                  ) : (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                </div>

                {m.role === 'assistant' && m.artifact && (
                  <button onClick={() => setOpenArtifact(m.artifact!)}
                    className="mt-2 w-full flex items-center gap-2 px-3 py-2 rounded-xl border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors text-left">
                    <MonitorPlay className="w-4 h-4 text-primary shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold">Open live preview</div>
                      <div className="text-[10px] text-muted-foreground">Interactive artifact · Preview + Code</div>
                    </div>
                    <span className="ml-auto text-primary text-sm">→</span>
                  </button>
                )}

                {m.role === 'assistant' && m.content && (
                  <button onClick={() => copyMessage(m.content, i)}
                    className="absolute -bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md bg-background/90 border border-border/50 shadow-sm" title="Copy">
                    {copiedIdx === i ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
                  </button>
                )}
              </div>
            </div>
          ))}

          {showStarters && (
            <div className="flex flex-wrap gap-2 pt-2 animate-fade-in">
              {STARTERS.map(s => (
                <button key={s} onClick={() => sendMessage(s)}
                  className="text-xs px-3 py-1.5 rounded-full bg-muted/40 hover:bg-muted/70 border border-border/30 transition-colors">
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-3 border-t border-border/30 flex gap-2 items-end shrink-0">
          <button type="button" onClick={startVoice}
            className={`p-2.5 rounded-xl transition-all shrink-0 ${listening ? 'bg-destructive/20 text-destructive animate-pulse' : 'hover:bg-muted/50 text-muted-foreground'}`}
            aria-label="Voice input">
            <Mic className="w-4 h-4" />
          </button>
          <textarea ref={inputRef} value={input}
            onChange={e => setInput(e.target.value)} onKeyDown={handleKey} rows={1}
            placeholder={listening ? 'Listening…' : "Command ABD'I — build anything…"}
            disabled={loading}
            className="flex-1 resize-none bg-muted/30 border border-border/30 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 max-h-32"
            style={{ minHeight: '40px' }} />
          <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
            className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-secondary text-primary-foreground disabled:opacity-50 hover:scale-105 transition-transform shrink-0">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* RIGHT: Artifact pane */}
      {openArtifact && (
        <div className="flex-1 min-w-0 animate-fade-in">
          <ArtifactPane artifact={openArtifact} onClose={() => setOpenArtifact(null)} />
        </div>
      )}
    </div>
  );
};

export const AIAssistantButton = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    aria-label="Open AI Assistant"
    className="fixed bottom-5 right-5 z-50 h-11 px-3.5 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center gap-2 text-sm font-medium hover:bg-primary/90 active:scale-95 transition-all duration-150 group border border-primary/40"
    style={{ boxShadow: "0 8px 24px -8px hsl(var(--primary) / 0.5), 0 0 0 1px hsl(var(--primary) / 0.4)" }}
  >
    <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
    <span className="hidden sm:inline">Ask ABD'I</span>
  </button>
);

export default AIAssistant;
