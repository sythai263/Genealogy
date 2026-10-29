/**
 * @project AncestorTree
 * @file src/lib/supabase-data-people.ts
 * @description Supabase data access — people CRUD, search, filter options
 * @version 1.0.0
 * @updated 2026-10-29
 */

import type {
    MemorialPerson,
    PeopleFilterOptions,
    PeopleListFilters,
    PeopleListResult,
    Person,
    CreatePersonInput,
    UpdatePersonInput,
} from '@types';
import { supabase } from './supabase';
import {
  chunkIds,
  ID_LOOKUP_CHUNK_SIZE,
} from './supabase-data-utils';

// ═══════════════════════════════════════════════════════════════════════════
// People CRUD
// ═══════════════════════════════════════════════════════════════════════════

export async function getPerson(id: string): Promise<Person | null> {
  const { data, error } = await supabase
    .from('people')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}

export async function getPersonByHandle(handle: string): Promise<Person | null> {
  const { data, error } = await supabase
    .from('people')
    .select('*')
    .eq('handle', handle)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}

export async function createPerson(input: CreatePersonInput): Promise<Person> {
  // Convert empty strings to null so PostgreSQL typed columns (DATE, URL) don't reject them
  const sanitized = Object.fromEntries(
    Object.entries(input).map(([k, v]) => [k, v === '' ? null : v])
  ) as CreatePersonInput;

  const { data, error } = await supabase
    .from('people')
    .insert(sanitized)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updatePerson(id: string, input: UpdatePersonInput): Promise<Person> {
  // Convert empty strings to null so PostgreSQL typed columns (DATE, URL) don't reject them
  const sanitized = Object.fromEntries(
    Object.entries(input).map(([k, v]) => [k, v === '' ? null : v])
  ) as UpdatePersonInput;

  const { data, error } = await supabase
    .from('people')
    .update({ ...sanitized, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deletePerson(id: string): Promise<void> {
  const { error } = await supabase
    .from('people')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

export async function searchPeople(query: string): Promise<Person[]> {
  // Escape LIKE special characters to prevent pattern injection
  const escaped = query.replace(/[%_\\]/g, '\\$&');
  const { data, error } = await supabase
    .from('people')
    .select('*')
    .ilike('display_name', `%${escaped}%`)
    .order('display_name', { ascending: true })
    .limit(20);

  if (error) throw error;
  return data || [];
}


export async function searchPeopleAdvanced(query: string, ignoreAccents: boolean = true): Promise<Person[]> {
  // Escape LIKE special characters to prevent pattern injection
  const escapedQuery = query.replace(/[%_\\]/g, '\\$&');

  const { data, error } = await supabase.rpc('search_people_advanced', {
    search_term: escapedQuery,
    ignore_acc: ignoreAccents,
  });

  if (error) throw error;
  return data || [];
}

interface PeopleFilterOptionsRpcResult {
  generations: number[];
  chi_values: number[];
}

/**
 * Filtered people search via RPC; pagination via Supabase `.range()` + count.
 */
export async function searchPeopleFiltered(
  filters: PeopleListFilters
): Promise<PeopleListResult> {
  const trimmed = filters.search.trim();
  const searchTerm = trimmed.length >= 2 ? trimmed : null;
  const page = Math.max(filters.page, 1);
  const from = (page - 1) * filters.pageSize;
  const to = from + filters.pageSize - 1;

  const { data, error, count } = await supabase
    .rpc(
      'search_people_filtered',
      {
        search_term: searchTerm,
        p_generation: filters.generation,
        p_chi: filters.chi,
        p_is_living: filters.isLiving,
        ignore_acc: filters.ignoreAccents ?? true,
        p_gender: filters.gender ?? null,
      },
      { count: 'exact' }
    )
    .range(from, to);

  if (error) throw error;

  return {
    items: (data as Person[] | null) ?? [],
    total: count ?? 0,
  };
}

/**
 * Distinct generation / chi values for people list filter dropdowns.
 */
export async function getPeopleFilterOptions(): Promise<PeopleFilterOptions> {
  const { data, error } = await supabase.rpc('get_people_filter_options');

  if (error) throw error;

  const result = data as PeopleFilterOptionsRpcResult | null;
  return {
    generations: result?.generations ?? [],
    chiValues: result?.chi_values ?? [],
  };
}

export async function getPeopleByGeneration(generation: number): Promise<Person[]> {
  const { data, error } = await supabase
    .from('people')
    .select('*')
    .eq('generation', generation)
    .order('display_name', { ascending: true });
  
  if (error) throw error;
  return data || [];
}

/**
 * Batch-fetch people by id for name-lookup maps (e.g. list rows referencing
 * a person). Dedupes input and chunks `.in()` calls to avoid huge queries.
 */
export async function getPeopleByIds(ids: string[]): Promise<Person[]> {
  const uniqueIds = [...new Set(ids)];
  if (uniqueIds.length === 0) return [];

  const results = await Promise.all(
    chunkIds(uniqueIds, ID_LOOKUP_CHUNK_SIZE).map(async (chunk) => {
      const { data, error } = await supabase.from('people').select('*').in('id', chunk);
      if (error) throw error;
      return data || [];
    })
  );

  return results.flat();
}

/**
 * Deceased people with a lunar death date — for auto-giỗ (memorial) scans only.
 * Bounded, lightweight select — never loads the full people table.
 */
export async function getUpcomingMemorialPeople(): Promise<MemorialPerson[]> {
  const { data, error } = await supabase
    .from('people')
    .select('id, display_name, death_lunar, is_living')
    .eq('is_living', false)
    .not('death_lunar', 'is', null);

  if (error) throw error;
  return data || [];
}

// ═══════════════════════════════════════════════════════════════════════════
