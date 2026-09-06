import { useEffect, useState } from "react";
import { CheckCircle, XCircle, RefreshCw, IndianRupee } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Row {
  id: string;
  user_id: string;
  course_id: string;
  amount: number;
  currency: string;
  status: string;
  provider: string | null;
  created_at: string;
}

const PurchasesTab = () => {
  const { toast } = useToast();
  const [rows, setRows] = useState<Row[]>([]);
  const [courses, setCourses] = useState<Record<string, string>>({});
  const [emails, setEmails] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [{ data: purchases }, { data: courseRows }, { data: profiles }] = await Promise.all([
      supabase.from("course_purchases").select("*").order("created_at", { ascending: false }),
      supabase.from("courses").select("id,title"),
      supabase.from("profiles").select("id,email,full_name"),
    ]);
    setRows((purchases as Row[]) || []);
    setCourses(Object.fromEntries((courseRows || []).map((c: any) => [c.id, c.title])));
    setEmails(Object.fromEntries((profiles || []).map((p: any) => [p.id, p.email || p.full_name || p.id])));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const setStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("course_purchases").update({ status }).eq("id", id);
    if (error) return toast({ title: "Could not update", description: error.message, variant: "destructive" });
    setRows(rows.map(r => (r.id === id ? { ...r, status } : r)));
    toast({ title: status === "paid" ? "Access granted" : "Purchase updated" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-display text-2xl font-bold">Course Purchases</h2>
          <p className="text-muted-foreground">Confirm payments to unlock a paid course for a student</p>
        </div>
        <button onClick={load} className="btn-outline inline-flex items-center gap-2"><RefreshCw className="w-4 h-4" /> Refresh</button>
      </div>

      <div className="glass-card p-4 overflow-x-auto">
        {loading ? (
          <p className="text-muted-foreground p-4">Loading...</p>
        ) : rows.length === 0 ? (
          <p className="text-muted-foreground p-4">No purchases yet.</p>
        ) : (
          <table className="w-full text-sm min-w-[640px]">
            <thead className="text-muted-foreground">
              <tr className="text-left">
                <th className="p-3">Student</th>
                <th className="p-3">Course</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id} className="border-t border-border/30">
                  <td className="p-3">{emails[r.user_id] || r.user_id.slice(0, 8)}</td>
                  <td className="p-3">{courses[r.course_id] || "—"}</td>
                  <td className="p-3 whitespace-nowrap">{r.currency} {r.amount}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      r.status === "paid" ? "bg-success/20 text-success"
                        : r.status === "failed" ? "bg-destructive/20 text-destructive"
                        : "bg-muted/40 text-muted-foreground"
                    }`}>{r.status}</span>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button onClick={() => setStatus(r.id, "paid")} className="p-2 rounded-lg text-success hover:bg-success/10" title="Mark as paid"><CheckCircle className="w-4 h-4" /></button>
                      <button onClick={() => setStatus(r.id, "failed")} className="p-2 rounded-lg text-destructive hover:bg-destructive/10" title="Reject"><XCircle className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="glass-card p-6 text-sm text-muted-foreground flex gap-3">
        <IndianRupee className="w-4 h-4 mt-0.5 shrink-0" />
        <p>Once online payments are switched on, purchases here will be confirmed automatically. Until then you can confirm them by hand.</p>
      </div>
    </div>
  );
};

export default PurchasesTab;
