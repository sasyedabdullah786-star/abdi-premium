import { useEffect, useState } from "react";
import {
  Activity, Brain, Sparkles, TrendingUp, Users, BookOpen, Star,
  MessageSquare, Loader2, RefreshCw, Zap, AlertTriangle, Trophy, Clock
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAnalytics } from "@/hooks/useAnalytics";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useToast } from "@/hooks/use-toast";

interface LiveSignals {
  activeToday: number;
  newUsersWeek: number;
  enrollmentsWeek: number;
  pendingReviews: number;
  recentSignups: { email: string; full_name: string | null; created_at: string }[];
  topStreaks: { user_id: string; current_streak: number; xp: number }[];
}

const SmartCenterTab = () => {
  const { analytics, loading: analyticsLoading, refetch } = useAnalytics();
  const [signals, setSignals] = useState<LiveSignals | null>(null);
  const [insights, setInsights] = useState<string>("");
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [signalsLoading, setSignalsLoading] = useState(true);
  const { toast } = useToast();

  const fetchSignals = async () => {
    setSignalsLoading(true);
    try {
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const [signupsRes, enrollRes, streaksRes, activeRes, recentRes] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", weekAgo),
        supabase.from("course_progress").select("id", { count: "exact", head: true }).gte("created_at", weekAgo),
        supabase.from("user_stats").select("user_id, current_streak, xp").order("current_streak", { ascending: false }).limit(5),
        supabase.from("user_stats").select("user_id", { count: "exact", head: true }).gte("last_activity_date", today.toISOString().slice(0, 10)),
        supabase.from("profiles").select("email, full_name, created_at").order("created_at", { ascending: false }).limit(5),
      ]);

      setSignals({
        activeToday: activeRes.count || 0,
        newUsersWeek: signupsRes.count || 0,
        enrollmentsWeek: enrollRes.count || 0,
        pendingReviews: analytics.pendingReviews,
        recentSignups: (recentRes.data as any) || [],
        topStreaks: (streaksRes.data as any) || [],
      });
    } catch (e) {
      console.error("signals fetch failed", e);
    } finally {
      setSignalsLoading(false);
    }
  };

  useEffect(() => {
    if (!analyticsLoading) fetchSignals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analyticsLoading]);

  // realtime subscription
  useEffect(() => {
    const ch = supabase
      .channel("smart-center")
      .on("postgres_changes", { event: "*", schema: "public", table: "course_progress" }, () => fetchSignals())
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => fetchSignals())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generateInsights = async () => {
    if (!signals) return;
    setInsightsLoading(true);
    setInsights("");
    try {
      const summary = `
Platform snapshot (ABD"I):
- Total users: ${analytics.totalUsers}, new this week: ${signals.newUsersWeek}
- Active today: ${signals.activeToday}
- Total courses: ${analytics.totalCourses} (${analytics.publishedCourses} published)
- Total lessons: ${analytics.totalLessons}
- Total enrollments: ${analytics.totalEnrollments}, this week: ${signals.enrollmentsWeek}
- Reviews: ${analytics.totalReviews} (pending moderation: ${analytics.pendingReviews})
- Testimonials: ${analytics.totalTestimonials}
- Top rated courses: ${analytics.topRatedCourses.map(c => `${c.title} (${c.average_rating.toFixed(1)}★)`).join(", ") || "none"}
- Top student streaks: ${signals.topStreaks.map(s => `${s.current_streak}d/${s.xp}xp`).join(", ") || "none"}
`;
      const prompt = `You are the AI Insights engine for the ABD"I admin dashboard. Given the platform snapshot below, write a sharp, executive-level briefing for the admin. Use markdown with these sections:

### 🎯 Headline
One-sentence summary of platform health.

### 📈 What's working
3 concise bullets (with numbers).

### ⚠️ What needs attention
2-3 concrete risks or gaps.

### 🚀 Recommended actions
3 specific, actionable next steps the admin can do today.

Keep it under 220 words. No fluff. End with "⚡ ABD'I STATUS: Insights generated."

${summary}`;

      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: [{ role: "user", content: prompt }] }),
      });

      if (!resp.ok || !resp.body) throw new Error("AI failed");
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "", soFar = "";
      let done = false;
      while (!done) {
        const { value, done: d } = await reader.read();
        if (d) break;
        buf += decoder.decode(value, { stream: true });
        let idx;
        while ((idx = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, idx); buf = buf.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") { done = true; break; }
          try {
            const delta = JSON.parse(json).choices?.[0]?.delta?.content;
            if (delta) { soFar += delta; setInsights(soFar); }
          } catch { buf = line + "\n" + buf; break; }
        }
      }
    } catch (e) {
      toast({ title: "Insights failed", description: "Could not reach AI.", variant: "destructive" });
    } finally {
      setInsightsLoading(false);
    }
  };

  if (analyticsLoading || signalsLoading || !signals) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading smart center…
      </div>
    );
  }

  const pulseCards = [
    { label: "Active Today", value: signals.activeToday, icon: Activity, color: "from-success to-success/50", hint: "users with activity today" },
    { label: "New Users (7d)", value: signals.newUsersWeek, icon: Users, color: "from-primary to-secondary", hint: "signups this week" },
    { label: "Enrollments (7d)", value: signals.enrollmentsWeek, icon: BookOpen, color: "from-secondary to-accent", hint: "course starts this week" },
    { label: "Pending Reviews", value: signals.pendingReviews, icon: AlertTriangle, color: "from-warning to-warning/50", hint: "awaiting moderation" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" />
            Smart Admin Center
          </h2>
          <p className="text-muted-foreground text-sm">Live signals + AI-generated insights, powered by ABD'I.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { refetch(); fetchSignals(); }} className="btn-glass text-sm flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button onClick={generateInsights} disabled={insightsLoading}
            className="btn-gradient text-sm flex items-center gap-2 disabled:opacity-50">
            {insightsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Generate Insights
          </button>
        </div>
      </div>

      {/* Pulse */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {pulseCards.map((c) => (
          <div key={c.label} className="glass-card p-5 relative overflow-hidden">
            <div className="absolute top-2 right-2">
              <span className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-success/15 text-success border border-success/30">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" /> LIVE
              </span>
            </div>
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center mb-3`}>
              <c.icon className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="font-display text-3xl font-bold gradient-text">{c.value}</div>
            <div className="font-medium text-sm">{c.label}</div>
            <div className="text-[11px] text-muted-foreground">{c.hint}</div>
          </div>
        ))}
      </div>

      {/* AI Insights */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-lg font-bold flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" /> AI Insights
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30">NEXUS-∞</span>
          </h3>
        </div>
        {insights ? (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{insights}</ReactMarkdown>
          </div>
        ) : insightsLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" /> ABD'I is analyzing your platform…
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Click <span className="font-medium text-foreground">Generate Insights</span> to let ABD'I analyze your live metrics and produce an executive briefing with risks and recommended actions.
          </p>
        )}
      </div>

      {/* Two-column footer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card p-5">
          <h3 className="font-display text-base font-bold mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" /> Recent Signups
          </h3>
          {signals.recentSignups.length === 0 ? (
            <p className="text-sm text-muted-foreground">No signups yet.</p>
          ) : (
            <div className="space-y-2">
              {signals.recentSignups.map((s, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/20">
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{s.full_name || s.email || "Anonymous"}</div>
                    <div className="text-[11px] text-muted-foreground truncate">{s.email}</div>
                  </div>
                  <div className="text-[11px] text-muted-foreground font-mono shrink-0 ml-2">
                    {new Date(s.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card p-5">
          <h3 className="font-display text-base font-bold mb-3 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-primary" /> Top Streaks
          </h3>
          {signals.topStreaks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No streak data yet.</p>
          ) : (
            <div className="space-y-2">
              {signals.topStreaks.map((s, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/20">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">{i + 1}</span>
                    <span className="text-sm font-mono text-muted-foreground">{s.user_id.slice(0, 8)}…</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-warning font-medium">🔥 {s.current_streak}d</span>
                    <span className="text-primary font-medium">{s.xp} XP</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SmartCenterTab;
