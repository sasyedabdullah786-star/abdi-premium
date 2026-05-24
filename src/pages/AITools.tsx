import { useState, useEffect, useMemo } from "react";
import Layout from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Wand2, Map, Brain, FileText, Sparkles, Loader2, Check, X, ChevronRight,
  RotateCcw, BookOpen, Clock, Target, Plus, Trash2, MessageSquare, Search,
  Rocket, Calendar, Users, Award, Quote, Compass, Mail, Menu, ImageIcon, Download, Upload,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Mode = "learning_path" | "quiz" | "summarize" | "nextgen" | "image";

interface PathWeek { week: number; focus: string; daily_minutes?: number; milestones: string[]; suggested_courses?: string[]; }
interface PathPlan {
  title: string;
  summary: string;
  weeks: PathWeek[];
  mastery_guide?: { pillars: string[]; deep_practice: string[]; milestones: string[]; mistakes_to_avoid?: string[]; };
  consistency_plan?: { daily_ritual: string[]; weekly_review?: string[]; anti_burnout?: string[]; accountability?: string[]; };
  networking_plan?: { communities: string[]; mentors?: string[]; people_to_follow: string[]; content_to_consume?: string[]; outreach_template?: string; };
}

interface QuizQuestion { question: string; options: string[]; correct_index: number; explanation: string; }
interface Quiz { topic: string; questions: QuizQuestion[]; }

interface NextGen {
  future_identity: string;
  day_in_life: string;
  inflection_points: { when: string; moment: string; why_it_mattered: string }[];
  signature_projects: string[];
  skills_unlocked: string[];
  mindset_shifts?: string[];
  wealth_impact?: string;
  letter_from_future: string;
  first_step_tomorrow: string;
}

interface HistoryItem {
  id: string;
  mode: Mode;
  title: string;
  createdAt: number;
  inputs: any;
  result: any;
}

const HISTORY_KEY = "abdi-ai-tools-history-v1";
const HISTORY_EVENT = "abdi-ai-tools-history-change";

const loadHistory = (): HistoryItem[] => {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); } catch { return []; }
};
const saveHistory = (h: HistoryItem[]) => {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(h.slice(0, 100)));
  window.dispatchEvent(new Event(HISTORY_EVENT));
};

const TOOLS: { id: Mode; icon: any; title: string; desc: string; accent: string }[] = [
  { id: "learning_path", icon: Map, title: "Learning Path", desc: "Week-by-week plan + mastery, consistency & networking strategy.", accent: "from-primary/30 to-secondary/30" },
  { id: "quiz", icon: Brain, title: "Quiz Generator", desc: "Instant MCQ quizzes with explanations.", accent: "from-secondary/30 to-primary/30" },
  { id: "summarize", icon: FileText, title: "Notes Summarizer", desc: "TL;DR + key concepts + flashcards.", accent: "from-primary/30 to-emerald-500/30" },
  { id: "nextgen", icon: Rocket, title: "NextGen — Future-You", desc: "Time-machine simulation of who you become in 5 years.", accent: "from-fuchsia-500/30 to-primary/30" },
  { id: "image", icon: ImageIcon, title: "Image Studio", desc: "Generate or edit images with AI (Nano Banana).", accent: "from-amber-500/30 to-fuchsia-500/30" },
];

const AITools = () => {
  const { toast } = useToast();
  const [mode, setMode] = useState<Mode>("learning_path");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>(() => loadHistory());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [query, setQuery] = useState("");

  // shared inputs
  const [goal, setGoal] = useState("Become a confident frontend developer");
  const [weeks, setWeeks] = useState(4);
  const [difficulty, setDifficulty] = useState("beginner");
  const [quizInput, setQuizInput] = useState("");
  const [numQ, setNumQ] = useState(5);
  const [sumInput, setSumInput] = useState("");
  const [nextgenInput, setNextgenInput] = useState("Become an AI-native product builder");
  const [imagePrompt, setImagePrompt] = useState("A futuristic classroom with glowing holograms, cinematic lighting");
  const [imageSource, setImageSource] = useState<string | null>(null);

  // outputs
  const [path, setPath] = useState<PathPlan | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [summary, setSummary] = useState("");
  const [nextgen, setNextgen] = useState<NextGen | null>(null);
  const [images, setImages] = useState<string[]>([]);

  // quiz state
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const onChange = () => setHistory(loadHistory());
    window.addEventListener(HISTORY_EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(HISTORY_EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const filteredHistory = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = history.slice().sort((a, b) => b.createdAt - a.createdAt);
    if (q) list = list.filter(h => h.title.toLowerCase().includes(q) || h.mode.includes(q));
    return list;
  }, [history, query]);

  const resetOutput = () => {
    setPath(null); setQuiz(null); setSummary(""); setNextgen(null); setImages([]);
    setAnswers({}); setSubmitted(false);
  };

  const pushHistory = (item: HistoryItem) => {
    const next = [item, ...history.filter(h => h.id !== item.id)];
    setHistory(next); saveHistory(next);
  };

  const run = async () => {
    setLoading(true); resetOutput();
    try {
      const body: any = { mode, difficulty };
      let title = "";
      let inputs: any = {};
      if (mode === "learning_path") { body.goal = goal; body.weeks = weeks; title = goal; inputs = { goal, weeks, difficulty }; }
      else if (mode === "quiz") { body.input = quizInput; body.num_questions = numQ; title = quizInput.slice(0, 60); inputs = { quizInput, numQ, difficulty }; }
      else if (mode === "summarize") { body.input = sumInput; title = sumInput.slice(0, 60); inputs = { sumInput }; }
      else if (mode === "nextgen") { body.input = nextgenInput; title = nextgenInput; inputs = { nextgenInput, difficulty }; }

      const { data, error } = await supabase.functions.invoke("ai-tools", { body });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);

      let result: any;
      if (mode === "summarize") { result = (data as any).content || ""; setSummary(result); }
      else if (mode === "learning_path") { result = (data as any).data; setPath(result); }
      else if (mode === "quiz") { result = (data as any).data; setQuiz(result); }
      else if (mode === "nextgen") { result = (data as any).data; setNextgen(result); }

      pushHistory({
        id: `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
        mode, title: title || "Untitled", createdAt: Date.now(), inputs, result,
      });
    } catch (e: any) {
      toast({ title: "AI request failed", description: e?.message || "Try again in a moment.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const openHistory = (h: HistoryItem) => {
    resetOutput();
    setMode(h.mode);
    if (h.mode === "learning_path") { setGoal(h.inputs.goal ?? ""); setWeeks(h.inputs.weeks ?? 4); setDifficulty(h.inputs.difficulty ?? "beginner"); setPath(h.result); }
    else if (h.mode === "quiz") { setQuizInput(h.inputs.quizInput ?? ""); setNumQ(h.inputs.numQ ?? 5); setDifficulty(h.inputs.difficulty ?? "beginner"); setQuiz(h.result); }
    else if (h.mode === "summarize") { setSumInput(h.inputs.sumInput ?? ""); setSummary(h.result); }
    else if (h.mode === "nextgen") { setNextgenInput(h.inputs.nextgenInput ?? ""); setDifficulty(h.inputs.difficulty ?? "beginner"); setNextgen(h.result); }
    setSidebarOpen(false);
  };

  const deleteHistory = (id: string) => {
    if (!confirm("Delete this item?")) return;
    const next = history.filter(h => h.id !== id);
    setHistory(next); saveHistory(next);
  };

  const clearAll = () => {
    if (!confirm("Clear all AI tool history?")) return;
    setHistory([]); saveHistory([]);
  };

  const score = quiz ? quiz.questions.reduce((acc, q, i) => acc + (answers[i] === q.correct_index ? 1 : 0), 0) : 0;

  const modeMeta = TOOLS.find(t => t.id === mode)!;

  // --- Sidebar ---
  const Sidebar = (
    <div className="flex flex-col h-full bg-background/40">
      <div className="p-3 border-b border-border/30 space-y-2">
        <div className="flex items-center gap-2 px-1">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <div className="text-xs font-bold leading-tight">AI Tools</div>
            <div className="text-[9px] font-mono text-muted-foreground">history</div>
          </div>
        </div>
        <button
          onClick={() => { resetOutput(); setSidebarOpen(false); }}
          className="w-full flex items-center justify-center gap-2 h-9 rounded-lg bg-gradient-to-br from-primary to-secondary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" /> New generation
        </button>
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search…" className="w-full pl-8 pr-3 h-8 rounded-lg bg-muted/30 border border-border/30 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40" />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredHistory.length === 0 && (
          <div className="text-center text-xs text-muted-foreground py-10 px-4">
            {query ? "No matches." : "Your generations will appear here."}
          </div>
        )}
        {filteredHistory.map(h => {
          const tool = TOOLS.find(t => t.id === h.mode);
          const Icon = tool?.icon || MessageSquare;
          return (
            <div key={h.id} onClick={() => openHistory(h)} className="group rounded-lg px-2.5 py-2 cursor-pointer transition-colors border border-transparent hover:bg-muted/40 hover:border-border/30">
              <div className="flex items-start gap-2">
                <Icon className="w-3.5 h-3.5 mt-0.5 text-primary shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium truncate">{h.title || "Untitled"}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{tool?.title}</div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); deleteHistory(h.id); }} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-destructive/20 text-destructive">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <div className="p-3 border-t border-border/30 flex items-center justify-between">
        <div className="text-[10px] text-muted-foreground">{history.length} item{history.length !== 1 ? "s" : ""}</div>
        {history.length > 0 && (
          <button onClick={clearAll} className="text-[10px] text-destructive hover:underline">Clear all</button>
        )}
      </div>
    </div>
  );

  return (
    <Layout title="">
      <section className="container mx-auto px-4 pt-10 pb-4">
        <div className="max-w-3xl">
          <div className="badge-gradient mb-4 inline-flex"><Sparkles className="w-3 h-3 mr-1" /> AI-powered</div>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-3 text-balance">
            Your <span className="text-gradient">personal AI study lab</span>.
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl">
            Four tools that turn raw curiosity into real outcomes — every generation is saved so you can revisit anything.
          </p>
        </div>
      </section>

      {/* Mobile history toggle */}
      <section className="container mx-auto px-4 lg:hidden mb-2">
        <button onClick={() => setSidebarOpen(true)} className="flex items-center gap-2 h-9 px-3 rounded-lg border border-border/40 bg-muted/30 text-xs">
          <Menu className="w-4 h-4" /> History ({history.length})
        </button>
      </section>

      <section className="container mx-auto px-4 pb-16">
        <div className="grid lg:grid-cols-[260px_1fr] gap-4">
          <aside className="hidden lg:block glass-card rounded-2xl border border-border/40 overflow-hidden h-[calc(100vh-12rem)] min-h-[520px]">
            {Sidebar}
          </aside>

          <div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              {TOOLS.map((t) => {
                const active = t.id === mode;
                return (
                  <button key={t.id} onClick={() => { setMode(t.id); resetOutput(); }}
                    className={`relative text-left p-4 rounded-xl border transition-all duration-150 overflow-hidden ${
                      active ? "border-primary/60 bg-primary/5" : "border-border/60 bg-card hover:border-border hover:bg-muted/30"
                    }`}>
                    {active && <div className={`absolute inset-0 bg-gradient-to-br ${t.accent} opacity-30 pointer-events-none`} />}
                    <div className="relative">
                      <t.icon className={`w-5 h-5 mb-2.5 ${active ? "text-primary" : "text-muted-foreground"}`} />
                      <div className="font-medium text-sm mb-1">{t.title}</div>
                      <div className="text-xs text-muted-foreground line-clamp-2">{t.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="grid lg:grid-cols-5 gap-6">
              {/* Inputs */}
              <div className="lg:col-span-2 surface-elevated p-5 h-fit rounded-2xl border border-border/40 bg-card">
                {mode === "learning_path" && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground block mb-1.5">Your goal</label>
                      <textarea value={goal} onChange={(e) => setGoal(e.target.value)} rows={3} placeholder="e.g. Become a confident React developer in 6 weeks" className="input-glass h-auto py-2.5 text-sm resize-none w-full" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground block mb-1.5">Duration (weeks)</label>
                        <input type="number" value={weeks} onChange={(e) => setWeeks(Math.max(1, Math.min(12, parseInt(e.target.value || "4"))))} min={1} max={12} className="input-glass text-sm w-full" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground block mb-1.5">Level</label>
                        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="input-glass text-sm w-full">
                          <option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option>
                        </select>
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground">Includes mastery guide, consistency system, and networking plan.</p>
                  </div>
                )}

                {mode === "quiz" && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground block mb-1.5">Topic or content</label>
                      <textarea value={quizInput} onChange={(e) => setQuizInput(e.target.value)} rows={8} placeholder="Paste lesson notes, or just write a topic like 'JavaScript closures'" className="input-glass h-auto py-2.5 text-sm resize-none w-full" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground block mb-1.5">Questions</label>
                        <input type="number" value={numQ} onChange={(e) => setNumQ(Math.max(3, Math.min(15, parseInt(e.target.value || "5"))))} min={3} max={15} className="input-glass text-sm w-full" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground block mb-1.5">Difficulty</label>
                        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="input-glass text-sm w-full">
                          <option value="beginner">Easy</option><option value="intermediate">Medium</option><option value="advanced">Hard</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {mode === "summarize" && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground block mb-1.5">Paste text to summarize</label>
                      <textarea value={sumInput} onChange={(e) => setSumInput(e.target.value)} rows={12} placeholder="Paste lesson transcript, article, or notes..." className="input-glass h-auto py-2.5 text-sm resize-none w-full" />
                      <div className="text-[10px] text-muted-foreground mt-1">{sumInput.length.toLocaleString()} chars</div>
                    </div>
                  </div>
                )}

                {mode === "nextgen" && (
                  <div className="space-y-4">
                    <div className="rounded-lg border border-fuchsia-500/30 bg-fuchsia-500/5 p-3">
                      <div className="flex items-center gap-2 text-xs font-medium text-fuchsia-300 mb-1"><Rocket className="w-3.5 h-3.5" /> NextGen · world-first</div>
                      <p className="text-[11px] text-muted-foreground">A 5-year time-machine simulation. Tell us your dream — get back Future You, the inflection points, signature projects, and a letter from your future self.</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground block mb-1.5">Your path / dream</label>
                      <textarea value={nextgenInput} onChange={(e) => setNextgenInput(e.target.value)} rows={4} placeholder="e.g. Become a self-employed AI engineer earning ₹2 cr/yr" className="input-glass h-auto py-2.5 text-sm resize-none w-full" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground block mb-1.5">Current level</label>
                      <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="input-glass text-sm w-full">
                        <option value="beginner">Just starting</option><option value="intermediate">Some experience</option><option value="advanced">Already advanced</option>
                      </select>
                    </div>
                  </div>
                )}

                <button onClick={run} disabled={loading || (mode === "quiz" && !quizInput.trim()) || (mode === "summarize" && !sumInput.trim()) || (mode === "nextgen" && !nextgenInput.trim())} className="btn-primary w-full mt-4 disabled:opacity-50 inline-flex items-center justify-center gap-2">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                  {loading ? "Generating..." : "Generate"}
                </button>
              </div>

              {/* Output */}
              <div className="lg:col-span-3 surface-elevated p-5 min-h-[400px] rounded-2xl border border-border/40 bg-card">
                {!loading && !path && !quiz && !summary && !nextgen && (
                  <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground py-16">
                    <div className="icon-glow w-12 h-12 mb-4 flex items-center justify-center rounded-xl bg-primary/10 border border-primary/30">
                      <modeMeta.icon className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-sm">Fill in the {modeMeta.title.toLowerCase()} form and hit Generate.</p>
                  </div>
                )}

                {loading && (
                  <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground py-16">
                    <Loader2 className="w-6 h-6 animate-spin text-primary mb-3" />
                    <p className="text-sm">Thinking through your request...</p>
                  </div>
                )}

                {path && (
                  <div className="space-y-5 animate-fade-in">
                    <div>
                      <h2 className="text-xl font-semibold mb-1">{path.title}</h2>
                      <p className="text-sm text-muted-foreground">{path.summary}</p>
                    </div>
                    <div className="space-y-3">
                      {path.weeks.map((w) => (
                        <div key={w.week} className="rounded-lg border border-border/50 p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-md bg-primary/15 border border-primary/25 flex items-center justify-center text-xs font-semibold text-primary">{w.week}</div>
                              <h3 className="font-medium text-sm">{w.focus}</h3>
                            </div>
                            {w.daily_minutes && (<span className="badge-gradient inline-flex items-center"><Clock className="w-3 h-3 mr-1" /> ~{w.daily_minutes}m/day</span>)}
                          </div>
                          <ul className="space-y-1 ml-9 text-sm text-muted-foreground">
                            {w.milestones.map((m, i) => (<li key={i} className="flex items-start gap-2"><Target className="w-3 h-3 mt-1 text-primary flex-shrink-0" /><span>{m}</span></li>))}
                          </ul>
                          {w.suggested_courses && w.suggested_courses.length > 0 && (
                            <div className="ml-9 mt-2 flex flex-wrap gap-1">
                              {w.suggested_courses.map((c, i) => (<span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border/40"><BookOpen className="w-2.5 h-2.5 inline mr-1" />{c}</span>))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {path.mastery_guide && (
                      <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3">
                        <div className="flex items-center gap-2"><Award className="w-4 h-4 text-primary" /><h3 className="text-sm font-semibold">Mastery Guide</h3></div>
                        <Block title="Core pillars" items={path.mastery_guide.pillars} />
                        <Block title="Deep-practice rituals" items={path.mastery_guide.deep_practice} />
                        <Block title="Mastery milestones" items={path.mastery_guide.milestones} />
                        {path.mastery_guide.mistakes_to_avoid && <Block title="Mistakes to avoid" items={path.mastery_guide.mistakes_to_avoid} tone="destructive" />}
                      </div>
                    )}

                    {path.consistency_plan && (
                      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-3">
                        <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-emerald-400" /><h3 className="text-sm font-semibold">Consistency System</h3></div>
                        <Block title="Daily ritual" items={path.consistency_plan.daily_ritual} />
                        {path.consistency_plan.weekly_review && <Block title="Weekly review" items={path.consistency_plan.weekly_review} />}
                        {path.consistency_plan.anti_burnout && <Block title="Anti-burnout" items={path.consistency_plan.anti_burnout} />}
                        {path.consistency_plan.accountability && <Block title="Accountability" items={path.consistency_plan.accountability} />}
                      </div>
                    )}

                    {path.networking_plan && (
                      <div className="rounded-xl border border-fuchsia-500/30 bg-fuchsia-500/5 p-4 space-y-3">
                        <div className="flex items-center gap-2"><Users className="w-4 h-4 text-fuchsia-400" /><h3 className="text-sm font-semibold">Networking Plan</h3></div>
                        <Block title="Communities to join" items={path.networking_plan.communities} />
                        {path.networking_plan.mentors && <Block title="Mentors to seek" items={path.networking_plan.mentors} />}
                        <Block title="People to follow" items={path.networking_plan.people_to_follow} />
                        {path.networking_plan.content_to_consume && <Block title="Content to consume" items={path.networking_plan.content_to_consume} />}
                        {path.networking_plan.outreach_template && (
                          <div>
                            <div className="text-[11px] font-medium text-muted-foreground mb-1 flex items-center gap-1"><Mail className="w-3 h-3" /> Outreach template</div>
                            <pre className="text-xs whitespace-pre-wrap bg-background/50 border border-border/40 rounded-md p-3 leading-relaxed">{path.networking_plan.outreach_template}</pre>
                          </div>
                        )}
                      </div>
                    )}

                    <button onClick={resetOutput} className="btn-ghost text-xs inline-flex items-center gap-1"><RotateCcw className="w-3.5 h-3.5" /> Start over</button>
                  </div>
                )}

                {quiz && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold">{quiz.topic}</h2>
                      {submitted && (<span className="badge-success px-2 py-1 rounded text-xs bg-success/15 text-success border border-success/30">Score: {score}/{quiz.questions.length}</span>)}
                    </div>
                    <div className="space-y-3">
                      {quiz.questions.map((q, qi) => (
                        <div key={qi} className="rounded-lg border border-border/50 p-3">
                          <div className="font-medium text-sm mb-2.5"><span className="text-muted-foreground mr-2">{qi + 1}.</span>{q.question}</div>
                          <div className="space-y-1.5">
                            {q.options.map((opt, oi) => {
                              const picked = answers[qi] === oi;
                              const correct = q.correct_index === oi;
                              let cls = "border-border/50 hover:bg-muted/40";
                              if (submitted) { if (correct) cls = "border-success/60 bg-success/10 text-foreground"; else if (picked && !correct) cls = "border-destructive/60 bg-destructive/10"; }
                              else if (picked) cls = "border-primary/60 bg-primary/10";
                              return (
                                <button key={oi} onClick={() => !submitted && setAnswers((a) => ({ ...a, [qi]: oi }))} disabled={submitted} className={`w-full text-left text-sm px-3 py-2 rounded-md border transition-colors flex items-center justify-between ${cls}`}>
                                  <span>{opt}</span>
                                  {submitted && correct && <Check className="w-4 h-4 text-success" />}
                                  {submitted && picked && !correct && <X className="w-4 h-4 text-destructive" />}
                                </button>
                              );
                            })}
                          </div>
                          {submitted && (<p className="text-xs text-muted-foreground mt-2 italic">{q.explanation}</p>)}
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      {!submitted ? (
                        <button onClick={() => setSubmitted(true)} disabled={Object.keys(answers).length < quiz.questions.length} className="btn-primary disabled:opacity-50 inline-flex items-center gap-1">Submit answers <ChevronRight className="w-4 h-4" /></button>
                      ) : (
                        <button onClick={resetOutput} className="btn-secondary inline-flex items-center gap-1"><RotateCcw className="w-4 h-4" /> Try another</button>
                      )}
                    </div>
                  </div>
                )}

                {summary && (
                  <div className="animate-fade-in">
                    <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{summary}</ReactMarkdown>
                    </div>
                    <button onClick={resetOutput} className="btn-ghost text-xs mt-4 inline-flex items-center gap-1"><RotateCcw className="w-3.5 h-3.5" /> Summarize another</button>
                  </div>
                )}

                {nextgen && (
                  <div className="space-y-5 animate-fade-in">
                    <div className="rounded-xl border border-fuchsia-500/40 bg-gradient-to-br from-fuchsia-500/10 via-primary/10 to-transparent p-5">
                      <div className="flex items-center gap-2 mb-2 text-[10px] uppercase tracking-widest text-fuchsia-300"><Rocket className="w-3 h-3" /> Future You · 5 years out</div>
                      <h2 className="text-2xl font-semibold leading-tight">{nextgen.future_identity}</h2>
                      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{nextgen.day_in_life}</p>
                      {nextgen.wealth_impact && (
                        <div className="mt-3 text-xs inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary"><Award className="w-3 h-3" /> {nextgen.wealth_impact}</div>
                      )}
                    </div>

                    <div className="rounded-xl border border-border/50 p-4">
                      <div className="flex items-center gap-2 mb-3"><Compass className="w-4 h-4 text-primary" /><h3 className="text-sm font-semibold">Inflection Points</h3></div>
                      <div className="space-y-3">
                        {nextgen.inflection_points.map((ip, i) => (
                          <div key={i} className="border-l-2 border-primary/50 pl-3">
                            <div className="text-[10px] uppercase tracking-wider text-primary font-medium">{ip.when}</div>
                            <div className="text-sm font-medium mt-0.5">{ip.moment}</div>
                            <div className="text-xs text-muted-foreground mt-1">{ip.why_it_mattered}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="rounded-xl border border-border/50 p-4">
                        <h3 className="text-sm font-semibold mb-2 flex items-center gap-2"><Award className="w-4 h-4 text-primary" /> Signature Projects</h3>
                        <ul className="space-y-1.5">{nextgen.signature_projects.map((s, i) => (<li key={i} className="text-xs text-muted-foreground flex gap-2"><span className="text-primary">→</span>{s}</li>))}</ul>
                      </div>
                      <div className="rounded-xl border border-border/50 p-4">
                        <h3 className="text-sm font-semibold mb-2 flex items-center gap-2"><Brain className="w-4 h-4 text-primary" /> Skills Unlocked</h3>
                        <div className="flex flex-wrap gap-1.5">{nextgen.skills_unlocked.map((s, i) => (<span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/30">{s}</span>))}</div>
                      </div>
                    </div>

                    {nextgen.mindset_shifts && nextgen.mindset_shifts.length > 0 && (
                      <div className="rounded-xl border border-border/50 p-4">
                        <h3 className="text-sm font-semibold mb-2">Mindset Shifts</h3>
                        <ul className="space-y-1.5 text-xs text-muted-foreground">{nextgen.mindset_shifts.map((m, i) => (<li key={i}>• {m}</li>))}</ul>
                      </div>
                    )}

                    <div className="rounded-xl border border-fuchsia-500/30 bg-fuchsia-500/5 p-5">
                      <div className="flex items-center gap-2 mb-2 text-xs font-medium text-fuchsia-300"><Quote className="w-3.5 h-3.5" /> Letter from Future You</div>
                      <p className="text-sm leading-relaxed italic">{nextgen.letter_from_future}</p>
                    </div>

                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
                      <div className="text-[10px] uppercase tracking-widest text-emerald-400 mb-1">Do this in the next 24h</div>
                      <p className="text-sm font-medium">{nextgen.first_step_tomorrow}</p>
                    </div>

                    <button onClick={resetOutput} className="btn-ghost text-xs inline-flex items-center gap-1"><RotateCcw className="w-3.5 h-3.5" /> Run another simulation</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile drawer */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-[70] flex animate-fade-in">
          <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-[85%] max-w-sm h-full bg-background border-r border-border/40 shadow-2xl animate-slide-in-left">
            <div className="absolute top-2 right-2 z-10">
              <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-md hover:bg-muted text-muted-foreground"><X className="w-4 h-4" /></button>
            </div>
            {Sidebar}
          </div>
        </div>
      )}
    </Layout>
  );
};

const Block = ({ title, items, tone }: { title: string; items: string[]; tone?: "destructive" }) => (
  <div>
    <div className={`text-[11px] font-medium mb-1 ${tone === "destructive" ? "text-destructive" : "text-muted-foreground"}`}>{title}</div>
    <ul className="space-y-1">
      {items.map((it, i) => (
        <li key={i} className="text-xs text-foreground/90 flex gap-2"><span className={tone === "destructive" ? "text-destructive" : "text-primary"}>•</span><span>{it}</span></li>
      ))}
    </ul>
  </div>
);

export default AITools;
