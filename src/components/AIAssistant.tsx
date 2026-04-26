import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, Loader2, Mic } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type Msg = { role: 'user' | 'assistant'; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

const AIAssistant = ({ open, onOpenChange }: Props) => {
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'assistant', content: "👋 Hi! I'm your ABD\"I AI tutor. Ask me anything about courses, learning paths, or how to get started!" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

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
      setInput(text);
      setListening(false);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    rec.start();
  };

  const send = async () => {
    const text = input.trim();
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
        body: JSON.stringify({ messages: next }),
      });

      if (resp.status === 429) {
        toast({ title: 'Slow down', description: 'Too many requests. Try again in a moment.', variant: 'destructive' });
        setLoading(false);
        return;
      }
      if (resp.status === 402) {
        toast({ title: 'AI credits exhausted', description: 'Please contact support.', variant: 'destructive' });
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

  if (!open) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[60] w-[380px] max-w-[calc(100vw-2rem)] h-[560px] max-h-[calc(100vh-6rem)] glass-card flex flex-col rounded-2xl overflow-hidden animate-scale-in border border-border/50 shadow-2xl">
      <div className="flex items-center justify-between p-4 border-b border-border/30 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">AI Assistant</h3>
            <p className="text-xs text-muted-foreground">Powered by Lovable AI</p>
          </div>
        </div>
        <button onClick={() => onOpenChange(false)} className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
            <div className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm whitespace-pre-wrap ${
              m.role === 'user'
                ? 'bg-gradient-to-br from-primary to-secondary text-primary-foreground rounded-br-md'
                : 'bg-muted/50 text-foreground rounded-bl-md'
            }`}>
              {m.content || (loading ? <Loader2 className="w-4 h-4 animate-spin" /> : '...')}
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-border/30 flex gap-2">
        <button
          type="button"
          onClick={startVoice}
          className={`p-2.5 rounded-xl transition-all ${listening ? 'bg-destructive/20 text-destructive animate-pulse' : 'hover:bg-muted/50 text-muted-foreground'}`}
          aria-label="Voice input"
        >
          <Mic className="w-4 h-4" />
        </button>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder={listening ? 'Listening...' : 'Ask anything...'}
          disabled={loading}
          className="flex-1 bg-muted/30 border border-border/30 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
        />
        <button
          onClick={send}
          disabled={!input.trim() || loading}
          className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-secondary text-primary-foreground disabled:opacity-50 hover:scale-105 transition-transform"
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
    className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-primary via-secondary to-accent shadow-2xl flex items-center justify-center hover:scale-110 transition-all duration-300 group"
  >
    <MessageSquare className="w-6 h-6 text-primary-foreground group-hover:rotate-12 transition-transform" />
    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-secondary blur-xl opacity-50 group-hover:opacity-75 -z-10" />
    <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-ping" />
  </button>
);

export default AIAssistant;
