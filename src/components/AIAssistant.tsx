import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, Loader2, Mic, Copy, Check, Trash2, Maximize2, Minimize2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useToast } from '@/hooks/use-toast';

type Msg = { role: 'user' | 'assistant'; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;
const STORAGE_KEY = 'abdi-ai-chat-history';

const SUGGESTIONS = [
  '✨ Recommend a course for me',
  '🗺️ Build me a learning path',
  '📝 Quiz me on a topic',
  '💻 Help me debug code',
  '⏰ Make a study schedule',
];

const WELCOME: Msg = {
  role: 'assistant',
  content: `👋 **Hey! I'm your ABD"I Assistant.**

I know every course on this platform and I'm here to help you learn faster. Try asking:

- *"What course should I take to learn web development?"*
- *"Build me a 4-week study plan"*
- *"Explain recursion with an example"*
- *"Quiz me on JavaScript basics"*

What would you like to do?`,
};

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

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
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  // persist chat
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-50)));
    } catch {}
  }, [messages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const startVoice = () => {
    const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      toast({ title: 'Voice not supported', description: 'Try Chrome or Edge browser.', variant: 'destructive' });
      return;
    }
    const rec = new SR();
    rec.lang = 'en-US';
    rec.interimResults = false;
    setListening(true);
    rec.onresult = (e: any) => {
      const text = e.results[0][0].transcript;
      setInput(prev => (prev ? prev + ' ' : '') + text);
      setListening(false);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    rec.start();
  };

  const clearChat = () => {
    setMessages([WELCOME]);
    localStorage.removeItem(STORAGE_KEY);
    toast({ title: 'Chat cleared', description: 'Starting fresh!' });
  };

  const copyMessage = async (text: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 1500);
    } catch {
      toast({ title: 'Copy failed', variant: 'destructive' });
    }
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
        body: JSON.stringify({ messages: next.slice(-20) }),
      });

      if (resp.status === 429) {
        toast({ title: 'Slow down', description: 'Too many requests. Try again in a moment.', variant: 'destructive' });
        setLoading(false);
        return;
      }
      if (resp.status === 402) {
        toast({ title: 'AI credits exhausted', description: 'Please contact the admin to top up.', variant: 'destructive' });
        setLoading(false);
        return;
      }
      if (!resp.ok || !resp.body) throw new Error('Stream failed');

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';
      let assistantSoFar = '';
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      let done = false;
      while (!done) {
        const { value, done: d } = await reader.read();
        if (d) break;
        buf += decoder.decode(value, { stream: true });
        let idx;
        while ((idx = buf.indexOf('\n')) !== -1) {
          let line = buf.slice(0, idx);
          buf = buf.slice(idx + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (!line.startsWith('data: ')) continue;
          const json = line.slice(6).trim();
          if (json === '[DONE]') { done = true; break; }
          try {
            const parsed = JSON.parse(json);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assistantSoFar += delta;
              setMessages(prev => {
                const copy = [...prev];
                copy[copy.length - 1] = { role: 'assistant', content: assistantSoFar };
                return copy;
              });
            }
          } catch {
            buf = line + '\n' + buf;
            break;
          }
        }
      }
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Could not reach AI. Try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!open) return null;

  const sizeClasses = expanded
    ? 'w-[min(720px,calc(100vw-2rem))] h-[min(800px,calc(100vh-3rem))]'
    : 'w-[380px] max-w-[calc(100vw-2rem)] h-[560px] max-h-[calc(100vh-6rem)]';

  const showSuggestions = messages.length <= 1 && !loading;

  return (
    <div className={`fixed bottom-6 right-6 z-[60] ${sizeClasses} glass-card flex flex-col rounded-2xl overflow-hidden animate-scale-in border border-border/50 shadow-2xl`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/30 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-sm truncate">ABD"I Assistant</h3>
            <p className="text-xs text-muted-foreground truncate">
              {loading ? 'Thinking...' : 'Online • Knows your courses'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={clearChat}
            title="Clear chat"
            className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors text-muted-foreground"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setExpanded(e => !e)}
            title={expanded ? 'Shrink' : 'Expand'}
            className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors text-muted-foreground"
          >
            {expanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button onClick={() => onOpenChange(false)} className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in group`}>
            <div className={`max-w-[88%] relative ${m.role === 'user' ? 'order-2' : ''}`}>
              <div className={`px-3.5 py-2.5 rounded-2xl text-sm ${
                m.role === 'user'
                  ? 'bg-gradient-to-br from-primary to-secondary text-primary-foreground rounded-br-md'
                  : 'bg-muted/50 text-foreground rounded-bl-md'
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
              {m.role === 'assistant' && m.content && (
                <button
                  onClick={() => copyMessage(m.content, i)}
                  className="absolute -bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md bg-background/90 border border-border/50 shadow-sm"
                  title="Copy"
                >
                  {copiedIdx === i ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                </button>
              )}
            </div>
          </div>
        ))}

        {showSuggestions && (
          <div className="flex flex-wrap gap-2 pt-2 animate-fade-in">
            {SUGGESTIONS.map(s => (
              <button
                key={s}
                onClick={() => sendMessage(s.replace(/^\S+\s/, ''))}
                className="text-xs px-3 py-1.5 rounded-full bg-muted/40 hover:bg-muted/70 border border-border/30 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border/30 flex gap-2 items-end">
        <button
          type="button"
          onClick={startVoice}
          className={`p-2.5 rounded-xl transition-all shrink-0 ${listening ? 'bg-destructive/20 text-destructive animate-pulse' : 'hover:bg-muted/50 text-muted-foreground'}`}
          aria-label="Voice input"
          title="Voice input"
        >
          <Mic className="w-4 h-4" />
        </button>
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          rows={1}
          placeholder={listening ? 'Listening...' : 'Ask anything... (Shift+Enter for new line)'}
          disabled={loading}
          className="flex-1 resize-none bg-muted/30 border border-border/30 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 max-h-32"
          style={{ minHeight: '40px' }}
        />
        <button
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
          className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-secondary text-primary-foreground disabled:opacity-50 hover:scale-105 transition-transform shrink-0"
          title="Send"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>
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
    <span className="hidden sm:inline">Ask AI</span>
  </button>
);

export default AIAssistant;
