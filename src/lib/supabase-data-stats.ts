/**
 * @project AncestorTree
 * @file src/lib/supabase-data-stats.ts
 * @description Supabase data access — dashboard stats + full tree payload
 * @version 1.0.0
 * @updated 2026-10-29
 */

import type {
    Family,
    Person,
} from '@types';
import { supabase } from './supabase';

interface PeopleStatsRpcResult {
  totalPeople: number;
  livingCount: number;
  deceasedCount: number;
  totalGenerations: number;
  totalChi: number;
}

/**
 * Dashboard counters. Prefers the `get_people_stats` SQL RPC (single
 * aggregate query). Falls back to count-only queries + a lightweight
 * `generation, chi` projection (not a full row select) if the RPC is not
 * available yet (e.g. migration not applied).
 */
export async function getStats(): Promise<{
  totalPeople: number;
  totalGenerations: number;
  totalChi: number;
  livingCount: number;
  deceasedCount: number;
}> {
  const { data, error } = await supabase.rpc('get_people_stats');
  if (!error && data) {
    const result = data as PeopleStatsRpcResult;
    return {
      totalPeople: result.totalPeople ?? 0,
      totalGenerations: result.totalGenerations ?? 0,
      totalChi: result.totalChi ?? 0,
      livingCount: result.livingCount ?? 0,
      deceasedCount: result.deceasedCount ?? 0,
    };
  }

  const [totalRes, livingRes, deceasedRes, genChiRes] = await Promise.all([
    supabase.from('people').select('*', { count: 'exact', head: true }),
    supabase.from('people').select('*', { count: 'exact', head: true }).eq('is_living', true),
    supabase.from('people').select('*', { count: 'exact', head: true }).eq('is_living', false),
    supabase.from('people').select('generation, chi'),
  ]);

  if (totalRes.error) throw totalRes.error;
  if (livingRes.error) throw livingRes.error;
  if (deceasedRes.error) throw deceasedRes.error;
  if (genChiRes.error) throw genChiRes.error;

  const generations = new Set((genChiRes.data || []).map((p) => p.generation));
  const chis = new Set((genChiRes.data || []).filter((p) => p.chi).map((p) => p.chi));

  return {
    totalPeople: totalRes.count ?? 0,
    totalGenerations: generations.size,
    totalChi: chis.size,
    livingCount: livingRes.count ?? 0,
    deceasedCount: deceasedRes.count ?? 0,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// Family Tree Data
// ═══════════════════════════════════════════════════════════════════════════

export interface TreeData {
  people: Person[];
  families: Family[];
  children: { family_id: string; person_id: string; sort_order: number }[];
}

export async function getTreeData(): Promise<TreeData> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Unauthenticated: people_public_tree view (no contact PII) + public families/children RLS
  if (!session) {
    const [peopleRes, familiesRes, childrenRes] = await Promise.all([
      supabase.from('people_public_tree').select('*'),
      supabase.from('families').select('*'),
      supabase.from('children').select('family_id, person_id, sort_order'),
    ]);

    if (peopleRes.error) throw peopleRes.error;
    if (familiesRes.error) throw familiesRes.error;
    if (childrenRes.error) throw childrenRes.error;

    return {
      people: (peopleRes.data || []) as Person[],
      families: familiesRes.data || [],
      children: childrenRes.data || [],
    };
  }

  const [peopleRes, familiesRes, childrenRes] = await Promise.all([
    supabase.from('people').select('*'),
    supabase.from('families').select('*'),
    supabase.from('children').select('family_id, person_id, sort_order'),
  ]);

  if (peopleRes.error) throw peopleRes.error;
  if (familiesRes.error) throw familiesRes.error;
  if (childrenRes.error) throw childrenRes.error;

  return {
    people: peopleRes.data || [],
    families: familiesRes.data || [],
    children: childrenRes.data || [],
  };
}

