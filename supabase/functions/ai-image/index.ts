// AI Image Studio — generate + edit images using Gemini 2.5 Flash Image (Nano Banana)
// via the Lovable AI gateway. Returns one or more image data URLs.
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
    const prompt: string = (body.prompt || "").toString().slice(0, 2000);
    const sourceImage: string | undefined = body.source_image; // optional data URL or https URL

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Prompt required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userContent: any[] = [{ type: "text", text: prompt }];
    if (sourceImage) {
      userContent.push({ type: "image_url", image_url: { url: sourceImage } });
    }

    const payload = {
      model: "google/gemini-2.5-flash-image",
      messages: [{ role: "user", content: userContent }],
      modalities: ["image", "text"],
    };

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
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (resp.status === 402) {
      return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!resp.ok) {
      const t = await resp.text();
      console.error("ai-image gateway:", resp.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const json = await resp.json();
    const msg = json.choices?.[0]?.message;
    // Gemini image models return images on message.images[] as data URLs
    const images: string[] = (msg?.images || [])
      .map((im: any) => im?.image_url?.url || im?.url)
      .filter(Boolean);
    const text = msg?.content || "";

    return new Response(JSON.stringify({ images, text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-image error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
