/**
 * @project AncestorTree
 * @file src/lib/supabase-data-profiles.ts
 * @description Supabase data access — user profiles, roles, moderation
 * @version 1.0.0
 * @updated 2026-10-29
 */

import { getPaginationRange } from '@constants';
import type {
    PaginatedResult,
    Profile,
    ProfilesListFilters,
} from '@types';
import { supabase } from './supabase';
import {
  chunkIds,
  ID_LOOKUP_CHUNK_SIZE,
} from './supabase-data-utils';

// ═══════════════════════════════════════════════════════════════════════════
// Profiles (Users)
// ═══════════════════════════════════════════════════════════════════════════

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}

/**
 * Batch-fetch profiles by user id for author-lookup maps (e.g. feed/comment
 * author names). Dedupes input and chunks `.in()` calls.
 */
export async function getProfilesByIds(userIds: string[]): Promise<Profile[]> {
  const uniqueIds = [...new Set(userIds)];
  if (uniqueIds.length === 0) return [];

  const results = await Promise.all(
    chunkIds(uniqueIds, ID_LOOKUP_CHUNK_SIZE).map(async (chunk) => {
      const { data, error } = await supabase.from('profiles').select('*').in('user_id', chunk);
      if (error) throw error;
      return data || [];
    })
  );

  return results.flat();
}

/** Paginated profiles for admin users list — never loads the full table. */
export async function getProfilesPage(
  filters: ProfilesListFilters
): Promise<PaginatedResult<Profile>> {
  const { from, to } = getPaginationRange(filters.page, filters.pageSize);
  let query = supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (filters.unverifiedOnly) {
    query = query.eq('is_verified', false);
  }

  const { data, error, count } = await query.range(from, to);
  if (error) throw error;
  return { items: data || [], total: count ?? 0 };
}

/** Count-only helper for admin badge (no row payload). */
export async function getUnverifiedProfilesCount(): Promise<number> {
  const { count, error } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('is_verified', false);

  if (error) throw error;
  return count ?? 0;
}

export async function updateProfile(userId: string, input: Partial<Profile>): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateUserRole(userId: string, role: Profile['role']): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// FR-507: link a user account to a person in the family tree
export async function updateLinkedPerson(
  userId: string,
  personId: string | null,
): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update({ linked_person: personId, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// FR-508: set the subtree root that a branch editor can edit (null = global)
export async function updateEditRootPerson(
  userId: string,
  personId: string | null,
): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update({ edit_root_person_id: personId, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Suspend / unsuspend a user account (admin only — enforced by RLS)
export async function suspendUser(userId: string, reason?: string): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      is_suspended: true,
      suspension_reason: reason ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function unsuspendUser(userId: string): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      is_suspended: false,
      suspension_reason: null,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// FR-510: check if target person is in the subtree rooted at rootPersonId
// Calls the PostgreSQL function is_person_in_subtree via supabase.rpc
export async function checkPersonInSubtree(
  rootPersonId: string,
  targetPersonId: string,
): Promise<boolean> {
  const { data, error } = await supabase.rpc('is_person_in_subtree', {
    root_id: rootPersonId,
    target_id: targetPersonId,
  });

  if (error) {
    console.error('is_person_in_subtree RPC error:', error);
    return false;
  }
  return data as boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// Verification & Sub-admin (Sprint 12)
// ═══════════════════════════════════════════════════════════════════════════

export async function verifyUser(userId: string, verified: boolean): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update({ is_verified: verified, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCanVerifyMembers(userId: string, canVerify: boolean): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update({ can_verify_members: canVerify, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
