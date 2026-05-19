import { useEffect, useMemo, useState } from 'react';
import { Sparkles, Plus, Search, Trash2, Pencil, MessageSquare, MonitorPlay, Check, X, Eye, Code2, ExternalLink } from 'lucide-react';
import Layout from '@/components/Layout';
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
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  const d = Math.floor(s/86400);
  if (d < 30) return `${d}d ago`;
  return new Date(ts).toLocaleDateString();
}

const Nexus = () => {
  const { sessions, activeId } = useSessions();
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(activeId);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [artifactPreview, setArtifactPreview] = useState<{ html: string; tab: 'preview' | 'code' } | null>(null);

  useEffect(() => {
    if (!selectedId && sessions[0]) setSelectedId(sessions[0].id);
  }, [sessions, selectedId]);

  const selected = useMemo(
    () => sessions.find(s => s.id === selectedId) ?? null,
    [sessions, selectedId]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sessions;
    return sessions.filter(s =>
      s.title.toLowerCase().includes(q) ||
      s.messages.some(m => m.content.toLowerCase().includes(q))
    );
  }, [sessions, query]);

  const stats = useMemo(() => {
    const totalMsgs = sessions.reduce((n, s) => n + s.messages.length, 0);
    const totalArtifacts = sessions.reduce((n, s) => n + countArtifacts(s), 0);
    return { chats: sessions.length, msgs: totalMsgs, artifacts: totalArtifacts };
  }, [sessions]);

  const openInChat = (id: string) => {
    setActiveId(id);
    // Defer opening the assistant so storage event syncs first.
    setTimeout(() => window.dispatchEvent(new CustomEvent('abdi-open-assistant')), 50);
    toast({ title: 'Chat opened', description: 'ABD\'I assistant is loading this session.' });
  };

  const handleNew = () => {
    const s = createSession();
    setSelectedId(s.id);
    toast({ title: 'New chat created', description: 'Open it to start building.' });
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this chat permanently?')) return;
    deleteSession(id);
    if (selectedId === id) setSelectedId(null);
  };

  const startRename = (s: NexusSession) => {
    setRenamingId(s.id);
    setRenameValue(s.title);
  };

  const commitRename = () => {
    if (renamingId) renameSession(renamingId, renameValue);
    setRenamingId(null);
  };

  const artifacts = useMemo(() => {
    if (!selected) return [];
    return selected.messages
      .map((m, i) => (m.artifact ? { idx: i, html: m.artifact, preview: m.content.slice(0, 80) } : null))
      .filter(Boolean) as { idx: number; html: string; preview: string }[];
  }, [selected]);

  return (
    <Layout showBack title="ABD'I Nexus">
      <div className="container mx-auto px-4 pt-4 pb-16">
        <p className="text-sm text-muted-foreground max-w-2xl">
          Your private workspace for every ABD'I NEXUS-∞ conversation and live artifact. Chats are saved locally on this device.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mt-5 max-w-md">
          {[
            { label: 'Chats', value: stats.chats },
            { label: 'Messages', value: stats.msgs },
            { label: 'Artifacts', value: stats.artifacts },
          ].map(s => (
            <div key={s.label} className="glass-card rounded-xl px-3 py-2.5 border border-border/40">
              <div className="text-lg font-semibold leading-tight">{s.value}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5 mt-6">
          {/* Sidebar — sessions list */}
          <aside className="glass-card rounded-2xl border border-border/40 overflow-hidden flex flex-col h-[70vh] min-h-[480px]">
            <div className="p-3 border-b border-border/30 space-y-2">
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
                  placeholder="Search chats…"
                  className="w-full pl-8 pr-3 h-8 rounded-lg bg-muted/30 border border-border/30 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {filtered.length === 0 && (
                <div className="text-center text-xs text-muted-foreground py-10 px-4">
                  {query ? 'No chats match.' : 'No chats yet. Start your first one.'}
                </div>
              )}
              {filtered.map(s => {
                const isSel = selectedId === s.id;
                const isActive = activeId === s.id;
                return (
                  <div
                    key={s.id}
                    onClick={() => setSelectedId(s.id)}
                    className={`group rounded-lg px-2.5 py-2 cursor-pointer transition-colors border ${
                      isSel ? 'bg-primary/10 border-primary/30' : 'border-transparent hover:bg-muted/40'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <MessageSquare className="w-3.5 h-3.5 mt-0.5 text-muted-foreground shrink-0" />
                      <div className="min-w-0 flex-1">
                        {renamingId === s.id ? (
                          <div className="flex items-center gap-1">
                            <input
                              autoFocus
                              value={renameValue}
                              onChange={e => setRenameValue(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setRenamingId(null); }}
                              onClick={e => e.stopPropagation()}
                              className="flex-1 min-w-0 text-xs h-6 px-1.5 rounded bg-background border border-border/50 focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                            <button onClick={(e) => { e.stopPropagation(); commitRename(); }} className="p-1 text-success"><Check className="w-3 h-3" /></button>
                            <button onClick={(e) => { e.stopPropagation(); setRenamingId(null); }} className="p-1 text-muted-foreground"><X className="w-3 h-3" /></button>
                          </div>
                        ) : (
                          <div className="text-xs font-medium truncate flex items-center gap-1.5">
                            {s.title}
                            {isActive && <span className="text-[8px] font-mono px-1 py-0.5 rounded-full bg-success/15 text-success border border-success/30">ACTIVE</span>}
                          </div>
                        )}
                        <div className="text-[10px] text-muted-foreground flex items-center gap-2 mt-0.5">
                          <span>{timeAgo(s.updatedAt)}</span>
                          <span>·</span>
                          <span>{s.messages.length} msg</span>
                          {countArtifacts(s) > 0 && (<><span>·</span><span className="text-primary">{countArtifacts(s)} art</span></>)}
                        </div>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); startRename(s); }} title="Rename" className="p-1 rounded hover:bg-muted text-muted-foreground"><Pencil className="w-3 h-3" /></button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(s.id); }} title="Delete" className="p-1 rounded hover:bg-destructive/20 text-destructive"><Trash2 className="w-3 h-3" /></button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>

          {/* Detail */}
          <section className="glass-card rounded-2xl border border-border/40 overflow-hidden flex flex-col h-[70vh] min-h-[480px]">
            {!selected ? (
              <div className="flex flex-col items-center justify-center flex-1 text-center px-6 text-muted-foreground">
                <Sparkles className="w-10 h-10 mb-3 text-primary/60" />
                <div className="text-sm">Select a chat to preview its messages and artifacts.</div>
                <button onClick={handleNew} className="mt-4 text-xs px-3 py-1.5 rounded-md bg-primary text-primary-foreground">Start a new chat</button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between gap-3 p-4 border-b border-border/30 bg-gradient-to-r from-primary/5 to-secondary/5">
                  <div className="min-w-0">
                    <div className="text-base font-semibold truncate">{selected.title}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {selected.messages.length} messages · {countArtifacts(selected)} artifacts · updated {timeAgo(selected.updatedAt)}
                    </div>
                  </div>
                  <button
                    onClick={() => openInChat(selected.id)}
                    className="shrink-0 text-xs px-3 py-1.5 rounded-md bg-gradient-to-br from-primary to-secondary text-primary-foreground font-medium hover:opacity-90"
                  >
                    Open in ABD'I
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {selected.messages.length === 0 && (
                    <div className="text-xs text-muted-foreground text-center py-10">No messages yet. Open this chat to start.</div>
                  )}
                  {selected.messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed whitespace-pre-wrap ${
                        m.role === 'user'
                          ? 'bg-gradient-to-br from-primary to-secondary text-primary-foreground'
                          : 'bg-muted/40 text-foreground'
                      }`}>
                        {m.content || <span className="opacity-60">…</span>}
                        {m.artifact && (
                          <button
                            onClick={() => setArtifactPreview({ html: m.artifact!, tab: 'preview' })}
                            className="mt-2 flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-md bg-background/60 border border-border/40 text-foreground hover:bg-background"
                          >
                            <MonitorPlay className="w-3 h-3 text-primary" /> View artifact
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Artifact gallery */}
                {artifacts.length > 0 && (
                  <div className="border-t border-border/30 p-3 bg-muted/10">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 font-semibold">Artifacts in this chat</div>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {artifacts.map(a => (
                        <button
                          key={a.idx}
                          onClick={() => setArtifactPreview({ html: a.html, tab: 'preview' })}
                          className="shrink-0 w-44 text-left rounded-lg border border-border/40 bg-background/60 hover:border-primary/50 p-2 transition-colors"
                        >
                          <div className="flex items-center gap-1 text-[10px] text-primary font-mono mb-1">
                            <MonitorPlay className="w-3 h-3" /> Artifact #{a.idx + 1}
                          </div>
                          <div className="text-[11px] line-clamp-2 text-muted-foreground">{a.preview || 'Live preview ready'}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </div>

      {/* Artifact modal */}
      {artifactPreview && (
        <ArtifactModal
          html={artifactPreview.html}
          tab={artifactPreview.tab}
          setTab={(t) => setArtifactPreview(p => p ? { ...p, tab: t } : p)}
          onClose={() => setArtifactPreview(null)}
        />
      )}
    </Layout>
  );
};

function ArtifactModal({
  html, tab, setTab, onClose,
}: {
  html: string;
  tab: 'preview' | 'code';
  setTab: (t: 'preview' | 'code') => void;
  onClose: () => void;
}) {
  const openNew = () => {
    const blob = new Blob([html], { type: 'text/html' });
    window.open(URL.createObjectURL(blob), '_blank');
  };
  return (
    <div className="fixed inset-0 z-[80] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="w-[min(1100px,100%)] h-[min(80vh,800px)] glass-card rounded-2xl border border-border/50 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 border-b border-border/30 bg-gradient-to-r from-primary/10 to-secondary/10">
          <div className="flex items-center gap-2 text-xs font-semibold"><Sparkles className="w-4 h-4 text-primary" /> Artifact preview</div>
          <div className="flex items-center gap-1">
            <div className="flex rounded-md overflow-hidden border border-border/40">
              <button onClick={() => setTab('preview')} className={`px-2 py-1 text-[11px] flex items-center gap-1 ${tab==='preview' ? 'bg-primary text-primary-foreground' : 'bg-muted/30 text-muted-foreground'}`}><Eye className="w-3 h-3"/> Preview</button>
              <button onClick={() => setTab('code')} className={`px-2 py-1 text-[11px] flex items-center gap-1 ${tab==='code' ? 'bg-primary text-primary-foreground' : 'bg-muted/30 text-muted-foreground'}`}><Code2 className="w-3 h-3"/> Code</button>
            </div>
            <button onClick={openNew} title="Open in new tab" className="p-1.5 rounded-md hover:bg-muted/50 text-muted-foreground"><ExternalLink className="w-3.5 h-3.5" /></button>
            <button onClick={onClose} className="p-1.5 rounded-md hover:bg-muted/50 text-muted-foreground"><X className="w-3.5 h-3.5" /></button>
          </div>
        </div>
        {tab === 'preview' ? (
          <iframe
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            srcDoc={html}
            className="flex-1 w-full border-0 bg-white"
            title="Artifact"
          />
        ) : (
          <pre className="flex-1 m-0 p-3 overflow-auto bg-[#0d1117] text-[#e6edf3] text-[11px] font-mono whitespace-pre-wrap">{html}</pre>
        )}
      </div>
    </div>
  );
}

export default Nexus;
