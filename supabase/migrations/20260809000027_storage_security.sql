-- ═══════════════════════════════════════════════════════════════════════════
-- Migration: Harden Supabase Storage access
--
-- Fixes:
--   1. Private `documents` bucket. Clan document files were stored in the
--      public `media` bucket, so a document with privacy_level 1 (members) or
--      2 (admin/editor) had its file readable by anyone holding the URL —
--      privacy_level only ever restricted the database row, never the file.
--   2. Path-scoped writes on `media`. Verified members can now upload their own
--      avatar/photos and feed images; everything else stays admin/editor only.
--      Previously the app offered those buttons to viewers but RLS rejected the
--      upload, surfacing as an opaque "row-level security" error.
--   3. Policies call the STABLE helper functions introduced in
--      20260727100732 so auth.uid() is evaluated once per statement rather
--      than once per row (auth_rls_initplan lint).
-- ═══════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────
-- Helper: does the current user own this people/<id>/... object path?
-- ─────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.owns_person_media_path(object_name text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = (SELECT auth.uid())
      AND linked_person IS NOT NULL
      AND object_name LIKE 'people/' || linked_person::text || '/%'
  );
$$;

REVOKE ALL ON FUNCTION public.owns_person_media_path(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.owns_person_media_path(text)
  TO authenticated, service_role;

-- ─────────────────────────────────────────────────────────────────────────
-- Bucket: media (public reads, scoped writes)
-- ─────────────────────────────────────────────────────────────────────────

-- Documents now live in their own bucket, so media only needs image types
UPDATE storage.buckets
SET
  allowed_mime_types = ARRAY[
    'image/jpeg', 'image/png', 'image/webp', 'image/gif'
  ],
  file_size_limit = 10485760
WHERE id = 'media';

DROP POLICY IF EXISTS "Editors and admins can upload media" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view media"               ON storage.objects;
DROP POLICY IF EXISTS "Editors and admins can delete media" ON storage.objects;
DROP POLICY IF EXISTS "Editors and admins can update media" ON storage.objects;

-- Bucket is public, so this mirrors what the public object endpoint already allows
CREATE POLICY "media_select_anyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'media');

CREATE POLICY "media_insert_scoped"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'media'
  AND (
    public.is_admin_or_editor()
    OR (
      public.is_verified_user()
      AND (
        name LIKE 'feed/%'
        OR public.owns_person_media_path(name)
      )
    )
  )
);

CREATE POLICY "media_update_scoped"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'media'
  AND (
    public.is_admin_or_editor()
    OR (public.is_verified_user() AND public.owns_person_media_path(name))
  )
)
WITH CHECK (
  bucket_id = 'media'
  AND (
    public.is_admin_or_editor()
    OR (public.is_verified_user() AND public.owns_person_media_path(name))
  )
);

CREATE POLICY "media_delete_scoped"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'media'
  AND (
    public.is_admin_or_editor()
    OR (public.is_verified_user() AND public.owns_person_media_path(name))
  )
);

-- ─────────────────────────────────────────────────────────────────────────
-- Bucket: documents (private, served through signed URLs)
-- ─────────────────────────────────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false,
  10485760,
  ARRAY[
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'video/mp4', 'video/webm'
  ]
)
ON CONFLICT (id) DO UPDATE
SET
  public             = EXCLUDED.public,
  file_size_limit    = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "documents_select_by_privacy" ON storage.objects;
DROP POLICY IF EXISTS "documents_insert_staff"      ON storage.objects;
DROP POLICY IF EXISTS "documents_update_staff"      ON storage.objects;
DROP POLICY IF EXISTS "documents_delete_staff"      ON storage.objects;

-- clan_documents.file_url stores the object path for files in this bucket,
-- which is what lets the row's privacy_level gate access to the file itself.
CREATE POLICY "documents_select_by_privacy"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'documents'
  AND (
    public.is_admin_or_editor()
    OR EXISTS (
      SELECT 1
      FROM public.clan_documents d
      WHERE d.file_url = storage.objects.name
        AND (
          d.privacy_level = 0
          OR (d.privacy_level = 1 AND public.is_verified_user())
        )
    )
  )
);

CREATE POLICY "documents_insert_staff"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'documents' AND public.is_admin_or_editor());

CREATE POLICY "documents_update_staff"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'documents' AND public.is_admin_or_editor())
WITH CHECK (bucket_id = 'documents' AND public.is_admin_or_editor());

CREATE POLICY "documents_delete_staff"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'documents' AND public.is_admin_or_editor());

COMMENT ON FUNCTION public.owns_person_media_path(text) IS
  'True when media object path people/<id>/... belongs to the caller''s linked person';
