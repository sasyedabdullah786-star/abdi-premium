import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "create_daily_task",
  title: "Create daily study task",
  description: "Add a study task to the signed-in learner's daily plan.",
  inputSchema: {
    title: z.string().trim().min(1).describe("Task title."),
    description: z.string().trim().optional().describe("Optional task detail."),
    task_type: z.string().trim().optional().describe("Task type, e.g. study, revise, quiz."),
    task_date: z.string().trim().optional().describe("ISO date (YYYY-MM-DD). Defaults to today."),
    xp_reward: z.number().int().min(0).max(500).optional().describe("XP granted on completion."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ title, description, task_type, task_date, xp_reward }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("daily_tasks")
      .insert({
        user_id: ctx.getUserId(),
        title,
        description: description ?? null,
        task_type: task_type ?? "study",
        ...(task_date ? { task_date } : {}),
        ...(xp_reward !== undefined ? { xp_reward } : {}),
      })
      .select()
      .maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `Task created: ${data?.title}` }],
      structuredContent: { task: data },
    };
  },
});
