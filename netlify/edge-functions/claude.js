// Proxy from Takaran to the Claude API. The API key stays on Netlify (ANTHROPIC_API_KEY),
// never in the browser. Optional APP_PASSCODE stops strangers from spending your credits.
const json = (status, type, message) =>
  new Response(JSON.stringify({ error: { type, message } }), {
    status,
    headers: { "content-type": "application/json" },
  });

export default async (req) => {
  if (req.method !== "POST") return json(405, "method", "Use POST");

  const passcode = Netlify.env.get("APP_PASSCODE");
  if (passcode && req.headers.get("x-app-passcode") !== passcode) {
    return json(401, "passcode", "Wrong or missing passcode");
  }
  const key = Netlify.env.get("ANTHROPIC_API_KEY");
  if (!key) return json(500, "no_key", "ANTHROPIC_API_KEY is not set");

  let body;
  try {
    body = await req.json();
  } catch {
    return json(400, "bad_request", "Invalid JSON");
  }

  // Accept only what the page sends: one user turn of text and image blocks.
  const messages = body?.messages;
  const ok =
    Array.isArray(messages) &&
    messages.length === 1 &&
    messages[0].role === "user" &&
    Array.isArray(messages[0].content) &&
    messages[0].content.length <= 4 &&
    messages[0].content.every((b) => b && (b.type === "text" || b.type === "image"));
  if (!ok) return json(400, "bad_request", "Unexpected request shape");

  const upstream = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: Netlify.env.get("ANTHROPIC_MODEL") || "claude-sonnet-5-5",
      max_tokens: Math.min(Number(body.max_tokens) || 2000, 4000),
      stream: true,
      messages,
    }),
  });

  if (!upstream.ok) {
    const status = upstream.status === 429 || upstream.status === 529 ? 429 : 502;
    return json(status, "upstream", `Claude API returned ${upstream.status}`);
  }
  // Stream the answer straight through so long analyses don't hit the response time limit.
  return new Response(upstream.body, {
    headers: { "content-type": "text/event-stream", "cache-control": "no-store" },
  });
};

export const config = { path: "/api/claude" };
