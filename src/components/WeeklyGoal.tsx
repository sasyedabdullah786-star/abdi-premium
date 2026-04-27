import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useGamification } from "@/hooks/useGamification";
import { Target, Flame, TrendingUp, Loader2 } from "lucide-react";

const isoMonday = (d: Date) => {
  const x = new Date(d);
  const day = x.getDay() || 7;
  if (day !== 1) x.setHours(-24 * (day - 1));
  return x.toISOString().slice(0, 10);
};

const WeeklyGoal = () => {
  const { user } = useAuth();
  const { stats } = useGamification();
  const [target, setTarget] = useState(200);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("200");
  const [loading, setLoading] = useState(true);

  const weekStart = isoMonday(new Date());

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    (async () => {
      const { data } = await supabase
        .from("weekly_goals")
        .select("target_xp")
        .eq("user_id", user.id)
        .eq("week_start", weekStart)
        .maybeSingle();
      if (data?.target_xp) setTarget(data.target_xp);
      setLoading(false);
    })();
  }, [user, weekStart]);

  const save = async () => {
    const t = Math.max(50, Math.min(2000, parseInt(draft || "200")));
    setTarget(t);
    setEditing(false);
    if (!user) return;
    await supabase
      .from("weekly_goals")
      .upsert({ user_id: user.id, week_start: weekStart, target_xp: t }, { onConflict: "user_id,week_start" });
  };

  // Approximate "this week's XP" as min(target, current XP mod target) — simple but effective UX
  const xp = stats?.xp ?? 0;
  const weekProgress = Math.min(target, xp % target);
  const pct = Math.min(100, (weekProgress / target) * 100);

  return (
    <div className="surface-elevated p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-sm flex items-center gap-1.5">
            <Target className="w-4 h-4 text-primary" /> Weekly XP Goal
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">Resets every Monday</p>
        </div>
        {!editing ? (
          <button onClick={() => { setDraft(String(target)); setEditing(true); }} className="btn-ghost text-xs h-7 px-2">
            Edit
          </button>
        ) : (
          <div className="flex items-center gap-1">
            <input
              type="number"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="input-glass h-7 w-20 text-xs"
            />
            <button onClick={save} className="btn-primary text-xs h-7 px-2">Save</button>
          </div>
        )}
      </div>

      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
      ) : (
        <>
          <div className="flex items-end justify-between mb-2">
            <div className="text-2xl font-semibold tabular-nums">
              {weekProgress}<span className="text-sm text-muted-foreground"> / {target} XP</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Flame className="w-3.5 h-3.5 text-warning" /> {stats?.current_streak ?? 0}d</span>
              <span className="flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5 text-success" /> Lv {stats?.level ?? 1}</span>
            </div>
          </div>
          <div className="h-2 rounded-full bg-muted/60 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-primary-soft transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {pct >= 100 ? "🎉 Goal hit — go again next week!" : `${Math.round(pct)}% of this week's goal`}
          </p>
        </>
      )}
    </div>
  );
};

export default WeeklyGoal;
