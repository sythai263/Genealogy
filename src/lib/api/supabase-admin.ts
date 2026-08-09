/**
 * @project AncestorTree
 * @file src/lib/api/supabase-admin.ts
 * @description Service-role Supabase client factory for server-only API routes
 * @version 1.0.0
 * @updated 2026-08-09
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Builds a service-role client (bypasses RLS). Returns `null` when either env
 * var is missing so callers can respond with a misconfiguration error instead
 * of crashing on a non-null assertion.
 */
export function createServiceRoleClient(): SupabaseClient | null {
  const supabaseUrl =
    process.env.SUPABASE_INTERNAL_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('[supabase-admin] Missing SUPABASE URL or SERVICE_ROLE_KEY');
    return null;
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
