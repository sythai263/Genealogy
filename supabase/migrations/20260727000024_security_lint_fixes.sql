-- ═══════════════════════════════════════════════════════════════════════════
-- Migration: Fix Supabase database security linter findings
-- Source: supabase/.temp/security_lint.csv
--
-- Fixes:
--   0011 function_search_path_mutable  — pin search_path on public functions
--   0014 extension_in_public           — move unaccent out of public schema
--   0024 rls_policy_always_true        — tighten profiles INSERT/UPDATE policies
--   0028/0029 security_definer execute — revoke RPC on trigger-only definer fns;
--                                       make is_person_in_subtree INVOKER
--
-- NOT fixable via SQL (dashboard Auth setting):
--   auth_leaked_password_protection — enable in Dashboard → Authentication →
--   Providers → Email → "Leaked password protection" (HaveIBeenPwned)
-- ═══════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────
-- 1. Move unaccent extension out of public schema (lint 0014)
-- ─────────────────────────────────────────────────────────────────────────
CREATE SCHEMA IF NOT EXISTS extensions;

-- Relocate existing extension; recreate if it was never installed
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_extension e
    JOIN pg_namespace n ON n.oid = e.extnamespace
    WHERE e.extname = 'unaccent' AND n.nspname = 'public'
  ) THEN
    ALTER EXTENSION unaccent SET SCHEMA extensions;
  ELSIF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'unaccent') THEN
    CREATE EXTENSION unaccent WITH SCHEMA extensions;
  END IF;
END $$;

-- Ensure API roles can use the extension functions
GRANT USAGE ON SCHEMA extensions TO postgres, anon, authenticated, service_role;

-- ─────────────────────────────────────────────────────────────────────────
-- 2. Pin search_path + recreate people search RPCs (lint 0011)
--    Use extensions.unaccent after the schema move.
-- ─────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.search_people_advanced(
  search_term text,
  ignore_acc boolean
)
RETURNS SETOF public.people
LANGUAGE plpgsql
STABLE
SET search_path = public, extensions
AS $$
BEGIN
  IF ignore_acc THEN
    RETURN QUERY
    SELECT *
    FROM public.people
    WHERE extensions.unaccent(replace(lower(display_name), 'đ', 'd'))
      ILIKE '%' || extensions.unaccent(replace(lower(search_term), 'đ', 'd')) || '%'
    ORDER BY display_name ASC
    LIMIT 20;
  ELSE
    RETURN QUERY
    SELECT *
    FROM public.people
    WHERE display_name ILIKE '%' || search_term || '%'
    ORDER BY display_name ASC
    LIMIT 20;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.search_people_filtered(
  search_term text DEFAULT NULL,
  p_generation int DEFAULT NULL,
  p_chi int DEFAULT NULL,
  p_is_living boolean DEFAULT NULL,
  ignore_acc boolean DEFAULT true,
  p_gender int DEFAULT NULL
)
RETURNS SETOF public.people
LANGUAGE plpgsql
STABLE
SET search_path = public, extensions
AS $$
DECLARE
  normalized_term text;
BEGIN
  IF search_term IS NOT NULL AND length(trim(search_term)) >= 2 THEN
    IF ignore_acc THEN
      normalized_term := extensions.unaccent(replace(lower(trim(search_term)), 'đ', 'd'));
    ELSE
      normalized_term := trim(search_term);
    END IF;
  ELSE
    normalized_term := NULL;
  END IF;

  RETURN QUERY
  SELECT p.*
  FROM public.people p
  WHERE
    (
      normalized_term IS NULL
      OR (
        CASE
          WHEN ignore_acc THEN
            extensions.unaccent(replace(lower(p.display_name), 'đ', 'd'))
            ILIKE '%' || normalized_term || '%'
          ELSE
            p.display_name ILIKE '%' || normalized_term || '%'
        END
      )
    )
    AND (p_generation IS NULL OR p.generation = p_generation)
    AND (p_chi IS NULL OR p.chi = p_chi)
    AND (p_is_living IS NULL OR p.is_living = p_is_living)
    AND (p_gender IS NULL OR p.gender = p_gender)
  ORDER BY p.generation ASC, p.display_name ASC;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_people_filter_options()
RETURNS json
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT json_build_object(
    'generations',
    COALESCE(
      (
        SELECT json_agg(g ORDER BY g)
        FROM (SELECT DISTINCT generation AS g FROM public.people) AS gens
      ),
      '[]'::json
    ),
    'chi_values',
    COALESCE(
      (
        SELECT json_agg(c ORDER BY c)
        FROM (
          SELECT DISTINCT chi AS c
          FROM public.people
          WHERE chi IS NOT NULL
        ) AS chis
      ),
      '[]'::json
    )
  );
$$;

GRANT EXECUTE ON FUNCTION public.search_people_advanced(text, boolean)
  TO authenticated, anon, service_role;

GRANT EXECUTE ON FUNCTION public.search_people_filtered(text, int, int, boolean, boolean, int)
  TO authenticated, anon, service_role;

GRANT EXECUTE ON FUNCTION public.get_people_filter_options()
  TO authenticated, anon, service_role;

-- ─────────────────────────────────────────────────────────────────────────
-- 3. is_person_in_subtree — INVOKER + pinned search_path (lints 0011/0028/0029)
--    Used by RLS; authenticated users can read families/children under INVOKER.
-- ─────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.is_person_in_subtree(root_id uuid, target_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  WITH RECURSIVE subtree(id) AS (
    SELECT root_id
    UNION
    SELECT ch.person_id
    FROM subtree s
    JOIN public.families f ON (f.father_id = s.id OR f.mother_id = s.id)
    JOIN public.children ch ON ch.family_id = f.id
  )
  SELECT EXISTS (SELECT 1 FROM subtree WHERE id = target_id);
$$;

REVOKE ALL ON FUNCTION public.is_person_in_subtree(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_person_in_subtree(uuid, uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.is_person_in_subtree(uuid, uuid) TO authenticated, service_role;

-- ─────────────────────────────────────────────────────────────────────────
-- 4. Trigger-only SECURITY DEFINER helpers — revoke RPC (lints 0028/0029)
--    Triggers still invoke them as table owner; REST /rpc must not.
-- ─────────────────────────────────────────────────────────────────────────

-- Ensure search_path is pinned (idempotent recreate)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'viewer'
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_post_comment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.author_id != (SELECT author_id FROM public.posts WHERE id = NEW.post_id) THEN
    INSERT INTO public.notifications (user_id, type, title, body, link, actor_id, reference_id)
    SELECT
      p.author_id,
      'post_comment',
      'Bình luận mới',
      (SELECT full_name FROM public.profiles WHERE user_id = NEW.author_id) || ' đã bình luận bài viết của bạn',
      '/feed',
      NEW.author_id,
      NEW.post_id::text
    FROM public.posts p
    WHERE p.id = NEW.post_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_post_like()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.user_id != (SELECT author_id FROM public.posts WHERE id = NEW.post_id) THEN
    INSERT INTO public.notifications (user_id, type, title, body, link, actor_id, reference_id)
    SELECT
      p.author_id,
      'post_like',
      'Lượt thích mới',
      (SELECT full_name FROM public.profiles WHERE user_id = NEW.user_id) || ' đã thích bài viết của bạn',
      '/feed',
      NEW.user_id,
      NEW.post_id::text
    FROM public.posts p
    WHERE p.id = NEW.post_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_post_likes_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_post_comments_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon, authenticated;

REVOKE ALL ON FUNCTION public.notify_post_comment() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.notify_post_comment() FROM anon, authenticated;

REVOKE ALL ON FUNCTION public.notify_post_like() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.notify_post_like() FROM anon, authenticated;

REVOKE ALL ON FUNCTION public.update_post_likes_count() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.update_post_likes_count() FROM anon, authenticated;

REVOKE ALL ON FUNCTION public.update_post_comments_count() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.update_post_comments_count() FROM anon, authenticated;

-- ─────────────────────────────────────────────────────────────────────────
-- 5. Tighten profiles RLS policies (lint 0024)
-- ─────────────────────────────────────────────────────────────────────────

-- Admin suspend: WITH CHECK must also enforce admin (not always-true)
DROP POLICY IF EXISTS "Admin can suspend or unsuspend accounts" ON public.profiles;

CREATE POLICY "Admin can suspend or unsuspend accounts"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (
    (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'admin'
  );

-- Profile inserts: restrict to service_role only (signup uses handle_new_user DEFINER)
DROP POLICY IF EXISTS "Service role can insert profiles" ON public.profiles;

CREATE POLICY "Service role can insert profiles"
  ON public.profiles
  FOR INSERT
  TO service_role
  WITH CHECK (auth.role() = 'service_role');
