/* ═══════════════════════════════════════════════════════════════
   SAL Chat Orchestration Engine
   SaintSal™ Labs · US Patent #10,290,222 HACP Protocol

   Full Claude tool-use loop with per-vertical tool routing:
   1. Receive message + vertical
   2. Select tools for that vertical
   3. Stream response — if Claude calls tools, execute them
   4. Return tool results, continue streaming
   5. Supports multi-turn tool use (Claude can chain tools)

   SSE Events:
   - { type: "delta", text: "..." }        — text chunk
   - { type: "tool_start", name, id }      — tool execution starting
   - { type: "tool_result", name, id }     — tool finished (data in AI response)
   - { type: "thinking", text: "..." }     — thinking indicator
   - [DONE]                                — stream complete
   ═══════════════════════════════════════════════════════════════ */

import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPTS } from "@/lib/constants";
import { getToolsForVertical, executeTool } from "@/lib/tools";

export const runtime = "edge";
export const maxDuration = 120;

const MAX_TOOL_ROUNDS = 5; // max sequential tool-use rounds per request

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

export async function POST(req: Request) {
  const encoder = new TextEncoder();

  try {
    const { messages, vertical = "default", systemOverride } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "messages required" }), { status: 400 });
    }

    const system = systemOverride || SYSTEM_PROMPTS[vertical as keyof typeof SYSTEM_PROMPTS] || SYSTEM_PROMPTS.default;

    // Get tools for this vertical
    const toolDefs = getToolsForVertical(vertical);
    const tools: Anthropic.Messages.Tool[] = toolDefs.map((t) => ({
      name: t.name,
      description: t.description,
      input_schema: t.input_schema as Anthropic.Messages.Tool.InputSchema,
    }));

    // Format messages for Anthropic
    const formattedMessages: Anthropic.Messages.MessageParam[] = messages.map(
      (m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })
    );

    const readable = new ReadableStream({
      async start(controller) {
        const send = (data: Record<string, unknown>) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        };

        try {
          let currentMessages = [...formattedMessages];
          let toolRound = 0;

          // ── Tool-use loop ───────────────────────────────
          // Claude may return tool_use blocks. We execute them,
          // feed results back, and let Claude continue responding.
          while (toolRound < MAX_TOOL_ROUNDS) {
            toolRound++;

            // Stream the response
            const stream = await anthropic.messages.stream({
              model: "claude-sonnet-4-20250514",
              max_tokens: 4096,
              system: system + `\n\nYou have access to real-time tools. Use them proactively when the user's question would benefit from live data. Don't hesitate to call multiple tools if needed. Current time: ${new Date().toISOString()}.`,
              messages: currentMessages,
              ...(tools.length > 0 ? { tools } : {}),
            });

            let hasToolUse = false;
            const toolUseBlocks: Array<{ id: string; name: string; input: Record<string, unknown> }> = [];
            const contentBlocks: Anthropic.Messages.ContentBlock[] = [];

            // Collect content as it streams
            for await (const event of stream) {
              if (event.type === "content_block_start") {
                if (event.content_block.type === "tool_use") {
                  hasToolUse = true;
                  send({ type: "tool_start", name: event.content_block.name, id: event.content_block.id });
                }
              }

              if (event.type === "content_block_delta") {
                if (event.delta.type === "text_delta") {
                  send({ type: "delta", text: event.delta.text });
                }
              }

              if (event.type === "message_stop") {
                // Get the final message to extract tool_use blocks
                const finalMessage = await stream.finalMessage();
                for (const block of finalMessage.content) {
                  contentBlocks.push(block);
                  if (block.type === "tool_use") {
                    toolUseBlocks.push({
                      id: block.id,
                      name: block.name,
                      input: block.input as Record<string, unknown>,
                    });
                  }
                }
              }
            }

            // If no tool use, we're done
            if (!hasToolUse || toolUseBlocks.length === 0) {
              break;
            }

            // ── Execute tools in parallel ────────────────
            send({ type: "thinking", text: `Fetching live data (${toolUseBlocks.map((t) => t.name).join(", ")})...` });

            const toolResults = await Promise.all(
              toolUseBlocks.map(async (tool) => {
                try {
                  const result = await executeTool(tool.name, tool.input);
                  send({ type: "tool_result", name: tool.name, id: tool.id });
                  return {
                    type: "tool_result" as const,
                    tool_use_id: tool.id,
                    content: result,
                  };
                } catch (e) {
                  return {
                    type: "tool_result" as const,
                    tool_use_id: tool.id,
                    content: JSON.stringify({ error: e instanceof Error ? e.message : "Tool execution failed" }),
                    is_error: true,
                  };
                }
              })
            );

            // Add assistant message (with tool_use blocks) + tool results to conversation
            currentMessages = [
              ...currentMessages,
              { role: "assistant" as const, content: contentBlocks },
              { role: "user" as const, content: toolResults },
            ];

            // Loop back to let Claude process tool results and generate response
          }

          // Done
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Stream error";
          send({ type: "error", text: msg });
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
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
    const message = err instanceof Error ? err.message : "Stream error";
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}
