import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

/**
 * GitHub-style activity heatmap.
 * Reads course_progress.last_accessed_at as a proxy for activity.
 * Shows last ~16 weeks (112 days).
 */
const DAYS = 112;

const ActivityHeatmap = () => {
  const { user } = useAuth();
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!user) return;
    (async () => {
      const since = new Date();
      since.setDate(since.getDate() - DAYS);
      const { data } = await supabase
        .from("course_progress")
        .select("last_accessed_at, updated_at")
        .eq("user_id", user.id)
        .gte("updated_at", since.toISOString());

      const map: Record<string, number> = {};
      (data || []).forEach((row: any) => {
        const ts = row.last_accessed_at || row.updated_at;
        if (!ts) return;
        const day = new Date(ts).toISOString().slice(0, 10);
        map[day] = (map[day] || 0) + 1;
      });
      setCounts(map);
    })();
  }, [user]);

  const cells = useMemo(() => {
    const out: { date: string; count: number }[] = [];
    const today = new Date();
    for (let i = DAYS - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      out.push({ date: key, count: counts[key] || 0 });
    }
    return out;
  }, [counts]);

  // group into 16 weeks of 7 days (column-major)
  const weeks: { date: string; count: number }[][] = [];
  for (let w = 0; w < 16; w++) {
    weeks.push(cells.slice(w * 7, w * 7 + 7));
  }

  const colorFor = (n: number) => {
    if (n === 0) return "bg-muted/40";
    if (n === 1) return "bg-primary/30";
    if (n === 2) return "bg-primary/55";
    if (n === 3) return "bg-primary/75";
    return "bg-primary";
  };

  const totalActiveDays = cells.filter((c) => c.count > 0).length;

  return (
    <div className="surface-elevated p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-sm">Activity</h3>
          <p className="text-xs text-muted-foreground">{totalActiveDays} active days in the last 16 weeks</p>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <span>Less</span>
          {[0, 1, 2, 3, 4].map((n) => (
            <span key={n} className={`inline-block w-2.5 h-2.5 rounded-sm ${colorFor(n)}`} />
          ))}
          <span>More</span>
        </div>
      </div>
      <div className="flex gap-1 overflow-x-auto">
        {weeks.map((wk, i) => (
          <div key={i} className="flex flex-col gap-1">
            {wk.map((day) => (
              <div
                key={day.date}
                title={`${day.date}: ${day.count} activity`}
                className={`w-2.5 h-2.5 rounded-sm ${colorFor(day.count)} transition-colors`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityHeatmap;
