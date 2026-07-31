/**
 * @project AncestorTree
 * @file src/lib/supabase-data-achievements.ts
 * @description Supabase data functions for achievements
 * @version 1.1.0
 * @updated 2026-07-27
 */

import { supabase } from './supabase';
import { escapeIlikePattern } from './utils';
import { getPaginationRange } from '@constants';
import type { Achievement, AchievementsListFilters, CreateAchievementInput, PaginatedResult, UpdateAchievementInput } from '@types';

export async function getAchievements(
  filters: AchievementsListFilters
): Promise<PaginatedResult<Achievement>> {
  const { from, to } = getPaginationRange(filters.page, filters.pageSize);

  let query = supabase
    .from('achievements')
    .select('*', { count: 'exact' })
    .order('year', { ascending: false });

  if (filters.category) {
    query = query.eq('category', filters.category);
  }

  const trimmed = filters.search?.trim();
  if (trimmed) {
    const pattern = `%${escapeIlikePattern(trimmed)}%`;

    const { data: matchingPeople, error: peopleError } = await supabase
      .from('people')
      .select('id')
      .ilike('display_name', pattern)
      .limit(50);

    if (peopleError) throw peopleError;

    const personIds = (matchingPeople || []).map((p) => p.id);
    const orParts = [`title.ilike."${pattern}"`, `awarded_by.ilike."${pattern}"`];
    if (personIds.length > 0) {
      orParts.push(`person_id.in.(${personIds.join(',')})`);
    }
    query = query.or(orParts.join(','));
  }

  const { data, error, count } = await query.range(from, to);
  if (error) throw error;
  return { items: data || [], total: count ?? 0 };
}

export async function getAchievement(id: string): Promise<Achievement | null> {
  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}

export async function getAchievementsByPerson(personId: string): Promise<Achievement[]> {
  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .eq('person_id', personId)
    .order('year', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getFeaturedAchievements(): Promise<Achievement[]> {
  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .eq('is_featured', true)
    .order('year', { ascending: false })
    .limit(6);

  if (error) throw error;
  return data || [];
}

export async function createAchievement(input: CreateAchievementInput): Promise<Achievement> {
  const { data, error } = await supabase
    .from('achievements')
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateAchievement(id: string, input: UpdateAchievementInput): Promise<Achievement> {
  const { data, error } = await supabase
    .from('achievements')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteAchievement(id: string): Promise<void> {
  const { error } = await supabase
    .from('achievements')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
