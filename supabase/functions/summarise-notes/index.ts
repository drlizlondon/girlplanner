// GirlPlanner — AI summary Edge Function.
//
// Takes raw captured notes / a voice transcript and returns a "Daily Executive
// Processing report" in the exact markdown format the app's existing
// deterministic parser (src/lib/briefingParser.ts -> parseBriefing) already
// consumes. The client feeds the returned markdown straight into the existing
// createBriefing() path, so the review UI, the parser, and the
// briefing_suggestions shape all stay unchanged. This replaces the old manual
// "copy to ChatGPT, paste the result back" bridge.
//
// PROVIDER SEAM (mirrors BPP's Pip): the LLM is chosen by env, so swapping
// provider/model is one secret change with no code edit.
//   PIP_LLM_PROVIDER   default "gemini"  (also: "anthropic", "openai")
//   PIP_LLM_MODEL      default "gemini-2.0-flash-lite"
//   GEMINI_API_KEY / ANTHROPIC_API_KEY / OPENAI_API_KEY  (secrets — set the
//                      one matching the provider; NEVER in the client bundle)
//
// The key lives only in the Edge Function's secrets. The app is public, so no
// key ever reaches the browser.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SYSTEM_PROMPT = `You are the processing engine behind a founder's daily planner.
You are given raw, messy captured notes or a voice transcript from one person's day.
Turn them into a calm, structured "Daily Executive Processing report" in GitHub-flavoured markdown.

Output RULES (strict — the app parses this deterministically by heading):
- Use ONLY these level-2 headings, in this order, and only include a heading if you have real content for it:
  ## Overview
  ## Executive Signals
  ## Priority Actions
  ## Possible Follow Ups
  ## Project Updates
  ## Strategic Insights
  ## Open Questions
  ## Parked Ideas
- Overview and Executive Signals are short prose (1-3 sentences each).
- Priority Actions, Possible Follow Ups, Strategic Insights, Open Questions and Parked Ideas are markdown bullet lists ("- ").
- For an actionable bullet, write "Title — one line of detail" (use an em dash or " - " between the title and the detail).
- If a bullet clearly belongs to a named project, prefix it with the project in square brackets, e.g. "- [BishBash] Ship onboarding — final QA pass".
- Under ## Project Updates, use level-3 headings for each project name, then bullets; you may add a "#### Next Steps" sub-heading with its own bullets.
- Invent nothing. Only reflect what the notes contain. Do not add commentary, preamble, or a closing note.
- Return the markdown report and NOTHING else (no code fences, no "Here is...").`;

function buildUserPrompt(notes: string): string {
  const today = new Date().toISOString().slice(0, 10);
  return `Today's date: ${today}\n\nRaw captured notes:\n"""\n${notes}\n"""\n\nProduce the Daily Executive Processing report now.`;
}

async function callGemini(model: string, notes: string): Promise<string> {
  const key = Deno.env.get("GEMINI_API_KEY");
  if (!key) throw new Error("GEMINI_API_KEY is not set");
  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ role: "user", parts: [{ text: buildUserPrompt(notes) }] }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 2048 },
    }),
  });
  if (!res.ok) {
    throw new Error(`Gemini error ${res.status}: ${await res.text()}`);
  }
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts
    ?.map((p: { text?: string }) => p?.text ?? "")
    .join("") ?? "";
  return text.trim();
}

async function callAnthropic(model: string, notes: string): Promise<string> {
  const key = Deno.env.get("ANTHROPIC_API_KEY");
  if (!key) throw new Error("ANTHROPIC_API_KEY is not set");
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 2048,
      temperature: 0.3,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildUserPrompt(notes) }],
    }),
  });
  if (!res.ok) {
    throw new Error(`Anthropic error ${res.status}: ${await res.text()}`);
  }
  const data = await res.json();
  const text = (data?.content ?? [])
    .map((b: { text?: string }) => b?.text ?? "")
    .join("");
  return text.trim();
}

async function callOpenAI(model: string, notes: string): Promise<string> {
  const key = Deno.env.get("OPENAI_API_KEY");
  if (!key) throw new Error("OPENAI_API_KEY is not set");
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.3,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(notes) },
      ],
    }),
  });
  if (!res.ok) {
    throw new Error(`OpenAI error ${res.status}: ${await res.text()}`);
  }
  const data = await res.json();
  return (data?.choices?.[0]?.message?.content ?? "").trim();
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const provider = (Deno.env.get("PIP_LLM_PROVIDER") ?? "gemini").toLowerCase();
  const model = Deno.env.get("PIP_LLM_MODEL") ?? "gemini-2.0-flash-lite";

  try {
    const body = await req.json().catch(() => ({}));
    const notes = typeof body?.notes === "string" ? body.notes.trim() : "";
    if (!notes) {
      return new Response(JSON.stringify({ error: "No notes provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let markdown: string;
    switch (provider) {
      case "anthropic":
        markdown = await callAnthropic(model, notes);
        break;
      case "openai":
        markdown = await callOpenAI(model, notes);
        break;
      case "gemini":
      default:
        markdown = await callGemini(model, notes);
        break;
    }

    if (!markdown) {
      return new Response(
        JSON.stringify({ error: "The model returned an empty summary" }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    return new Response(JSON.stringify({ markdown, provider, model }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("summarise-notes failed:", err);
    return new Response(
      JSON.stringify({ error: (err as Error)?.message ?? "Summary failed" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
