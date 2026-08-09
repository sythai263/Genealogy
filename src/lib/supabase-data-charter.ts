/**
 * @project AncestorTree
 * @file src/lib/supabase-data-charter.ts
 * @description Supabase data functions for clan articles (hương ước)
 * @version 2.0.0
 * @updated 2026-08-09
 */

import { supabase } from './supabase';
import { getPaginationRange } from '@constants';
import type { ClanArticle, ClanArticlesListFilters, CreateClanArticleInput, PaginatedResult, UpdateClanArticleInput } from '@types';

/** Paginated clan articles list — bounds the query as the category grows. */
export async function getClanArticles(
  filters: ClanArticlesListFilters
): Promise<PaginatedResult<ClanArticle>> {
  const { from, to } = getPaginationRange(filters.page, filters.pageSize);

  let query = supabase
    .from('clan_articles')
    .select('*', { count: 'exact' })
    .order('sort_order', { ascending: true });

  if (filters.category) {
    query = query.eq('category', filters.category);
  }

  const { data, error, count } = await query.range(from, to);
  if (error) throw error;
  return { items: data || [], total: count ?? 0 };
}

export async function getClanArticle(id: string): Promise<ClanArticle | null> {
  const { data, error } = await supabase
    .from('clan_articles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}

export async function getFeaturedArticles(): Promise<ClanArticle[]> {
  const { data, error } = await supabase
    .from('clan_articles')
    .select('*')
    .eq('is_featured', true)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createClanArticle(input: CreateClanArticleInput): Promise<ClanArticle> {
  const { data, error } = await supabase
    .from('clan_articles')
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateClanArticle(id: string, input: UpdateClanArticleInput): Promise<ClanArticle> {
  const { data, error } = await supabase
    .from('clan_articles')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteClanArticle(id: string): Promise<void> {
  const { error } = await supabase
    .from('clan_articles')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
