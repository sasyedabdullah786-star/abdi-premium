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
    } else if (mode === "nextgen") {
      // NextGen Career Time-Machine — simulates "Future You" in 5 years
      // for a chosen path and reverse-engineers the steps to get there.
      payload = {
        ...payload,
        messages: [
          {
            role: "system",
            content:
              "You are NextGen — a never-before-seen AI tool that runs a 5-year 'Future Self Time-Machine' simulation. For the user's chosen path, write a vivid day-in-the-life of their future self, identify the inflection points that got them there, list the skills, mindset shifts, signature projects, and the wealth/impact trajectory. Always call the time_machine tool. Be cinematic but specific, never generic.",
          },
          {
            role: "user",
            content: `Path / dream: ${input || goal || "becoming an exceptional version of myself"}\nCurrent level: ${difficulty}\nHorizon: 5 years.\n\nRun the simulation.`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "time_machine",
              description: "Simulate the user's future self 5 years from now along the chosen path",
              parameters: {
                type: "object",
                properties: {
                  future_identity: { type: "string", description: "One-line headline of who they become (e.g. 'Senior product engineer at a unicorn shipping AI products')" },
                  day_in_life: { type: "string", description: "Cinematic 1-paragraph day-in-the-life of Future You" },
                  inflection_points: {
                    type: "array",
                    description: "3-5 key moments / decisions that made the difference",
                    items: {
                      type: "object",
                      properties: {
                        when: { type: "string", description: "e.g. 'Month 3', 'Year 2'" },
                        moment: { type: "string" },
                        why_it_mattered: { type: "string" },
                      },
                      required: ["when", "moment", "why_it_mattered"],
                    },
                  },
                  signature_projects: { type: "array", items: { type: "string" }, description: "3 portfolio-defining projects to ship" },
                  skills_unlocked: { type: "array", items: { type: "string" } },
                  mindset_shifts: { type: "array", items: { type: "string" }, description: "Old belief → new belief format" },
                  wealth_impact: { type: "string", description: "Realistic income / impact band by year 5" },
                  letter_from_future: { type: "string", description: "A 4-6 sentence motivational letter from Future You to Present You" },
                  first_step_tomorrow: { type: "string", description: "The single most important action to take in the next 24h" },
                },
                required: ["future_identity", "day_in_life", "inflection_points", "signature_projects", "skills_unlocked", "letter_from_future", "first_step_tomorrow"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "time_machine" } },
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
