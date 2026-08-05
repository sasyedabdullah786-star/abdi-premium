import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "create_flashcard",
  title: "Create flashcard",
  description: "Save a flashcard (front/back) to the signed-in learner's study deck.",
  inputSchema: {
    front: z.string().trim().min(1).describe("Question or prompt side."),
    back: z.string().trim().min(1).describe("Answer side."),
    topic: z.string().trim().optional().describe("Optional topic label."),
    course_id: z.string().uuid().optional().describe("Optional course to attach the card to."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ front, back, topic, course_id }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("flashcards")
      .insert({
        user_id: ctx.getUserId(),
        front,
        back,
        topic: topic ?? null,
        course_id: course_id ?? null,
      })
      .select()
      .maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `Flashcard saved: ${data?.front}` }],
      structuredContent: { flashcard: data },
    };
  },
});
