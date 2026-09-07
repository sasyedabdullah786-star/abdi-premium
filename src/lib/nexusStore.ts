// Lightweight multi-session store for ABD'I NEXUS chats.
// Persists to localStorage. Each session = a separate chat/project.

export type NexusMsg = {
  role: 'user' | 'assistant';
  content: string;
  artifact?: string | null;
};

export type NexusSession = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: NexusMsg[];
};

const SESSIONS_KEY = 'abdi-nexus-sessions-v1';
const ACTIVE_KEY = 'abdi-nexus-active-v1';
const LEGACY_KEY = 'abdi-ai-chat-history-v2';

export const NEXUS_EVENT = 'abdi-nexus-change';

function emit() {
  try { window.dispatchEvent(new Event(NEXUS_EVENT)); } catch {}
}

function uid() {
  return `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function listSessions(): NexusSession[] {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return arr.sort((a, b) => b.updatedAt - a.updatedAt);
    }
    // One-time migration from legacy single-session storage.
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      const msgs = JSON.parse(legacy);
      if (Array.isArray(msgs) && msgs.length > 1) {
        const s: NexusSession = {
          id: uid(),
          title: deriveTitle(msgs),
          createdAt: Date.now(),
          updatedAt: Date.now(),
          messages: msgs,
        };
        localStorage.setItem(SESSIONS_KEY, JSON.stringify([s]));
        localStorage.setItem(ACTIVE_KEY, s.id);
        return [s];
      }
    }
  } catch {}
  return [];
}

function writeAll(sessions: NexusSession[]) {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions.slice(0, 200)));
  emit();
}

export function getActiveId(): string | null {
  return localStorage.getItem(ACTIVE_KEY);
}

export function setActiveId(id: string | null) {
  if (id) localStorage.setItem(ACTIVE_KEY, id);
  else localStorage.removeItem(ACTIVE_KEY);
  emit();
}

export function getSession(id: string): NexusSession | null {
  return listSessions().find(s => s.id === id) ?? null;
}

export function getActiveSession(): NexusSession | null {
  const id = getActiveId();
  if (!id) return null;
  return getSession(id);
}

export function createSession(title?: string): NexusSession {
  const s: NexusSession = {
    id: uid(),
    title: title?.trim() || 'New chat',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    messages: [],
  };
  const all = listSessions();
  all.unshift(s);
  writeAll(all);
  setActiveId(s.id);
  return s;
}

export function updateSession(id: string, patch: Partial<NexusSession>) {
  const all = listSessions();
  const i = all.findIndex(s => s.id === id);
  if (i === -1) return;
  all[i] = { ...all[i], ...patch, updatedAt: Date.now() };
  writeAll(all);
}

export function saveMessages(id: string, messages: NexusMsg[]) {
  const all = listSessions();
  const i = all.findIndex(s => s.id === id);
  if (i === -1) return;

  const currentMsgs = all[i].messages || [];
  if (currentMsgs.length === messages.length) {
    const isSame = currentMsgs.every(
      (m, idx) =>
        m.role === messages[idx]?.role &&
        m.content === messages[idx]?.content &&
        m.artifact === messages[idx]?.artifact
    );
    if (isSame) return;
  }

  const next = { ...all[i], messages: messages.slice(-100), updatedAt: Date.now() };
  // Auto-derive title from first user message if still default.
  if ((!all[i].title || all[i].title === 'New chat') && messages.length) {
    next.title = deriveTitle(messages);
  }
  all[i] = next;
  writeAll(all);
}

export function deleteSession(id: string) {
  const all = listSessions().filter(s => s.id !== id);
  writeAll(all);
  if (getActiveId() === id) setActiveId(all[0]?.id ?? null);
}

export function renameSession(id: string, title: string) {
  updateSession(id, { title: title.trim() || 'Untitled' });
}

export function clearAllSessions() {
  localStorage.removeItem(SESSIONS_KEY);
  localStorage.removeItem(ACTIVE_KEY);
  emit();
}

function deriveTitle(messages: NexusMsg[]): string {
  const firstUser = messages.find(m => m.role === 'user');
  const raw = (firstUser?.content || messages[0]?.content || 'New chat').trim();
  return raw.length > 60 ? raw.slice(0, 57) + '…' : raw;
}

export function countArtifacts(s: NexusSession): number {
  return s.messages.filter(m => m.artifact).length;
}
