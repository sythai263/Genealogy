/**
 * @project AncestorTree
 * @file src/lib/supabase-data-contributions.ts
 * @description Supabase data access — member contribution review flow
 * @version 1.0.0
 * @updated 2026-10-29
 */

import { getPaginationRange } from '@constants';
import type {
    Contribution,
    ContributionsListFilters,
    JsonObject,
    PaginatedResult,
} from '@types';
import { supabase } from './supabase';

// ═══════════════════════════════════════════════════════════════════════════
// Contributions (Edit Suggestions)
// ═══════════════════════════════════════════════════════════════════════════

export async function getContributions(
  filters: ContributionsListFilters
): Promise<PaginatedResult<Contribution>> {
  const { from, to } = getPaginationRange(filters.page, filters.pageSize);

  let query = supabase
    .from('contributions')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  if (filters.authorId) {
    query = query.eq('author_id', filters.authorId);
  }

  const { data, error, count } = await query.range(from, to);
  if (error) throw error;
  return { items: data || [], total: count ?? 0 };
}

export async function getPendingContributionsCount(): Promise<number> {
  const { count, error } = await supabase
    .from('contributions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  if (error) throw error;
  return count ?? 0;
}

export async function getContribution(id: string): Promise<Contribution | null> {
  const { data, error } = await supabase
    .from('contributions')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}

export async function createContribution(input: {
  author_id: string;
  target_person: string;
  change_type: Contribution['change_type'];
  changes: JsonObject;
  reason?: string;
}): Promise<Contribution> {
  const { data, error } = await supabase
    .from('contributions')
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** people columns a contribution is allowed to write — everything else is dropped */
const CONTRIBUTION_ALLOWED_FIELDS = new Set([
  'display_name', 'first_name', 'middle_name', 'surname', 'pen_name', 'taboo_name',
  'phone', 'email', 'zalo', 'facebook', 'address', 'hometown',
  'birth_year', 'death_year', 'death_lunar', 'birth_place', 'death_place',
  'occupation', 'biography', 'notes', 'generation', 'chi', 'gender',
]);

const CONTRIBUTION_INTEGER_FIELDS = new Set([
  'birth_year',
  'death_year',
  'generation',
  'chi',
  'gender',
]);

/**
 * Filters `changes` down to whitelisted people columns and coerces the
 * string-valued form payload into the column types.
 */
function buildSafePersonChanges(changes: JsonObject): JsonObject {
  const safeChanges: JsonObject = {};
  for (const [key, raw] of Object.entries(changes)) {
    if (!CONTRIBUTION_ALLOWED_FIELDS.has(key)) continue;
    if (CONTRIBUTION_INTEGER_FIELDS.has(key)) {
      const parsed = typeof raw === 'number' ? raw : parseInt(String(raw), 10);
      if (Number.isNaN(parsed)) continue;
      safeChanges[key] = parsed;
    } else {
      safeChanges[key] = raw;
    }
  }
  return safeChanges;
}

/** Generates a unique people.handle for contribution-created rows */
function generateContributionHandle(): string {
  return `p${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Applies an approved contribution to the people table.
 * Throws when the change cannot be applied so the contribution stays pending
 * instead of being silently marked approved.
 */
async function applyApprovedContribution(
  contribution: Contribution
): Promise<void> {
  if (contribution.change_type === 'update') {
    if (!contribution.target_person) return;
    const safeChanges = buildSafePersonChanges(contribution.changes);
    if (Object.keys(safeChanges).length === 0) return;

    const { error } = await supabase
      .from('people')
      .update({ ...safeChanges, updated_at: new Date().toISOString() })
      .eq('id', contribution.target_person);

    if (error) throw error;
    return;
  }

  if (contribution.change_type === 'create') {
    const safeChanges = buildSafePersonChanges(contribution.changes);
    const displayName = safeChanges.display_name;
    if (typeof displayName !== 'string' || !displayName.trim()) {
      throw new Error('Contribution create requires display_name');
    }

    const { error } = await supabase.from('people').insert({
      ...safeChanges,
      handle: generateContributionHandle(),
      is_living: true,
      is_patrilineal: true,
      privacy_level: 0,
    });

    if (error) throw error;
    return;
  }

  if (contribution.change_type === 'delete') {
    if (!contribution.target_person) {
      throw new Error('Contribution delete requires target_person');
    }
    const { error } = await supabase
      .from('people')
      .delete()
      .eq('id', contribution.target_person);

    if (error) throw error;
  }
}

export async function reviewContribution(
  id: string,
  status: 'approved' | 'rejected',
  reviewerId: string,
  reviewNotes?: string
): Promise<Contribution> {
  // First, get the contribution to access changes and target person
  const { data: contribution, error: fetchError } = await supabase
    .from('contributions')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError) throw fetchError;

  // Apply the proposed change only when approving a still-pending item —
  // guards against double-applying if the review is retried.
  if (status === 'approved' && contribution.status === 'pending') {
    await applyApprovedContribution(contribution);
  }

  // Update the contribution status
  const { data, error } = await supabase
    .from('contributions')
    .update({
      status,
      reviewed_by: reviewerId,
      reviewed_at: new Date().toISOString(),
      review_notes: reviewNotes,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getContributionsByPerson(personId: string): Promise<Contribution[]> {
  const { data, error } = await supabase
    .from('contributions')
    .select('*')
    .eq('target_person', personId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function deleteContribution(id: string): Promise<void> {
  const { error } = await supabase
    .from('contributions')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

