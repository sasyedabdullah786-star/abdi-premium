import { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Loader2, RotateCcw, MessageCircleQuestion } from 'lucide-react';
// supabase imported indirectly via env-derived fetch
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useToast } from '@/hooks/use-toast';

type Msg = { role: 'user' | 'assistant'; content: string };

interface Props {
  courseTitle?: string;
  lessonTitle?: string;
  lessonNotes?: string | null;
}

const DoubtSolver = ({ courseTitle, lessonTitle, lessonNotes }: Props) => {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  // Reset when lesson changes
  useEffect(() => { setMessages([]); }, [lessonTitle]);

  const ask = async (q?: string) => {
    const question = (q ?? input).trim();
    if (!question || loading) return;
    setInput('');
    const next: Msg[] = [...messages, { role: 'user', content: question }];
    setMessages(next);
    setLoading(true);
    try {
      const lessonCtx = `\n\nLESSON CONTEXT — Course: ${courseTitle || 'N/A'} | Lesson: ${lessonTitle || 'N/A'}.${
        lessonNotes ? ` Notes excerpt: ${lessonNotes.slice(0, 1200)}` : ''
      }\nAnswer briefly with markdown, bold key terms, and end with a one-line "Try this:" prompt.`;

      const url = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/ai-chat`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [
            ...next.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: lessonCtx },
          ],
        }),
      });
      if (!res.ok || !res.body) {
        const txt = await res.text().catch(() => '');
        throw new Error(txt || `Request failed (${res.status})`);
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';
      let assistant = '';
      setMessages(m => [...m, { role: 'assistant', content: '' }]);
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop() || '';
        for (const line of lines) {
          const l = line.trim();
          if (!l.startsWith('data:')) continue;
          const data = l.slice(5).trim();
          if (data === '[DONE]') continue;
          try {
            const j = JSON.parse(data);
            const delta = j.choices?.[0]?.delta?.content || '';
            if (delta) {
              assistant += delta;
              setMessages(m => {
                const copy = [...m];
                copy[copy.length - 1] = { role: 'assistant', content: assistant };
                return copy;
              });
            }
          } catch {}
        }
      }
      if (!assistant.trim()) throw new Error('Empty response');
    } catch (e: any) {
      toast({ title: 'Doubt Solver failed', description: e?.message || 'Try again.', variant: 'destructive' });
      setMessages(m => m.filter(x => x.role === 'user' || x.content.trim()));
    } finally {
      setLoading(false);
    }
  };

  const starters = [
    'Explain this concept like I\'m 12',
    'Give me a real-world example',
    'What\'s the most common mistake here?',
    'Quick recap in 3 bullets',
  ];

  return (
    <div className="glass-card overflow-hidden flex flex-col h-[500px]">
      <div className="px-4 py-3 border-b border-border/40 flex items-center justify-between bg-gradient-to-r from-primary/10 to-transparent">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <div className="text-sm font-semibold">Doubt Solver</div>
            <div className="text-[10px] text-muted-foreground">Ask anything about this lesson</div>
          </div>
        </div>
        {messages.length > 0 && (
          <button onClick={() => setMessages([])} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground gap-3 py-6">
            <MessageCircleQuestion className="w-8 h-8 text-primary/60" />
            <p className="text-xs max-w-xs">Stuck on something in this video? Ask the AI tutor — it has context about this exact lesson.</p>
            <div className="flex flex-wrap gap-1.5 justify-center max-w-sm">
              {starters.map(s => (
                <button key={s} onClick={() => ask(s)} className="text-[11px] px-2.5 py-1 rounded-full border border-border/50 hover:border-primary/60 hover:bg-primary/5 transition-colors">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
              m.role === 'user'
                ? 'bg-gradient-to-br from-primary to-secondary text-primary-foreground'
                : 'bg-muted/50 border border-border/40'
            }`}>
              {m.role === 'assistant' ? (
                <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                </div>
              ) : (
                <p className="whitespace-pre-wrap">{m.content}</p>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-muted/50 border border-border/40 rounded-xl px-3 py-2 flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="w-3 h-3 animate-spin" /> Thinking…
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="p-3 border-t border-border/40">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); ask(); } }}
            placeholder="Ask a doubt…"
            className="flex-1 h-9 px-3 rounded-lg bg-muted/30 border border-border/40 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            disabled={loading}
          />
          <button
            onClick={() => ask()}
            disabled={loading || !input.trim()}
            className="h-9 px-3 rounded-lg bg-gradient-to-br from-primary to-secondary text-primary-foreground disabled:opacity-50 flex items-center gap-1.5 text-sm"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoubtSolver;
