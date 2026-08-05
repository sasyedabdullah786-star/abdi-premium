import { defineTool } from "@lovable.dev/mcp-js";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "my_progress",
  title: "My learning progress",
  description: "Get the signed-in learner's XP, level, streaks, and course enrollments with progress.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const userId = ctx.getUserId();
    const [statsRes, enrollRes] = await Promise.all([
      supabase.from("user_stats").select("*").eq("user_id", userId).maybeSingle(),
      supabase
        .from("enrollments")
        .select("course_id, xp_earned, viewed_lessons, updated_at, courses(title, category)")
        .eq("user_id", userId),
    ]);
    if (statsRes.error) return { content: [{ type: "text", text: statsRes.error.message }], isError: true };
    if (enrollRes.error) return { content: [{ type: "text", text: enrollRes.error.message }], isError: true };
    const payload = { stats: statsRes.data ?? null, enrollments: enrollRes.data ?? [] };
    return {
      content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
      structuredContent: payload,
    };
  },
});
