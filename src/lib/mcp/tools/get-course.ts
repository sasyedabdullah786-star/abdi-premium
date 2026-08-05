import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "get_course",
  title: "Get course details",
  description: "Fetch one published course with its lessons by course id.",
  inputSchema: { course_id: z.string().uuid().describe("The course id.") },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ course_id }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data: course, error } = await supabase
      .from("courses")
      .select("*")
      .eq("id", course_id)
      .maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!course) return { content: [{ type: "text", text: "Course not found" }], isError: true };
    const { data: lessons } = await supabase
      .from("lessons")
      .select("id, title, description, duration, sort_order")
      .eq("course_id", course_id)
      .order("sort_order");
    const payload = { course, lessons: lessons ?? [] };
    return {
      content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
      structuredContent: payload,
    };
  },
});
