-- ═══════════════════════════════════════════════════════════════════════════
-- Migration: Public family tree for unauthenticated visitors
--
-- Fixes empty /family-tree when logged out (RLS blocked families/children
-- and most people after security hardening), without SECURITY DEFINER RPCs
-- or SECURITY DEFINER views.
--
-- 1. View people_public_tree (security_invoker=true) — no contact columns
-- 2. Anon RLS on people: privacy_level < 2
-- 3. Anon column grants on people — contact PII revoked
-- 4. Anon SELECT on families + children (structure only)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE VIEW public.people_public_tree
WITH (security_invoker = true)
AS
SELECT
  id,
  handle,
  display_name,
  first_name,
  middle_name,
  surname,
  pen_name,
  taboo_name,
  gender,
  generation,
  chi,
  birth_date,
  birth_year,
  birth_place,
  death_date,
  death_year,
  death_place,
  death_lunar,
  is_living,
  is_patrilineal,
  hometown,
  occupation,
  biography,
  notes,
  avatar_url,
  privacy_level,
  created_at,
  updated_at
FROM public.people
WHERE privacy_level < 2;

COMMENT ON VIEW public.people_public_tree IS
  'Public family-tree people without contact PII (INVOKER + RLS).';

GRANT SELECT ON public.people_public_tree TO anon, authenticated, service_role;

CREATE POLICY "Anon can read non-private people"
  ON public.people
  FOR SELECT
  TO anon
  USING (privacy_level < 2);

REVOKE SELECT ON TABLE public.people FROM anon;
GRANT SELECT (
  id,
  handle,
  display_name,
  first_name,
  middle_name,
  surname,
  pen_name,
  taboo_name,
  gender,
  generation,
  chi,
  birth_date,
  birth_year,
  birth_place,
  death_date,
  death_year,
  death_place,
  death_lunar,
  is_living,
  is_patrilineal,
  hometown,
  occupation,
  biography,
  notes,
  avatar_url,
  privacy_level,
  created_at,
  updated_at
) ON TABLE public.people TO anon;

CREATE POLICY "Anon can read families for public tree"
  ON public.families
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anon can read children for public tree"
  ON public.children
  FOR SELECT
  TO anon
  USING (true);
