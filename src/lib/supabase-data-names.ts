/**
 * @project AncestorTree
 * @file src/lib/supabase-data-names.ts
 * @description Supabase data functions for the public name dictionary —
 *              names table + per-name meanings, DB-side search via the
 *              folded `name_search` column, submissions and moderation
 * @version 1.1.0
 * @updated 2026-10-30
 */

import { supabase } from './supabase';
import { normalizeVietnameseName, removeVietnameseTones } from './format-utils';
import { escapeIlikePattern } from './utils';
import { getPaginationRange } from '@constants';
import type {
  NameEntry,
  NameGender,
  NameMeaningRow,
  NameStatus,
  NameSubmission,
  PaginatedResult,
} from '@types';

export interface NameSearchFilters {
  keyword?: string;
  gender?: NameGender;
  /** 1 → 3-word full name, 2 → 4-word full name */
  nameWordCount?: 1 | 2;
  page: number;
  pageSize: number;
}

export interface AdminNameFilters extends NameSearchFilters {
  status?: NameStatus;
}

type NameRow = Omit<NameEntry, 'meanings'>;

function applyNameFilters(
  query: ReturnType<typeof baseQuery>,
  filters: NameSearchFilters
) {
  let q = query;
  if (filters.gender) {
    q = q.in('gender', [filters.gender, 'both']);
  }
  if (filters.nameWordCount) {
    q = q.eq('name_word_count', filters.nameWordCount);
  }
  const keyword = filters.keyword?.trim();
  if (keyword) {
    const raw = `%${escapeIlikePattern(keyword)}%`;
    const folded = `%${escapeIlikePattern(removeVietnameseTones(keyword))}%`;
    q = q.or(`name.ilike.${raw},name_search.ilike.${folded}`);
  }
  return q;
}

const baseQuery = () => supabase.from('names').select('*', { count: 'exact' });

/** Fetch meaning rows for a set of name ids. */
async function fetchMeanings(
  nameIds: string[],
  approvedOnly: boolean
): Promise<Map<string, NameMeaningRow[]>> {
  const map = new Map<string, NameMeaningRow[]>();
  if (nameIds.length === 0) return map;
  let q = supabase
    .from('name_meanings')
    .select('*')
    .in('name_id', nameIds)
    .order('created_at', { ascending: true });
  if (approvedOnly) q = q.eq('status', 'approved');
  const { data, error } = await q;
  if (error) throw error;
  for (const row of (data ?? []) as NameMeaningRow[]) {
    const list = map.get(row.name_id) ?? [];
    list.push(row);
    map.set(row.name_id, list);
  }
  return map;
}

/** Public search — approved names only, accent-insensitive via name_search. */
export async function searchNames(
  filters: NameSearchFilters
): Promise<PaginatedResult<NameEntry>> {
  const { from, to } = getPaginationRange(filters.page, filters.pageSize);

  const query = applyNameFilters(
    baseQuery().eq('status', 'approved').order('name', { ascending: true }),
    filters
  );

  const { data, error, count } = await query.range(from, to);
  if (error) throw error;

  const rows = (data ?? []) as NameRow[];
  const meanings = await fetchMeanings(
    rows.map((r) => r.id),
    true
  );
  return {
    items: rows.map((r) => ({ ...r, meanings: meanings.get(r.id) ?? [] })),
    total: count ?? 0,
  };
}

/**
 * Community submission — adds a pending meaning to the existing name when it
 * already exists, otherwise creates a pending name + pending meaning.
 */
export async function submitName(payload: NameSubmission): Promise<void> {
  const name = normalizeVietnameseName(payload.name);
  const meaning = payload.meaning.trim();
  const contributor = {
    contributor_name: payload.contributor_name?.trim() || null,
    contributor_note: payload.contributor_note?.trim() || null,
  };

  const { data: existing } = await supabase
    .from('names')
    .select('id')
    .eq('name', name)
    .eq('gender', payload.gender)
    .limit(1);

  let nameId = existing?.[0]?.id as string | undefined;
  if (!nameId) {
    const { data: row, error } = await supabase
      .from('names')
      .insert({
        name,
        gender: payload.gender,
        name_word_count: Math.min(name.split(/\s+/).length, 2),
        ...contributor,
      })
      .select('id')
      .single();
    if (error) throw error;
    nameId = (row as { id: string }).id;
  }

  const { error } = await supabase.from('name_meanings').insert({
    name_id: nameId,
    meaning,
    ...contributor,
  });
  if (error) throw error;
}

/** Admin list — names of any status with all their meanings. */
export async function getAdminNames(
  filters: AdminNameFilters
): Promise<PaginatedResult<NameEntry>> {
  const { from, to } = getPaginationRange(filters.page, filters.pageSize);

  let query = applyNameFilters(
    baseQuery().order('created_at', { ascending: false }),
    filters
  );
  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  const { data, error, count } = await query.range(from, to);
  if (error) throw error;

  const rows = (data ?? []) as NameRow[];
  const meanings = await fetchMeanings(
    rows.map((r) => r.id),
    false
  );
  return {
    items: rows.map((r) => ({ ...r, meanings: meanings.get(r.id) ?? [] })),
    total: count ?? 0,
  };
}

export interface AdminNameInput {
  name: string;
  gender: NameGender;
  /** One meaning per list item — empty list → name-only entry. */
  meanings: string[];
  status?: NameStatus;
}

async function replaceMeanings(
  nameId: string,
  meanings: string[],
  status: NameStatus
): Promise<void> {
  const { error: delError } = await supabase
    .from('name_meanings')
    .delete()
    .eq('name_id', nameId);
  if (delError) throw delError;
  const rows = meanings
    .map((m) => m.trim())
    .filter(Boolean)
    .map((meaning) => ({ name_id: nameId, meaning, status }));
  if (rows.length === 0) return;
  const { error } = await supabase.from('name_meanings').insert(rows);
  if (error) throw error;
}

export async function createAdminName(input: AdminNameInput): Promise<void> {
  const name = normalizeVietnameseName(input.name);
  const { data: row, error } = await supabase
    .from('names')
    .insert({
      name,
      gender: input.gender,
      name_word_count: Math.min(name.split(/\s+/).length, 2),
      status: input.status ?? 'approved',
    })
    .select('id')
    .single();
  if (error) throw error;
  await replaceMeanings(
    (row as { id: string }).id,
    input.meanings,
    input.status ?? 'approved'
  );
}

export async function updateName(
  id: string,
  input: AdminNameInput
): Promise<void> {
  const name = normalizeVietnameseName(input.name);
  const { error } = await supabase
    .from('names')
    .update({
      name,
      gender: input.gender,
      name_word_count: Math.min(name.split(/\s+/).length, 2),
      status: input.status,
    })
    .eq('id', id);
  if (error) throw error;
  await replaceMeanings(id, input.meanings, input.status ?? 'approved');
}

/** Approve a name and all its pending meanings in one go. */
export async function approveName(id: string): Promise<void> {
  const { error } = await supabase
    .from('names')
    .update({ status: 'approved' })
    .eq('id', id);
  if (error) throw error;
  const { error: mError } = await supabase
    .from('name_meanings')
    .update({ status: 'approved' })
    .eq('name_id', id)
    .eq('status', 'pending');
  if (mError) throw mError;
}

export async function deleteName(id: string): Promise<void> {
  const { error } = await supabase.from('names').delete().eq('id', id);
  if (error) throw error;
}
