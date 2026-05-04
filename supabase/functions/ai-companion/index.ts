// AI Study Companion edge function
// Handles 3 modes: 'daily_tasks', 'adaptive_quiz', 'flashcards'
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

async function callAI(messages: any[], tools?: any[], toolChoice?: any) {
  const body: any = {
    model: "google/gemini-2.5-flash",
    messages,
  };
  if (tools) {
    body.tools = tools;
    body.tool_choice = toolChoice;
  }
  const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`AI gateway ${r.status}: ${t}`);
  }
  return r.json();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const { mode, topic, difficulty, count, recentScores, userName } = await req.json();

    // ---------------- DAILY TASKS ----------------
    if (mode === "daily_tasks") {
      const sys = `You are an exam-focused AI study mentor for ABD"I, an Indian learning platform. Generate 4 actionable, exam-focused daily study tasks for ${userName || "the student"}. Mix theory, practice, revision, and a short motivational task. Keep titles under 60 chars. Use a motivational tone with one shayari-style line in description occasionally.`;
      const tools = [{
        type: "function",
        function: {
          name: "emit_tasks",
          description: "Return today's study tasks",
          parameters: {
            type: "object",
            properties: {
              tasks: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    description: { type: "string" },
                    task_type: { type: "string", enum: ["study", "practice", "revision", "motivation"] },
                    xp_reward: { type: "number" },
                  },
                  required: ["title", "description", "task_type", "xp_reward"],
                  additionalProperties: false,
                },
              },
            },
            required: ["tasks"],
            additionalProperties: false,
          },
        },
      }];
      const data = await callAI(
        [{ role: "system", content: sys }, { role: "user", content: "Generate today's tasks." }],
        tools,
        { type: "function", function: { name: "emit_tasks" } },
      );
      const args = JSON.parse(data.choices[0].message.tool_calls[0].function.arguments);
      return new Response(JSON.stringify(args), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ---------------- ADAPTIVE QUIZ ----------------
    if (mode === "adaptive_quiz") {
      // Adapt difficulty: average score < 50 => easy, < 80 => medium, else hard
      const avg = Array.isArray(recentScores) && recentScores.length
        ? recentScores.reduce((a: number, b: number) => a + b, 0) / recentScores.length
        : 60;
      const adaptedDifficulty = difficulty || (avg < 50 ? "easy" : avg < 80 ? "medium" : "hard");

      const sys = `Generate a ${adaptedDifficulty} difficulty quiz on "${topic || "general knowledge"}" for an Indian student. Each question 4 options, one correct, with brief explanation.`;
      const tools = [{
        type: "function",
        function: {
          name: "emit_quiz",
          description: "Return quiz questions",
          parameters: {
            type: "object",
            properties: {
              difficulty: { type: "string" },
              questions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    question: { type: "string" },
                    options: { type: "array", items: { type: "string" } },
                    correct_index: { type: "number" },
                    explanation: { type: "string" },
                  },
                  required: ["question", "options", "correct_index", "explanation"],
                  additionalProperties: false,
                },
              },
            },
            required: ["difficulty", "questions"],
            additionalProperties: false,
          },
        },
      }];
      const data = await callAI(
        [{ role: "system", content: sys }, { role: "user", content: `Generate ${count || 5} questions.` }],
        tools,
        { type: "function", function: { name: "emit_quiz" } },
      );
      const args = JSON.parse(data.choices[0].message.tool_calls[0].function.arguments);
      return new Response(JSON.stringify(args), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ---------------- FLASHCARDS ----------------
    if (mode === "flashcards") {
      const sys = `Generate concise exam-focused flashcards on "${topic}". Front = a question or term, back = a crisp 1-3 sentence answer.`;
      const tools = [{
        type: "function",
        function: {
          name: "emit_flashcards",
          description: "Return flashcards",
          parameters: {
            type: "object",
            properties: {
              cards: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    front: { type: "string" },
                    back: { type: "string" },
                  },
                  required: ["front", "back"],
                  additionalProperties: false,
                },
              },
            },
            required: ["cards"],
            additionalProperties: false,
          },
        },
      }];
      const data = await callAI(
        [{ role: "system", content: sys }, { role: "user", content: `Generate ${count || 8} flashcards.` }],
        tools,
        { type: "function", function: { name: "emit_flashcards" } },
      );
      const args = JSON.parse(data.choices[0].message.tool_calls[0].function.arguments);
      return new Response(JSON.stringify(args), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid mode" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-companion error", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    const status = msg.includes("429") ? 429 : msg.includes("402") ? 402 : 500;
    return new Response(JSON.stringify({ error: msg }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
