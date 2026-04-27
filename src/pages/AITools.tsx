import { useState } from "react";
import Layout from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Wand2, Map, Brain, FileText, Sparkles, Loader2, Check, X, ChevronRight,
  RotateCcw, BookOpen, Clock, Target,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Mode = "learning_path" | "quiz" | "summarize";

interface PathWeek {
  week: number;
  focus: string;
  daily_minutes?: number;
  milestones: string[];
  suggested_courses?: string[];
}
interface PathPlan {
  title: string;
  summary: string;
  weeks: PathWeek[];
}

interface QuizQuestion {
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}
interface Quiz {
  topic: string;
  questions: QuizQuestion[];
}

const TOOLS: { id: Mode; icon: any; title: string; desc: string }[] = [
  { id: "learning_path", icon: Map, title: "Learning Path Generator", desc: "Tell me your goal — I'll build a week-by-week plan grounded in real courses." },
  { id: "quiz", icon: Brain, title: "AI Quiz Generator", desc: "Paste any topic or notes — get an instant 5-question MCQ quiz with explanations." },
  { id: "summarize", icon: FileText, title: "Smart Notes Summarizer", desc: "Drop in long content — get a TL;DR, key concepts, and flashcard prompts." },
];

const AITools = () => {
  const { toast } = useToast();
  const [mode, setMode] = useState<Mode>("learning_path");

  // shared state
  const [loading, setLoading] = useState(false);

  // path
  const [goal, setGoal] = useState("Become a confident frontend developer");
  const [weeks, setWeeks] = useState(4);
  const [difficulty, setDifficulty] = useState("beginner");
  const [path, setPath] = useState<PathPlan | null>(null);

  // quiz
  const [quizInput, setQuizInput] = useState("");
  const [numQ, setNumQ] = useState(5);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  // summarize
  const [sumInput, setSumInput] = useState("");
  const [summary, setSummary] = useState("");

  const reset = () => {
    setPath(null);
    setQuiz(null);
    setAnswers({});
    setSubmitted(false);
    setSummary("");
  };

  const run = async () => {
    setLoading(true);
    reset();
    try {
      const body: any = { mode, difficulty };
      if (mode === "learning_path") {
        body.goal = goal;
        body.weeks = weeks;
      } else if (mode === "quiz") {
        body.input = quizInput;
        body.num_questions = numQ;
      } else {
        body.input = sumInput;
      }

      const { data, error } = await supabase.functions.invoke("ai-tools", { body });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);

      if (mode === "summarize") setSummary((data as any).content || "");
      else if (mode === "learning_path") setPath((data as any).data as PathPlan);
      else setQuiz((data as any).data as Quiz);
    } catch (e: any) {
      toast({
        title: "AI request failed",
        description: e?.message || "Try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const score = quiz
    ? quiz.questions.reduce((acc, q, i) => acc + (answers[i] === q.correct_index ? 1 : 0), 0)
    : 0;

  return (
    <Layout title="">
      <section className="container mx-auto px-4 pt-12 pb-6">
        <div className="max-w-3xl">
          <div className="badge-gradient mb-4">
            <Sparkles className="w-3 h-3 mr-1" /> AI-powered
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-3 text-balance">
            Your <span className="text-gradient">personal AI study lab</span>.
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl">
            Three tools that turn raw curiosity into a real learning outcome — built on top of every course on the platform.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-3 gap-3 mb-8">
          {TOOLS.map((t) => {
            const active = t.id === mode;
            return (
              <button
                key={t.id}
                onClick={() => { setMode(t.id); reset(); }}
                className={`text-left p-4 rounded-xl border transition-all duration-150 ${
                  active
                    ? "border-primary/60 bg-primary/5"
                    : "border-border/60 bg-card hover:border-border hover:bg-muted/30"
                }`}
              >
                <t.icon className={`w-5 h-5 mb-2.5 ${active ? "text-primary" : "text-muted-foreground"}`} />
                <div className="font-medium text-sm mb-1">{t.title}</div>
                <div className="text-xs text-muted-foreground line-clamp-2">{t.desc}</div>
              </button>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Inputs */}
          <div className="lg:col-span-2 surface-elevated p-5 h-fit">
            {mode === "learning_path" && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Your goal</label>
                  <textarea
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    rows={3}
                    placeholder="e.g. Become a confident React developer in 6 weeks"
                    className="input-glass h-auto py-2.5 text-sm resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1.5">Duration (weeks)</label>
                    <input
                      type="number"
                      value={weeks}
                      onChange={(e) => setWeeks(Math.max(1, Math.min(12, parseInt(e.target.value || "4"))))}
                      min={1} max={12}
                      className="input-glass text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1.5">Level</label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="input-glass text-sm"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {mode === "quiz" && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Topic or content</label>
                  <textarea
                    value={quizInput}
                    onChange={(e) => setQuizInput(e.target.value)}
                    rows={8}
                    placeholder="Paste lesson notes, or just write a topic like 'JavaScript closures'"
                    className="input-glass h-auto py-2.5 text-sm resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1.5">Questions</label>
                    <input
                      type="number"
                      value={numQ}
                      onChange={(e) => setNumQ(Math.max(3, Math.min(15, parseInt(e.target.value || "5"))))}
                      min={3} max={15}
                      className="input-glass text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1.5">Difficulty</label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="input-glass text-sm"
                    >
                      <option value="beginner">Easy</option>
                      <option value="intermediate">Medium</option>
                      <option value="advanced">Hard</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {mode === "summarize" && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Paste text to summarize</label>
                  <textarea
                    value={sumInput}
                    onChange={(e) => setSumInput(e.target.value)}
                    rows={12}
                    placeholder="Paste lesson transcript, article, or notes..."
                    className="input-glass h-auto py-2.5 text-sm resize-none"
                  />
                  <div className="text-[10px] text-muted-foreground mt-1">{sumInput.length.toLocaleString()} chars</div>
                </div>
              </div>
            )}

            <button
              onClick={run}
              disabled={loading || (mode === "quiz" && !quizInput.trim()) || (mode === "summarize" && !sumInput.trim())}
              className="btn-primary w-full mt-4 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
              {loading ? "Generating..." : "Generate"}
            </button>
          </div>

          {/* Output */}
          <div className="lg:col-span-3 surface-elevated p-5 min-h-[400px]">
            {!loading && !path && !quiz && !summary && (
              <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground py-16">
                <div className="icon-glow w-12 h-12 mb-4">
                  <Sparkles className="w-5 h-5" />
                </div>
                <p className="text-sm">Pick a tool, fill it in, and hit Generate.</p>
              </div>
            )}

            {loading && (
              <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground py-16">
                <Loader2 className="w-6 h-6 animate-spin text-primary mb-3" />
                <p className="text-sm">Thinking through your request...</p>
              </div>
            )}

            {path && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <h2 className="text-xl font-semibold mb-1">{path.title}</h2>
                  <p className="text-sm text-muted-foreground">{path.summary}</p>
                </div>
                <div className="space-y-3">
                  {path.weeks.map((w) => (
                    <div key={w.week} className="rounded-lg border border-border/50 p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-md bg-primary/15 border border-primary/25 flex items-center justify-center text-xs font-semibold text-primary">
                            {w.week}
                          </div>
                          <h3 className="font-medium text-sm">{w.focus}</h3>
                        </div>
                        {w.daily_minutes && (
                          <span className="badge-gradient">
                            <Clock className="w-3 h-3 mr-1" /> ~{w.daily_minutes}m/day
                          </span>
                        )}
                      </div>
                      <ul className="space-y-1 ml-9 text-sm text-muted-foreground">
                        {w.milestones.map((m, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <Target className="w-3 h-3 mt-1 text-primary flex-shrink-0" />
                            <span>{m}</span>
                          </li>
                        ))}
                      </ul>
                      {w.suggested_courses && w.suggested_courses.length > 0 && (
                        <div className="ml-9 mt-2 flex flex-wrap gap-1">
                          {w.suggested_courses.map((c, i) => (
                            <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border/40">
                              <BookOpen className="w-2.5 h-2.5 inline mr-1" />{c}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <button onClick={reset} className="btn-ghost text-xs">
                  <RotateCcw className="w-3.5 h-3.5" /> Start over
                </button>
              </div>
            )}

            {quiz && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">{quiz.topic}</h2>
                  {submitted && (
                    <span className="badge-success">
                      Score: {score}/{quiz.questions.length}
                    </span>
                  )}
                </div>
                <div className="space-y-3">
                  {quiz.questions.map((q, qi) => (
                    <div key={qi} className="rounded-lg border border-border/50 p-3">
                      <div className="font-medium text-sm mb-2.5">
                        <span className="text-muted-foreground mr-2">{qi + 1}.</span>{q.question}
                      </div>
                      <div className="space-y-1.5">
                        {q.options.map((opt, oi) => {
                          const picked = answers[qi] === oi;
                          const correct = q.correct_index === oi;
                          let cls = "border-border/50 hover:bg-muted/40";
                          if (submitted) {
                            if (correct) cls = "border-success/60 bg-success/10 text-foreground";
                            else if (picked && !correct) cls = "border-destructive/60 bg-destructive/10";
                          } else if (picked) {
                            cls = "border-primary/60 bg-primary/10";
                          }
                          return (
                            <button
                              key={oi}
                              onClick={() => !submitted && setAnswers((a) => ({ ...a, [qi]: oi }))}
                              disabled={submitted}
                              className={`w-full text-left text-sm px-3 py-2 rounded-md border transition-colors flex items-center justify-between ${cls}`}
                            >
                              <span>{opt}</span>
                              {submitted && correct && <Check className="w-4 h-4 text-success" />}
                              {submitted && picked && !correct && <X className="w-4 h-4 text-destructive" />}
                            </button>
                          );
                        })}
                      </div>
                      {submitted && (
                        <p className="text-xs text-muted-foreground mt-2 italic">{q.explanation}</p>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  {!submitted ? (
                    <button
                      onClick={() => setSubmitted(true)}
                      disabled={Object.keys(answers).length < quiz.questions.length}
                      className="btn-primary disabled:opacity-50"
                    >
                      Submit answers <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button onClick={reset} className="btn-secondary">
                      <RotateCcw className="w-4 h-4" /> Try another
                    </button>
                  )}
                </div>
              </div>
            )}

            {summary && (
              <div className="animate-fade-in">
                <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{summary}</ReactMarkdown>
                </div>
                <button onClick={reset} className="btn-ghost text-xs mt-4">
                  <RotateCcw className="w-3.5 h-3.5" /> Summarize another
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default AITools;
