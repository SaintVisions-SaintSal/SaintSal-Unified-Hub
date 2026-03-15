import Anthropic from "@anthropic-ai/sdk";
import type { EditRequest, LLMFileOutput } from "@/lib/builder-types";

export const runtime = "edge";
export const maxDuration = 120;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const EDIT_SYSTEM = `You are SAL Builder — the AI code editing engine for SaintSal™ Labs.

You receive:
1. A user's edit instruction
2. The current project files (some or all)
3. Optionally, specific files to focus on

Your job: Apply the requested changes and return ONLY a valid JSON object:

{
  "files": [
    {
      "path": "app/page.tsx",
      "content": "// complete updated file content",
      "language": "tsx"
    }
  ],
  "changedPaths": ["app/page.tsx"],
  "explanation": "What was changed and why"
}

RULES:
1. Return ONLY the files that CHANGED. Do not return unchanged files.
2. Return the COMPLETE file content for each changed file, not just the diff.
3. If new files are needed, include them with their full path and content.
4. If a file should be deleted, include it with empty content and note it in explanation.
5. Output valid JSON only. No markdown fences, no text outside the JSON.
6. Preserve existing code style, imports, and architecture.
7. Never break existing functionality unless explicitly asked.
8. Keep the premium dark theme (bg: #0C0C0F, gold: #F59E0B, green: #22C55E).`;

export async function POST(req: Request) {
  try {
    const body: EditRequest = await req.json();
    const { projectId, message, files = [], targetFiles } = body;

    if (!message?.trim()) {
      return new Response(JSON.stringify({ error: "message required" }), { status: 400 });
    }

    // Build the file context for the LLM
    let fileContext = "";
    const relevantFiles = targetFiles
      ? files.filter((f) => targetFiles.includes(f.path))
      : files;

    for (const f of relevantFiles) {
      fileContext += `\n--- FILE: ${f.path} (${f.language}) ---\n${f.content}\n`;
    }

    // If we have more files than the targeted ones, mention them
    const otherFiles = files.filter((f) => !relevantFiles.includes(f));
    if (otherFiles.length > 0) {
      fileContext += `\n--- OTHER PROJECT FILES (not shown, ${otherFiles.length} files): ${otherFiles.map((f) => f.path).join(", ")} ---\n`;
    }

    const userPrompt = `Current project files:
${fileContext}

User edit request: ${message}

Apply the changes and return the JSON object with only the changed/new files. Return ONLY valid JSON.`;

    const stream = await anthropic.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 16384,
      system: EDIT_SYSTEM,
      messages: [{ role: "user", content: userPrompt }],
    });

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        let fullText = "";

        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            fullText += event.delta.text;
            const progress = `data: ${JSON.stringify({ type: "progress", text: event.delta.text })}\n\n`;
            controller.enqueue(encoder.encode(progress));
          }
          if (event.type === "message_stop") {
            try {
              let jsonText = fullText.trim();
              if (jsonText.startsWith("```")) {
                jsonText = jsonText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
              }

              const parsed = JSON.parse(jsonText);

              if (!parsed.files || !Array.isArray(parsed.files)) {
                throw new Error("Invalid output: missing files array");
              }

              const now = Date.now();
              const changedFiles: LLMFileOutput[] = parsed.files.map((f: LLMFileOutput) => ({
                path: f.path,
                content: f.content,
                language: f.language || detectLanguage(f.path),
              }));

              const buildLog: string[] = [];
              buildLog.push(`✓ Modified ${changedFiles.length} file(s)`);
              if (parsed.changedPaths) {
                parsed.changedPaths.forEach((p: string) => buildLog.push(`  → ${p}`));
              }
              buildLog.push("✓ Changes applied");
              buildLog.push("✓ Ready for preview");

              const result = {
                type: "complete",
                projectId,
                files: changedFiles.map((f) => ({
                  ...f,
                  editedBy: "ai" as const,
                  updatedAt: now,
                })),
                changedPaths: parsed.changedPaths || changedFiles.map((f: LLMFileOutput) => f.path),
                explanation: parsed.explanation || "",
                buildLog,
              };

              controller.enqueue(encoder.encode(`data: ${JSON.stringify(result)}\n\n`));
            } catch (parseErr) {
              // Fallback: extract files from markdown
              const fallbackFiles = extractFilesFromMarkdown(fullText);
              if (fallbackFiles.length > 0) {
                const now = Date.now();
                const result = {
                  type: "complete",
                  projectId,
                  files: fallbackFiles.map((f) => ({ ...f, editedBy: "ai" as const, updatedAt: now })),
                  changedPaths: fallbackFiles.map((f) => f.path),
                  explanation: "Extracted from code blocks",
                  buildLog: [`✓ Modified ${fallbackFiles.length} file(s)`, "✓ Ready for preview"],
                };
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(result)}\n\n`));
              } else {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                  type: "error",
                  error: `Parse error: ${parseErr instanceof Error ? parseErr.message : "Unknown"}`,
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
    const message = err instanceof Error ? err.message : "Edit error";
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}

function detectLanguage(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase() || "";
  const map: Record<string, string> = {
    tsx: "tsx", ts: "ts", jsx: "jsx", js: "js", json: "json",
    html: "html", css: "css", md: "markdown", py: "python",
    sh: "bash", sql: "sql", yaml: "yaml", yml: "yaml",
  };
  return map[ext] || ext;
}

function extractFilesFromMarkdown(text: string): LLMFileOutput[] {
  const files: LLMFileOutput[] = [];
  const re = /```(\w+)(?:\s+([^\n]+))?\n([\s\S]*?)```/g;
  const extMap: Record<string, string> = {
    jsx: "App.jsx", tsx: "App.tsx", js: "index.js", ts: "index.ts",
    html: "index.html", css: "styles.css", json: "package.json",
  };
  let m;
  while ((m = re.exec(text)) !== null) {
    const lang = m[1];
    const name = m[2]?.trim() || extMap[lang] || `file.${lang}`;
    files.push({ path: name, content: m[3], language: lang });
  }
  return files;
}
