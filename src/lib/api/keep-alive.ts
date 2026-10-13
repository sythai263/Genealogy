/**
 * @project AncestorTree
 * @file src/lib/api/keep-alive.ts
 * @description Supabase keep-alive ping — lives in @lib/api (not the flat @lib
 *              barrel) because it uses the service role and must never reach a
 *              client bundle.
 * @version 1.0.0
 * @updated 2026-10-13
 */

import type { KeepAliveRow } from '@types';
import { createServiceRoleClient } from './supabase-admin';

const KEEP_ALIVE_ID = 1;

/**
 * Upserts the singleton keep_alive row with the current timestamp and returns
 * it. keep_alive has no RLS policies, so only the service role can write —
 * which is exactly what a keep-alive ping needs to register DB activity.
 */
export async function pingKeepAlive(): Promise<KeepAliveRow> {
  const supabase = createServiceRoleClient();
  if (!supabase) {
    throw new Error('Supabase service role is not configured');
  }

  const { data, error } = await supabase
    .from('keep_alive')
    .upsert({ id: KEEP_ALIVE_ID, pinged_at: new Date().toISOString() })
    .select()
    .single<KeepAliveRow>();

  if (error) throw error;
  return data;
}
