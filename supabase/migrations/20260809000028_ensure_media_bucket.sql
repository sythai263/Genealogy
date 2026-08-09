-- ═══════════════════════════════════════════════════════════════════════════
-- Migration: Ensure the public `media` bucket exists
--
-- The original storage setup only documented creating this bucket via the
-- Dashboard. Remote environments that never had that manual step end up with
-- the scoped media policies from 20260809000027 but no bucket to attach them
-- to, so avatar / gallery / feed uploads fail. This makes creation idempotent.
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE
SET
  public             = EXCLUDED.public,
  file_size_limit    = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;
