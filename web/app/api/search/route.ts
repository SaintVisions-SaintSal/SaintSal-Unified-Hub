import Anthropic from "@anthropic-ai/sdk";

export const runtime = "edge";
export const maxDuration = 60;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

export async function POST(req: Request) {
  try {
    const { query, vertical = "search" } = await req.json();

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      tools: [
        {
          type: "web_search_20250305",
          name: "web_search",
        } as unknown as Anthropic.Messages.Tool,
      ],
      system: `You are SAL Search — the AI research engine for SaintSal™ Labs. Use web search to find current, accurate information. Provide comprehensive, well-structured analysis with specific data. Vertical context: ${vertical}.`,
      messages: [{ role: "user", content: query }],
    });

    const textContent = message.content.find((c) => c.type === "text");
    const result = textContent?.type === "text" ? textContent.text : "No results found";

    return Response.json({ result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Search error";
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}
