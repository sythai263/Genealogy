-- ═══════════════════════════════════════════════════════════════════════════
-- Migration: Drop broad SELECT on public media bucket
--
-- Public buckets serve objects via /storage/v1/object/public/... without any
-- SELECT policy. media_select_anyone let authenticated/anon clients list every
-- object in the bucket (Storage list API), which is more exposure than the
-- public object URLs alone. Writes stay gated by the scoped INSERT/UPDATE/DELETE
-- policies from 20260809000027.
-- ═══════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "media_select_anyone" ON storage.objects;
