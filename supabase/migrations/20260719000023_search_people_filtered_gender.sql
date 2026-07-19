-- ============================================================
-- Migration: Add gender filter to search_people_filtered
-- Description: Directory page needs p_gender; people list passes NULL.
-- DROP required — CREATE OR REPLACE cannot change the argument list.
-- ============================================================

DROP FUNCTION IF EXISTS search_people_filtered(text, int, int, boolean, boolean);

CREATE OR REPLACE FUNCTION search_people_filtered(
  search_term text DEFAULT NULL,
  p_generation int DEFAULT NULL,
  p_chi int DEFAULT NULL,
  p_is_living boolean DEFAULT NULL,
  ignore_acc boolean DEFAULT true,
  p_gender int DEFAULT NULL
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
    AND (p_gender IS NULL OR p.gender = p_gender)
  ORDER BY p.generation ASC, p.display_name ASC;
END;
$$;

GRANT EXECUTE ON FUNCTION search_people_filtered(text, int, int, boolean, boolean, int)
  TO authenticated, anon, service_role;
