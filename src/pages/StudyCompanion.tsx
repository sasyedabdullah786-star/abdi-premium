import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, CheckCircle2, Circle, Loader2, Brain, Layers, Zap, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface DailyTask {
  id: string;
  title: string;
  description: string | null;
  task_type: string;
  xp_reward: number;
  completed: boolean;
}

interface QuizQ {
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

interface Flashcard {
  front: string;
  back: string;
}

const StudyCompanion = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);

  // Quiz state
  const [topic, setTopic] = useState("Physics - Class 10 - Light");
  const [quiz, setQuiz] = useState<QuizQ[] | null>(null);
  const [quizDifficulty, setQuizDifficulty] = useState("");
  const [quizLoading, setQuizLoading] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  // Flashcards
  const [fcTopic, setFcTopic] = useState("Indian Constitution Basics");
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [cardLoading, setCardLoading] = useState(false);
  const [flippedIdx, setFlippedIdx] = useState<number | null>(null);

  useEffect(() => {
    if (user) loadTasks();
  }, [user]);

  const loadTasks = async () => {
    if (!user) return;
    const today = new Date().toISOString().slice(0, 10);
    const { data } = await supabase
      .from("daily_tasks")
      .select("*")
      .eq("user_id", user.id)
      .eq("task_date", today)
      .order("created_at");
    setTasks((data as DailyTask[]) || []);
  };

  const generateTasks = async () => {
    if (!user) return;
    setLoadingTasks(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-companion", {
        body: { mode: "daily_tasks", userName: user.email?.split("@")[0] },
      });
      if (error) throw error;
      const today = new Date().toISOString().slice(0, 10);
      // Replace today's tasks
      await supabase.from("daily_tasks").delete().eq("user_id", user.id).eq("task_date", today);
      const rows = (data.tasks || []).map((t: any) => ({
        user_id: user.id,
        task_date: today,
        title: t.title,
        description: t.description,
        task_type: t.task_type,
        xp_reward: t.xp_reward,
      }));
      const { data: inserted } = await supabase.from("daily_tasks").insert(rows).select();
      setTasks((inserted as DailyTask[]) || []);
      toast.success("Today's plan is ready!");
    } catch (e: any) {
      toast.error(e.message || "Failed to generate tasks");
    } finally {
      setLoadingTasks(false);
    }
  };

  const toggleTask = async (t: DailyTask) => {
    const updated = !t.completed;
    setTasks((prev) => prev.map((x) => (x.id === t.id ? { ...x, completed: updated } : x)));
    await supabase.from("daily_tasks").update({ completed: updated }).eq("id", t.id);
    if (updated) toast.success(`+${t.xp_reward} XP earned!`);
  };

  const generateQuiz = async () => {
    if (!user) return;
    setQuizLoading(true);
    setQuiz(null);
    setAnswers({});
    setSubmitted(false);
    try {
      // Pull recent scores for adaptive difficulty
      const { data: recent } = await supabase
        .from("quiz_attempts")
        .select("score,total_questions")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);
      const recentScores = (recent || [])
        .filter((r: any) => r.total_questions > 0)
        .map((r: any) => Math.round((r.score / r.total_questions) * 100));

      const { data, error } = await supabase.functions.invoke("ai-companion", {
        body: { mode: "adaptive_quiz", topic, count: 5, recentScores },
      });
      if (error) throw error;
      setQuiz(data.questions);
      setQuizDifficulty(data.difficulty);
    } catch (e: any) {
      toast.error(e.message || "Failed to generate quiz");
    } finally {
      setQuizLoading(false);
    }
  };

  const submitQuiz = async () => {
    if (!quiz || !user) return;
    const score = quiz.reduce((s, q, i) => s + (answers[i] === q.correct_index ? 1 : 0), 0);
    setSubmitted(true);
    await supabase.from("quiz_attempts").insert({
      user_id: user.id,
      topic,
      difficulty: quizDifficulty,
      score,
      total_questions: quiz.length,
      questions: quiz as any,
    });
    toast.success(`Scored ${score}/${quiz.length}`);
  };

  const generateCards = async () => {
    setCardLoading(true);
    setCards([]);
    setFlippedIdx(null);
    try {
      const { data, error } = await supabase.functions.invoke("ai-companion", {
        body: { mode: "flashcards", topic: fcTopic, count: 8 },
      });
      if (error) throw error;
      setCards(data.cards || []);
    } catch (e: any) {
      toast.error(e.message || "Failed");
    } finally {
      setCardLoading(false);
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-muted-foreground">Please sign in to use the AI Study Companion.</p>
          <Link to="/auth" className="btn-primary inline-block mt-4">Sign In</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 md:py-10 space-y-8 max-w-5xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary mb-3">
            <Sparkles className="w-3 h-3" /> AI Study Companion
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Your personal <span className="gradient-text">study mentor</span>
          </h1>
          <p className="text-muted-foreground mt-1">Adaptive quizzes, AI flashcards, and a daily plan that adjusts to you.</p>
        </div>

        {/* DAILY TASKS */}
        <section className="rounded-2xl border border-border/60 bg-card/40 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> Today's Plan
            </h2>
            <button onClick={generateTasks} disabled={loadingTasks} className="btn-primary text-xs h-8 px-3">
              {loadingTasks ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
              <span className="ml-1.5">Generate</span>
            </button>
          </div>
          {tasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tasks yet. Click "Generate" for today's AI-curated plan.</p>
          ) : (
            <div className="space-y-2">
              {tasks.map((t) => (
                <button
                  key={t.id}
                  onClick={() => toggleTask(t)}
                  className={`w-full text-left flex items-start gap-3 p-3 rounded-lg border transition-all ${
                    t.completed
                      ? "border-primary/30 bg-primary/5"
                      : "border-border/40 hover:border-primary/30 bg-background/40"
                  }`}
                >
                  {t.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium text-sm ${t.completed ? "line-through text-muted-foreground" : ""}`}>{t.title}</div>
                    {t.description && <div className="text-xs text-muted-foreground mt-0.5">{t.description}</div>}
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-muted">{t.task_type}</span>
                      <span className="text-[10px] text-primary">+{t.xp_reward} XP</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* ADAPTIVE QUIZ */}
        <section className="rounded-2xl border border-border/60 bg-card/40 p-5">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-3">
            <Brain className="w-4 h-4 text-primary" /> Adaptive Quiz
            {quizDifficulty && (
              <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                {quizDifficulty}
              </span>
            )}
          </h2>
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Topic (e.g. Physics - Class 10 - Light)"
              className="flex-1 h-9 px-3 rounded-md border border-border bg-background text-sm"
            />
            <button onClick={generateQuiz} disabled={quizLoading} className="btn-primary text-xs h-9 px-4">
              {quizLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Generate Quiz"}
            </button>
          </div>
          {quiz && (
            <div className="space-y-4">
              {quiz.map((q, i) => (
                <div key={i} className="rounded-lg border border-border/40 p-3">
                  <div className="font-medium text-sm mb-2">{i + 1}. {q.question}</div>
                  <div className="space-y-1.5">
                    {q.options.map((opt, oi) => {
                      const chosen = answers[i] === oi;
                      const correct = submitted && oi === q.correct_index;
                      const wrong = submitted && chosen && oi !== q.correct_index;
                      return (
                        <button
                          key={oi}
                          disabled={submitted}
                          onClick={() => setAnswers((p) => ({ ...p, [i]: oi }))}
                          className={`w-full text-left text-sm px-3 py-2 rounded-md border transition-colors ${
                            correct ? "border-primary bg-primary/10 text-primary" :
                            wrong ? "border-destructive bg-destructive/10 text-destructive" :
                            chosen ? "border-primary/40 bg-primary/5" :
                            "border-border/40 hover:border-primary/30"
                          }`}
                        >
                          {String.fromCharCode(65 + oi)}. {opt}
                        </button>
                      );
                    })}
                  </div>
                  {submitted && (
                    <div className="mt-2 text-xs text-muted-foreground">💡 {q.explanation}</div>
                  )}
                </div>
              ))}
              {!submitted && (
                <button onClick={submitQuiz} className="btn-primary text-xs h-9 px-4">Submit Quiz</button>
              )}
            </div>
          )}
        </section>

        {/* FLASHCARDS */}
        <section className="rounded-2xl border border-border/60 bg-card/40 p-5">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-3">
            <Layers className="w-4 h-4 text-primary" /> AI Flashcards
          </h2>
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <input
              value={fcTopic}
              onChange={(e) => setFcTopic(e.target.value)}
              placeholder="Topic"
              className="flex-1 h-9 px-3 rounded-md border border-border bg-background text-sm"
            />
            <button onClick={generateCards} disabled={cardLoading} className="btn-primary text-xs h-9 px-4">
              {cardLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Generate"}
            </button>
          </div>
          {cards.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {cards.map((c, i) => (
                <button
                  key={i}
                  onClick={() => setFlippedIdx(flippedIdx === i ? null : i)}
                  className="text-left p-4 rounded-xl border border-border/40 bg-background/40 hover:border-primary/40 transition-all min-h-[120px]"
                >
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                    {flippedIdx === i ? "Answer" : "Question"}
                  </div>
                  <div className="text-sm">{flippedIdx === i ? c.back : c.front}</div>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
};

export default StudyCompanion;
