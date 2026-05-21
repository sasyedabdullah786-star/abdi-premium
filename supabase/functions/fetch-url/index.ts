// Fetch a URL: returns extracted text + a public screenshot URL (mshots).
// No external API key required.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTitle(html: string): string {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m ? m[1].trim().slice(0, 200) : "";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { url } = await req.json();
    if (!url || typeof url !== "string" || !/^https?:\/\//i.test(url)) {
      return new Response(JSON.stringify({ error: "Valid http(s) URL required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 8-second timeout
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);

    let html = "";
    let status = 0;
    try {
      const r = await fetch(url, {
        signal: controller.signal,
        headers: { "User-Agent": "Mozilla/5.0 (compatible; ABDIBot/1.0)" },
        redirect: "follow",
      });
      status = r.status;
      const ct = r.headers.get("content-type") || "";
      if (ct.includes("text/html") || ct.includes("text/plain") || ct.includes("xml") || !ct) {
        html = (await r.text()).slice(0, 200_000);
      }
    } catch (e) {
      console.error("fetch failed", e);
    } finally {
      clearTimeout(timer);
    }

    const title = extractTitle(html);
    const text = stripHtml(html).slice(0, 8000);
    // Public screenshot service — no API key needed
    const screenshot = `https://s.wordpress.com/mshots/v1/${encodeURIComponent(url)}?w=1200`;

    return new Response(JSON.stringify({
      url, status, title, text, screenshot,
      length: text.length,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
