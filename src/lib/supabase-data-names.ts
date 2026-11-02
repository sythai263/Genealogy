/**
 * @project AncestorTree
 * @file src/lib/supabase-data-names.ts
 * @description Supabase data functions for the public name dictionary —
 *              DB-side search via the folded `name_search` column, community
 *              submissions (always pending) and admin moderation
 * @version 1.0.0
 * @updated 2026-10-30
 */

import { supabase } from './supabase';
import { removeVietnameseTones } from './format-utils';
import { escapeIlikePattern } from './utils';
import { getPaginationRange } from '@constants';
import type {
  NameGender,
  NameMeaning,
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

/** Public search — approved rows only, accent-insensitive via name_search. */
export async function searchNames(
  filters: NameSearchFilters
): Promise<PaginatedResult<NameMeaning>> {
  const { from, to } = getPaginationRange(filters.page, filters.pageSize);

  let query = supabase
    .from('name_meanings')
    .select('*', { count: 'exact' })
    .eq('status', 'approved')
    .order('name', { ascending: true });

  if (filters.gender) {
    query = query.in('gender', [filters.gender, 'both']);
  }
  if (filters.nameWordCount) {
    query = query.eq('name_word_count', filters.nameWordCount);
  }
  const keyword = filters.keyword?.trim();
  if (keyword) {
    const raw = `%${escapeIlikePattern(keyword)}%`;
    const folded = `%${escapeIlikePattern(removeVietnameseTones(keyword))}%`;
    query = query.or(`name.ilike.${raw},name_search.ilike.${folded}`);
  }

  const { data, error, count } = await query.range(from, to);
  if (error) throw error;

  return { items: (data ?? []) as NameMeaning[], total: count ?? 0 };
}

/** Community submission — RLS forces status='pending'. */
export async function submitName(payload: NameSubmission): Promise<void> {
  const { error } = await supabase.from('name_meanings').insert({
    name: payload.name.trim(),
    gender: payload.gender,
    meaning: payload.meaning.trim(),
    name_word_count: payload.name.trim().split(/\s+/).length,
    contributor_name: payload.contributor_name?.trim() || null,
    contributor_note: payload.contributor_note?.trim() || null,
  });
  if (error) throw error;
}

/** Admin list — all statuses. */
export async function getAdminNames(
  filters: AdminNameFilters
): Promise<PaginatedResult<NameMeaning>> {
  const { from, to } = getPaginationRange(filters.page, filters.pageSize);

  let query = supabase
    .from('name_meanings')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  if (filters.gender) {
    query = query.eq('gender', filters.gender);
  }
  const keyword = filters.keyword?.trim();
  if (keyword) {
    const raw = `%${escapeIlikePattern(keyword)}%`;
    const folded = `%${escapeIlikePattern(removeVietnameseTones(keyword))}%`;
    query = query.or(`name.ilike.${raw},name_search.ilike.${folded}`);
  }

  const { data, error, count } = await query.range(from, to);
  if (error) throw error;

  return { items: (data ?? []) as NameMeaning[], total: count ?? 0 };
}

export interface AdminNameInput {
  name: string;
  gender: NameGender;
  meaning: string;
  status?: NameStatus;
}

export async function createAdminName(input: AdminNameInput): Promise<void> {
  const { error } = await supabase.from('name_meanings').insert({
    name: input.name.trim(),
    gender: input.gender,
    meaning: input.meaning.trim(),
    name_word_count: input.name.trim().split(/\s+/).length,
    status: input.status ?? 'approved',
  });
  if (error) throw error;
}

export async function updateName(
  id: string,
  input: AdminNameInput
): Promise<void> {
  const { error } = await supabase
    .from('name_meanings')
    .update({
      name: input.name.trim(),
      gender: input.gender,
      meaning: input.meaning.trim(),
      name_word_count: input.name.trim().split(/\s+/).length,
      status: input.status,
    })
    .eq('id', id);
  if (error) throw error;
}

export async function approveName(id: string): Promise<void> {
  const { error } = await supabase
    .from('name_meanings')
    .update({ status: 'approved' })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteName(id: string): Promise<void> {
  const { error } = await supabase.from('name_meanings').delete().eq('id', id);
  if (error) throw error;
}
