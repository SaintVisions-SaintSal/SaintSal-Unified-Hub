"use client";
import { useState, useCallback, useRef, useEffect } from "react";

export interface Attachment {
  type: "image";
  name: string;
  url: string;
}

export interface ToolCall {
  name: string;
  id: string;
  status: "running" | "done" | "error";
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
  timestamp: number;
  attachments?: Attachment[];
  toolCalls?: ToolCall[];
  thinking?: string;
}

const STORAGE_KEY = "sal_chat_history_";
const CONV_ID_KEY = "sal_conv_id_";

function loadHistory(vertical: string): Message[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY + vertical);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveHistory(vertical: string, messages: Message[]) {
  if (typeof window === "undefined") return;
  try {
    const toSave = messages.filter((m) => !m.streaming).slice(-50);
    sessionStorage.setItem(STORAGE_KEY + vertical, JSON.stringify(toSave));
  } catch {}
}

function getConversationId(vertical: string): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(CONV_ID_KEY + vertical) || null;
}

function setConversationId(vertical: string, id: string) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(CONV_ID_KEY + vertical, id);
}

// ── Supabase persistence (fire-and-forget) ───────────────────

async function persistToSupabase(
  vertical: string,
  messages: Message[],
  userEmail?: string | null
) {
  if (!userEmail || messages.length === 0) return;
  try {
    const convId = getConversationId(vertical);
    const res = await fetch("/api/memory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "save",
        user_id: userEmail,
        conversation_id: convId,
        vertical,
        messages: messages.filter((m) => !m.streaming).map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          timestamp: m.timestamp,
          attachments: m.attachments,
          tool_calls: m.toolCalls,
        })),
      }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.conversation_id) {
        setConversationId(vertical, data.conversation_id);
      }
    }
  } catch {
    // Silently fail — sessionStorage is the fallback
  }
}

// ── Main hook ────────────────────────────────────────────────

export function useChat(vertical = "default", userEmail?: string | null) {
  const [messages, setMessages] = useState<Message[]>(() => loadHistory(vertical));
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeTools, setActiveTools] = useState<ToolCall[]>([]);
  const [thinkingText, setThinkingText] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Load from Supabase on mount if user is logged in and no sessionStorage data
  useEffect(() => {
    if (!userEmail) return;
    const convId = getConversationId(vertical);
    if (convId && messages.length === 0) {
      fetch(`/api/memory?action=load&conversation_id=${convId}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.messages?.length) {
            const loaded: Message[] = data.messages.map((m: Record<string, unknown>) => ({
              id: m.id || crypto.randomUUID(),
              role: m.role,
              content: m.content,
              timestamp: m.timestamp ? new Date(m.timestamp as string).getTime() : Date.now(),
              attachments: m.attachments as Attachment[] | undefined,
              toolCalls: m.tool_calls as ToolCall[] | undefined,
            }));
            setMessages(loaded);
            saveHistory(vertical, loaded);
          }
        })
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vertical, userEmail]);

  const sendMessage = useCallback(
    async (text: string, attachments?: Attachment[]) => {
      if (isStreaming || !text.trim()) return;

      const userMsg: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: text.trim(),
        timestamp: Date.now(),
        attachments,
      };
      const salMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "",
        streaming: true,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMsg, salMsg]);
      setIsStreaming(true);
      setActiveTools([]);
      setThinkingText(null);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const history = [...messages, userMsg].map((m) => ({ role: m.role, content: m.content }));

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history, vertical }),
          signal: controller.signal,
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        if (!reader) throw new Error("No reader");

        let buffer = "";
        const toolCallsAccum: ToolCall[] = [];

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6);
            if (data === "[DONE]") break;
            try {
              const parsed = JSON.parse(data);

              // Text delta
              if (parsed.type === "delta" && parsed.text) {
                setMessages((prev) =>
                  prev.map((m) => (m.id === salMsg.id ? { ...m, content: m.content + parsed.text } : m))
                );
              }

              // Tool start — show indicator
              if (parsed.type === "tool_start") {
                const tc: ToolCall = { name: parsed.name, id: parsed.id, status: "running" };
                toolCallsAccum.push(tc);
                setActiveTools([...toolCallsAccum]);
              }

              // Tool result — mark done
              if (parsed.type === "tool_result") {
                const existing = toolCallsAccum.find((t) => t.id === parsed.id);
                if (existing) existing.status = "done";
                setActiveTools([...toolCallsAccum]);
              }

              // Thinking indicator
              if (parsed.type === "thinking") {
                setThinkingText(parsed.text);
              }

              // Error
              if (parsed.type === "error") {
                setMessages((prev) =>
                  prev.map((m) => (m.id === salMsg.id ? { ...m, content: m.content + `\n\n⚠ ${parsed.text}` } : m))
                );
              }
            } catch {}
          }
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== "AbortError") {
          setMessages((prev) =>
            prev.map((m) => (m.id === salMsg.id ? { ...m, content: `⚠ Error: ${err.message}` } : m))
          );
        }
      } finally {
        setMessages((prev) => {
          const updated = prev.map((m) =>
            m.id === salMsg.id ? { ...m, streaming: false, toolCalls: activeTools.length ? activeTools : undefined } : m
          );
          saveHistory(vertical, updated);
          // Persist to Supabase async
          persistToSupabase(vertical, updated, userEmail);
          return updated;
        });
        setIsStreaming(false);
        setActiveTools([]);
        setThinkingText(null);
        abortRef.current = null;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [messages, isStreaming, vertical, userEmail, activeTools]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(STORAGE_KEY + vertical);
      sessionStorage.removeItem(CONV_ID_KEY + vertical);
    }
  }, [vertical]);

  const stopStreaming = useCallback(() => abortRef.current?.abort(), []);

  const exportChat = useCallback((format: "txt" | "pdf" = "txt") => {
    const content = messages
      .filter((m) => !m.streaming)
      .map((m) => `${m.role === "user" ? "You" : "SAL"}: ${m.content}`)
      .join("\n\n");
    const header = `SaintSal™ Labs · ${vertical.toUpperCase()} Intelligence\n${"=".repeat(50)}\nExported: ${new Date().toLocaleString()}\n\n`;

    if (format === "txt") {
      const blob = new Blob([header + content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sal-${vertical}-${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      const win = window.open("", "_blank");
      if (win) {
        win.document.write(`<!DOCTYPE html><html><head><title>SAL ${vertical} Export</title>
<style>body{font-family:system-ui,sans-serif;max-width:700px;margin:40px auto;color:#222;line-height:1.7}
h1{color:#B8860B;font-size:18px}h2{color:#666;font-size:12px;margin-bottom:24px}
.msg{margin-bottom:16px;padding:12px;border-radius:8px}
.user{background:#f5f5f5;border-left:3px solid #B8860B}
.sal{background:#fff;border-left:3px solid #22C55E}
.role{font-weight:700;font-size:11px;text-transform:uppercase;margin-bottom:4px;letter-spacing:0.5px}
.content{font-size:13px;white-space:pre-wrap}
pre{background:#f0f0f0;padding:8px;border-radius:4px;font-size:12px;overflow-x:auto}
</style></head><body>
<h1>SaintSal™ Labs · ${vertical.toUpperCase()} Intelligence</h1>
<h2>Exported ${new Date().toLocaleString()} · Patent #10,290,222 HACP Protocol</h2>`);
        messages.filter((m) => !m.streaming).forEach((m) => {
          const cls = m.role === "user" ? "user" : "sal";
          const role = m.role === "user" ? "You" : "SAL";
          const escaped = m.content.replace(/</g, "&lt;").replace(/>/g, "&gt;");
          win.document.write(`<div class="msg ${cls}"><div class="role">${role}</div><div class="content">${escaped}</div></div>`);
        });
        win.document.write("</body></html>");
        win.document.close();
        setTimeout(() => win.print(), 300);
      }
    }
  }, [messages, vertical]);

  return {
    messages,
    isStreaming,
    activeTools,
    thinkingText,
    sendMessage,
    clearMessages,
    stopStreaming,
    exportChat,
  };
}
