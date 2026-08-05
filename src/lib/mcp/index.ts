import { auth, defineMcp } from "@lovable.dev/mcp-js";
import searchCoursesTool from "./tools/search-courses";
import getCourseTool from "./tools/get-course";
import myProgressTool from "./tools/my-progress";
import createTaskTool from "./tools/create-task";
import createFlashcardTool from "./tools/create-flashcard";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "abd-i",
  title: "Abd'i",
  version: "0.1.0",
  instructions:
    "Tools for the ABD'I learning platform. Browse the course catalog, read the signed-in learner's XP/streaks/enrollments, and add study tasks or flashcards to their plan.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [searchCoursesTool, getCourseTool, myProgressTool, createTaskTool, createFlashcardTool],
});
