-- ═══════════════════════════════════════════════════════════════════════════
-- Migration: keep_alive — singleton row updated by the /ping route.
--
-- Supabase free-tier projects are paused after ~7 days of inactivity. An
-- external scheduler pings /ping, which upserts this row's timestamp so the
-- database registers write activity and stays awake.
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS keep_alive (
  -- CHECK (id = 1) enforces the singleton: only one row can ever exist
  id        SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  pinged_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed the singleton row
INSERT INTO keep_alive (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- ─── RLS ─────────────────────────────────────────────────────────────────────
-- No policies on purpose: only the service role (used by /ping) may
-- read or write this table. Anon/authenticated clients get nothing.
ALTER TABLE keep_alive ENABLE ROW LEVEL SECURITY;
