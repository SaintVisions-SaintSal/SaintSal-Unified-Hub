import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPTS } from "@/lib/constants";

export const runtime = "edge";
export const maxDuration = 60;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

export async function POST(req: Request) {
  try {
    const { topic, brandVoice } = await req.json();

    if (!topic) {
      return new Response(JSON.stringify({ error: "topic required" }), { status: 400 });
    }

    const brandContext = brandVoice
      ? `\n\nBrand voice: ${brandVoice}`
      : "\n\nBrand: SaintSal™ Labs — Responsible Intelligence™ — Patent #10,290,222 HACP Protocol — 175+ countries";

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: SYSTEM_PROMPTS.social + brandContext,
      messages: [
        {
          role: "user",
          content: `Create platform-optimized social media posts about: ${topic}\n\nReturn ONLY a valid JSON object with exactly these keys: x, li, ig, tt, fb. Each value is a complete post string ready to copy-paste. No markdown, no backticks, no explanation.`,
        },
      ],
    });

    const raw = message.content[0].type === "text" ? message.content[0].text : "";

    try {
      const clean = raw.replace(/```json|```/g, "").trim();
      const posts = JSON.parse(clean);
      return Response.json({ posts });
    } catch {
      // Fallback: build posts from topic
      const fallback = {
        x: `${topic}\n\n#AI #SaintSal #ResponsibleAI #Innovation`,
        li: `Excited to share: ${topic}\n\nAt SaintSal™ Labs, we build with Responsible Intelligence™ — technology that serves humanity first.\n\nPatent #10,290,222 | 175+ Countries | HACP Protocol\n\n#AI #Technology #Innovation #SaintSal`,
        ig: `${topic} ✨\n\nPowered by Responsible Intelligence™\n\n#AIInnovation #SaintSalLabs #ResponsibleAI #TechForGood #HACP`,
        tt: `${topic} 🔥 Here's why this matters for everyone... #AI #SaintSal #Innovation #TechTok`,
        fb: `${topic}\n\nAt SaintSal™ Labs, we believe in Responsible Intelligence™ — AI that's patent-protected, faith-forward, and built for the 33% of the market that mainstream AI can't serve.\n\nWhat do you think? Drop your thoughts below! 👇`,
      };
      return Response.json({ posts: fallback });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Social generation error";
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}
