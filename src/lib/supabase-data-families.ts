/**
 * @project AncestorTree
 * @file src/lib/supabase-data-families.ts
 * @description Supabase data access — families CRUD, spouse lookup,
 *              relations, family mutations
 * @version 1.0.0
 * @updated 2026-10-29
 */

import { getPaginationRange } from '@constants';
import type {
    FamiliesMissingSpouseFilters,
    Family,
    FamilyMissingSpouse,
    PaginatedResult,
    Person,
} from '@types';
import { supabase } from './supabase';

// Families CRUD
// ═══════════════════════════════════════════════════════════════════════════

/** Head-count only — for dashboard cards that don't need row payloads. */
export async function getFamiliesCount(): Promise<number> {
  const { count, error } = await supabase
    .from('families')
    .select('*', { count: 'exact', head: true });

  if (error) throw error;
  return count ?? 0;
}

export async function getFamily(id: string): Promise<Family | null> {
  const { data, error } = await supabase
    .from('families')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}

export async function getFamilyChildren(familyId: string): Promise<Person[]> {
  const { data, error } = await supabase
    .from('children')
    .select('person_id, sort_order')
    .eq('family_id', familyId)
    .order('sort_order', { ascending: true });
  
  if (error) throw error;
  if (!data || data.length === 0) return [];
  
  const personIds = data.map(c => c.person_id);
  const { data: people, error: peopleError } = await supabase
    .from('people')
    .select('*')
    .in('id', personIds);
  
  if (peopleError) throw peopleError;
  
  // Sort by original order
  const orderMap = new Map(data.map(c => [c.person_id, c.sort_order]));
  return (people || []).sort((a, b) => 
    (orderMap.get(a.id) || 0) - (orderMap.get(b.id) || 0)
  );
}

/**
 * Bulk missing-spouse worklist, paginated.
 *
 * The candidate set is inherently the "incomplete families" slice of
 * `families` (already a narrow subset, not the full people table) — chi/
 * generation live on the *person* row so they cannot be pushed into the
 * families query. The algorithm therefore still loads that full incomplete
 * set + their linked people, applies chi/generation filters server-side in
 * memory, sorts, and only then slices the page via `getPaginationRange`;
 * `total` reflects the filtered (not the raw incomplete) count.
 */
export async function getFamiliesMissingSpouse(
  filters: FamiliesMissingSpouseFilters
): Promise<PaginatedResult<FamilyMissingSpouse>> {
  const { data: families, error } = await supabase
    .from('families')
    .select('id, father_id, mother_id')
    .or(
      'and(father_id.not.is.null,mother_id.is.null),and(mother_id.not.is.null,father_id.is.null)'
    );

  if (error) throw error;
  if (!families || families.length === 0) return { items: [], total: 0 };

  const personIds = families.map((f) => f.father_id ?? f.mother_id).filter((id): id is string => Boolean(id));

  const [peopleRes, childrenRes] = await Promise.all([
    supabase.from('people').select('*').in('id', personIds),
    supabase
      .from('children')
      .select('family_id')
      .in('family_id', families.map((f) => f.id)),
  ]);

  if (peopleRes.error) throw peopleRes.error;
  if (childrenRes.error) throw childrenRes.error;

  const peopleById = new Map((peopleRes.data || []).map((p: Person) => [p.id, p]));
  const childCounts = new Map<string, number>();
  for (const row of childrenRes.data || []) {
    childCounts.set(row.family_id, (childCounts.get(row.family_id) || 0) + 1);
  }

  const filtered = families
    .map((family) => {
      const knownRole: 'father' | 'mother' = family.father_id ? 'father' : 'mother';
      const person = peopleById.get(family.father_id ?? family.mother_id);
      if (!person) return null;
      return {
        family_id: family.id,
        person,
        knownRole,
        childrenCount: childCounts.get(family.id) || 0,
      };
    })
    .filter((entry): entry is FamilyMissingSpouse => entry != null)
    .filter((entry) => filters.chi == null || entry.person.chi === filters.chi)
    .filter((entry) => filters.generation == null || entry.person.generation === filters.generation)
    .sort(
      (a, b) =>
        a.person.generation - b.person.generation ||
        (a.person.chi ?? 0) - (b.person.chi ?? 0) ||
        a.person.display_name.localeCompare(b.person.display_name, 'vi')
    );

  const { from, to } = getPaginationRange(filters.page, filters.pageSize);
  return { items: filtered.slice(from, to + 1), total: filtered.length };
}

export async function createFamily(input: Omit<Family, 'id' | 'created_at' | 'updated_at'>): Promise<Family> {
  const { data, error } = await supabase
    .from('families')
    .insert(input)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function addChildToFamily(familyId: string, personId: string, sortOrder: number): Promise<void> {
  const { error } = await supabase
    .from('children')
    .insert({ family_id: familyId, person_id: personId, sort_order: sortOrder });
  
  if (error) throw error;
}

export async function removeChildFromFamily(familyId: string, personId: string): Promise<void> {
  const { error } = await supabase
    .from('children')
    .delete()
    .eq('family_id', familyId)
    .eq('person_id', personId);

  if (error) throw error;
}

export async function nextChildSortOrder(familyId: string): Promise<number> {
  const { data, error } = await supabase
    .from('children')
    .select('sort_order')
    .eq('family_id', familyId)
    .order('sort_order', { ascending: false })
    .limit(1);
  if (error) throw error;
  return data?.length ? data[0].sort_order + 1 : 0;
}

