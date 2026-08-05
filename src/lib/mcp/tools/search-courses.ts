import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "search_courses",
  title: "Search courses",
  description: "Search the published ABD'I course catalog by title, description, or category.",
  inputSchema: {
    query: z.string().trim().optional().describe("Free-text search across title and description."),
    category: z.string().trim().optional().describe("Filter by category name."),
    limit: z.number().int().min(1).max(50).optional().describe("Max results (default 20)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query, category, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    let q = supabase
      .from("courses")
      .select("id, title, description, category, price, duration, is_featured, total_enrollments, average_rating")
      .eq("is_published", true)
      .limit(limit ?? 20);
    if (category) q = q.eq("category", category);
    if (query) q = q.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { courses: data ?? [] },
    };
  },
});
