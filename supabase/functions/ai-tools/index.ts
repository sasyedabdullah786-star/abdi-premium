// AI Tools edge function — handles 3 modes: learning_path, quiz, summarize
// Uses Lovable AI Gateway with structured tool-calling for path & quiz, plain text for summary.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not set");

    const body = await req.json();
    const mode: string = body.mode;
    const input: string = (body.input || "").toString().slice(0, 8000);
    const goal: string = (body.goal || "").toString().slice(0, 500);
    const weeks: number = Math.min(Math.max(parseInt(body.weeks ?? "4"), 1), 12);
    const difficulty: string = body.difficulty || "beginner";
    const numQuestions: number = Math.min(Math.max(parseInt(body.num_questions ?? "5"), 3), 15);

    // Pull lightweight course context (titles only) so AI grounds suggestions in actual platform.
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_ANON_KEY");
    let courseList = "";
    if (supabaseUrl && supabaseKey) {
      try {
        const sb = createClient(supabaseUrl, supabaseKey);
        const { data } = await sb
          .from("courses")
          .select("title, category, description")
          .eq("is_published", true)
          .limit(50);
        if (data?.length) {
          courseList = data
            .map((c: any) => `- ${c.title} (${c.category || "general"})`)
            .join("\n");
        }
      } catch (e) {
        console.error("courses fetch failed", e);
      }
    }

    let payload: Record<string, unknown> = {
      model: "google/gemini-2.5-flash",
    };

    if (mode === "learning_path") {
      payload = {
        ...payload,
        messages: [
          {
            role: "system",
            content:
              "You are an elite curriculum designer + career mentor for the ABD\"I learning platform. You build realistic, week-by-week paths AND a full mastery + consistency + networking strategy. Always call the path_plan tool. Be specific, motivational, and concise.",
          },
          {
            role: "user",
            content: `Goal: ${goal}\nDifficulty: ${difficulty}\nDuration: ${weeks} weeks\n\nAvailable platform courses:\n${courseList || "(no courses listed)"}\n\nReturn a complete plan: weekly schedule + a mastery_guide (how to truly master this), a consistency_plan (daily habits, anti-burnout, accountability), and a networking_plan (communities, mentors, content to consume, people to follow).`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "path_plan",
              description: "Return a week-by-week structured learning path with mastery, consistency and networking sections",
              parameters: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  summary: { type: "string" },
                  weeks: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        week: { type: "number" },
                        focus: { type: "string" },
                        daily_minutes: { type: "number" },
                        milestones: { type: "array", items: { type: "string" } },
                        suggested_courses: { type: "array", items: { type: "string" } },
                      },
                      required: ["week", "focus", "milestones"],
                    },
                  },
                  mastery_guide: {
                    type: "object",
                    description: "How to go from learner to master of this domain",
                    properties: {
                      pillars: { type: "array", items: { type: "string" }, description: "3-5 core skill pillars to deeply master" },
                      deep_practice: { type: "array", items: { type: "string" }, description: "Specific deep-practice rituals" },
                      milestones: { type: "array", items: { type: "string" }, description: "Mastery checkpoints (beginner → expert)" },
                      mistakes_to_avoid: { type: "array", items: { type: "string" } },
                    },
                    required: ["pillars", "deep_practice", "milestones"],
                  },
                  consistency_plan: {
                    type: "object",
                    description: "Daily/weekly habit system to keep going",
                    properties: {
                      daily_ritual: { type: "array", items: { type: "string" }, description: "Step-by-step daily routine" },
                      weekly_review: { type: "array", items: { type: "string" } },
                      anti_burnout: { type: "array", items: { type: "string" } },
                      accountability: { type: "array", items: { type: "string" }, description: "How to stay accountable" },
                    },
                    required: ["daily_ritual"],
                  },
                  networking_plan: {
                    type: "object",
                    description: "How to build a network in this field",
                    properties: {
                      communities: { type: "array", items: { type: "string" }, description: "Communities/Discords/forums to join" },
                      mentors: { type: "array", items: { type: "string" }, description: "Profiles / kinds of mentors to seek" },
                      people_to_follow: { type: "array", items: { type: "string" } },
                      content_to_consume: { type: "array", items: { type: "string" }, description: "Books, podcasts, channels, newsletters" },
                      outreach_template: { type: "string", description: "A short cold-DM template to reach out to mentors" },
                    },
                    required: ["communities", "people_to_follow"],
                  },
                },
                required: ["title", "summary", "weeks", "mastery_guide", "consistency_plan", "networking_plan"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "path_plan" } },
      };
    } else if (mode === "quiz") {
      payload = {
        ...payload,
        messages: [
          {
            role: "system",
            content:
              "You generate clear, well-scoped multiple-choice quizzes. Always use the make_quiz tool. Each question has exactly 4 options and one correct_index (0-3).",
          },
          {
            role: "user",
            content: `Topic / source material:\n${input}\n\nDifficulty: ${difficulty}\nNumber of questions: ${numQuestions}`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "make_quiz",
              description: "Return a multiple-choice quiz",
              parameters: {
                type: "object",
                properties: {
                  topic: { type: "string" },
                  questions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        question: { type: "string" },
                        options: {
                          type: "array",
                          items: { type: "string" },
                          minItems: 4,
                          maxItems: 4,
                        },
                        correct_index: { type: "number" },
                        explanation: { type: "string" },
                      },
                      required: ["question", "options", "correct_index", "explanation"],
                    },
                  },
                },
                required: ["topic", "questions"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "make_quiz" } },
      };
    } else if (mode === "summarize") {
      payload = {
        ...payload,
        messages: [
          {
            role: "system",
            content:
              "You produce concise, well-structured study notes from raw text. Format with markdown: a short TL;DR, key concepts as a bullet list, and 3-5 quick-recall flashcard prompts. Be ruthless — no fluff.",
          },
          { role: "user", content: input },
        ],
      };
    } else {
      return new Response(JSON.stringify({ error: "Unknown mode" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resp = await fetch(GATEWAY, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (resp.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limited. Try again shortly." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (resp.status === 402) {
      return new Response(JSON.stringify({ error: "AI credits exhausted. Top up your Lovable AI workspace." }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!resp.ok) {
      const t = await resp.text();
      console.error("AI gateway:", resp.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const json = await resp.json();
    if (mode === "summarize") {
      const content = json.choices?.[0]?.message?.content || "";
      return new Response(JSON.stringify({ content }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // structured: pull tool args
    const tc = json.choices?.[0]?.message?.tool_calls?.[0];
    if (!tc) {
      return new Response(JSON.stringify({ error: "No structured output returned" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    let args: unknown = {};
    try {
      args = JSON.parse(tc.function?.arguments || "{}");
    } catch {
      args = {};
    }
    return new Response(JSON.stringify({ data: args }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-tools error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
