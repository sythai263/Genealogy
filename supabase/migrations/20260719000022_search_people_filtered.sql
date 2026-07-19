-- ============================================================
-- Migration: Filtered People Search + Filter Options
-- Description: search_people_filtered RPC for list page (accent-
-- insensitive Vietnamese search + generation/chi/living filters).
-- Pagination is NOT in SQL — use PostgREST .range() + count.
-- get_people_filter_options returns distinct dropdown values.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS unaccent;

-- 1. Filtered search for /people list (SETOF; paginate via Supabase .range())
CREATE OR REPLACE FUNCTION search_people_filtered(
  search_term text DEFAULT NULL,
  p_generation int DEFAULT NULL,
  p_chi int DEFAULT NULL,
  p_is_living boolean DEFAULT NULL,
  ignore_acc boolean DEFAULT true
)
RETURNS SETOF people
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  normalized_term text;
BEGIN
  IF search_term IS NOT NULL AND length(trim(search_term)) >= 2 THEN
    IF ignore_acc THEN
      normalized_term := unaccent(replace(lower(trim(search_term)), 'đ', 'd'));
    ELSE
      normalized_term := trim(search_term);
    END IF;
  ELSE
    normalized_term := NULL;
  END IF;

  RETURN QUERY
  SELECT p.*
  FROM people p
  WHERE
    (
      normalized_term IS NULL
      OR (
        CASE
          WHEN ignore_acc THEN
            unaccent(replace(lower(p.display_name), 'đ', 'd'))
            ILIKE '%' || normalized_term || '%'
          ELSE
            p.display_name ILIKE '%' || normalized_term || '%'
        END
      )
    )
    AND (p_generation IS NULL OR p.generation = p_generation)
    AND (p_chi IS NULL OR p.chi = p_chi)
    AND (p_is_living IS NULL OR p.is_living = p_is_living)
  ORDER BY p.generation ASC, p.display_name ASC;
END;
$$;

-- 2. Distinct generations / chi for filter dropdowns
CREATE OR REPLACE FUNCTION get_people_filter_options()
RETURNS json
LANGUAGE sql
STABLE
AS $$
  SELECT json_build_object(
    'generations',
    COALESCE(
      (
        SELECT json_agg(g ORDER BY g)
        FROM (SELECT DISTINCT generation AS g FROM people) AS gens
      ),
      '[]'::json
    ),
    'chi_values',
    COALESCE(
      (
        SELECT json_agg(c ORDER BY c)
        FROM (
          SELECT DISTINCT chi AS c
          FROM people
          WHERE chi IS NOT NULL
        ) AS chis
      ),
      '[]'::json
    )
  );
$$;

GRANT EXECUTE ON FUNCTION search_people_filtered(text, int, int, boolean, boolean)
  TO authenticated, anon, service_role;

GRANT EXECUTE ON FUNCTION get_people_filter_options()
  TO authenticated, anon, service_role;
