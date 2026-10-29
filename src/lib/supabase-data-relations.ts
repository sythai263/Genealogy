/**
 * @project AncestorTree
 * @file src/lib/supabase-data-relations.ts
 * @description Supabase data access — person-family linking, relation
 *              lookup, couple/spouse family creation
 * @version 1.0.0
 * @updated 2026-10-29
 */

import type {
    Family,
    Person,
    PersonRelations,
} from '@types';
import { supabase } from './supabase';
import {
  addChildToFamily,
  nextChildSortOrder,
  removeChildFromFamily,
} from './supabase-data-families';

/**
 * Ensure childPersonId belongs to familyId as their parent family.
 * If they were already linked to another family, move them so cha/mẹ map
 * to this couple only (one parent-family per person).
 */
export async function ensureChildInFamily(
  familyId: string,
  childPersonId: string
): Promise<void> {
  const { data: family, error: familyError } = await supabase
    .from('families')
    .select('id, father_id, mother_id')
    .eq('id', familyId)
    .maybeSingle();
  if (familyError) throw familyError;
  if (!family) throw new Error('Không tìm thấy gia đình');

  if (childPersonId === family.father_id || childPersonId === family.mother_id) {
    throw new Error('Không thể thêm bố/mẹ làm con trong cùng gia đình');
  }

  const { data: existingLinks, error: linksError } = await supabase
    .from('children')
    .select('id, family_id')
    .eq('person_id', childPersonId);
  if (linksError) throw linksError;

  const inTarget = (existingLinks || []).find((r) => r.family_id === familyId);
  if (inTarget) return;

  const nextSort = await nextChildSortOrder(familyId);
  const otherLinks = (existingLinks || []).filter((r) => r.family_id !== familyId);

  if (otherLinks.length > 0) {
    const [primary, ...extras] = otherLinks;
    const { error: moveError } = await supabase
      .from('children')
      .update({ family_id: familyId, sort_order: nextSort })
      .eq('id', primary.id);
    if (moveError) throw moveError;

    for (const extra of extras) {
      const { error: deleteError } = await supabase
        .from('children')
        .delete()
        .eq('id', extra.id);
      if (deleteError) throw deleteError;
    }
    return;
  }

  await addChildToFamily(familyId, childPersonId, nextSort);
}

/**
 * Add a child under a specific family (correct father_id/mother_id pair).
 * Used by the family-relations card "Thêm con" action.
 */
export async function addChildToExistingFamily(
  familyId: string,
  childPersonId: string
): Promise<void> {
  await ensureChildInFamily(familyId, childPersonId);
}

/**
 * Add a child for a person who may not have an own family yet.
 * - If familyId is provided, attach to that family (and its parents).
 * - Otherwise find/create a single-parent family for this person, then attach.
 */
export async function addChildForPerson(
  parentPersonId: string,
  parentGender: 1 | 2,
  childPersonId: string,
  familyId?: string
): Promise<void> {
  if (childPersonId === parentPersonId) {
    throw new Error('Không thể thêm chính mình làm con');
  }

  if (familyId) {
    const { data: family, error } = await supabase
      .from('families')
      .select('id, father_id, mother_id')
      .eq('id', familyId)
      .maybeSingle();
    if (error) throw error;
    if (!family) throw new Error('Không tìm thấy gia đình');

    const belongsToParent =
      family.father_id === parentPersonId || family.mother_id === parentPersonId;
    if (!belongsToParent) {
      throw new Error('Gia đình không thuộc về thành viên này');
    }

    await ensureChildInFamily(familyId, childPersonId);
    return;
  }

  const fatherId = parentGender === 1 ? parentPersonId : null;
  const motherId = parentGender === 2 ? parentPersonId : null;
  await addPersonToParentFamily(fatherId, motherId, childPersonId);
}

// ─── Person Relations ─────────────────────────────────────────────────────────

export async function getPersonRelations(personId: string): Promise<PersonRelations> {
  // Parallel: find parent family + own families
  const [childRowsRes, ownFamiliesRes] = await Promise.all([
    supabase
      .from('children')
      .select('family_id, created_at')
      .eq('person_id', personId)
      .order('created_at', { ascending: false })
      .limit(1),
    supabase
      .from('families')
      .select('*')
      .or(`father_id.eq.${personId},mother_id.eq.${personId}`)
      .order('sort_order', { ascending: true }),
  ]);

  if (childRowsRes.error) throw childRowsRes.error;
  if (ownFamiliesRes.error) throw ownFamiliesRes.error;

  const parentFamilyId = childRowsRes.data?.[0]?.family_id ?? null;
  const ownFamilies: Family[] = ownFamiliesRes.data || [];

  // Parallel: fetch parent family record + sibling rows + own children rows
  const [parentFamilyRes, siblingRowsRes, ownChildrenRowsRes] = await Promise.all([
    parentFamilyId
      ? supabase.from('families').select('*').eq('id', parentFamilyId).single()
      : Promise.resolve({ data: null, error: null }),
    parentFamilyId
      ? supabase
          .from('children')
          .select('person_id, sort_order')
          .eq('family_id', parentFamilyId)
          .order('sort_order', { ascending: true })
      : Promise.resolve({ data: [], error: null }),
    ownFamilies.length > 0
      ? supabase
          .from('children')
          .select('family_id, person_id, sort_order')
          .in('family_id', ownFamilies.map((f) => f.id))
          .order('sort_order', { ascending: true })
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (parentFamilyRes.error && (parentFamilyRes.error as { code?: string }).code !== 'PGRST116')
    throw parentFamilyRes.error;
  if (siblingRowsRes.error) throw siblingRowsRes.error;
  if (ownChildrenRowsRes.error) throw ownChildrenRowsRes.error;

  const parentFamily = parentFamilyRes.data as Family | null;
  const siblingRows = (siblingRowsRes.data || []) as { person_id: string; sort_order: number }[];
  const ownChildrenRows = (ownChildrenRowsRes.data || []) as {
    family_id: string;
    person_id: string;
    sort_order: number;
  }[];

  // Collect all person IDs to batch-fetch
  const personIds = new Set<string>();
  if (parentFamily?.father_id) personIds.add(parentFamily.father_id);
  if (parentFamily?.mother_id) personIds.add(parentFamily.mother_id);
  for (const r of siblingRows) {
    if (r.person_id !== personId) personIds.add(r.person_id);
  }
  for (const f of ownFamilies) {
    if (f.father_id && f.father_id !== personId) personIds.add(f.father_id);
    if (f.mother_id && f.mother_id !== personId) personIds.add(f.mother_id);
  }
  for (const r of ownChildrenRows) personIds.add(r.person_id);

  // Batch fetch persons
  const personMap = new Map<string, Person>();
  if (personIds.size > 0) {
    const { data: persons, error: personsError } = await supabase
      .from('people')
      .select('*')
      .in('id', [...personIds]);
    if (personsError) throw personsError;
    for (const p of persons || []) personMap.set(p.id, p);
  }

  // Build parentFamily result
  let parentFamilyResult: PersonRelations['parentFamily'] = null;
  if (parentFamily) {
    const siblings = siblingRows
      .filter((r) => r.person_id !== personId)
      .map((r) => personMap.get(r.person_id))
      .filter(Boolean) as Person[];
    parentFamilyResult = {
      family: parentFamily,
      father: parentFamily.father_id ? (personMap.get(parentFamily.father_id) || null) : null,
      mother: parentFamily.mother_id ? (personMap.get(parentFamily.mother_id) || null) : null,
      siblings,
    };
  }

  // Build ownFamilies result
  const childrenByFamily = new Map<string, typeof ownChildrenRows>();
  for (const r of ownChildrenRows) {
    if (!childrenByFamily.has(r.family_id)) childrenByFamily.set(r.family_id, []);
    childrenByFamily.get(r.family_id)!.push(r);
  }

  const resolvedOwnFamilies = ownFamilies.map((family) => {
    const spouseId = family.father_id === personId ? family.mother_id : family.father_id;
    const familyChildren = (childrenByFamily.get(family.id) || [])
      .map((r) => personMap.get(r.person_id))
      .filter(Boolean) as Person[];
    return {
      family,
      spouse: spouseId ? (personMap.get(spouseId) || null) : null,
      children: familyChildren,
    };
  });

  return { parentFamily: parentFamilyResult, ownFamilies: resolvedOwnFamilies };
}

// Find or create a family for the given parents, then add childPersonId as a child.
// Resolves the correct couple family so cha/mẹ on the child's page match the intended parents.
export async function addPersonToParentFamily(
  fatherId: string | null,
  motherId: string | null,
  childPersonId: string
): Promise<void> {
  if (!fatherId && !motherId) return;
  if (childPersonId === fatherId || childPersonId === motherId) {
    throw new Error('Không thể thêm bố/mẹ làm con');
  }

  let familyId: string | null = null;

  if (fatherId && motherId) {
    // Exact couple — use their existing family when present
    const { data: couple, error } = await supabase
      .from('families')
      .select('id')
      .eq('father_id', fatherId)
      .eq('mother_id', motherId)
      .order('sort_order', { ascending: true })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    if (couple?.id) familyId = couple.id;
  } else if (fatherId) {
    // Prefer father's half-family; if he has exactly one complete marriage, use that
    const { data: half, error: halfError } = await supabase
      .from('families')
      .select('id')
      .eq('father_id', fatherId)
      .is('mother_id', null)
      .order('sort_order', { ascending: true })
      .limit(1)
      .maybeSingle();
    if (halfError) throw halfError;
    if (half?.id) {
      familyId = half.id;
    } else {
      const { data: completes, error: completeError } = await supabase
        .from('families')
        .select('id')
        .eq('father_id', fatherId)
        .not('mother_id', 'is', null)
        .order('sort_order', { ascending: true });
      if (completeError) throw completeError;
      if (completes?.length === 1) familyId = completes[0].id;
    }
  } else if (motherId) {
    const { data: half, error: halfError } = await supabase
      .from('families')
      .select('id')
      .eq('mother_id', motherId)
      .is('father_id', null)
      .order('sort_order', { ascending: true })
      .limit(1)
      .maybeSingle();
    if (halfError) throw halfError;
    if (half?.id) {
      familyId = half.id;
    } else {
      const { data: completes, error: completeError } = await supabase
        .from('families')
        .select('id')
        .eq('mother_id', motherId)
        .not('father_id', 'is', null)
        .order('sort_order', { ascending: true });
      if (completeError) throw completeError;
      if (completes?.length === 1) familyId = completes[0].id;
    }
  }

  if (!familyId) {
    const handle = `fam-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const insertData: Record<string, unknown> = { handle, sort_order: 0 };
    if (fatherId) insertData.father_id = fatherId;
    if (motherId) insertData.mother_id = motherId;
    const { data: newFamily, error } = await supabase
      .from('families')
      .insert(insertData)
      .select('id')
      .single();
    if (error) throw error;
    familyId = newFamily.id;
  }

  if (!familyId) throw new Error('Không tạo được gia đình cho cha/mẹ');
  await ensureChildInFamily(familyId, childPersonId);
}

function parentRoleColumns(gender: 1 | 2): { own: 'father_id' | 'mother_id'; other: 'father_id' | 'mother_id' } {
  return gender === 1
    ? { own: 'father_id', other: 'mother_id' }
    : { own: 'mother_id', other: 'father_id' };
}

/** Families where this person is a parent and the other parent is already set. */
async function countCompleteSpouseFamilies(personId: string, personGender: 1 | 2): Promise<number> {
  const { own, other } = parentRoleColumns(personGender);
  const { data, error } = await supabase
    .from('families')
    .select('id')
    .eq(own, personId)
    .not(other, 'is', null);
  if (error) throw error;
  return data?.length ?? 0;
}

/** Single-parent family for this person (other parent still null). */
async function findHalfFamily(personId: string, personGender: 1 | 2): Promise<Family | null> {
  const { own, other } = parentRoleColumns(personGender);
  const { data, error } = await supabase
    .from('families')
    .select('*')
    .eq(own, personId)
    .is(other, null)
    .order('sort_order', { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return (data as Family | null) ?? null;
}

async function fillMissingParent(
  familyId: string,
  fatherId: string,
  motherId: string
): Promise<Family> {
  const { data, error } = await supabase
    .from('families')
    .update({ father_id: fatherId, mother_id: motherId })
    .eq('id', familyId)
    .select()
    .single();
  if (error) throw error;
  return data as Family;
}

async function nextFamilySortOrder(personId: string, personGender: 1 | 2): Promise<number> {
  const { own } = parentRoleColumns(personGender);
  const { data, error } = await supabase
    .from('families')
    .select('sort_order')
    .eq(own, personId)
    .order('sort_order', { ascending: false })
    .limit(1);
  if (error) throw error;
  return data?.length ? data[0].sort_order + 1 : 0;
}

async function insertCoupleFamily(
  fatherId: string,
  motherId: string,
  sortOrder: number
): Promise<Family> {
  const handle = `fam-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const { data, error } = await supabase
    .from('families')
    .insert({
      handle,
      father_id: fatherId,
      mother_id: motherId,
      sort_order: sortOrder,
    })
    .select()
    .single();
  if (error) throw error;
  return data as Family;
}

/** Move children from a half-family into the couple family, then drop the empty half-family. */
async function migrateChildrenBetweenFamilies(
  fromFamilyId: string,
  toFamilyId: string
): Promise<void> {
  if (fromFamilyId === toFamilyId) return;

  const [{ data: sourceChildren, error: sourceError }, { data: targetChildren, error: targetError }] =
    await Promise.all([
      supabase
        .from('children')
        .select('person_id, sort_order')
        .eq('family_id', fromFamilyId)
        .order('sort_order', { ascending: true }),
      supabase
        .from('children')
        .select('person_id, sort_order')
        .eq('family_id', toFamilyId)
        .order('sort_order', { ascending: true }),
    ]);
  if (sourceError) throw sourceError;
  if (targetError) throw targetError;

  const targetPersonIds = new Set((targetChildren || []).map((r) => r.person_id));
  let nextSort =
    (targetChildren || []).reduce((max, r) => Math.max(max, r.sort_order), -1) + 1;

  for (const row of sourceChildren || []) {
    if (targetPersonIds.has(row.person_id)) {
      await removeChildFromFamily(fromFamilyId, row.person_id);
      continue;
    }

    const { error: moveError } = await supabase
      .from('children')
      .update({ family_id: toFamilyId, sort_order: nextSort })
      .eq('family_id', fromFamilyId)
      .eq('person_id', row.person_id);
    if (moveError) throw moveError;
    targetPersonIds.add(row.person_id);
    nextSort += 1;
  }

  const { error: deleteError } = await supabase.from('families').delete().eq('id', fromFamilyId);
  if (deleteError) throw deleteError;
}

/**
 * Attach any remaining single-parent families of this person into the couple family
 * so existing children become children of the new husband/wife pair.
 */
async function absorbHalfFamilyChildren(
  personId: string,
  personGender: 1 | 2,
  coupleFamilyId: string
): Promise<void> {
  const { own, other } = parentRoleColumns(personGender);
  const { data: halfFamilies, error } = await supabase
    .from('families')
    .select('id')
    .eq(own, personId)
    .is(other, null)
    .neq('id', coupleFamilyId);
  if (error) throw error;

  for (const half of halfFamilies || []) {
    await migrateChildrenBetweenFamilies(half.id, coupleFamilyId);
  }
}

export interface CreateSpouseFamilyOptions {
  /** When set, fill this specific half-family instead of auto-picking. */
  targetFamilyId?: string;
}

/**
 * Link personId (as father if gender=1, mother if gender=2) with spouseId.
 *
 * - First spouse (no complete couple yet): reuse/update a half-family when
 *   possible, create a couple family, and auto-attach existing children from
 *   either side's single-parent families.
 * - Additional spouse (already has ≥1 complete couple): create a separate
 *   family only — do not move children from prior marriages.
 */
export async function createSpouseFamily(
  personId: string,
  personGender: 1 | 2,
  spouseId: string,
  options?: CreateSpouseFamilyOptions
): Promise<Family> {
  const fatherId = personGender === 1 ? personId : spouseId;
  const motherId = personGender === 2 ? personId : spouseId;
  const spouseGender: 1 | 2 = personGender === 1 ? 2 : 1;

  // Return existing family if one already links these two people (prevents duplicates on double-submit)
  const { data: existing } = await supabase
    .from('families')
    .select('*')
    .eq('father_id', fatherId)
    .eq('mother_id', motherId)
    .maybeSingle();
  if (existing) return existing as Family;

  const completeCount = await countCompleteSpouseFamilies(personId, personGender);

  // Second (or later) marriage: always a new separate family — do not touch prior children
  if (completeCount >= 1 && !options?.targetFamilyId) {
    const sortOrder = await nextFamilySortOrder(personId, personGender);
    return insertCoupleFamily(fatherId, motherId, sortOrder);
  }

  // Explicit half-family update (e.g. "Thêm vợ/chồng" on a family missing spouse)
  if (options?.targetFamilyId) {
    const { data: target, error: targetError } = await supabase
      .from('families')
      .select('*')
      .eq('id', options.targetFamilyId)
      .maybeSingle();
    if (targetError) throw targetError;
    if (!target) throw new Error('Không tìm thấy gia đình');

    const belongsToPerson =
      (personGender === 1 && target.father_id === personId) ||
      (personGender === 2 && target.mother_id === personId);
    if (!belongsToPerson) {
      throw new Error('Gia đình không thuộc về thành viên này');
    }

    const missingOther =
      (personGender === 1 && !target.mother_id) || (personGender === 2 && !target.father_id);
    if (!missingOther) {
      throw new Error('Gia đình này đã có vợ/chồng');
    }

    const updated = await fillMissingParent(target.id, fatherId, motherId);
    await absorbHalfFamilyChildren(spouseId, spouseGender, updated.id);
    return updated;
  }

  // First spouse: prefer filling a half-family so existing children stay with the couple
  const personHalf = await findHalfFamily(personId, personGender);
  if (personHalf) {
    const updated = await fillMissingParent(personHalf.id, fatherId, motherId);
    await absorbHalfFamilyChildren(spouseId, spouseGender, updated.id);
    return updated;
  }

  const spouseHalf = await findHalfFamily(spouseId, spouseGender);
  if (spouseHalf) {
    const updated = await fillMissingParent(spouseHalf.id, fatherId, motherId);
    await absorbHalfFamilyChildren(personId, personGender, updated.id);
    return updated;
  }

  // No half-family on either side — create couple, then pull in any stray single-parent kids
  const sortOrder = await nextFamilySortOrder(personId, personGender);
  const created = await insertCoupleFamily(fatherId, motherId, sortOrder);
  await absorbHalfFamilyChildren(personId, personGender, created.id);
  await absorbHalfFamilyChildren(spouseId, spouseGender, created.id);
  return created;
}
