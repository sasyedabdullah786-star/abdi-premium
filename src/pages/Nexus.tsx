import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Trash2, Pencil, MessageSquare, Check, X, Sparkles, Menu } from 'lucide-react';
import Layout from '@/components/Layout';
import AIAssistant from '@/components/AIAssistant';
import {
  listSessions, createSession, deleteSession, renameSession,
  setActiveId, getActiveId, countArtifacts, NEXUS_EVENT,
  type NexusSession,
} from '@/lib/nexusStore';
import { useToast } from '@/hooks/use-toast';

function useSessions() {
  const [sessions, setSessions] = useState<NexusSession[]>(() => listSessions());
  const [activeId, setActive] = useState<string | null>(() => getActiveId());
  useEffect(() => {
    const refresh = () => { setSessions(listSessions()); setActive(getActiveId()); };
    window.addEventListener(NEXUS_EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(NEXUS_EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);
  return { sessions, activeId };
}

function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s/60)}m`;
  if (s < 86400) return `${Math.floor(s/3600)}h`;
  const d = Math.floor(s/86400);
  if (d < 30) return `${d}d`;
  return new Date(ts).toLocaleDateString();
}

const Nexus = () => {
  const { sessions, activeId } = useSessions();
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Ensure there is always an active session when landing here.
  useEffect(() => {
    if (sessions.length === 0) createSession('New chat');
    else if (!activeId) setActiveId(sessions[0].id);
  }, [sessions, activeId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sessions;
    return sessions.filter(s =>
      s.title.toLowerCase().includes(q) ||
      s.messages.some(m => m.content.toLowerCase().includes(q))
    );
  }, [sessions, query]);

  const handleNew = () => {
    createSession();
    setSidebarOpen(false);
    toast({ title: 'New chat started' });
  };

  const handleOpen = (id: string) => {
    setActiveId(id);
    setSidebarOpen(false);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this chat permanently?')) return;
    deleteSession(id);
  };

  const startRename = (s: NexusSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setRenamingId(s.id);
    setRenameValue(s.title);
  };

  const commitRename = () => {
    if (renamingId) renameSession(renamingId, renameValue);
    setRenamingId(null);
  };

  const Sidebar = (
    <div className="flex flex-col h-full bg-background/40">
      <div className="p-3 border-b border-border/30 space-y-2">
        <div className="flex items-center gap-2 px-1">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <div className="text-xs font-bold leading-tight">AB3D</div>
            <div className="text-[9px] font-mono text-muted-foreground">chat history</div>
          </div>
        </div>
        <button
          onClick={handleNew}
          className="w-full flex items-center justify-center gap-2 h-9 rounded-lg bg-gradient-to-br from-primary to-secondary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" /> New chat
        </button>
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search…"
            className="w-full pl-8 pr-3 h-8 rounded-lg bg-muted/30 border border-border/30 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filtered.length === 0 && (
          <div className="text-center text-xs text-muted-foreground py-10 px-4">
            {query ? 'No chats match.' : 'No chats yet.'}
          </div>
        )}
        {filtered.map(s => {
          const isActive = activeId === s.id;
          return (
            <div
              key={s.id}
              onClick={() => handleOpen(s.id)}
              className={`group rounded-lg px-2.5 py-2 cursor-pointer transition-colors border ${
                isActive ? 'bg-primary/10 border-primary/30' : 'border-transparent hover:bg-muted/40'
              }`}
            >
              <div className="flex items-start gap-2">
                <MessageSquare className="w-3.5 h-3.5 mt-0.5 text-muted-foreground shrink-0" />
                <div className="min-w-0 flex-1">
                  {renamingId === s.id ? (
                    <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                      <input
                        autoFocus
                        value={renameValue}
                        onChange={e => setRenameValue(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setRenamingId(null); }}
                        className="flex-1 min-w-0 text-xs h-6 px-1.5 rounded bg-background border border-border/50 focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <button onClick={commitRename} className="p-1 text-success"><Check className="w-3 h-3" /></button>
                      <button onClick={() => setRenamingId(null)} className="p-1 text-muted-foreground"><X className="w-3 h-3" /></button>
                    </div>
                  ) : (
                    <div className="text-xs font-medium truncate">{s.title}</div>
                  )}
                  <div className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                    <span>{timeAgo(s.updatedAt)}</span>
                    <span>·</span>
                    <span>{s.messages.length} msg</span>
                    {countArtifacts(s) > 0 && (<><span>·</span><span className="text-primary">{countArtifacts(s)} art</span></>)}
                  </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
                  <button onClick={(e) => startRename(s, e)} title="Rename" className="p-1 rounded hover:bg-muted text-muted-foreground"><Pencil className="w-3 h-3" /></button>
                  <button onClick={(e) => handleDelete(s.id, e)} title="Delete" className="p-1 rounded hover:bg-destructive/20 text-destructive"><Trash2 className="w-3 h-3" /></button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="p-3 border-t border-border/30 text-[10px] text-muted-foreground">
        {sessions.length} chat{sessions.length !== 1 ? 's' : ''} · saved on this device
      </div>
    </div>
  );

  return (
    <Layout showBack>
      <div className="container mx-auto px-3 sm:px-4 pt-4 pb-6">
        {/* Hero header */}
        <div className="mb-4 hidden lg:block">
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-border/40 bg-gradient-to-r from-primary/10 via-secondary/10 to-transparent px-5 py-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/30">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <div className="text-sm font-semibold leading-tight">AB3D</div>
                <div className="text-[11px] text-muted-foreground font-mono">save · resume · build with AI</div>
              </div>
            </div>
            <button onClick={handleNew} className="hidden sm:inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-gradient-to-br from-primary to-secondary text-primary-foreground text-xs font-medium hover:opacity-90">
              <Plus className="w-4 h-4" /> New chat
            </button>
          </div>
        </div>

        {/* Mobile toolbar */}
        <div className="flex items-center justify-between mb-3 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="flex items-center gap-2 h-9 px-3 rounded-lg border border-border/40 bg-muted/30 text-xs">
            <Menu className="w-4 h-4" /> Chats ({sessions.length})
          </button>
          <button onClick={handleNew} className="flex items-center gap-1.5 h-9 px-3 rounded-lg bg-gradient-to-br from-primary to-secondary text-primary-foreground text-xs font-medium">
            <Plus className="w-4 h-4" /> New
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4 h-[calc(100vh-12rem)] min-h-[560px]">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block glass-card rounded-2xl border border-border/40 overflow-hidden">
            {Sidebar}
          </aside>

          {/* Embedded chat */}
          <main className="h-full min-h-0">
            <AIAssistant open embedded onOpenChange={() => {}} key={activeId || 'empty'} />
          </main>
        </div>
      </div>

      {/* Mobile sidebar drawer */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-[70] flex animate-fade-in">
          <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-[85%] max-w-sm h-full bg-background border-r border-border/40 shadow-2xl animate-slide-in-left">
            <div className="absolute top-2 right-2 z-10">
              <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-md hover:bg-muted text-muted-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            {Sidebar}
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Nexus;
