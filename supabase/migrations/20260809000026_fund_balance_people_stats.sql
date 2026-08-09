-- ═══════════════════════════════════════════════════════════════════════════
-- Migration: Aggregate RPCs to replace full-table client-side aggregation
--
-- Adds:
--   get_fund_balance()  — single-query income/expense/balance totals
--   get_people_stats()  — single-query dashboard counters (totals, generations, chi)
--
-- Both are STABLE + SECURITY INVOKER so RLS on the underlying tables still
-- applies to the calling role (matches existing RPC conventions, e.g.
-- get_people_filter_options / search_people_filtered).
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION get_fund_balance()
RETURNS json
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT json_build_object(
    'income', COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0),
    'expense', COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0),
    'balance', COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0)
  )
  FROM fund_transactions;
$$;

CREATE OR REPLACE FUNCTION get_people_stats()
RETURNS json
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT json_build_object(
    'totalPeople', (SELECT COUNT(*)::int FROM people),
    'livingCount', (SELECT COUNT(*)::int FROM people WHERE is_living = true),
    'deceasedCount', (SELECT COUNT(*)::int FROM people WHERE is_living = false),
    'totalGenerations', (SELECT COUNT(DISTINCT generation)::int FROM people),
    'totalChi', (SELECT COUNT(DISTINCT chi)::int FROM people WHERE chi IS NOT NULL)
  );
$$;

GRANT EXECUTE ON FUNCTION get_fund_balance() TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION get_people_stats() TO authenticated, anon, service_role;
