-- ═══════════════════════════════════════════════════════════════
-- SAL Memory Tables — Persistent Conversation Storage
-- SaintSal™ Labs · Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- Conversations table
CREATE TABLE IF NOT EXISTS sal_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  vertical TEXT NOT NULL DEFAULT 'default',
  title TEXT NOT NULL DEFAULT 'New Conversation',
  message_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sal_conv_user ON sal_conversations(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_sal_conv_vertical ON sal_conversations(vertical);

-- Messages table
CREATE TABLE IF NOT EXISTS sal_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES sal_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL DEFAULT '',
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  attachments JSONB,
  tool_calls JSONB
);

CREATE INDEX IF NOT EXISTS idx_sal_msg_conv ON sal_messages(conversation_id, timestamp ASC);

-- RLS policies (enable RLS on both tables)
ALTER TABLE sal_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sal_messages ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (API routes use service key)
CREATE POLICY "Service role full access to conversations"
  ON sal_conversations FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access to messages"
  ON sal_messages FOR ALL
  USING (true)
  WITH CHECK (true);
