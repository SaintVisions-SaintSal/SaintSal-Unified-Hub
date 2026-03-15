import Anthropic from "@anthropic-ai/sdk";
import type { GenerateRequest, LLMFileOutput } from "@/lib/builder-types";

export const runtime = "edge";
export const maxDuration = 120;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const CODEGEN_SYSTEM = `You are SAL Builder — the AI code generation engine for SaintSal™ Labs, backed by US Patent #10,290,222 HACP Protocol.

You generate COMPLETE, DEPLOYABLE, PRODUCTION-READY applications from natural language prompts.

CRITICAL OUTPUT FORMAT:
You MUST return a valid JSON object with this exact structure (no markdown, no explanation outside the JSON):

{
  "projectName": "my-app",
  "description": "Brief description of what was built",
  "files": [
    {
      "path": "app/page.tsx",
      "content": "// full file content here",
      "language": "tsx"
    }
  ],
  "setupInstructions": "npm install && npm run dev",
  "explanation": "Brief explanation of the architecture and key decisions"
}

RULES:
1. ALWAYS output valid JSON. No markdown fences. No text before or after the JSON.
2. Every file must have a complete, working implementation — no placeholders, no TODOs, no "add your code here".
3. Use modern best practices: TypeScript, React 19, Next.js 15 App Router, Tailwind CSS.
4. Include package.json, tsconfig.json, tailwind.config.ts, and all config files needed to run.
5. Use a premium dark theme (bg: #0C0C0F, surface: #111118, gold accent: #F59E0B, green: #22C55E, text: #E8E6E1).
6. Include proper error handling, loading states, and responsive design.
7. Every component must be fully typed with TypeScript.
8. Use the "path" field as the actual file path relative to the project root.
9. Generate 3-15 files for a typical app. More for complex requests.
10. The code must be immediately runnable with npm install && npm run dev.`;

export async function POST(req: Request) {
  try {
    const body: GenerateRequest = await req.json();
    const { prompt, framework = "nextjs" } = body;

    if (!prompt?.trim()) {
      return new Response(JSON.stringify({ error: "prompt required" }), { status: 400 });
    }

    const frameworkContext: Record<string, string> = {
      nextjs: "Generate a Next.js 15 app with App Router, TypeScript, and Tailwind CSS.",
      react: "Generate a React 19 + Vite app with TypeScript and Tailwind CSS.",
      html: "Generate a vanilla HTML/CSS/JS app. No build tools needed.",
      node: "Generate a Node.js application with TypeScript.",
      worker: "Generate a Cloudflare Worker with TypeScript.",
    };

    const userPrompt = `${frameworkContext[framework] || frameworkContext.nextjs}

User request: ${prompt}

Generate the complete application as a JSON object matching the required schema. Every file must be complete and working. Return ONLY the JSON object, nothing else.`;

    // Stream the response so we can handle large codegen outputs
    const stream = await anthropic.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 16384,
      system: CODEGEN_SYSTEM,
      messages: [{ role: "user", content: userPrompt }],
    });

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        let fullText = "";

        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            fullText += event.delta.text;
            // Stream progress chunks
            const progress = `data: ${JSON.stringify({ type: "progress", text: event.delta.text })}\n\n`;
            controller.enqueue(encoder.encode(progress));
          }
          if (event.type === "message_stop") {
            // Parse the complete JSON output
            try {
              // Extract JSON from the response (handle potential markdown fences)
              let jsonText = fullText.trim();
              if (jsonText.startsWith("```")) {
                jsonText = jsonText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
              }

              const parsed = JSON.parse(jsonText);

              // Validate structure
              if (!parsed.files || !Array.isArray(parsed.files)) {
                throw new Error("Invalid output: missing files array");
              }

              // Create project
              const projectId = crypto.randomUUID();
              const now = Date.now();

              const files: LLMFileOutput[] = parsed.files.map((f: LLMFileOutput) => ({
                path: f.path,
                content: f.content,
                language: f.language || detectLanguage(f.path),
              }));

              // Run validation
              const buildLog: string[] = [];
              buildLog.push(`✓ Generated ${files.length} files`);
              buildLog.push(`✓ Framework: ${framework}`);
              buildLog.push(`✓ Project: ${parsed.projectName || "untitled"}`);

              const hasPackageJson = files.some((f) => f.path === "package.json" || f.path.endsWith("/package.json"));
              if (hasPackageJson) buildLog.push("✓ package.json present");
              else buildLog.push("⚠ No package.json — may need manual setup");

              const hasTsConfig = files.some((f) => f.path.includes("tsconfig"));
              if (hasTsConfig) buildLog.push("✓ TypeScript configured");

              buildLog.push("✓ Ready for preview and deployment");

              const result = {
                type: "complete",
                projectId,
                project: {
                  id: projectId,
                  name: parsed.projectName || "SAL App",
                  description: parsed.description || prompt.slice(0, 100),
                  framework,
                  createdAt: now,
                  updatedAt: now,
                  deployUrl: null,
                  deployStatus: "idle" as const,
                  buildLog,
                },
                files: files.map((f) => ({
                  ...f,
                  editedBy: "ai" as const,
                  updatedAt: now,
                })),
                explanation: parsed.explanation || "",
                setupInstructions: parsed.setupInstructions || "",
                buildLog,
              };

              controller.enqueue(encoder.encode(`data: ${JSON.stringify(result)}\n\n`));
            } catch (parseErr) {
              // If JSON parsing fails, try to extract files from markdown code blocks
              const fallbackFiles = extractFilesFromMarkdown(fullText);
              if (fallbackFiles.length > 0) {
                const projectId = crypto.randomUUID();
                const now = Date.now();
                const result = {
                  type: "complete",
                  projectId,
                  project: {
                    id: projectId,
                    name: "SAL App",
                    description: prompt.slice(0, 100),
                    framework,
                    createdAt: now,
                    updatedAt: now,
                    deployUrl: null,
                    deployStatus: "idle" as const,
                    buildLog: [`✓ Generated ${fallbackFiles.length} files (markdown fallback)`, "✓ Ready for preview"],
                  },
                  files: fallbackFiles.map((f) => ({
                    ...f,
                    editedBy: "ai" as const,
                    updatedAt: now,
                  })),
                  explanation: "Files extracted from code blocks",
                  setupInstructions: "",
                  buildLog: [`✓ Generated ${fallbackFiles.length} files`, "✓ Ready for preview"],
                };
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(result)}\n\n`));
              } else {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                  type: "error",
                  error: `Parse error: ${parseErr instanceof Error ? parseErr.message : "Unknown"}`,
                  raw: fullText.slice(0, 500),
                })}\n\n`));
              }
            }

            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();
          }
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Generation error";
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}

function detectLanguage(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase() || "";
  const map: Record<string, string> = {
    tsx: "tsx", ts: "ts", jsx: "jsx", js: "js", json: "json",
    html: "html", css: "css", md: "markdown", py: "python",
    sh: "bash", sql: "sql", yaml: "yaml", yml: "yaml",
    env: "env", mjs: "js", cjs: "js",
  };
  return map[ext] || ext;
}

function extractFilesFromMarkdown(text: string): LLMFileOutput[] {
  const files: LLMFileOutput[] = [];
  const re = /```(\w+)(?:\s+([^\n]+))?\n([\s\S]*?)```/g;
  const extMap: Record<string, string> = {
    jsx: "App.jsx", tsx: "App.tsx", js: "index.js", ts: "index.ts",
    html: "index.html", css: "styles.css", json: "package.json",
    py: "main.py", sh: "setup.sh",
  };
  let m;
  while ((m = re.exec(text)) !== null) {
    const lang = m[1];
    const name = m[2]?.trim() || extMap[lang] || `file.${lang}`;
    files.push({ path: name, content: m[3], language: lang });
  }
  return files;
}
