import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Send, Reply, Trash2, ArrowUp, Users, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Discussion {
  id: string;
  course_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  upvotes: number;
  created_at: string;
}

interface DiscussionsProps {
  courseId?: string;
}

const Discussions = ({ courseId: propCourseId }: DiscussionsProps) => {
  const params = useParams();
  const courseId = propCourseId || params.courseId;
  const { user } = useAuth();
  const { toast } = useToast();

  const [items, setItems] = useState<Discussion[]>([]);
  const [content, setContent] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [presence, setPresence] = useState(0);

  useEffect(() => {
    if (!courseId) return;
    let active = true;

    const load = async () => {
      const { data } = await supabase
        .from("discussions")
        .select("*")
        .eq("course_id", courseId)
        .order("created_at", { ascending: false })
        .limit(100);
      if (active) {
        setItems((data as Discussion[]) || []);
        setLoading(false);
      }
    };
    load();

    const channel = supabase
      .channel(`discussions:${courseId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "discussions", filter: `course_id=eq.${courseId}` },
        () => load()
      )
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        setPresence(Object.keys(state).length);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED" && user) {
          await channel.track({ user_id: user.id, online_at: new Date().toISOString() });
        }
      });

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [courseId, user]);

  const post = async (text: string, parent: string | null) => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to post." });
      return;
    }
    if (!text.trim() || !courseId) return;
    setPosting(true);
    const { error } = await supabase.from("discussions").insert({
      course_id: courseId,
      user_id: user.id,
      parent_id: parent,
      content: text.trim(),
    });
    setPosting(false);
    if (error) {
      toast({ title: "Failed", description: error.message, variant: "destructive" });
    } else {
      if (parent) {
        setReplyTo(null);
        setReplyContent("");
      } else {
        setContent("");
      }
    }
  };

  const remove = async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from("discussions").delete().eq("id", id);
    if (error) toast({ title: "Failed", description: error.message, variant: "destructive" });
  };

  const upvote = async (d: Discussion) => {
    const { error } = await supabase
      .from("discussions")
      .update({ upvotes: d.upvotes + 1 })
      .eq("id", d.id);
    if (error) console.error(error);
  };

  const topLevel = items.filter((i) => !i.parent_id);
  const repliesFor = (id: string) =>
    items.filter((i) => i.parent_id === id).sort((a, b) => a.created_at.localeCompare(b.created_at));

  return (
    <div className="surface-elevated p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm">Discussion ({topLevel.length})</h3>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
          </span>
          <Users className="w-3.5 h-3.5" />
          <span>{Math.max(presence, 1)} studying</span>
        </div>
      </div>

      {/* New thread composer */}
      <div className="mb-5">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          placeholder={user ? "Ask a question or share a tip..." : "Sign in to join the discussion"}
          disabled={!user || posting}
          className="input-glass resize-none text-sm h-auto py-2.5"
        />
        <div className="flex justify-end mt-2">
          <button
            onClick={() => post(content, null)}
            disabled={!user || posting || !content.trim()}
            className="btn-primary text-xs h-8 px-3 disabled:opacity-50"
          >
            {posting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            Post
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-xs text-muted-foreground py-6">Loading...</div>
      ) : topLevel.length === 0 ? (
        <div className="text-center text-xs text-muted-foreground py-6">
          Be the first to start a discussion.
        </div>
      ) : (
        <div className="space-y-3">
          {topLevel.map((d) => {
            const replies = repliesFor(d.id);
            return (
              <article key={d.id} className="rounded-lg border border-border/50 p-3 bg-muted/20">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5">
                      <span className="font-medium text-foreground/80">User {d.user_id.slice(0, 6)}</span>
                      <span>·</span>
                      <span>{formatDistanceToNow(new Date(d.created_at), { addSuffix: true })}</span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap break-words">{d.content}</p>
                    <div className="flex items-center gap-3 mt-2.5">
                      <button
                        onClick={() => upvote(d)}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                      >
                        <ArrowUp className="w-3.5 h-3.5" /> {d.upvotes}
                      </button>
                      <button
                        onClick={() => setReplyTo(replyTo === d.id ? null : d.id)}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Reply className="w-3.5 h-3.5" /> Reply
                      </button>
                      {user?.id === d.user_id && (
                        <button
                          onClick={() => remove(d.id)}
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {replyTo === d.id && (
                  <div className="mt-3 pl-4 border-l border-border/50">
                    <textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      rows={2}
                      placeholder="Write a reply..."
                      className="input-glass resize-none text-sm h-auto py-2"
                      autoFocus
                    />
                    <div className="flex justify-end gap-2 mt-2">
                      <button
                        onClick={() => { setReplyTo(null); setReplyContent(""); }}
                        className="btn-ghost text-xs h-7 px-2.5"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => post(replyContent, d.id)}
                        disabled={!replyContent.trim() || posting}
                        className="btn-primary text-xs h-7 px-2.5"
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                )}

                {replies.length > 0 && (
                  <div className="mt-3 pl-4 border-l border-border/50 space-y-2">
                    {replies.map((r) => (
                      <div key={r.id} className="rounded-md p-2.5 bg-background/50">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                          <span className="font-medium text-foreground/80">User {r.user_id.slice(0, 6)}</span>
                          <span>·</span>
                          <span>{formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}</span>
                          {user?.id === r.user_id && (
                            <button
                              onClick={() => remove(r.id)}
                              className="ml-auto text-muted-foreground hover:text-destructive transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                        <p className="text-sm whitespace-pre-wrap break-words">{r.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Discussions;
