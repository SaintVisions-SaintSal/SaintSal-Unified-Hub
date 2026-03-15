/* ═══════════════════════════════════════════════════════════════
   SAL Memory API — Persistent Conversation Storage
   SaintSal™ Labs · US Patent #10,290,222 HACP Protocol

   Stores and retrieves conversations in Supabase.
   Tables required (auto-created if service key available):
   • sal_conversations — conversation metadata
   • sal_messages — individual messages

   Endpoints:
   GET  ?action=list&user_id=...             — list conversations
   GET  ?action=load&conversation_id=...     — load messages
   POST { action: "save", ... }              — save/update conversation
   POST { action: "delete", ... }            — delete conversation
   ═══════════════════════════════════════════════════════════════ */

import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// ── GET: list conversations or load messages ─────────────────

export async function GET(req: Request) {
  const url = new URL(req.url);
  const action = url.searchParams.get("action");
  const supabase = getSupabase();

  try {
    if (action === "list") {
      const userId = url.searchParams.get("user_id");
      if (!userId) return Response.json({ error: "user_id required" }, { status: 400 });

      const { data, error } = await supabase
        .from("sal_conversations")
        .select("id, vertical, title, updated_at, message_count")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false })
        .limit(50);

      if (error) return Response.json({ error: error.message }, { status: 500 });
      return Response.json({ conversations: data });
    }

    if (action === "load") {
      const conversationId = url.searchParams.get("conversation_id");
      if (!conversationId) return Response.json({ error: "conversation_id required" }, { status: 400 });

      const { data, error } = await supabase
        .from("sal_messages")
        .select("id, role, content, timestamp, attachments, tool_calls")
        .eq("conversation_id", conversationId)
        .order("timestamp", { ascending: true })
        .limit(200);

      if (error) return Response.json({ error: error.message }, { status: 500 });
      return Response.json({ messages: data });
    }

    return Response.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Memory error" }, { status: 500 });
  }
}

// ── POST: save or delete conversation ────────────────────────

export async function POST(req: Request) {
  const supabase = getSupabase();

  try {
    const body = await req.json();
    const { action } = body;

    if (action === "save") {
      const { user_id, conversation_id, vertical, title, messages } = body;
      if (!user_id || !vertical || !messages?.length) {
        return Response.json({ error: "user_id, vertical, and messages required" }, { status: 400 });
      }

      // Upsert conversation
      const convId = conversation_id || crypto.randomUUID();
      const convTitle = title || messages.find((m: { role: string }) => m.role === "user")?.content?.slice(0, 80) || `${vertical} conversation`;

      const { error: convError } = await supabase
        .from("sal_conversations")
        .upsert({
          id: convId,
          user_id,
          vertical,
          title: convTitle,
          message_count: messages.length,
          updated_at: new Date().toISOString(),
        }, { onConflict: "id" });

      if (convError) return Response.json({ error: convError.message }, { status: 500 });

      // Batch upsert messages
      const msgRows = messages.map((m: {
        id: string; role: string; content: string;
        timestamp: number; attachments?: unknown[]; tool_calls?: unknown[];
      }) => ({
        id: m.id,
        conversation_id: convId,
        role: m.role,
        content: m.content,
        timestamp: new Date(m.timestamp).toISOString(),
        attachments: m.attachments || null,
        tool_calls: m.tool_calls || null,
      }));

      const { error: msgError } = await supabase
        .from("sal_messages")
        .upsert(msgRows, { onConflict: "id" });

      if (msgError) return Response.json({ error: msgError.message }, { status: 500 });

      return Response.json({ conversation_id: convId, saved: messages.length });
    }

    if (action === "delete") {
      const { conversation_id } = body;
      if (!conversation_id) return Response.json({ error: "conversation_id required" }, { status: 400 });

      // Delete messages first (FK), then conversation
      await supabase.from("sal_messages").delete().eq("conversation_id", conversation_id);
      await supabase.from("sal_conversations").delete().eq("id", conversation_id);

      return Response.json({ deleted: true });
    }

    return Response.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Memory error" }, { status: 500 });
  }
}
